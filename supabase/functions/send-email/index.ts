import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { generateBookingConfirmationEmail, generateGuideBookingNotificationEmail, type BookingConfirmationData, type GuideBookingNotificationData } from './templates.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

interface EmailRequest {
  type: 'contact' | 'newsletter' | 'verification' | 'welcome' | 'booking' | 'booking-confirmation' | 'guide-booking-notification' | 'custom_verification' | 'verification-code' | 'new_message' | 'new_anonymous_inquiry' | 'review_available' | 'review_reminder' | 'waiver_confirmation' | 'waiver_reminder' | 'insurance_reminder' | 'participant_invitation' | 'participant_reminder' | 'participant_completion' | 'booker_participant_complete' | 'guide_participant_documents' | 'review_response' | 'booking_cancellation_hiker' | 'booking_cancellation_guide' | 'booking_refund_hiker' | 'pre_trip_reminder' | 'post_trip_thank_you' | 'tour_date_change_notification' | 'tour_fully_booked_alert' | 'payout_processed_notification' | 'document_upload_notification' | 'review_received_notification' | 'guide_verification_completed' | 'failed_payment_alert_admin'
  to: string
  from?: string
  reply_to?: string
  name?: string
  email?: string
  subject?: string
  message?: string
  data?: Record<string, any>
  template_data?: Record<string, any>
  bookingReference?: string
  tourTitle?: string
  bookingDate?: string
  guideName?: string
  meetingPoint?: string
  totalPrice?: number
  currency?: string
  participants?: number
  isDeposit?: boolean
  depositAmount?: number
  finalPaymentAmount?: number
  finalPaymentDueDate?: string
  anonymousName?: string
  anonymousEmail?: string
  conversationId?: string
}

interface EmailTemplate {
  subject: string
  html: string
  text?: string
}

