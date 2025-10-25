import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Button,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface ReviewReminderEmailProps {
  recipient_name: string;
  recipient_type: 'hiker' | 'guide';
  tour_title: string;
  booking_date: string;
  review_url: string;
  expires_date: string;
  reminder_type: 'first_reminder' | 'second_reminder' | 'final_reminder';
}

export const ReviewReminderEmail = ({
  recipient_name,
  recipient_type,
  tour_title,
  booking_date,
  review_url,
  expires_date,
  reminder_type
}: ReviewReminderEmailProps) => {
  const urgency = {
    first_reminder: { emoji: '⏰', color: '#ffa726', message: 'Don\'t forget to share your experience!' },
    second_reminder: { emoji: '⚠️', color: '#ff9800', message: 'Your review window is closing soon' },
    final_reminder: { emoji: '🚨', color: '#f44336', message: 'Last chance to leave your review!' }
  }[reminder_type];

  return (
    <Html>
      <Head />
      <Preview>Reminder: Share your experience from {tour_title}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <div style={logoContainer}>
              <Text style={logo}>🏔️</Text>
              <Text style={brandName}>MadeToHike</Text>
            </div>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>
              {urgency.emoji} {urgency.message}
            </Heading>
            
            <Text style={text}>Hi {recipient_name},</Text>
            
            <Text style={text}>
              {reminder_type === 'final_reminder'
                ? `This is your final reminder - your review for "${tour_title}" expires on ${expires_date}.`
                : `We noticed you haven't left a review yet for your ${recipient_type === 'hiker' ? 'adventure' : 'hiker'} on "${tour_title}".`
              }
            </Text>

            <Text style={text}>
              {recipient_type === 'hiker'
                ? 'Your feedback helps other hikers discover amazing experiences and helps guides improve their services.'
                : 'Your feedback about your hiker helps build trust in our community.'
              }
            </Text>

            {/* Tour Info Box */}
            <Section style={{...infoBox, borderLeftColor: urgency.color}}>
              <Text style={infoLabel}>Tour</Text>
              <Text style={infoValue}>{tour_title}</Text>
              <Text style={infoLabel}>Date</Text>
              <Text style={infoValue}>{booking_date}</Text>
              <Text style={infoLabel}>Expires</Text>
              <Text style={{...infoValue, color: urgency.color}}>{expires_date}</Text>
            </Section>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button href={review_url} style={{...button, backgroundColor: urgency.color}}>
                {recipient_type === 'hiker' ? 'Write Your Review Now' : 'Review Your Hiker Now'}
              </Button>
            </Section>

            {reminder_type === 'final_reminder' && (
              <Section style={urgentBox}>
                <Text style={urgentText}>
                  ⏳ <strong>Time is running out!</strong> After expiration, you won't be able to leave a review for this booking.
                </Text>
              </Section>
            )}

            <Text style={note}>
              💡 Reviews are only published when both parties complete theirs, ensuring fairness and authenticity.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Happy hiking! 🥾<br />
              The MadeToHike Team
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ReviewReminderEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header = {
  backgroundColor: '#2c5530',
  padding: '24px',
  textAlign: 'center' as const,
}

const logoContainer = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
}

const logo = {
  fontSize: '32px',
  margin: '0',
}

const brandName = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '600',
  margin: '0',
}

const content = {
  padding: '0 48px',
}

const h1 = {
  color: '#2c5530',
  fontSize: '28px',
  fontWeight: '600',
  lineHeight: '1.3',
  marginTop: '32px',
  marginBottom: '24px',
}

const text = {
  color: '#484848',
  fontSize: '16px',
  lineHeight: '26px',
  marginTop: '0',
  marginBottom: '16px',
}

const infoBox = {
  backgroundColor: '#f8fffe',
  borderLeft: '4px solid #2c5530',
  padding: '20px',
  margin: '24px 0',
  borderRadius: '0 4px 4px 0',
}

const infoLabel = {
  color: '#737373',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '8px 0 4px 0',
}

const infoValue = {
  color: '#2c5530',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0 0 12px 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#2c5530',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
}

const urgentBox = {
  backgroundColor: '#ffebee',
  border: '2px solid #f44336',
  borderRadius: '6px',
  padding: '16px',
  margin: '24px 0',
}

const urgentText = {
  fontSize: '14px',
  color: '#c62828',
  margin: '0',
  textAlign: 'center' as const,
}

const note = {
  backgroundColor: '#f0f8ff',
  border: '1px solid #64b5f6',
  borderRadius: '6px',
  padding: '16px',
  fontSize: '14px',
  color: '#1565c0',
  margin: '16px 0',
}

const footer = {
  padding: '24px 48px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e6ebf1',
}

const footerText = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
}
