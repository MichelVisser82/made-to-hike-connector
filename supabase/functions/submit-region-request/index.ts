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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { country, region, subregion, description, key_features } = await req.json()

    console.log('Processing region submission request:', { country, region, subregion })

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Check if region already exists in verified regions
    const { data: existingRegion } = await supabaseClient
      .from('hiking_regions')
      .select('*')
      .eq('country', country)
      .eq('subregion', subregion)
      .maybeSingle()

    if (existingRegion) {
      return new Response(
        JSON.stringify({ 
          error: 'This region already exists in our database. Please select it from the list.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Check if user already submitted this region
    const { data: existingSubmission } = await supabaseClient
      .from('user_submitted_regions')
      .select('*')
      .eq('country', country)
      .eq('subregion', subregion)
      .eq('submitted_by', user.id)
      .maybeSingle()

    if (existingSubmission) {
      return new Response(
        JSON.stringify({ 
          error: 'You have already submitted this region. It is pending admin verification.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Submit new region
    const { data: submission, error: insertError } = await supabaseClient
      .from('user_submitted_regions')
      .insert({
        submitted_by: user.id,
        country,
        region: region || null,
        subregion,
        description,
        key_features,
        verification_status: 'pending'
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    // Get user profile for notification
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('name, email')
      .eq('id', user.id)
      .single()

    // Notify admin via Slack
    const slackWebhookUrl = Deno.env.get('SLACK_WEBHOOK_URL')
    if (slackWebhookUrl) {
      const slackMessage = {
        text: '🗺️ New Hiking Region Submission',
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '🗺️ New Hiking Region Submission',
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Submitted by:*\n${profile?.name || 'Unknown'} (${profile?.email})`,
              },
              {
                type: 'mrkdwn',
                text: `*Country:*\n${country}`,
              },
              {
                type: 'mrkdwn',
                text: `*Region:*\n${region || 'N/A'}`,
              },
              {
                type: 'mrkdwn',
                text: `*Subregion:*\n${subregion}`,
              },
            ],
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Description:*\n${description}`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Key Features:*\n${key_features.join(' | ')}`,
            },
          },
        ],
      }

      try {
        await fetch(slackWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(slackMessage),
        })
      } catch (slackError) {
        console.error('Failed to send Slack notification:', slackError)
      }
    }

    console.log('Region submission successful:', submission.id)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Your region has been submitted and is ready to use! It will be reviewed by our admin team.',
        submission: {
          id: submission.id,
          country: submission.country,
          region: submission.region,
          subregion: submission.subregion,
          description: submission.description,
          key_features: submission.key_features,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in submit-region-request:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})