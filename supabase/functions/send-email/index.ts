import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

interface EmailRequest {
  type: 'contact' | 'newsletter' | 'verification' | 'welcome' | 'booking' | 'custom_verification' | 'verification-code' | 'new_message'
  to: string
  from?: string
  name?: string
  email?: string
  subject?: string
  message?: string
  data?: Record<string, any>
  template_data?: Record<string, any>
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
      text: `New Message\n\nHi ${data.recipientName || 'there'},\n\nYou have a new message from ${data.senderName}.\n\nMessage:\n${data.messagePreview}\n\n${data.isAnonymous ? 'Reply to this email to continue the conversation.' : `View the conversation: ${data.conversationUrl}`}\n\nThe Made to Hike Team`
    }
  }

  return templates[type as keyof typeof templates] || templates.contact
}

// Enhanced validation function
const validateEmailRequest = (body: any): EmailRequest => {
  const errors: string[] = []

  if (!body.type || !['contact', 'newsletter', 'verification', 'welcome', 'booking', 'custom_verification', 'admin_verification_request', 'verification-code', 'booking_refund_hiker', 'booking_cancellation_guide', 'new_message'].includes(body.type)) {
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

    // Get the appropriate email template
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
      ...(emailRequest.email && { reply_to: emailRequest.email })
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