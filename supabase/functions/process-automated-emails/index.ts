import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'
import { corsHeaders } from '../_shared/cors.ts'
import { 
  replaceTemplateVariables, 
  extractFirstName, 
  extractLastName, 
  formatMessageDate,
  type VariableData 
} from './templateVariables.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Get optional lookback days parameter (default 30 days for retrospective)
    const { lookbackDays = 30 } = req.method === 'POST' ? await req.json() : {}
    
    console.log('Starting automated email processing...')
    
    // Fetch all active email templates
    const { data: templates, error: templatesError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('is_active', true)
    
    if (templatesError) {
      console.error('Error fetching templates:', templatesError)
      throw templatesError
    }
    
    if (!templates || templates.length === 0) {
      console.log('No active email templates found')
      return new Response(
        JSON.stringify({ message: 'No active templates', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log(`Found ${templates.length} active templates`)
    let emailsSent = 0
    
    for (const template of templates) {
      console.log(`Processing template: ${template.name}`)
      
      // Calculate time window based on timing configuration
      const now = new Date()
      
      // For retrospective sending, look back the specified number of days
      const lookbackStart = new Date(now.getTime() - lookbackDays * 24 * 60 * 60 * 1000)
      
      // Convert timing to hours
      let hoursOffset = template.timing_value
      if (template.timing_unit === 'minutes') {
        hoursOffset = template.timing_value / 60
      } else if (template.timing_unit === 'days') {
        hoursOffset = template.timing_value * 24
      }
      
      if (template.timing_direction === 'before') {
        hoursOffset = -hoursOffset
      }
      
      // Find matching bookings based on trigger type
      let bookingsQuery = supabase
        .from('bookings')
        .select(`
          *,
          tour:tours(
            id,
            title,
            guide_id,
            meeting_point,
            guide_profiles!tours_guide_id_fkey(display_name)
          ),
          hiker:profiles!bookings_hiker_id_fkey(name)
        `)
        .eq('status', 'confirmed')
      
      // Filter based on trigger type - look back from lookbackStart to now
      if (template.trigger_type === 'booking_confirmed') {
        // Send for bookings created in the lookback period
        bookingsQuery = bookingsQuery
          .gte('created_at', lookbackStart.toISOString())
          .lte('created_at', now.toISOString())
      } else if (template.trigger_type === 'booking_reminder') {
        // Send for upcoming bookings
        bookingsQuery = bookingsQuery
          .gte('booking_date', lookbackStart.toISOString().split('T')[0])
          .lte('booking_date', now.toISOString().split('T')[0])
      } else if (template.trigger_type === 'tour_completed') {
        // Send for completed tours in the lookback period
        bookingsQuery = bookingsQuery
          .eq('status', 'completed')
          .gte('booking_date', lookbackStart.toISOString().split('T')[0])
          .lte('booking_date', now.toISOString().split('T')[0])
      }
      
      const { data: bookings, error: bookingsError } = await bookingsQuery
      
      if (bookingsError) {
        console.error(`Error fetching bookings for template ${template.name}:`, bookingsError)
        continue
      }
      
      if (!bookings || bookings.length === 0) {
        console.log(`No matching bookings for template: ${template.name}`)
        continue
      }
      
      console.log(`Found ${bookings.length} bookings for template: ${template.name}`)
      
      // Process each booking
      for (const booking of bookings) {
        try {
          // Check if email already sent for this template + booking
          const { data: existingLog } = await supabase
            .from('email_logs')
            .select('id')
            .eq('template_id', template.id)
            .eq('booking_id', booking.id)
            .eq('status', 'sent')
            .single()
          
          if (existingLog) {
            console.log(`Email already sent for booking ${booking.id}, template ${template.name}`)
            continue
          }
          
          // Build variable data
          const variableData: VariableData = {
            guestFirstName: extractFirstName(booking.hiker?.name),
            guestLastName: extractLastName(booking.hiker?.name),
            guestFullName: booking.hiker?.name || 'Guest',
            tourName: booking.tour?.title || 'the tour',
            tourDate: formatMessageDate(booking.booking_date),
            guestCount: booking.participants || 1,
            guideName: booking.tour?.guide_profiles?.display_name || 'your guide',
            meetingPoint: booking.tour?.meeting_point || 'the meeting point',
            startTime: '09:00'
          }
          
          // Replace variables in subject and content
          const processedSubject = replaceTemplateVariables(template.subject, variableData)
          const processedContent = replaceTemplateVariables(template.content, variableData)
          
          // Send email
          const { error: emailError } = await supabase.functions.invoke('send-email', {
            body: {
              type: 'automated_template',
              to: booking.hiker_email,
              subject: processedSubject,
              html: processedContent
            }
          })
          
          if (emailError) {
            console.error(`Error sending email for booking ${booking.id}:`, emailError)
            
            // Log failed send
            await supabase.from('email_logs').insert({
              template_id: template.id,
              booking_id: booking.id,
              recipient_email: booking.hiker_email,
              subject: processedSubject,
              status: 'failed'
            })
            
            continue
          }
          
          // Log successful send
          await supabase.from('email_logs').insert({
            template_id: template.id,
            booking_id: booking.id,
            recipient_email: booking.hiker_email,
            subject: processedSubject,
            status: 'sent'
          })
          
          emailsSent++
          console.log(`Email sent for booking ${booking.id}, template ${template.name}`)
          
        } catch (error) {
          console.error(`Error processing booking ${booking.id}:`, error)
        }
      }
    }
    
    console.log(`Automated email processing complete. Sent ${emailsSent} emails.`)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        templates_processed: templates.length,
        emails_sent: emailsSent,
        lookback_days: lookbackDays
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error in process-automated-emails:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
