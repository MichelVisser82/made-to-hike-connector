import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, userId } = await req.json();

    if (!query || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Search query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all active FAQs
    const { data: faqs, error: faqError } = await supabase
      .from('help_faqs')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (faqError) {
      console.error('Error fetching FAQs:', faqError);
      throw new Error('Failed to fetch FAQs');
    }

    // Use Lovable AI to find relevant FAQs
    if (!lovableApiKey) {
      console.warn('LOVABLE_API_KEY not configured, falling back to basic search');
      // Fallback: basic text matching
      const results = faqs.filter(faq => 
        faq.question.toLowerCase().includes(query.toLowerCase()) ||
        faq.answer.toLowerCase().includes(query.toLowerCase()) ||
        (faq.search_keywords && faq.search_keywords.some((kw: string) => 
          kw.toLowerCase().includes(query.toLowerCase())
        ))
      ).slice(0, 5);

      return new Response(
        JSON.stringify({ results, suggestions: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build context for AI with all FAQs
    const faqContext = faqs.map((faq, idx) => 
      `[FAQ ${idx}]\nQuestion: ${faq.question}\nAnswer: ${faq.answer}\nCategory: ${faq.category}\nUser Type: ${faq.user_type}\n`
    ).join('\n---\n');

    const systemPrompt = `You are a helpful assistant for MadeToHike, a platform connecting hikers with certified mountain guides. 
Analyze the user's question and return the most relevant FAQ IDs (up to 5) that answer their question.

Available FAQs:
${faqContext}

Return ONLY a JSON object with this structure:
{
  "faqIds": [array of FAQ indices that are relevant, e.g., [0, 3, 7]],
  "suggestions": [array of up to 3 related search suggestions if their question wasn't fully answered]
}`;

    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      throw new Error('AI search failed');
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;

    // Parse AI response
    let parsedResponse;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = aiContent.match(/```json\n([\s\S]*?)\n```/) || 
                       aiContent.match(/```\n([\s\S]*?)\n```/) ||
                       [null, aiContent];
      parsedResponse = JSON.parse(jsonMatch[1] || aiContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      parsedResponse = { faqIds: [], suggestions: [] };
    }

    // Map FAQ indices to actual FAQ objects
    const results = (parsedResponse.faqIds || [])
      .filter((idx: number) => idx >= 0 && idx < faqs.length)
      .map((idx: number) => faqs[idx])
      .slice(0, 5);

    // Log search for analytics
    const { error: logError } = await supabase
      .from('help_searches')
      .insert({
        search_query: query,
        user_id: userId || null,
        results_shown: results.map((r: any) => r.id),
      });

    if (logError) {
      console.error('Error logging search:', logError);
    }

    // Increment view counts for returned FAQs
    if (results.length > 0) {
      const faqIds = results.map((r: any) => r.id);
      const { error: incrementError } = await supabase.rpc('increment_faq_views', { faq_ids: faqIds });
      if (incrementError) {
        console.error('Error incrementing view counts:', incrementError);
      }
    }

    return new Response(
      JSON.stringify({
        results,
        suggestions: parsedResponse.suggestions || [],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in help-search function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
