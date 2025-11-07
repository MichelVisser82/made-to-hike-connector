import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-TAX-DOC] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    logStep('Function started');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) throw new Error('User not authenticated');
    const user = userData.user;

    const { year } = await req.json();
    if (!year || year < 2020 || year > new Date().getFullYear()) {
      throw new Error('Invalid year');
    }

    logStep('User authenticated', { userId: user.id, year });

    // Fetch guide profile
    const { data: guide, error: guideError } = await supabaseClient
      .from('guide_profiles')
      .select('display_name, stripe_account_id')
      .eq('user_id', user.id)
      .single();

    if (guideError || !guide) throw new Error('Guide profile not found');

    // Fetch all completed bookings for the year
    const { data: bookings, error: bookingsError } = await supabaseClient
      .from('bookings')
      .select(`
        *,
        tours!inner(title, guide_id)
      `)
      .eq('tours.guide_id', user.id)
      .eq('status', 'completed')
      .gte('booking_date', `${year}-01-01`)
      .lte('booking_date', `${year}-12-31`);

    if (bookingsError) throw bookingsError;

    // Calculate totals (amounts are in cents)
    const grossIncome = bookings?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;
    const platformFees = Math.round(grossIncome * 0.15); // 15% platform fee
    const netIncome = grossIncome - platformFees;
    const totalBookings = bookings?.length || 0;

    logStep('Calculations complete', {
      totalBookings,
      grossIncome: grossIncome / 100,
      netIncome: netIncome / 100
    });

    // Generate simple text-based report
    const reportLines = [
      '='.repeat(60),
      'MadeToHike Income Summary',
      `Year: ${year}`,
      `Guide: ${guide.display_name}`,
      `Report Generated: ${new Date().toLocaleDateString()}`,
      '='.repeat(60),
      '',
      'FINANCIAL SUMMARY',
      '-'.repeat(60),
      `Total Bookings: ${totalBookings}`,
      `Gross Income: €${(grossIncome / 100).toFixed(2)}`,
      `Platform Fees (15%): -€${(platformFees / 100).toFixed(2)}`,
      `Net Income: €${(netIncome / 100).toFixed(2)}`,
      '',
      'BOOKING DETAILS',
      '-'.repeat(60),
      ...bookings?.map(b => 
        `${new Date(b.booking_date).toLocaleDateString()} | ${b.tours.title} | €${(b.total_price / 100).toFixed(2)}`
      ) || []
    ];

    const reportContent = reportLines.join('\n');
    const fileName = `${user.id}/${year}-income-summary.txt`;

    // Upload to storage
    const { error: uploadError } = await supabaseClient.storage
      .from('tax-documents')
      .upload(fileName, new Blob([reportContent], { type: 'text/plain' }), { upsert: true });

    if (uploadError) throw uploadError;

    logStep('File uploaded', { fileName });

    // Save record to database
    const { data: taxDoc, error: dbError } = await supabaseClient
      .from('tax_documents')
      .upsert({
        guide_id: user.id,
        year: year,
        file_path: fileName,
        gross_income: grossIncome / 100,
        net_income: netIncome / 100,
        platform_fees: platformFees / 100,
        total_bookings: totalBookings,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'guide_id,year' })
      .select()
      .single();

    if (dbError) throw dbError;

    logStep('Database record created', { docId: taxDoc.id });

    return new Response(
      JSON.stringify({ 
        success: true,
        document: taxDoc
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    logStep('ERROR', { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
