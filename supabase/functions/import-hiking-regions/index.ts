import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      req.headers.get('Authorization')?.split('Bearer ')[1] ?? ''
    )
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleError || roleData?.role !== 'admin') {
      throw new Error('Admin access required')
    }

    const { csvData } = await req.json()

    console.log('Starting CSV import...')

    // Parse CSV
    const lines = csvData.trim().split('\n')
    const headers = lines[0].split(',')
    
    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',')
        
        if (values.length < 5) continue // Skip invalid rows

        const country = values[0].trim()
        const region = values[1]?.trim() || null
        const subregion = values[2].trim()
        const description = values[3].trim()
        const keyFeaturesStr = values[4].trim()

        // Parse key features (separated by |)
        const keyFeatures = keyFeaturesStr
          .split('|')
          .map(f => f.trim())
          .filter(f => f.length > 0)

        // Insert or update region
        const { error: upsertError } = await supabaseClient
          .from('hiking_regions')
          .upsert(
            {
              country,
              region: region || null,
              subregion,
              description,
              key_features: keyFeatures,
              is_active: true,
            },
            {
              onConflict: 'country,region,subregion',
              ignoreDuplicates: false
            }
          )

        if (upsertError) {
          console.error(`Error inserting row ${i}:`, upsertError)
          errors.push(`Row ${i}: ${upsertError.message}`)
          errorCount++
        } else {
          successCount++
        }
      } catch (error) {
        console.error(`Error processing row ${i}:`, error)
        errors.push(`Row ${i}: ${error.message}`)
        errorCount++
      }
    }

    console.log(`Import complete: ${successCount} success, ${errorCount} errors`)

    return new Response(
      JSON.stringify({
        success: true,
        successCount,
        errorCount,
        errors: errors.slice(0, 10), // Return first 10 errors
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in import-hiking-regions:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})