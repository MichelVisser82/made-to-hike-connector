// Clean HTML email templates without React dependencies

export interface BookingConfirmationData {
  bookingReference: string
  tourTitle: string
  bookingDate: string
  guideName: string
  meetingPoint: string
  totalPrice: number
  currency: string
  participants: number
  isDeposit?: boolean
  depositAmount?: number
  finalPaymentAmount?: number
  finalPaymentDueDate?: string
}

export interface GuideBookingNotificationData {
  bookingReference: string
  tourTitle: string
  bookingDate: string
  hikerName?: string
  hikerEmail: string
  totalPrice: number
  currency: string
  participants: number
  meetingPoint: string
}

export const generateBookingConfirmationEmail = (data: BookingConfirmationData): string => {
  const formattedDate = new Date(data.bookingDate).toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmed - MadeToHike</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
    
    <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f97316 100%); padding: 32px 40px 24px; text-align: center;">
      <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: bold; color: #ffffff; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">🏔️ MadeToHike</h1>
      <p style="margin: 0; font-size: 16px; color: #fecaca; font-weight: 500;">Booking Confirmed!</p>
    </div>

    <div style="padding: 48px 40px 32px; text-align: center;">
      <div style="font-size: 48px; margin: 0 0 16px 0;">✅</div>
      <h2 style="margin: 0 0 16px 0; font-size: 28px; font-weight: bold; color: #1e293b; line-height: 1.2;">Adventure Booked Successfully!</h2>
      <p style="margin: 0; font-size: 16px; color: #64748b; line-height: 1.5;">Get ready for an amazing hiking experience with ${data.guideName}</p>
    </div>

    <div style="padding: 32px 40px; background-color: #f8fafc;">
      <h3 style="margin: 0 0 24px 0; font-size: 20px; font-weight: bold; color: #1e293b;">Booking Details</h3>
      
      <div style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
        <p style="margin: 0 0 4px 0; font-size: 14px; color: #64748b; font-weight: 500;">Booking ID:</p>
        <p style="margin: 0; font-size: 14px; color: #1e293b; font-weight: 600;">#${data.bookingReference.slice(0, 8).toUpperCase()}</p>
      </div>
      
      <div style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
        <p style="margin: 0 0 4px 0; font-size: 14px; color: #64748b; font-weight: 500;">Tour:</p>
        <p style="margin: 0; font-size: 14px; color: #1e293b; font-weight: 600;">${data.tourTitle}</p>
      </div>
      
      <div style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
        <p style="margin: 0 0 4px 0; font-size: 14px; color: #64748b; font-weight: 500;">Guide:</p>
        <p style="margin: 0; font-size: 14px; color: #1e293b; font-weight: 600;">${data.guideName}</p>
      </div>
      
      <div style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
        <p style="margin: 0 0 4px 0; font-size: 14px; color: #64748b; font-weight: 500;">Date:</p>
        <p style="margin: 0; font-size: 14px; color: #1e293b; font-weight: 600;">${formattedDate}</p>
      </div>
      
      <div style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
        <p style="margin: 0 0 4px 0; font-size: 14px; color: #64748b; font-weight: 500;">Participants:</p>
        <p style="margin: 0; font-size: 14px; color: #1e293b; font-weight: 600;">${data.participants} ${data.participants === 1 ? 'person' : 'people'}</p>
      </div>
      
      <div style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
        <p style="margin: 0 0 4px 0; font-size: 14px; color: #64748b; font-weight: 500;">Meeting Point:</p>
        <p style="margin: 0; font-size: 14px; color: #1e293b; font-weight: 600;">${data.meetingPoint}</p>
      </div>
      
      <div style="margin-top: 16px; padding-top: 16px; border-top: 2px solid #ef4444;">
        ${data.isDeposit ? `
          <div style="margin-bottom: 12px;">
            <p style="margin: 0 0 4px 0; font-size: 14px; color: #64748b; font-weight: 500;">Deposit Paid:</p>
            <p style="margin: 0; font-size: 16px; color: #059669; font-weight: bold;">✓ ${data.currency} ${data.depositAmount?.toFixed(2)}</p>
          </div>
          <div style="margin-bottom: 12px;">
            <p style="margin: 0 0 4px 0; font-size: 14px; color: #64748b; font-weight: 500;">Remaining Balance:</p>
            <p style="margin: 0; font-size: 16px; color: #1e293b; font-weight: 600;">${data.currency} ${data.finalPaymentAmount?.toFixed(2)}</p>
          </div>
          <div style="margin-bottom: 12px;">
            <p style="margin: 0 0 4px 0; font-size: 14px; color: #64748b; font-weight: 500;">Auto-Collection Date:</p>
            <p style="margin: 0; font-size: 14px; color: #1e293b; font-weight: 600;">${data.finalPaymentDueDate ? new Date(data.finalPaymentDueDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Will be notified'}</p>
          </div>
        ` : `
          <p style="margin: 0 0 4px 0; font-size: 16px; color: #1e293b; font-weight: bold;">Total Amount Paid:</p>
          <p style="margin: 0; font-size: 18px; color: #059669; font-weight: bold;">✓ ${data.currency} ${data.totalPrice.toFixed(2)}</p>
        `}
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0 0 4px 0; font-size: 16px; color: #1e293b; font-weight: bold;">Total Tour Price:</p>
          <p style="margin: 0; font-size: 18px; color: #ef4444; font-weight: bold;">${data.currency} ${data.totalPrice.toFixed(2)}</p>
        </div>
      </div>
    </div>

    <div style="padding: 32px 40px;">
      <h3 style="margin: 0 0 24px 0; font-size: 20px; font-weight: bold; color: #1e293b;">What to Bring</h3>
      <p style="margin: 8px 0; font-size: 14px; color: #374151; line-height: 1.5;">🥾 Comfortable hiking boots</p>
      <p style="margin: 8px 0; font-size: 14px; color: #374151; line-height: 1.5;">💧 Water bottle (at least 1L)</p>
      <p style="margin: 8px 0; font-size: 14px; color: #374151; line-height: 1.5;">🧢 Sun hat and sunscreen</p>
      <p style="margin: 8px 0; font-size: 14px; color: #374151; line-height: 1.5;">🎒 Small backpack</p>
      <p style="margin: 8px 0; font-size: 14px; color: #374151; line-height: 1.5;">📱 Fully charged phone</p>
      <p style="margin: 8px 0; font-size: 14px; color: #374151; line-height: 1.5;">🧥 Weather-appropriate clothing</p>
    </div>

    ${data.isDeposit ? `
    <div style="padding: 32px 40px; background-color: #dcfce7; border-left: 4px solid #059669;">
      <h3 style="margin: 0 0 16px 0; font-size: 20px; font-weight: bold; color: #1e293b;">💳 Automatic Payment Collection</h3>
      <p style="margin: 0 0 16px 0; font-size: 14px; color: #166534; line-height: 1.6;">
        <strong>Your deposit of ${data.currency} ${data.depositAmount?.toFixed(2)} has been successfully processed.</strong>
      </p>
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #166534; line-height: 1.6;">
        The remaining balance of <strong>${data.currency} ${data.finalPaymentAmount?.toFixed(2)}</strong> will be automatically collected from your payment method on <strong>${data.finalPaymentDueDate ? new Date(data.finalPaymentDueDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'the scheduled date'}</strong>.
      </p>
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #166534; line-height: 1.6;">
        ✓ <strong>No action required</strong> - The payment will be processed automatically<br>
        ✓ <strong>Secure</strong> - We use Stripe's secure payment system<br>
        ✓ <strong>Receipt</strong> - You'll receive a confirmation email after the payment is collected
      </p>
      <p style="margin: 0; font-size: 13px; color: #15803d; line-height: 1.5;">
        If your payment fails, we'll notify you immediately so you can update your payment method and avoid any booking issues.
      </p>
    </div>
    ` : ''}

    <div style="padding: 32px 40px; background-color: #fef3cd;">
      <h3 style="margin: 0 0 24px 0; font-size: 20px; font-weight: bold; color: #1e293b;">Important Information</h3>
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #92400e; line-height: 1.5;">📍 <strong>Meeting Point:</strong> Please arrive 15 minutes early at ${data.meetingPoint}</p>
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #92400e; line-height: 1.5;">📞 <strong>Contact:</strong> Your guide will contact you 24 hours before the tour with final details</p>
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #92400e; line-height: 1.5;">🌦️ <strong>Weather:</strong> Tours run rain or shine. Check the weather forecast and dress appropriately</p>
      <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.5;">❌ <strong>Cancellation:</strong> Free cancellation up to 24 hours before the tour</p>
    </div>

    <div style="padding: 32px 40px; text-align: center;">
      <a href="https://madetohike.com/dashboard" style="display: inline-block; background-color: #ef4444; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); margin-bottom: 12px;">View Full Details</a>
      <br>
      <a href="mailto:support@madetohike.com" style="display: inline-block; background-color: transparent; color: #ef4444; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px; border: 2px solid #ef4444;">Contact Support</a>
    </div>

    <div style="padding: 32px 40px; text-align: center; background-color: #1e293b;">
      <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8;">Questions about your booking? <a href="mailto:support@madetohike.com" style="color: #f97316; text-decoration: none;">Contact our support team</a></p>
      <p style="margin: 0; font-size: 12px; color: #94a3b8;">© 2024 MadeToHike. Safe travels and happy hiking!</p>
    </div>

  </div>
