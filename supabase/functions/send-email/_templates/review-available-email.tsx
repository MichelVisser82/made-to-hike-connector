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

interface ReviewAvailableEmailProps {
  recipient_name: string;
  recipient_type: 'hiker' | 'guide';
  tour_title: string;
  booking_date: string;
  review_url: string;
  expires_date: string;
}

export const ReviewAvailableEmail = ({
  recipient_name,
  recipient_type,
  tour_title,
  booking_date,
  review_url,
  expires_date
}: ReviewAvailableEmailProps) => (
  <Html>
    <Head />
    <Preview>Share your experience from {tour_title} 🏔️</Preview>
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
            {recipient_type === 'hiker' ? 'How was your adventure?' : 'How was your hiker?'}
          </Heading>
          
          <Text style={text}>Hi {recipient_name},</Text>
          
          <Text style={text}>
            {recipient_type === 'hiker' 
              ? `We hope you enjoyed your recent adventure on "${tour_title}"! Your feedback helps other hikers discover amazing experiences and helps guides improve their services.`
              : `We hope you enjoyed guiding on "${tour_title}"! Your feedback about your hiker helps build trust in our community.`
            }
          </Text>

          {/* Tour Info Box */}
          <Section style={infoBox}>
            <Text style={infoLabel}>Tour</Text>
            <Text style={infoValue}>{tour_title}</Text>
            <Text style={infoLabel}>Date</Text>
            <Text style={infoValue}>{booking_date}</Text>
          </Section>

          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Button href={review_url} style={button}>
              {recipient_type === 'hiker' ? 'Write Your Review' : 'Review Your Hiker'}
            </Button>
          </Section>

          <Text style={reminder}>
            ⏰ Reviews are available for 6 days. This review expires on {expires_date}.
          </Text>

          <Text style={note}>
            💡 <strong>Did you know?</strong> Reviews are only published when both parties complete theirs, ensuring fairness and authenticity.
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
)

export default ReviewAvailableEmail

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

const reminder = {
  backgroundColor: '#fff4e6',
  border: '1px solid #ffa726',
  borderRadius: '6px',
  padding: '16px',
  fontSize: '14px',
  color: '#e65100',
  margin: '24px 0',
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