// Enhanced email templates
const getEmailTemplate = (type: string, data: any): EmailTemplate => {
  const templates = {
    contact: {
      subject: `New Contact Form Submission from ${data.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Submission</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
            <div style="background: linear-gradient(135deg, #2c5530 0%, #4a7c59 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">Made to Hike</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">New Contact Form Submission</p>
            </div>
            
            <div style="padding: 30px;">
              <div style="background: #f8fffe; border-left: 4px solid #2c5530; padding: 20px; margin-bottom: 25px; border-radius: 0 4px 4px 0;">
                <h2 style="margin: 0 0 15px; color: #2c5530; font-size: 18px;">Contact Details</h2>
                <p style="margin: 8px 0;"><strong>Name:</strong> ${data.name}</p>
                <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${data.email}" style="color: #2c5530; text-decoration: none;">${data.email}</a></p>
                <p style="margin: 8px 0;"><strong>Subject:</strong> ${data.subject || 'No subject provided'}</p>
                <p style="margin: 8px 0;"><strong>Submitted:</strong> ${new Date().toLocaleString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}</p>
              </div>
              
              <div style="background: white; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px;">
                <h3 style="margin: 0 0 15px; color: #2c5530; font-size: 16px;">Message:</h3>
                <div style="color: #4a5568; line-height: 1.6; white-space: pre-wrap;">${data.message}</div>
              </div>
              
              <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
                <p style="margin: 0; color: #718096; font-size: 14px;">Reply directly to this email to respond to ${data.name}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `New contact form submission from ${data.name}\n\nEmail: ${data.email}\nSubject: ${data.subject || 'No subject'}\n\nMessage:\n${data.message}\n\nSubmitted: ${new Date().toLocaleString()}`
    },

    confirmation: {
      subject: "Thank you for contacting Made to Hike",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thank You - Made to Hike</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
            <div style="background: linear-gradient(135deg, #2c5530 0%, #4a7c59 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">Made to Hike</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Your Adventure Starts Here</p>
            </div>
            
            <div style="padding: 30px; text-align: center;">
              <h2 style="margin: 0 0 20px; color: #2c5530; font-size: 22px;">Thank You, ${data.name}! 🏔️</h2>
              
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">We've received your message and will get back to you within <strong>24 hours</strong>.</p>
              
              <div style="background: #f0f8f0; border-radius: 6px; padding: 20px; margin: 25px 0;">
                <h3 style="margin: 0 0 15px; color: #2c5530; font-size: 18px;">While You Wait...</h3>
                <p style="margin: 0; color: #4a5568;">Explore our hiking guides and discover your next adventure!</p>
              </div>
              
              <div style="margin: 30px 0;">
                <a href="${data.websiteUrl || '#'}" style="display: inline-block; background: #2c5530; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; font-size: 16px;">Explore Trails</a>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0 0 10px; color: #718096; font-size: 14px;">Happy hiking!</p>
                <p style="margin: 0; color: #718096; font-size: 14px;"><strong>The Made to Hike Team</strong></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Thank you for contacting Made to Hike, ${data.name}!\n\nWe've received your message and will get back to you within 24 hours.\n\nIn the meantime, feel free to explore our hiking guides and trail recommendations.\n\nHappy hiking!\nThe Made to Hike Team`
    },

    newsletter: {
      subject: "Welcome to Made to Hike Newsletter! 🥾",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Made to Hike Newsletter</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
            <div style="background: linear-gradient(135deg, #2c5530 0%, #4a7c59 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">Made to Hike</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Newsletter Subscription</p>
            </div>
            
            <div style="padding: 30px;">
              <h2 style="margin: 0 0 20px; color: #2c5530; font-size: 22px; text-align: center;">Welcome to the Adventure, ${data.name || 'Fellow Hiker'}! 🏔️</h2>
              
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; text-align: center;">Thank you for subscribing to the Made to Hike newsletter!</p>
              
              <div style="background: #f0f8f0; border-radius: 6px; padding: 25px; margin: 25px 0;">
                <h3 style="margin: 0 0 15px; color: #2c5530; font-size: 18px; text-align: center;">You'll now receive:</h3>
                <div style="display: grid; gap: 12px;">
                  <div style="display: flex; align-items: center; color: #4a5568;">
                    <span style="margin-right: 10px; font-size: 18px;">🥾</span>
                    <span>Weekly trail recommendations</span>
                  </div>
                  <div style="display: flex; align-items: center; color: #4a5568;">
                    <span style="margin-right: 10px; font-size: 18px;">🏔️</span>
                    <span>Expert hiking tips and guides</span>
                  </div>
                  <div style="display: flex; align-items: center; color: #4a5568;">
                    <span style="margin-right: 10px; font-size: 18px;">📸</span>
                    <span>Stunning trail photography</span>
                  </div>
                  <div style="display: flex; align-items: center; color: #4a5568;">
                    <span style="margin-right: 10px; font-size: 18px;">🗓️</span>
                    <span>Upcoming hiking events</span>
                  </div>
                  <div style="display: flex; align-items: center; color: #4a5568;">
                    <span style="margin-right: 10px; font-size: 18px;">⚡</span>
                    <span>Early access to new features</span>
                  </div>
                </div>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.websiteUrl || '#'}" style="display: inline-block; background: #2c5530; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; font-size: 16px;">Start Exploring</a>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0 0 10px; color: #2c5530; font-size: 16px; font-weight: 500;">Get ready to explore!</p>
                <p style="margin: 0; color: #718096; font-size: 14px;">Your next adventure is just an email away.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Welcome to Made to Hike Newsletter, ${data.name || 'Fellow Hiker'}!\n\nThank you for subscribing! You'll now receive:\n\n🥾 Weekly trail recommendations\n🏔️ Expert hiking tips and guides\n📸 Stunning trail photography\n🗓️ Upcoming hiking events\n⚡ Early access to new features\n\nGet ready to explore!\nYour next adventure is just an email away.\n\nHappy hiking!\nThe Made to Hike Team`
    },

    custom_verification: {
      subject: 'Verify Your MadeToHike Account',
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your MadeToHike Account</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f6f9fc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
        <div style="text-align: center; padding: 20px;">
            <h1 style="color: #1a73e8; margin: 0;">🏔️ MadeToHike</h1>
        </div>
        
        <div style="text-align: center; padding: 20px;">
            <h2 style="color: #1a1a1a;">Welcome to MadeToHike!</h2>
            <p style="color: #666666; font-size: 16px;">
                Hi ${data.user_name || 'Adventurer'}, we're excited to have you join our community!
            </p>
        </div>

        <div style="padding: 20px;">
            <p style="color: #525252; font-size: 16px;">
                Please verify your email address by clicking the button below:
            </p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${data.verification_url}" style="background-color: #1a73e8; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Verify My Email
                </a>
            </div>

            <p style="color: #525252; font-size: 14px;">
                Or copy and paste this link: ${data.verification_url}
            </p>
        </div>

        <div style="text-align: center; padding: 20px; color: #8898aa; font-size: 12px;">
            <p>© 2025 MadeToHike. Happy hiking! 🏔️</p>
        </div>
    </div>
</body>
</html>`,
      text: `Welcome to MadeToHike!\n\nHi ${data.user_name || 'Adventurer'}, we're excited to have you join our community!\n\nPlease verify your email address by clicking this link:\n${data.verification_url}\n\n© 2025 MadeToHike. Happy hiking! 🏔️`
    },

    admin_verification_request: {
      subject: `🔔 New Guide Verification Request - ${data.guide_name || 'Unknown'}`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Guide Verification Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f6f9fc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2c5530 0%, #4a7c59 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px;">🔔 New Verification Request</h1>
        </div>
        
        <div style="padding: 30px;">
            <div style="background: #fff8e1; border-left: 4px solid #ffc107; padding: 20px; margin-bottom: 20px;">
                <h2 style="margin: 0 0 10px; color: #f57c00; font-size: 18px;">Action Required</h2>
                <p style="margin: 0; color: #666;">A guide has submitted certifications for verification</p>
            </div>

            <div style="background: #f8fffe; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px; color: #2c5530;">Guide Information</h3>
                <p style="margin: 8px 0;"><strong>Name:</strong> ${data.guide_name || 'Unknown'}</p>
                <p style="margin: 8px 0;"><strong>Email:</strong> ${data.guide_email || 'Unknown'}</p>
                <p style="margin: 8px 0;"><strong>Certifications:</strong> ${data.certification_count || 0} submitted</p>
                ${data.certification_added ? `<p style="margin: 8px 0;"><strong>Latest:</strong> ${data.certification_added}</p>` : ''}
                <p style="margin: 8px 0;"><strong>Requested:</strong> ${new Date(data.timestamp || Date.now()).toLocaleString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="https://ab369f57-f214-4187-b9e3-10bb8b4025d9.lovableproject.com/admin" style="display: inline-block; background: #2c5530; color: white; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">
                    Review in Admin Dashboard
                </a>
            </div>

            <div style="padding: 15px; background: #f0f8f0; border-radius: 6px; margin-top: 20px;">
                <p style="margin: 0; color: #2c5530; font-size: 14px; text-align: center;">
                    <strong>⏰ Please review within 48 hours</strong>
                </p>
            </div>
        </div>

        <div style="text-align: center; padding: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 12px;">
            <p style="margin: 0;">© 2025 MadeToHike Admin System</p>
        </div>
    </div>
</body>
</html>`,
      text: `New Guide Verification Request\n\nGuide Information:\nName: ${data.guide_name || 'Unknown'}\nEmail: ${data.guide_email || 'Unknown'}\nCertifications: ${data.certification_count || 0} submitted\n${data.certification_added ? `Latest: ${data.certification_added}\n` : ''}Requested: ${new Date(data.timestamp || Date.now()).toLocaleString()}\n\nPlease review in the admin dashboard:\nhttps://ab369f57-f214-4187-b9e3-10bb8b4025d9.lovableproject.com/admin\n\n⏰ Please review within 48 hours`
    },

    'verification-code': {
      subject: 'Your MadeToHike Verification Code',
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #2c5530 0%, #4a7c59 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">Made to Hike</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Email Verification</p>
        </div>
        
        <div style="padding: 40px 30px; text-align: center;">
            <h2 style="margin: 0 0 20px; color: #2c5530; font-size: 22px;">Your Verification Code</h2>
            
            <p style="margin: 0 0 30px; color: #4a5568; font-size: 16px;">Enter this code to complete your booking:</p>
            
            <div style="background: #f0f8f0; border: 2px dashed #2c5530; border-radius: 8px; padding: 30px; margin: 30px 0;">
                <div style="font-size: 48px; font-weight: bold; color: #2c5530; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                    ${data.code}
                </div>
            </div>

            <p style="margin: 30px 0 0; color: #718096; font-size: 14px;">
                This code will expire in <strong>10 minutes</strong>
            </p>

            <p style="margin: 20px 0 0; color: #718096; font-size: 14px;">
                If you didn't request this code, please ignore this email.
            </p>
        </div>

        <div style="text-align: center; padding: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 12px;">
            <p style="margin: 0;">© 2025 MadeToHike. Happy hiking! 🏔️</p>
        </div>
    </div>
</body>
</html>`,
      text: `Your MadeToHike Verification Code\n\nYour verification code is: ${data.code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.\n\n© 2025 MadeToHike. Happy hiking! 🏔️`
    },

    booking_refund_hiker: {
      subject: `Refund Processed for Your Booking - ${data.tour_title}`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Refund Processed</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #2c5530 0%, #4a7c59 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">Made to Hike</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Booking Refund Notification</p>
        </div>
        
        <div style="padding: 30px;">
            <h2 style="margin: 0 0 20px; color: #2c5530; font-size: 22px;">Hi ${data.hiker_name || 'there'},</h2>
            
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">
                We're writing to inform you that your booking has been cancelled and a refund has been processed.
            </p>

            <div style="background: #f8fffe; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin: 25px 0;">
                <h3 style="margin: 0 0 15px; color: #2c5530; font-size: 18px;">Booking Details</h3>
                <p style="margin: 8px 0;"><strong>Tour:</strong> ${data.tour_title}</p>
                <p style="margin: 8px 0;"><strong>Booking Reference:</strong> ${data.booking_reference}</p>
                <p style="margin: 8px 0;"><strong>Tour Date:</strong> ${new Date(data.booking_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p style="margin: 8px 0;"><strong>Guide:</strong> ${data.guide_name || 'Your guide'}</p>
            </div>

            <div style="background: #fff8e1; border-left: 4px solid #ffc107; padding: 20px; margin: 25px 0; border-radius: 0 4px 4px 0;">
                <h3 style="margin: 0 0 15px; color: #f57c00; font-size: 18px;">Refund Information</h3>
                <p style="margin: 8px 0;"><strong>Refund Amount:</strong> ${data.refund_amount} ${data.currency}</p>
                <p style="margin: 8px 0;"><strong>Original Payment:</strong> ${data.original_amount} ${data.currency}</p>
                ${data.refund_reason ? `<p style="margin: 8px 0;"><strong>Reason:</strong> ${data.refund_reason}</p>` : ''}
            </div>

            <div style="background: #f0f8f0; border-radius: 6px; padding: 20px; margin: 25px 0;">
                <h4 style="margin: 0 0 10px; color: #2c5530; font-size: 16px;">When will I receive my refund?</h4>
                <p style="margin: 0; color: #4a5568; font-size: 14px;">
                    Your refund has been processed and will appear in your original payment method within <strong>3-10 business days</strong>, depending on your bank or card issuer.
                </p>
            </div>

            <p style="margin: 25px 0 0; color: #4a5568; font-size: 16px;">
                We're sorry your plans changed. We hope to see you on the trails soon!
            </p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="https://ab369f57-f214-4187-b9e3-10bb8b4025d9.lovableproject.com/tours" style="display: inline-block; background: #2c5530; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; font-size: 16px;">Browse Other Tours</a>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0 0 10px; color: #718096; font-size: 14px;">Questions? Contact us at support@madetohike.com</p>
                <p style="margin: 0; color: #718096; font-size: 14px;"><strong>The Made to Hike Team</strong></p>
            </div>
        </div>
    </div>
</body>
</html>`,
      text: `Booking Refund Processed\n\nHi ${data.hiker_name || 'there'},\n\nYour booking has been cancelled and a refund has been processed.\n\nBooking Details:\nTour: ${data.tour_title}\nBooking Reference: ${data.booking_reference}\nTour Date: ${new Date(data.booking_date).toLocaleDateString()}\nGuide: ${data.guide_name || 'Your guide'}\n\nRefund Information:\nRefund Amount: ${data.refund_amount} ${data.currency}\nOriginal Payment: ${data.original_amount} ${data.currency}\n${data.refund_reason ? `Reason: ${data.refund_reason}\n` : ''}\nYour refund will appear in your original payment method within 3-10 business days.\n\nWe hope to see you on the trails soon!\n\nThe Made to Hike Team`
    },

    booking_cancellation_guide: {
      subject: `Booking Cancelled - ${data.tour_title}`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Cancelled</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #2c5530 0%, #4a7c59 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">Made to Hike</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Booking Cancellation Notice</p>
        </div>
        
        <div style="padding: 30px;">
            <h2 style="margin: 0 0 20px; color: #2c5530; font-size: 22px;">Hi ${data.guide_name || 'there'},</h2>
            
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">
                A booking for your tour has been cancelled and the customer has been refunded.
            </p>

            <div style="background: #f8fffe; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin: 25px 0;">
                <h3 style="margin: 0 0 15px; color: #2c5530; font-size: 18px;">Booking Details</h3>
                <p style="margin: 8px 0;"><strong>Tour:</strong> ${data.tour_title}</p>
                <p style="margin: 8px 0;"><strong>Booking Reference:</strong> ${data.booking_reference}</p>
                <p style="margin: 8px 0;"><strong>Tour Date:</strong> ${new Date(data.booking_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p style="margin: 8px 0;"><strong>Customer:</strong> ${data.hiker_name}</p>
                <p style="margin: 8px 0;"><strong>Cancelled:</strong> ${new Date(data.cancelled_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>

            <div style="background: #fff8e1; border-left: 4px solid #ffc107; padding: 20px; margin: 25px 0; border-radius: 0 4px 4px 0;">
                <h3 style="margin: 0 0 10px; color: #f57c00; font-size: 18px;">Refund Processed</h3>
                <p style="margin: 0; color: #666;"><strong>Refund Amount:</strong> ${data.refund_amount} ${data.currency}</p>
            </div>

            <div style="background: #f0f8f0; border-radius: 6px; padding: 20px; margin: 25px 0; text-align: center;">
                <p style="margin: 0 0 10px; color: #2c5530; font-size: 16px; font-weight: 500;">✅ Date Slot Now Available</p>
                <p style="margin: 0; color: #4a5568; font-size: 14px;">
                    This date is now open for new bookings from other hikers.
                </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="https://ab369f57-f214-4187-b9e3-10bb8b4025d9.lovableproject.com/dashboard?section=bookings" style="display: inline-block; background: #2c5530; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; font-size: 16px;">View Dashboard</a>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #718096; font-size: 14px;"><strong>The Made to Hike Team</strong></p>
            </div>
        </div>
    </div>
</body>
</html>`,
      text: `Booking Cancelled\n\nHi ${data.guide_name || 'there'},\n\nA booking for your tour has been cancelled and the customer has been refunded.\n\nBooking Details:\nTour: ${data.tour_title}\nBooking Reference: ${data.booking_reference}\nTour Date: ${new Date(data.booking_date).toLocaleDateString()}\nCustomer: ${data.hiker_name}\nCancelled: ${new Date(data.cancelled_at).toLocaleString()}\n\nRefund Amount: ${data.refund_amount} ${data.currency}\n\nThis date is now open for new bookings from other hikers.\n\nView your dashboard: https://ab369f57-f214-4187-b9e3-10bb8b4025d9.lovableproject.com/dashboard?section=bookings\n\nThe Made to Hike Team`
    },

    new_message: {
      subject: data.subject || `New message from ${data.senderName}`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Message</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #2c5530 0%, #4a7c59 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">Made to Hike</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">New Message</p>
        </div>
        
        <div style="padding: 30px;">
            <h2 style="margin: 0 0 20px; color: #2c5530; font-size: 22px;">Hi ${data.recipientName || 'there'},</h2>
            
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">
                You have a new message from <strong>${data.senderName}</strong>.
            </p>

            <div style="background: #f8fffe; border-left: 4px solid #2c5530; padding: 20px; margin: 25px 0; border-radius: 0 4px 4px 0;">
                <p style="margin: 0; color: #4a5568; line-height: 1.6; white-space: pre-wrap;">${data.messagePreview}</p>
            </div>

            ${data.isAnonymous ? `
            <div style="background: #f0f8f0; border-radius: 6px; padding: 20px; margin: 25px 0; text-align: center;">
                <h3 style="margin: 0 0 10px; color: #2c5530; font-size: 18px;">💬 Reply via Email</h3>
                <p style="margin: 0; color: #4a5568; font-size: 14px;">
                    Simply reply to this email to continue the conversation with ${data.senderName}.
                </p>
                ${data.conversationId ? `<p style="margin: 10px 0 0; color: #718096; font-size: 12px;">Reference: ${data.conversationId.substring(0, 8)}</p>` : ''}
            </div>
            ` : `
            <div style="text-align: center; margin: 30px 0;">
                <a href="${data.conversationUrl}" style="display: inline-block; background: #2c5530; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; font-size: 16px;">View Conversation</a>
            </div>
            `}

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #718096; font-size: 14px;"><strong>The Made to Hike Team</strong></p>
            </div>
        </div>
    </div>
</body>
</html>`,
      text: `New Message\n\nHi ${data.recipientName || 'there'},\n\nYou have a new message from ${data.senderName}.\n\nMessage:\n${data.messagePreview}\n\n${data.isAnonymous ? `Reply to this email to continue the conversation.${data.conversationId ? `\nReference: ${data.conversationId.substring(0, 8)}` : ''}` : `View the conversation: ${data.conversationUrl}`}\n\nThe Made to Hike Team`
    },

    new_anonymous_inquiry: {
      subject: `${data.tourTitle ? `Question about ${data.tourTitle}` : 'New Tour Inquiry'} from ${data.anonymousName}`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Tour Inquiry</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #2c5530 0%, #4a7c59 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">🏔️ Made to Hike</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">New Tour Inquiry</p>
        </div>
        
        <div style="padding: 30px;">
            <h2 style="margin: 0 0 20px; color: #2c5530; font-size: 22px;">Hi ${data.recipientName || 'there'},</h2>
            
            <div style="background: #f0f8f0; border-left: 4px solid #2c5530; padding: 20px; margin: 25px 0; border-radius: 0 4px 4px 0;">
                <p style="margin: 0 0 10px; color: #718096; font-size: 12px; font-weight: 600; text-transform: uppercase;">📍 About Tour</p>
                <p style="margin: 0; color: #2c5530; font-size: 20px; font-weight: 600;">${data.tourTitle || 'Your Tour'}</p>
            </div>

            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">
                You received a new inquiry from <strong>${data.anonymousName}</strong> (${data.anonymousEmail})
            </p>

            <div style="background: #f8fffe; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin: 25px 0;">
                <p style="margin: 0; color: #4a5568; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
            </div>

            <div style="background: #f0f8f0; border-radius: 6px; padding: 20px; margin: 25px 0; text-align: center;">
                <h3 style="margin: 0 0 10px; color: #2c5530; font-size: 18px;">💬 Reply via Email</h3>
                <p style="margin: 0; color: #4a5568; font-size: 14px;">
                    Simply reply to this email to answer ${data.anonymousName}'s question.
                </p>
                ${data.conversationId ? `<p style="margin: 10px 0 0; color: #718096; font-size: 12px;">Reference: ${data.conversationId.substring(0, 8)}</p>` : ''}
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${data.conversationUrl || 'https://ab369f57-f214-4187-b9e3-10bb8b4025d9.lovableproject.com/dashboard?section=inbox'}" style="display: inline-block; background: #2c5530; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; font-size: 16px;">View in Dashboard</a>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #718096; font-size: 14px;"><strong>The Made to Hike Team</strong></p>
            </div>
        </div>
    </div>
</body>
</html>`,
      text: `New Tour Inquiry\n\nHi ${data.recipientName || 'there'},\n\n📍 About Tour: ${data.tourTitle || 'Your Tour'}\n\nYou received a new inquiry from ${data.anonymousName} (${data.anonymousEmail})\n\nMessage:\n${data.message}\n\n💬 Simply reply to this email to answer ${data.anonymousName}'s question.${data.conversationId ? `\nReference: ${data.conversationId.substring(0, 8)}` : ''}\n\nOr view in your dashboard: ${data.conversationUrl || 'https://ab369f57-f214-4187-b9e3-10bb8b4025d9.lovableproject.com/dashboard?section=inbox'}\n\nThe Made to Hike Team`
    },

    review_available: {
      subject: data.recipientType === 'hiker' ? `How was your adventure on ${data.tourTitle}?` : `Please review your hiker from ${data.tourTitle}`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Share Your Experience</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #2c5530 0%, #4a7c59 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">🏔️ Made to Hike</h1>
        </div>
        
        <div style="padding: 30px;">
            <h2 style="margin: 0 0 20px; color: #2c5530; font-size: 22px;">${data.recipientType === 'hiker' ? 'How was your adventure?' : 'How was your hiker?'}</h2>
            
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">Hi ${data.recipientName},</p>
            
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">
                ${data.recipientType === 'hiker' 
                  ? `We hope you enjoyed your recent adventure on "${data.tourTitle}"! Your feedback helps other hikers discover amazing experiences and helps guides improve their services.`
                  : `We hope you enjoyed guiding on "${data.tourTitle}"! Your feedback about your hiker helps build trust in our community.`
                }
            </p>

            <div style="background: #f8fffe; border-left: 4px solid #2c5530; padding: 20px; margin: 25px 0; border-radius: 0 4px 4px 0;">
                <p style="margin: 0 0 10px; color: #718096; font-size: 12px; font-weight: 600; text-transform: uppercase;">Tour</p>
                <p style="margin: 0 0 15px; color: #2c5530; font-size: 16px; font-weight: 500;">${data.tourTitle}</p>
                <p style="margin: 0 0 10px; color: #718096; font-size: 12px; font-weight: 600; text-transform: uppercase;">Date</p>
                <p style="margin: 0; color: #2c5530; font-size: 16px; font-weight: 500;">${data.bookingDate}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${data.reviewUrl}" style="display: inline-block; background: #2c5530; color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    ${data.recipientType === 'hiker' ? 'Write Your Review' : 'Review Your Hiker'}
                </a>
            </div>

            <div style="background: #fff4e6; border: 1px solid #ffa726; border-radius: 6px; padding: 16px; margin: 25px 0; text-align: center;">
                <p style="margin: 0; color: #e65100; font-size: 14px;">⏰ Reviews are available for 6 days. This review expires on ${data.expiresDate}.</p>
            </div>

            <div style="background: #f0f8ff; border: 1px solid #64b5f6; border-radius: 6px; padding: 16px; margin: 25px 0;">
                <p style="margin: 0; color: #1565c0; font-size: 14px;">💡 <strong>Did you know?</strong> Reviews are only published when both parties complete theirs, ensuring fairness and authenticity.</p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #718096; font-size: 14px;">Happy hiking! 🥾<br><strong>The Made to Hike Team</strong></p>
            </div>
        </div>
    </div>
</body>
</html>`,
      text: `${data.recipientType === 'hiker' ? 'How was your adventure?' : 'How was your hiker?'}\n\nHi ${data.recipientName},\n\n${data.recipientType === 'hiker' ? `We hope you enjoyed your adventure on "${data.tourTitle}"!` : `We hope you enjoyed guiding on "${data.tourTitle}"!`}\n\nTour: ${data.tourTitle}\nDate: ${data.bookingDate}\n\nLeave your review: ${data.reviewUrl}\n\n⏰ Reviews expire on ${data.expiresDate}\n\nHappy hiking!\nThe Made to Hike Team`
    },

    review_reminder: {
      subject: data.reminderType === 'final_reminder' 
        ? `⏰ Last chance to review ${data.tourTitle}!`
        : `Reminder: Share your experience from ${data.tourTitle}`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Review Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #2c5530 0%, #4a7c59 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">🏔️ Made to Hike</h1>
        </div>
        
        <div style="padding: 30px;">
            <h2 style="margin: 0 0 20px; color: #2c5530; font-size: 22px;">
                ${data.reminderType === 'final_reminder' ? '🚨' : data.reminderType === 'second_reminder' ? '⚠️' : '⏰'} 
                ${data.reminderType === 'final_reminder' ? 'Last chance to leave your review!' : 'Don\'t forget to share your experience!'}
            </h2>
            
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">Hi ${data.recipientName},</p>
            
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">
                ${data.reminderType === 'final_reminder'
                  ? `This is your final reminder - your review for "${data.tourTitle}" expires on ${data.expiresDate}.`
                  : `We noticed you haven't left a review yet for your ${data.recipientType === 'hiker' ? 'adventure' : 'hiker'} on "${data.tourTitle}".`
                }
            </p>

            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">
                ${data.recipientType === 'hiker'
                  ? 'Your feedback helps other hikers discover amazing experiences and helps guides improve their services.'
                  : 'Your feedback about your hiker helps build trust in our community.'
                }
            </p>

            <div style="background: #f8fffe; border-left: 4px solid ${data.reminderType === 'final_reminder' ? '#f44336' : data.reminderType === 'second_reminder' ? '#ff9800' : '#ffa726'}; padding: 20px; margin: 25px 0; border-radius: 0 4px 4px 0;">
                <p style="margin: 0 0 10px; color: #718096; font-size: 12px; font-weight: 600; text-transform: uppercase;">Tour</p>
                <p style="margin: 0 0 15px; color: #2c5530; font-size: 16px; font-weight: 500;">${data.tourTitle}</p>
                <p style="margin: 0 0 10px; color: #718096; font-size: 12px; font-weight: 600; text-transform: uppercase;">Date</p>
                <p style="margin: 0 0 15px; color: #2c5530; font-size: 16px; font-weight: 500;">${data.bookingDate}</p>
                <p style="margin: 0 0 10px; color: #718096; font-size: 12px; font-weight: 600; text-transform: uppercase;">Expires</p>
                <p style="margin: 0; color: ${data.reminderType === 'final_reminder' ? '#f44336' : '#ffa726'}; font-size: 16px; font-weight: 500;">${data.expiresDate}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${data.reviewUrl}" style="display: inline-block; background: ${data.reminderType === 'final_reminder' ? '#f44336' : data.reminderType === 'second_reminder' ? '#ff9800' : '#ffa726'}; color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    ${data.recipientType === 'hiker' ? 'Write Your Review Now' : 'Review Your Hiker Now'}
                </a>
            </div>

            ${data.reminderType === 'final_reminder' ? `
            <div style="background: #ffebee; border: 2px solid #f44336; border-radius: 6px; padding: 16px; margin: 25px 0; text-align: center;">
                <p style="margin: 0; color: #c62828; font-size: 14px;">⏳ <strong>Time is running out!</strong> After expiration, you won't be able to leave a review for this booking.</p>
            </div>
            ` : ''}

            <div style="background: #f0f8ff; border: 1px solid #64b5f6; border-radius: 6px; padding: 16px; margin: 25px 0;">
                <p style="margin: 0; color: #1565c0; font-size: 14px;">💡 Reviews are only published when both parties complete theirs, ensuring fairness and authenticity.</p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #718096; font-size: 14px;">Happy hiking! 🥾<br><strong>The Made to Hike Team</strong></p>
            </div>
        </div>
    </div>
</body>
</html>`,
      text: `${data.reminderType === 'final_reminder' ? '🚨 Last Chance!' : 'Reminder'}\n\nHi ${data.recipientName},\n\n${data.reminderType === 'final_reminder' ? `This is your final reminder - your review expires on ${data.expiresDate}.` : `Don't forget to review "${data.tourTitle}".`}\n\nTour: ${data.tourTitle}\nDate: ${data.bookingDate}\nExpires: ${data.expiresDate}\n\nLeave your review now: ${data.reviewUrl}\n\nHappy hiking!\nThe Made to Hike Team`
    },

    waiver_confirmation: {
      subject: `✅ Waiver Confirmed - ${data.tourTitle}`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Waiver Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #2c5530 0%, #4a7c59 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">✅ Waiver Confirmed</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Your Document Has Been Saved</p>
        </div>
        
        <div style="padding: 30px;">
            <h2 style="margin: 0 0 15px; color: #2c5530; font-size: 22px;">Hi ${data.name} 👋</h2>
            
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">
                Your liability waiver for <strong>${data.tourTitle}</strong> (${data.bookingReference}) has been successfully submitted and securely saved.
            </p>

            <div style="background: #f0f8f0; border-left: 4px solid #2c5530; padding: 20px; margin: 25px 0; border-radius: 0 4px 4px 0;">
                <h3 style="margin: 0 0 10px; color: #2c5530; font-size: 16px;">✓ What's Next</h3>
                <p style="margin: 5px 0; color: #4a5568;">• You can view your signed waiver anytime in your trip details</p>
                <p style="margin: 5px 0; color: #4a5568;">• Your guide has been notified of your submission</p>
                <p style="margin: 5px 0; color: #4a5568;">• All required documents are now on file for your trip</p>
            </div>

            <div style="background: #e3f2fd; border: 1px solid #64b5f6; border-radius: 6px; padding: 16px; margin: 25px 0;">
                <p style="margin: 0; color: #1565c0; font-size: 14px;">💡 Don't forget to upload your travel insurance before your tour start date!</p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #718096; font-size: 14px;">See you on the trail! 🥾<br><strong>The Made to Hike Team</strong></p>
            </div>
        </div>
    </div>
</body>
</html>`,
      text: `✅ Waiver Confirmed\n\nHi ${data.name},\n\nYour liability waiver for ${data.tourTitle} (${data.bookingReference}) has been successfully submitted.\n\nWhat's Next:\n- View your signed waiver in your trip details\n- Your guide has been notified\n- All documents are on file\n\nSee you on the trail!\nThe Made to Hike Team`
    },

    waiver_reminder: {
      subject: `⏰ Action Required: Submit Waiver - ${data.tourTitle}`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Waiver Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">⏰ Waiver Required</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Complete Before Your Tour</p>
        </div>
        
        <div style="padding: 30px;">
            <h2 style="margin: 0 0 15px; color: #2c5530; font-size: 22px;">Hi ${data.participantName} 👋</h2>
            
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">
                Your tour <strong>${data.tourTitle}</strong> departs in ${data.daysUntilTour} days, but we still need your signed liability waiver.
            </p>

            <div style="background: #fff3cd; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 0 4px 4px 0;">
                <h3 style="margin: 0 0 10px; color: #92400e; font-size: 16px;">⚠️ Why This Matters</h3>
                <p style="margin: 5px 0; color: #92400e;">A signed waiver is required for all participants before tour departure. This protects both you and your guide.</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${data.waiverUrl}" style="display: inline-block; background: #f59e0b; color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Submit Waiver Now
                </a>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #718096; font-size: 14px;">Questions? Contact your guide<br><strong>The Made to Hike Team</strong></p>
            </div>
        </div>
    </div>
</body>
</html>`,
      text: `⏰ Waiver Required\n\nHi ${data.participantName},\n\nYour tour ${data.tourTitle} departs in ${data.daysUntilTour} days, but we still need your signed waiver.\n\nSubmit now: ${data.waiverUrl}\n\nThe Made to Hike Team`
    },

    insurance_reminder: {
      subject: `📋 Action Required: Upload Insurance - ${data.tourTitle}`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Insurance Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">📋 Insurance Required</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Upload Before Your Tour</p>
        </div>
        
        <div style="padding: 30px;">
            <h2 style="margin: 0 0 15px; color: #2c5530; font-size: 22px;">Hi ${data.participantName} 👋</h2>
            
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">
                Your tour <strong>${data.tourTitle}</strong> departs in ${data.daysUntilTour} days, but we still need proof of your travel insurance.
            </p>

            <div style="background: #fff3cd; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 0 4px 4px 0;">
                <h3 style="margin: 0 0 10px; color: #92400e; font-size: 16px;">⚠️ Insurance Requirements</h3>
                <p style="margin: 5px 0; color: #92400e;">• Must include mountain rescue coverage</p>
                <p style="margin: 5px 0; color: #92400e;">• Must be valid for tour dates</p>
                <p style="margin: 5px 0; color: #92400e;">• Upload clear photo or PDF of policy</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${data.uploadUrl}" style="display: inline-block; background: #f59e0b; color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Upload Insurance Now
                </a>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #718096; font-size: 14px;">Questions? Contact your guide<br><strong>The Made to Hike Team</strong></p>
            </div>
        </div>
    </div>
</body>
</html>`,
      text: `📋 Insurance Required\n\nHi ${data.participantName},\n\nYour tour ${data.tourTitle} departs in ${data.daysUntilTour} days, but we still need proof of your insurance.\n\nUpload now: ${data.uploadUrl}\n\nThe Made to Hike Team`
    },

    participant_invitation: {
      subject: `📋 Complete Your Tour Documents - ${data.tourTitle}`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete Your Tour Documents</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #7C2D32 0%, #5C1E22 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">🏔️ Made to Hike</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Complete Your Participant Information</p>
        </div>
        
        <div style="padding: 30px;">
            <h2 style="margin: 0 0 20px; color: #2c5530; font-size: 22px;">Hi ${data.participantName}!</h2>
            
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">
                You've been invited by <strong>${data.primaryBooker}</strong> to join this exciting adventure:
            </p>

            <div style="background: #f8fffe; border-left: 4px solid #2c5530; padding: 20px; margin-bottom: 25px; border-radius: 0 4px 4px 0;">
                <h3 style="margin: 0 0 10px; color: #2c5530; font-size: 18px;">${data.tourTitle}</h3>
                <p style="margin: 5px 0; color: #4a5568; font-size: 14px;"><strong>Dates:</strong> ${data.tourDates}</p>
                <p style="margin: 5px 0; color: #4a5568; font-size: 14px;"><strong>Guide:</strong> ${data.guideName}</p>
                <p style="margin: 5px 0; color: #4a5568; font-size: 14px;"><strong>Booking:</strong> #${data.bookingReference}</p>
            </div>

            <h3 style="color: #2c5530; margin-bottom: 15px;">You need to complete:</h3>
            <ul style="color: #4a5568; line-height: 1.8;">
                <li>Liability waiver (digital signature)</li>
                <li>Travel insurance proof</li>
                <li>Emergency contact information</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${data.participantLink}" style="display: inline-block; background: #7C2D32; color: white; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">
                    Complete Your Documents
                </a>
            </div>

            <div style="background: #fff8e1; border-left: 4px solid #ffc107; padding: 15px; border-radius: 0 4px 4px 0; margin-top: 20px;">
                <p style="margin: 0; color: #f57c00; font-size: 14px;">
                    <strong>⏰ Important:</strong> This link expires in 30 days. No account needed!
                </p>
            </div>
        </div>

        <div style="text-align: center; padding: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 12px;">
            <p style="margin: 0;">Questions? Reply to this email or contact ${data.primaryBooker}</p>
        </div>
    </div>
</body>
</html>`,
      text: `Complete Your Tour Documents - ${data.tourTitle}\n\nHi ${data.participantName}!\n\nYou've been invited by ${data.primaryBooker} to join: ${data.tourTitle}\nDates: ${data.tourDates}\nGuide: ${data.guideName}\n\nComplete your documents: ${data.participantLink}\n\nThis link expires in 30 days. Questions? Contact ${data.primaryBooker}`
    },

    participant_reminder: {
      subject: `⏰ Reminder: Complete Your Tour Documents - ${data.tourTitle}`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #7C2D32 0%, #5C1E22 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">⏰ Reminder</h1>
        </div>
        
        <div style="padding: 30px;">
            <h2 style="margin: 0 0 20px; color: #2c5530; font-size: 22px;">Hi ${data.participantName},</h2>
            
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">
                Your tour <strong>${data.tourTitle}</strong> departs in <strong>${data.daysUntilTour} days</strong>, but we still need your participant documents.
            </p>

            <div style="background: #fff8e1; border-left: 4px solid #ffc107; padding: 20px; margin-bottom: 25px; border-radius: 0 4px 4px 0;">
                <p style="margin: 0; color: #f57c00; font-size: 14px;">
                    <strong>Action Required:</strong> Please complete your waiver, insurance, and emergency contact information.
                </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${data.participantLink}" style="display: inline-block; background: #7C2D32; color: white; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">
                    Continue Your Submission
                </a>
            </div>

            <p style="color: #718096; font-size: 14px; text-align: center;">
                Your progress is automatically saved. You can complete this at your own pace.
            </p>
        </div>
    </div>
</body>
</html>`,
      text: `Reminder: Complete Your Tour Documents\n\nHi ${data.participantName},\n\nYour tour ${data.tourTitle} departs in ${data.daysUntilTour} days.\n\nContinue: ${data.participantLink}`
    },

    participant_completion: {
      subject: `✅ Documents Received - ${data.tourTitle}`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #4a7c59 0%, #2c5530 100%); padding: 30px; text-center;">
            <div style="width: 60px; height: 60px; background: white; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 30px;">✅</span>
            </div>
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">All Set!</h1>
        </div>
        
        <div style="padding: 30px;">
            <h2 style="margin: 0 0 20px; color: #2c5530; font-size: 22px;">Thank you, ${data.participantName}!</h2>
            
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">
                We've received all your documents for <strong>${data.tourTitle}</strong>.
            </p>

            <div style="background: #f0f8f0; border-left: 4px solid #4a7c59; padding: 20px; margin-bottom: 25px; border-radius: 0 4px 4px 0;">
                <h3 style="margin: 0 0 15px; color: #2c5530;">What's next?</h3>
                <ul style="margin: 0; padding-left: 20px; color: #4a5568;">
                    <li style="margin-bottom: 8px;">${data.primaryBooker} will be notified</li>
                    <li style="margin-bottom: 8px;">Your guide will review your information</li>
                    <li style="margin-bottom: 8px;">You'll receive tour details 48h before departure</li>
                </ul>
            </div>

            <p style="color: #718096; font-size: 14px; text-align: center;">
                Get excited! Your adventure begins soon 🏔️
            </p>
        </div>
    </div>
</body>
</html>`,
      text: `Documents Received!\n\nThank you, ${data.participantName}!\n\nWe've received all your documents for ${data.tourTitle}.\n\n${data.primaryBooker} will be notified and your guide will review your information.`
    },

    booker_participant_complete: {
      subject: `✅ ${data.participantName} completed tour documents`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #4a7c59 0%, #2c5530 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">Participant Update</h1>
        </div>
        
        <div style="padding: 30px;">
            <h2 style="margin: 0 0 20px; color: #2c5530; font-size: 22px;">Good news!</h2>
            
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">
                <strong>${data.participantName}</strong> has completed their tour documents for <strong>${data.tourTitle}</strong>.
            </p>

            <div style="background: #f0f8f0; border-left: 4px solid #4a7c59; padding: 20px; margin-bottom: 25px; border-radius: 0 4px 4px 0;">
                <p style="margin: 0; color: #2c5530; font-size: 16px;">
                    <strong>Progress:</strong> ${data.completedCount} of ${data.totalCount} participants completed
                </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${data.dashboardLink}" style="display: inline-block; background: #7C2D32; color: white; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">
                    View All Documents
                </a>
            </div>
        </div>
    </div>
</body>
</html>`,
      text: `Participant Update\n\n${data.participantName} has completed their tour documents for ${data.tourTitle}.\n\nProgress: ${data.completedCount} of ${data.totalCount} completed\n\nView: ${data.dashboardLink}`
    },

    guide_participant_documents: {
      subject: `📄 Participant Documents - ${data.tourTitle}`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #7C2D32 0%, #5a2127 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">📄 Participant Documents</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Your Tour Summary</p>
        </div>
        
        <div style="padding: 30px;">
            <h2 style="margin: 0 0 20px; color: #7C2D32; font-size: 22px;">Hi! Here's your participant summary</h2>
            
            <div style="background: #FEF7ED; border-left: 4px solid #7C2D32; padding: 20px; margin: 25px 0; border-radius: 0 4px 4px 0;">
                <h3 style="margin: 0 0 15px; color: #7C2D32; font-size: 18px;">Tour Details</h3>
                <p style="margin: 5px 0; color: #4a5568;"><strong>Tour:</strong> ${data.tourTitle}</p>
                <p style="margin: 5px 0; color: #4a5568;"><strong>Date:</strong> ${data.tourDate}</p>
            </div>

            <div style="background: #f0f8f0; border: 1px solid #d0e8d0; padding: 20px; margin: 25px 0; border-radius: 6px;">
                <h3 style="margin: 0 0 15px; color: #2c5530; font-size: 18px;">Document Status</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 10px 0; color: #4a5568;">Total Participants</td>
                        <td style="padding: 10px 0; color: #2c5530; font-weight: bold; text-align: right;">${data.totalParticipants}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 10px 0; color: #4a5568;">Waivers Completed</td>
                        <td style="padding: 10px 0; color: ${data.completedWaivers === data.totalParticipants ? '#059669' : '#f59e0b'}; font-weight: bold; text-align: right;">${data.completedWaivers} / ${data.totalParticipants}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #4a5568;">Insurance Verified</td>
                        <td style="padding: 10px 0; color: ${data.completedInsurance === data.totalParticipants ? '#059669' : '#f59e0b'}; font-weight: bold; text-align: right;">${data.completedInsurance} / ${data.totalParticipants}</td>
                    </tr>
                </table>
            </div>

            <p style="margin: 20px 0; color: #4a5568; font-size: 14px;">
                Please find the complete participant documentation attached to this email as an HTML file. You can open it in any web browser to view all participant details, waivers, and insurance information.
            </p>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #718096; font-size: 14px;">
                    <strong>Made to Hike</strong><br>
                    Questions? Contact support@madetohike.com
                </p>
            </div>
        </div>
    </div>
</body>
</html>`,
      text: `Participant Documents - ${data.tourTitle}\n\nTour Date: ${data.tourDate}\n\nDocument Status:\n- Total Participants: ${data.totalParticipants}\n- Waivers Completed: ${data.completedWaivers} / ${data.totalParticipants}\n- Insurance Verified: ${data.completedInsurance} / ${data.totalParticipants}\n\nPlease see the attached HTML file for complete participant documentation.`
    },

    review_response: {
      subject: `${data.responderType === 'guide' ? 'Your guide' : 'Your hiker'} responded to your review - ${data.tourTitle}`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #7C2D32 0%, #5a2127 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">💬 New Response to Your Review</h1>
        </div>
        
        <div style="padding: 30px;">
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">Hi ${data.reviewerName},</p>
            
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">
                ${data.responderType === 'guide' ? 'Your guide' : 'Your hiker'} has responded to the review you left for <strong>${data.tourTitle}</strong>.
            </p>

            <div style="background: #FEF7ED; border-left: 4px solid #7C2D32; padding: 20px; margin: 25px 0; border-radius: 0 4px 4px 0;">
                <p style="margin: 0 0 12px; color: #666; font-size: 14px; font-style: italic;">Your review (${data.rating}/5):</p>
                <p style="margin: 0; color: #4a5568; font-size: 15px; line-height: 1.6;">"${data.reviewComment}"</p>
            </div>

            <div style="background: white; border: 2px solid #7C2D32; padding: 20px; margin: 25px 0; border-radius: 8px;">
                <p style="margin: 0 0 12px; color: #7C2D32; font-size: 14px; font-weight: 600;">Response:</p>
                <p style="margin: 0; color: #4a5568; font-size: 15px; line-height: 1.6;">"${data.responseText}"</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${data.dashboardUrl}" style="display: inline-block; background: #7C2D32; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    View Full Conversation
                </a>
            </div>

            <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px;">
                <p style="margin: 0; color: #718096; font-size: 13px; line-height: 1.6;">
                    Thank you for being part of the MadeToHike community!
                </p>
            </div>
        </div>
    </div>
</body>
</html>`,
      text: `${data.responderType === 'guide' ? 'Your guide' : 'Your hiker'} responded to your review - ${data.tourTitle}\n\nHi ${data.reviewerName},\n\n${data.responderType === 'guide' ? 'Your guide' : 'Your hiker'} has responded to the review you left for ${data.tourTitle}.\n\nYour review (${data.rating}/5):\n"${data.reviewComment}"\n\nResponse:\n"${data.responseText}"\n\nView the full conversation at: ${data.dashboardUrl}\n\nThank you for being part of the MadeToHike community!`
    },

    // PHASE 1: Critical Missing Templates
    booking_cancellation_hiker: {
      subject: `❌ Booking Cancelled - ${data.tourTitle}`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #7C2D32 0%, #5a2127 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">Booking Cancelled</h1>
        </div>
        
        <div style="padding: 30px;">
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">Hi ${data.hikerName},</p>
            
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">
                Your booking has been cancelled for:
            </p>

            <div style="background: #FEF7ED; border-left: 4px solid #7C2D32; padding: 20px; margin: 25px 0; border-radius: 0 4px 4px 0;">
                <p style="margin: 5px 0; color: #4a5568;"><strong>Tour:</strong> ${data.tourTitle}</p>
                <p style="margin: 5px 0; color: #4a5568;"><strong>Booking Reference:</strong> ${data.bookingReference}</p>
                <p style="margin: 5px 0; color: #4a5568;"><strong>Date:</strong> ${data.bookingDate}</p>
                <p style="margin: 5px 0; color: #4a5568;"><strong>Guide:</strong> ${data.guideName}</p>
                ${data.reason ? `<p style="margin: 15px 0 5px; color: #4a5568;"><strong>Reason:</strong> ${data.reason}</p>` : ''}
            </div>

            ${data.refundAmount ? `
            <div style="background: #f0f8f0; border: 1px solid #4a7c59; border-radius: 6px; padding: 16px; margin: 25px 0;">
                <p style="margin: 0; color: #2c5530; font-size: 16px; font-weight: 600;">
                    Refund being processed: ${data.currency} ${data.refundAmount}
                </p>
                <p style="margin: 8px 0 0; color: #4a5568; font-size: 14px;">
                    You will see the refund in 5-10 business days.
                </p>
            </div>
            ` : ''}

            <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px;">
                <p style="margin: 0; color: #718096; font-size: 13px;">
                    If you have questions, please contact <strong>${data.guideName}</strong> or our support team.
                </p>
            </div>
        </div>
    </div>
</body>
</html>`,
      text: `Booking Cancelled - ${data.tourTitle}\n\nHi ${data.hikerName},\n\nYour booking has been cancelled:\n\nTour: ${data.tourTitle}\nBooking Reference: ${data.bookingReference}\nDate: ${data.bookingDate}\nGuide: ${data.guideName}\n${data.reason ? `Reason: ${data.reason}\n` : ''}\n${data.refundAmount ? `\nRefund being processed: ${data.currency} ${data.refundAmount}\nYou will see this in 5-10 business days.\n` : ''}\nIf you have questions, please contact ${data.guideName} or our support team.`
    },

    booking_cancellation_guide: {
      subject: `❌ Booking Cancelled - ${data.tourTitle}`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #7C2D32 0%, #5a2127 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">Booking Cancelled</h1>
        </div>
        
        <div style="padding: 30px;">
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">Hi ${data.guideName},</p>
            
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">
                A booking has been cancelled:
            </p>

            <div style="background: #FEF7ED; border-left: 4px solid #7C2D32; padding: 20px; margin: 25px 0; border-radius: 0 4px 4px 0;">
                <p style="margin: 5px 0; color: #4a5568;"><strong>Tour:</strong> ${data.tourTitle}</p>
                <p style="margin: 5px 0; color: #4a5568;"><strong>Booking Reference:</strong> ${data.bookingReference}</p>
                <p style="margin: 5px 0; color: #4a5568;"><strong>Date:</strong> ${data.bookingDate}</p>
                <p style="margin: 5px 0; color: #4a5568;"><strong>Hiker:</strong> ${data.hikerName}</p>
                <p style="margin: 5px 0; color: #4a5568;"><strong>Cancelled:</strong> ${data.cancelledAt}</p>
            </div>

            <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px;">
                <p style="margin: 0; color: #718096; font-size: 13px;">
                    This spot is now available for new bookings.
                </p>
            </div>
        </div>
    </div>
</body>
</html>`,
      text: `Booking Cancelled - ${data.tourTitle}\n\nHi ${data.guideName},\n\nA booking has been cancelled:\n\nTour: ${data.tourTitle}\nBooking Reference: ${data.bookingReference}\nDate: ${data.bookingDate}\nHiker: ${data.hikerName}\nCancelled: ${data.cancelledAt}\n\nThis spot is now available for new bookings.`
    },

    booking_refund_hiker: {
      subject: `✅ Refund Processed - ${data.tourTitle}`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #4a7c59 0%, #2c5530 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">✅ Refund Processed</h1>
        </div>
        
        <div style="padding: 30px;">
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">Hi ${data.hikerName},</p>
            
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">
                Your refund has been processed for:
            </p>

            <div style="background: #FEF7ED; border-left: 4px solid #4a7c59; padding: 20px; margin: 25px 0; border-radius: 0 4px 4px 0;">
                <p style="margin: 5px 0; color: #4a5568;"><strong>Tour:</strong> ${data.tourTitle}</p>
                <p style="margin: 5px 0; color: #4a5568;"><strong>Booking Reference:</strong> ${data.bookingReference}</p>
                <p style="margin: 5px 0; color: #4a5568;"><strong>Guide:</strong> ${data.guideName}</p>
            </div>

            <div style="background: #f0f8f0; border: 2px solid #4a7c59; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
                <p style="margin: 0 0 8px; color: #2c5530; font-size: 20px; font-weight: 600;">
                    ${data.currency} ${data.refundAmount}
                </p>
                <p style="margin: 0; color: #4a5568; font-size: 14px;">
                    ${data.refundReason ? `Reason: ${data.refundReason}` : 'Refund processed'}
                </p>
            </div>

            <div style="background: #e3f2fd; border: 1px solid #64b5f6; border-radius: 6px; padding: 16px; margin: 25px 0;">
                <p style="margin: 0; color: #1565c0; font-size: 14px;">
                    💳 Your refund of <strong>${data.currency} ${data.refundAmount}</strong> will appear in your account within 5-10 business days.
                </p>
            </div>

            <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; text-align: center;">
                <p style="margin: 0; color: #718096; font-size: 13px;">
                    Questions? Contact our support team.
                </p>
            </div>
        </div>
    </div>
</body>
</html>`,
      text: `✅ Refund Processed - ${data.tourTitle}\n\nHi ${data.hikerName},\n\nYour refund has been processed:\n\nTour: ${data.tourTitle}\nBooking Reference: ${data.bookingReference}\nGuide: ${data.guideName}\n\nRefund Amount: ${data.currency} ${data.refundAmount}\n${data.refundReason ? `Reason: ${data.refundReason}\n` : ''}\nYour refund will appear in your account within 5-10 business days.\n\nQuestions? Contact our support team.`
    },

    // PHASE 2: High Priority New Templates
    pre_trip_reminder: {
      subject: `🏔️ Your adventure starts in 3 days! - ${data.tourTitle}`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #7C2D32 0%, #5a2127 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">🏔️ Your Adventure Starts Soon!</h1>
        </div>
        
        <div style="padding: 30px;">
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">Hi ${data.hikerName},</p>
            
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">
                Your adventure <strong>${data.tourTitle}</strong> starts in <strong>3 days</strong>!
            </p>

            <div style="background: #FEF7ED; border-left: 4px solid #7C2D32; padding: 20px; margin: 25px 0; border-radius: 0 4px 4px 0;">
                <h3 style="margin: 0 0 15px; color: #7C2D32;">📅 Tour Details</h3>
                <p style="margin: 5px 0; color: #4a5568;"><strong>Tour Date:</strong> ${data.tourDate}</p>
                <p style="margin: 5px 0; color: #4a5568;"><strong>Meeting Time:</strong> ${data.startTime}</p>
                <p style="margin: 5px 0; color: #4a5568;"><strong>Meeting Point:</strong> ${data.meetingPoint}</p>
                <p style="margin: 5px 0; color: #4a5568;"><strong>Guide:</strong> ${data.guideName}</p>
            </div>

            <div style="background: #fff8e1; border-left: 4px solid #ffc107; padding: 20px; margin: 25px 0; border-radius: 0 4px 4px 0;">
                <h3 style="margin: 0 0 15px; color: #f57c00;">✓ Final Checklist</h3>
                <ul style="margin: 0; padding-left: 20px; color: #4a5568; line-height: 1.8;">
                    <li>Check weather forecast</li>
                    <li>Pack all required gear</li>
                    <li>Bring signed waiver (if not uploaded)</li>
                    <li>Ensure travel insurance is valid</li>
                    <li>Charge your phone/camera</li>
                </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${data.checklistUrl}" style="display: inline-block; background: #7C2D32; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    View Full Checklist
                </a>
            </div>

            <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; text-align: center;">
                <p style="margin: 0; color: #718096; font-size: 13px;">
                    Get ready for an amazing adventure! 🥾
                </p>
            </div>
        </div>
    </div>
</body>
</html>`,
      text: `🏔️ Your adventure starts in 3 days! - ${data.tourTitle}\n\nHi ${data.hikerName},\n\nYour adventure starts in 3 days!\n\nTour Date: ${data.tourDate}\nMeeting Time: ${data.startTime}\nMeeting Point: ${data.meetingPoint}\nGuide: ${data.guideName}\n\nFinal Checklist:\n- Check weather forecast\n- Pack all required gear\n- Bring signed waiver\n- Ensure insurance is valid\n- Charge phone/camera\n\nView full checklist: ${data.checklistUrl}\n\nGet ready for an amazing adventure! 🥾`
    },

    post_trip_thank_you: {
      subject: `✨ Thank you for hiking with us! - ${data.tourTitle}`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #4a7c59 0%, #2c5530 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">✨ Thank You for Hiking with Us!</h1>
        </div>
        
        <div style="padding: 30px;">
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">Hi ${data.hikerName},</p>
            
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">
                Thank you for completing <strong>${data.tourTitle}</strong> with ${data.guideName}! We hope you had an amazing adventure.
            </p>

            <div style="background: #FEF7ED; border-left: 4px solid #4a7c59; padding: 20px; margin: 25px 0; border-radius: 0 4px 4px 0;">
                <h3 style="margin: 0 0 15px; color: #2c5530;">⭐ Share Your Experience</h3>
                <p style="margin: 0 0 15px; color: #4a5568;">
                    Your feedback helps other hikers make informed decisions and helps guides improve their tours.
                </p>
                <div style="text-align: center; margin-top: 20px;">
                    <a href="${data.reviewUrl}" style="display: inline-block; background: #4a7c59; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">
                        Leave a Review
                    </a>
                </div>
            </div>

            <div style="background: #e3f2fd; border: 1px solid #64b5f6; border-radius: 6px; padding: 16px; margin: 25px 0;">
                <p style="margin: 0; color: #1565c0; font-size: 14px; text-align: center;">
                    💡 Reviews are only published when both parties complete theirs, ensuring fairness and authenticity.
                </p>
            </div>

            <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; text-align: center;">
                <p style="margin: 0 0 10px; color: #718096; font-size: 13px;">
                    We'd love to see you on the trails again soon! 🥾
                </p>
                <p style="margin: 0; color: #718096; font-size: 13px;">
                    <strong>The Made to Hike Team</strong>
                </p>
            </div>
        </div>
    </div>
</body>
</html>`,
      text: `✨ Thank you for hiking with us! - ${data.tourTitle}\n\nHi ${data.hikerName},\n\nThank you for completing ${data.tourTitle} with ${data.guideName}! We hope you had an amazing adventure.\n\n⭐ Share Your Experience\nYour feedback helps other hikers make informed decisions and helps guides improve their tours.\n\nLeave a review: ${data.reviewUrl}\n\nReviews are only published when both parties complete theirs.\n\nWe'd love to see you on the trails again soon! 🥾\nThe Made to Hike Team`
    },

    tour_date_change_notification: {
      subject: `📅 Tour Date Changed - ${data.tourTitle}`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">📅 Tour Date Changed</h1>
        </div>
        
        <div style="padding: 30px;">
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">Hi ${data.hikerName},</p>
            
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">
                Your guide ${data.guideName} has changed the date for <strong>${data.tourTitle}</strong>.
            </p>

            <div style="background: #fff8e1; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 0 4px 4px 0;">
                <p style="margin: 5px 0; color: #92400e;"><strong>Booking Reference:</strong> ${data.bookingReference}</p>
                <p style="margin: 15px 0 5px; color: #92400e;"><strong>Previous Date:</strong> ${data.oldDate}</p>
                <p style="margin: 5px 0; color: #059669; font-size: 18px; font-weight: 600;"><strong>New Date:</strong> ${data.newDate}</p>
            </div>

            <div style="background: #e3f2fd; border: 1px solid #64b5f6; border-radius: 6px; padding: 16px; margin: 25px 0;">
                <p style="margin: 0; color: #1565c0; font-size: 14px;">
                    💡 If you cannot make the new date, please contact ${data.guideName} to discuss alternatives or cancellation options.
                </p>
            </div>

            <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; text-align: center;">
                <p style="margin: 0; color: #718096; font-size: 13px;">
                    Questions? Contact ${data.guideName} directly.
                </p>
            </div>
        </div>
    </div>
</body>
</html>`,
      text: `📅 Tour Date Changed - ${data.tourTitle}\n\nHi ${data.hikerName},\n\nYour guide ${data.guideName} has changed the date for ${data.tourTitle}.\n\nBooking Reference: ${data.bookingReference}\nPrevious Date: ${data.oldDate}\nNew Date: ${data.newDate}\n\nIf you cannot make the new date, please contact ${data.guideName} to discuss alternatives.\n\nQuestions? Contact ${data.guideName} directly.`
    },

    tour_fully_booked_alert: {
      subject: `🎉 Tour Fully Booked - ${data.tourTitle}`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #4a7c59 0%, #2c5530 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">🎉 Tour Fully Booked!</h1>
        </div>
        
        <div style="padding: 30px;">
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">Hi ${data.guideName},</p>
            
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">
                Great news! Your tour <strong>${data.tourTitle}</strong> is now fully booked!
            </p>

            <div style="background: #f0f8f0; border: 2px solid #4a7c59; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
                <p style="margin: 0 0 8px; color: #2c5530; font-size: 24px; font-weight: 600;">
                    ${data.totalSpots} / ${data.totalSpots} Spots
                </p>
                <p style="margin: 0; color: #4a5568; font-size: 14px;">
                    Tour Date: ${data.tourDate}
                </p>
            </div>

            <div style="background: #FEF7ED; border-left: 4px solid #4a7c59; padding: 20px; margin: 25px 0; border-radius: 0 4px 4px 0;">
                <p style="margin: 0 0 10px; color: #2c5530; font-size: 16px; font-weight: 600;">
                    Total Bookings: ${data.bookingsCount}
                </p>
                <p style="margin: 0; color: #4a5568; font-size: 14px;">
                    All participants confirmed
                </p>
            </div>

            <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; text-align: center;">
                <p style="margin: 0; color: #718096; font-size: 13px;">
                    Get ready for a great tour! 🥾
                </p>
            </div>
        </div>
    </div>
</body>
</html>`,
      text: `🎉 Tour Fully Booked! - ${data.tourTitle}\n\nHi ${data.guideName},\n\nGreat news! Your tour ${data.tourTitle} is now fully booked!\n\n${data.totalSpots} / ${data.totalSpots} Spots\nTour Date: ${data.tourDate}\n\nTotal Bookings: ${data.bookingsCount}\nAll participants confirmed\n\nGet ready for a great tour! 🥾`
    },

    payout_processed_notification: {
      subject: `💰 Payout Processed - ${data.currency} ${data.amount}`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #4a7c59 0%, #2c5530 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">💰 Payout Processed</h1>
        </div>
        
        <div style="padding: 30px;">
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">Hi ${data.guideName},</p>
            
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">
                Your payout has been processed successfully!
            </p>

            <div style="background: #f0f8f0; border: 2px solid #4a7c59; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
                <p style="margin: 0 0 8px; color: #2c5530; font-size: 28px; font-weight: 600;">
                    ${data.currency} ${data.amount}
                </p>
                <p style="margin: 0; color: #4a5568; font-size: 14px;">
                    Payout Date: ${data.payoutDate}
                </p>
            </div>

            <div style="background: #FEF7ED; border-left: 4px solid #4a7c59; padding: 20px; margin: 25px 0; border-radius: 0 4px 4px 0;">
                <p style="margin: 5px 0; color: #4a5568;"><strong>Bank Account:</strong> ****${data.bankLast4}</p>
                <p style="margin: 5px 0; color: #4a5568;"><strong>Expected Arrival:</strong> 2-3 business days</p>
            </div>

            <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; text-align: center;">
                <p style="margin: 0; color: #718096; font-size: 13px;">
                    Questions about your payout? Contact our support team.
                </p>
            </div>
        </div>
    </div>
</body>
</html>`,
      text: `💰 Payout Processed - ${data.currency} ${data.amount}\n\nHi ${data.guideName},\n\nYour payout has been processed successfully!\n\nAmount: ${data.currency} ${data.amount}\nPayout Date: ${data.payoutDate}\nBank Account: ****${data.bankLast4}\nExpected Arrival: 2-3 business days\n\nQuestions about your payout? Contact our support team.`
    },

    // PHASE 3: Medium Priority Templates
    document_upload_notification: {
      subject: `📄 Document Uploaded - ${data.tourTitle}`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #7C2D32 0%, #5a2127 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">📄 Document Uploaded</h1>
        </div>
        
        <div style="padding: 30px;">
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">Hi ${data.guideName},</p>
            
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">
                ${data.hikerName} has uploaded their <strong>${data.documentType}</strong> for ${data.tourTitle}.
            </p>

            <div style="background: #FEF7ED; border-left: 4px solid #7C2D32; padding: 20px; margin: 25px 0; border-radius: 0 4px 4px 0;">
                <p style="margin: 5px 0; color: #4a5568;"><strong>Hiker:</strong> ${data.hikerName}</p>
                <p style="margin: 5px 0; color: #4a5568;"><strong>Document:</strong> ${data.documentType}</p>
                <p style="margin: 5px 0; color: #4a5568;"><strong>Uploaded:</strong> ${data.uploadDate}</p>
            </div>

            <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; text-align: center;">
                <p style="margin: 0; color: #718096; font-size: 13px;">
                    View documents in your booking dashboard.
                </p>
            </div>
        </div>
    </div>
</body>
</html>`,
      text: `📄 Document Uploaded - ${data.tourTitle}\n\nHi ${data.guideName},\n\n${data.hikerName} has uploaded their ${data.documentType} for ${data.tourTitle}.\n\nHiker: ${data.hikerName}\nDocument: ${data.documentType}\nUploaded: ${data.uploadDate}\n\nView documents in your booking dashboard.`
    },

    review_received_notification: {
      subject: `⭐ New Review Received - ${data.tourTitle}`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #7C2D32 0%, #5a2127 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">⭐ New Review Received</h1>
        </div>
        
        <div style="padding: 30px;">
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">Hi ${data.guideName},</p>
            
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">
                ${data.reviewerName} left a review for <strong>${data.tourTitle}</strong>!
            </p>

            <div style="background: #FEF7ED; border: 2px solid #7C2D32; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
                <p style="margin: 0 0 8px; color: #7C2D32; font-size: 32px; font-weight: 600;">
                    ${data.rating} ⭐
                </p>
                <p style="margin: 0; color: #4a5568; font-size: 14px;">
                    Overall Rating
                </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${data.reviewUrl}" style="display: inline-block; background: #7C2D32; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Read Full Review
                </a>
            </div>

            <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; text-align: center;">
                <p style="margin: 0; color: #718096; font-size: 13px;">
                    Thank you for providing great experiences! 🥾
                </p>
            </div>
        </div>
    </div>
</body>
</html>`,
      text: `⭐ New Review Received - ${data.tourTitle}\n\nHi ${data.guideName},\n\n${data.reviewerName} left a review for ${data.tourTitle}!\n\nOverall Rating: ${data.rating} ⭐\n\nRead full review: ${data.reviewUrl}\n\nThank you for providing great experiences! 🥾`
    },

    guide_verification_completed: {
      subject: `${data.status === 'approved' ? '✅ Verification Approved' : '❌ Verification Update Required'}`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, ${data.status === 'approved' ? '#4a7c59' : '#f59e0b'} 0%, ${data.status === 'approved' ? '#2c5530' : '#f97316'} 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">${data.status === 'approved' ? '✅ Verification Approved' : '❌ Update Required'}</h1>
        </div>
        
        <div style="padding: 30px;">
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">Hi ${data.guideName},</p>
            
            ${data.status === 'approved' ? `
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">
                Congratulations! Your guide verification has been <strong>approved</strong>. You can now create and publish tours!
            </p>

            <div style="background: #f0f8f0; border: 2px solid #4a7c59; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
                <p style="margin: 0; color: #2c5530; font-size: 18px; font-weight: 600;">
                    ✓ Verified Guide
                </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="https://ab369f57-f214-4187-b9e3-10bb8b4025d9.lovableproject.com/dashboard" style="display: inline-block; background: #4a7c59; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Create Your First Tour
                </a>
            </div>
            ` : `
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">
                Your verification request requires additional information or updates.
            </p>

            ${data.adminNotes ? `
            <div style="background: #fff8e1; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 0 4px 4px 0;">
                <p style="margin: 0 0 10px; color: #92400e; font-size: 14px; font-weight: 600;">Admin Notes:</p>
                <p style="margin: 0; color: #92400e; font-size: 14px;">${data.adminNotes}</p>
            </div>
            ` : ''}

            <div style="text-align: center; margin: 30px 0;">
                <a href="https://ab369f57-f214-4187-b9e3-10bb8b4025d9.lovableproject.com/dashboard" style="display: inline-block; background: #f59e0b; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Update Your Profile
                </a>
            </div>
            `}

            <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; text-align: center;">
                <p style="margin: 0; color: #718096; font-size: 13px;">
                    Questions? Contact our support team.
                </p>
            </div>
        </div>
    </div>
</body>
</html>`,
      text: `${data.status === 'approved' ? '✅ Verification Approved' : '❌ Update Required'}\n\nHi ${data.guideName},\n\n${data.status === 'approved' ? 'Congratulations! Your guide verification has been approved. You can now create and publish tours!\n\nCreate your first tour: https://ab369f57-f214-4187-b9e3-10bb8b4025d9.lovableproject.com/dashboard' : `Your verification request requires additional information.\n\n${data.adminNotes ? `Admin Notes: ${data.adminNotes}\n\n` : ''}Update your profile: https://ab369f57-f214-4187-b9e3-10bb8b4025d9.lovableproject.com/dashboard`}\n\nQuestions? Contact our support team.`
    },

    failed_payment_alert_admin: {
      subject: `🚨 Failed Payment Alert - ${data.bookingReference}`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">🚨 Failed Payment Alert</h1>
        </div>
        
        <div style="padding: 30px;">
            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px;">Admin Alert: Payment Failed</p>
            
            <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 20px; margin: 25px 0; border-radius: 0 4px 4px 0;">
                <p style="margin: 5px 0; color: #991b1b;"><strong>Booking Reference:</strong> ${data.bookingReference}</p>
                <p style="margin: 5px 0; color: #991b1b;"><strong>Hiker:</strong> ${data.hikerName}</p>
                <p style="margin: 5px 0; color: #991b1b;"><strong>Tour:</strong> ${data.tourTitle}</p>
                <p style="margin: 5px 0; color: #991b1b;"><strong>Amount:</strong> ${data.currency} ${data.amount}</p>
                <p style="margin: 5px 0; color: #991b1b;"><strong>Error Code:</strong> ${data.errorCode}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="https://ab369f57-f214-4187-b9e3-10bb8b4025d9.lovableproject.com/admin" style="display: inline-block; background: #dc2626; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Review in Admin
                </a>
            </div>
        </div>
    </div>
</body>
</html>`,
      text: `🚨 Failed Payment Alert - ${data.bookingReference}\n\nAdmin Alert: Payment Failed\n\nBooking Reference: ${data.bookingReference}\nHiker: ${data.hikerName}\nTour: ${data.tourTitle}\nAmount: ${data.currency} ${data.amount}\nError Code: ${data.errorCode}\n\nReview in admin: https://ab369f57-f214-4187-b9e3-10bb8b4025d9.lovableproject.com/admin`
    },
  };

  const allowedTypes = ['contact', 'newsletter', 'verification', 'welcome', 'booking', 'booking-confirmation', 'guide-booking-notification', 'custom_verification', 'verification-code', 'new_message', 'new_anonymous_inquiry', 'review_available', 'review_reminder', 'waiver_confirmation', 'waiver_reminder', 'insurance_reminder', 'participant_invitation', 'participant_reminder', 'participant_completion', 'booker_participant_complete', 'guide_participant_documents', 'review_response', 'booking_cancellation_hiker', 'booking_cancellation_guide', 'booking_refund_hiker', 'pre_trip_reminder', 'post_trip_thank_you', 'tour_date_change_notification', 'tour_fully_booked_alert', 'payout_processed_notification', 'document_upload_notification', 'review_received_notification', 'guide_verification_completed', 'failed_payment_alert_admin'];

  return templates[type as keyof typeof templates] || templates.contact
}

// Enhanced validation function
const validateEmailRequest = (body: any): EmailRequest => {
  const errors: string[] = []

  if (!body.type || !['contact', 'newsletter', 'verification', 'welcome', 'booking', 'booking-confirmation', 'guide-booking-notification', 'custom_verification', 'admin_verification_request', 'verification-code', 'new_message', 'new_anonymous_inquiry', 'review_available', 'review_reminder', 'waiver_confirmation', 'waiver_reminder', 'insurance_reminder', 'participant_invitation', 'participant_reminder', 'participant_completion', 'booker_participant_complete', 'guide_participant_documents', 'review_response', 'booking_cancellation_hiker', 'booking_cancellation_guide', 'booking_refund_hiker', 'pre_trip_reminder', 'post_trip_thank_you', 'tour_date_change_notification', 'tour_fully_booked_alert', 'payout_processed_notification', 'document_upload_notification', 'review_received_notification', 'guide_verification_completed', 'failed_payment_alert_admin'].includes(body.type)) {
    errors.push('Invalid or missing email type')
  }

  if (!body.to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.to)) {
    errors.push('Invalid or missing recipient email')
  }

  // Type-specific validation
  switch (body.type) {
    case 'contact':
      if (!body.name || body.name.trim().length < 2) errors.push('Name is required (minimum 2 characters)')
      if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) errors.push('Valid email is required')
      if (!body.message || body.message.trim().length < 10) errors.push('Message is required (minimum 10 characters)')
      if (body.message && body.message.length > 5000) errors.push('Message too long (maximum 5000 characters)')
      break
    case 'newsletter':
      if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) errors.push('Valid email is required')
      break
    case 'custom_verification':
      if (!body.template_data?.user_name) errors.push('User name is required for verification emails')
      if (!body.template_data?.verification_url) errors.push('Verification URL is required')
      break
  }

  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`)
  }

  return body as EmailRequest
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate API key
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set')
      return new Response(
        JSON.stringify({ error: 'Email service configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const emailRequest = validateEmailRequest(await req.json())
    console.log('Processing email request:', { type: emailRequest.type, to: emailRequest.to })

    // Handle guide_participant_documents email with HTML attachment
    if (emailRequest.type === 'guide_participant_documents') {
      const htmlAttachment = emailRequest.data?.htmlAttachment;
      const fileName = emailRequest.data?.fileName || 'participant-documents.html';

      // Decode base64 attachment
      const attachmentContent = htmlAttachment ? atob(htmlAttachment) : '';

      const template = getEmailTemplate(emailRequest.type, {
        ...emailRequest.data,
      });

      const emailPayload: any = {
        from: 'MadeToHike <documents@madetohike.com>',
        to: emailRequest.to,
        subject: emailRequest.subject || template.subject,
        html: template.html,
        text: template.text,
      };

      // Add attachment if provided
      if (attachmentContent) {
        emailPayload.attachments = [{
          filename: fileName,
          content: btoa(unescape(encodeURIComponent(attachmentContent))),
        }];
      }

      console.log('Sending guide participant documents email via Resend...');
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Resend API error:', result);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to send email', 
            details: result.message || 'Unknown error',
            code: result.name || 'EMAIL_SEND_ERROR'
          }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Guide participant documents email sent successfully:', result.id);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Participant documents email sent successfully',
          id: result.id,
          type: emailRequest.type
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle booking-confirmation email
    if (emailRequest.type === 'booking-confirmation') {
      const html = generateBookingConfirmationEmail({
        bookingReference: emailRequest.bookingReference || 'N/A',
        tourTitle: emailRequest.tourTitle || 'Hiking Tour',
        bookingDate: emailRequest.bookingDate || new Date().toISOString(),
        guideName: emailRequest.guideName || 'Your Guide',
        meetingPoint: emailRequest.meetingPoint || 'Details will be shared',
        totalPrice: emailRequest.totalPrice || 0,
        currency: emailRequest.currency || 'EUR',
        participants: emailRequest.participants || 1,
        isDeposit: emailRequest.isDeposit,
        depositAmount: emailRequest.depositAmount,
        finalPaymentAmount: emailRequest.finalPaymentAmount,
        finalPaymentDueDate: emailRequest.finalPaymentDueDate,
      })


      const emailPayload = {
        from: 'MadeToHike <bookings@madetohike.com>',
        to: emailRequest.to,
        subject: `🎒 Booking Confirmed - ${emailRequest.tourTitle} (${emailRequest.bookingReference})`,
        html,
      }

      console.log('Sending booking confirmation email via Resend...')
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Resend API error:', result)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to send email', 
            details: result.message || 'Unknown error',
            code: result.name || 'EMAIL_SEND_ERROR'
          }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('Booking confirmation email sent successfully:', result.id)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Booking confirmation email sent successfully',
          id: result.id,
          type: emailRequest.type
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle guide-booking-notification email
    if (emailRequest.type === 'guide-booking-notification') {
      const html = generateGuideBookingNotificationEmail({
        bookingReference: emailRequest.bookingReference || 'N/A',
        tourTitle: emailRequest.tourTitle || 'Hiking Tour',
        bookingDate: emailRequest.bookingDate || new Date().toISOString(),
        hikerName: emailRequest.name,
        hikerEmail: emailRequest.email || 'guest@madetohike.com',
        meetingPoint: emailRequest.meetingPoint || 'Details will be shared',
        totalPrice: emailRequest.totalPrice || 0,
        currency: emailRequest.currency || 'EUR',
        participants: emailRequest.participants || 1,
      })

      const emailPayload = {
        from: 'MadeToHike <bookings@madetohike.com>',
        to: emailRequest.to,
        subject: `🎉 New Booking - ${emailRequest.tourTitle} (${emailRequest.bookingReference})`,
        html,
      }

      console.log('Sending guide booking notification email via Resend...')
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Resend API error:', result)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to send email', 
            details: result.message || 'Unknown error',
            code: result.name || 'EMAIL_SEND_ERROR'
          }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('Guide booking notification email sent successfully:', result.id)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Guide booking notification email sent successfully',
          id: result.id,
          type: emailRequest.type
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the appropriate email template for other types
    const template = getEmailTemplate(emailRequest.type, {
      ...emailRequest,
      ...emailRequest.data,
      ...emailRequest.template_data,
      websiteUrl: 'https://ab369f57-f214-4187-b9e3-10bb8b4025d9.lovableproject.com'
    })

    // Prepare email payload
    const emailPayload = {
      from: emailRequest.from || 'MadeToHike <noreply@madetohike.com>',
      to: emailRequest.to,
      subject: emailRequest.subject || template.subject,
      html: template.html,
      text: template.text,
      ...(emailRequest.reply_to && { reply_to: emailRequest.reply_to }),
      ...(emailRequest.email && !emailRequest.reply_to && { reply_to: emailRequest.email })
    }

    // Send email via Resend
    console.log('Sending email via Resend...')
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Resend API error:', result)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send email', 
          details: result.message || 'Unknown error',
          code: result.name || 'EMAIL_SEND_ERROR'
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Email sent successfully:', result.id)

    // Send confirmation email for contact forms
    if (emailRequest.type === 'contact' && emailRequest.email) {
      try {
        const confirmationTemplate = getEmailTemplate('confirmation', {
          name: emailRequest.name,
          websiteUrl: 'https://ab369f57-f214-4187-b9e3-10bb8b4025d9.lovableproject.com'
        })

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'MadeToHike <noreply@madetohike.com>',
            to: emailRequest.email,
            subject: confirmationTemplate.subject,
            html: confirmationTemplate.html,
            text: confirmationTemplate.text,
          }),
        })
        
        console.log('Confirmation email sent to user')
      } catch (error) {
        console.error('Failed to send confirmation email:', error)
        // Don't fail the main request if confirmation email fails
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        id: result.id,
        type: emailRequest.type
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Email function error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        type: 'FUNCTION_ERROR'
      }),
      { 
        status: error.message?.includes('Validation errors') ? 400 : 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})