</body>
</html>`
}

export const generateGuideBookingNotificationEmail = (data: GuideBookingNotificationData): string => {
  const formattedDate = new Date(data.bookingDate).toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Booking Received - MadeToHike</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
    
    <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f97316 100%); padding: 32px 40px 24px; text-align: center;">
      <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: bold; color: #ffffff; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">🏔️ MadeToHike</h1>
      <p style="margin: 0; font-size: 16px; color: #fecaca; font-weight: 500;">New Booking Received!</p>
    </div>

    <div style="padding: 48px 40px 32px; text-align: center;">
      <div style="font-size: 48px; margin: 0 0 16px 0;">🎉</div>
      <h2 style="margin: 0 0 16px 0; font-size: 28px; font-weight: bold; color: #1e293b; line-height: 1.2;">Congratulations!</h2>
      <p style="margin: 0; font-size: 16px; color: #64748b; line-height: 1.5;">You have a new confirmed booking</p>
    </div>

    <div style="padding: 32px 40px; background-color: #f8fafc;">
      <h3 style="margin: 0 0 24px 0; font-size: 20px; font-weight: bold; color: #1e293b;">Booking Details</h3>
      
      <div style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
        <p style="margin: 0 0 4px 0; font-size: 14px; color: #64748b; font-weight: 500;">Booking ID:</p>
        <p style="margin: 0; font-size: 14px; color: #1e293b; font-weight: 600;">#${data.bookingReference}</p>
      </div>
      
      <div style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
        <p style="margin: 0 0 4px 0; font-size: 14px; color: #64748b; font-weight: 500;">Tour:</p>
        <p style="margin: 0; font-size: 14px; color: #1e293b; font-weight: 600;">${data.tourTitle}</p>
      </div>
      
      <div style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
        <p style="margin: 0 0 4px 0; font-size: 14px; color: #64748b; font-weight: 500;">Client:</p>
        <p style="margin: 0; font-size: 14px; color: #1e293b; font-weight: 600;">${data.hikerName || 'Guest'}</p>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">${data.hikerEmail}</p>
      </div>
      
      <div style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
        <p style="margin: 0 0 4px 0; font-size: 14px; color: #64748b; font-weight: 500;">Date:</p>
        <p style="margin: 0; font-size: 14px; color: #1e293b; font-weight: 600;">${formattedDate}</p>
      </div>
      
      <div style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
        <p style="margin: 0 0 4px 0; font-size: 14px; color: #64748b; font-weight: 500;">Participants:</p>
        <p style="margin: 0; font-size: 14px; color: #1e293b; font-weight: 600;">${data.participants} ${data.participants === 1 ? 'person' : 'people'}</p>
      </div>
      
      <div style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
        <p style="margin: 0 0 4px 0; font-size: 14px; color: #64748b; font-weight: 500;">Meeting Point:</p>
        <p style="margin: 0; font-size: 14px; color: #1e293b; font-weight: 600;">${data.meetingPoint}</p>
      </div>
      
      <div style="background-color: #dcfce7; padding: 16px; border-radius: 8px; border-left: 4px solid #22c55e;">
        <p style="margin: 0 0 4px 0; font-size: 14px; color: #15803d; font-weight: 600;">Payment Received</p>
        <p style="margin: 0; font-size: 24px; color: #15803d; font-weight: bold;">${data.currency} ${data.totalPrice.toFixed(2)}</p>
      </div>
    </div>

    <div style="padding: 32px 40px; background-color: #fef3cd;">
      <h3 style="margin: 0 0 24px 0; font-size: 20px; font-weight: bold; color: #1e293b;">Next Steps</h3>
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #92400e; line-height: 1.5;">✅ <strong>Booking Confirmed:</strong> The client has paid in full</p>
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #92400e; line-height: 1.5;">📧 <strong>Contact Client:</strong> Reach out 24-48 hours before the tour with final details</p>
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #92400e; line-height: 1.5;">🎒 <strong>Prepare:</strong> Review equipment needs and weather forecast</p>
      <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.5;">💰 <strong>Payout:</strong> Funds will be transferred according to your payout schedule</p>
    </div>

    <div style="padding: 32px 40px; text-align: center;">
      <a href="https://madetohike.com/dashboard" style="display: inline-block; background-color: #ef4444; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); margin-bottom: 12px;">View in Dashboard</a>
      <br>
      <a href="mailto:${data.hikerEmail}" style="display: inline-block; background-color: transparent; color: #ef4444; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px; border: 2px solid #ef4444;">Contact Client</a>
    </div>

    <div style="padding: 32px 40px; text-align: center; background-color: #1e293b;">
      <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8;">Questions about this booking? <a href="mailto:support@madetohike.com" style="color: #f97316; text-decoration: none;">Contact our support team</a></p>
      <p style="margin: 0; font-size: 12px; color: #94a3b8;">© 2024 MadeToHike. Happy guiding!</p>
    </div>

  </div>
</body>
</html>
  `.trim()
}
