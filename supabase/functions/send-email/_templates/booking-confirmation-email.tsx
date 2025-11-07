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
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface BookingConfirmationEmailProps {
  booking_id: string
  tour_title: string
  booking_date: string
  guide_name: string
  meeting_point: string
  total_price: number
  currency: string
  participants?: number
}

export const BookingConfirmationEmail = ({
  booking_id,
  tour_title,
  booking_date,
  guide_name,
  meeting_point,
  total_price,
  currency = 'EUR',
  participants = 1,
}: BookingConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Your MadeToHike adventure is confirmed! 🎒</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <Text style={logoText}>🏔️ MadeToHike</Text>
          <Text style={headerSubtitle}>Booking Confirmed!</Text>
        </Section>

        {/* Hero Section */}
        <Section style={hero}>
          <Text style={confirmationIcon}>✅</Text>
          <Heading style={heroTitle}>Adventure Booked Successfully!</Heading>
          <Text style={heroSubtitle}>
            Get ready for an amazing hiking experience with {guide_name}
          </Text>
        </Section>

        {/* Booking Details */}
        <Section style={bookingDetails}>
          <Heading style={sectionTitle}>Booking Details</Heading>
          
          <Text style={detailRow}>
            <span style={detailLabel}>Booking ID:</span>
            <br />
            <span style={detailValue}>#{booking_id.slice(0, 8).toUpperCase()}</span>
          </Text>
          
          <Text style={detailRow}>
            <span style={detailLabel}>Tour:</span>
            <br />
            <span style={detailValue}>{tour_title}</span>
          </Text>
          
          <Text style={detailRow}>
            <span style={detailLabel}>Guide:</span>
            <br />
            <span style={detailValue}>{guide_name}</span>
          </Text>
          
          <Text style={detailRow}>
            <span style={detailLabel}>Date:</span>
            <br />
            <span style={detailValue}>{new Date(booking_date).toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </Text>
          
          <Text style={detailRow}>
            <span style={detailLabel}>Participants:</span>
            <br />
            <span style={detailValue}>{participants} {participants === 1 ? 'person' : 'people'}</span>
          </Text>
          
          <Text style={detailRow}>
            <span style={detailLabel}>Meeting Point:</span>
            <br />
            <span style={detailValue}>{meeting_point}</span>
          </Text>
          
          <Hr style={divider} />
          
          <Text style={totalRow}>
            <span style={totalLabel}>Total Amount:</span>
            <br />
            <span style={totalValue}>{currency} {total_price.toFixed(2)}</span>
          </Text>
        </Section>

        {/* What to Bring */}
        <Section style={preparationSection}>
          <Heading style={sectionTitle}>What to Bring</Heading>
          
          <Text style={checklistText}>🥾 Comfortable hiking boots</Text>
          <Text style={checklistText}>💧 Water bottle (at least 1L)</Text>
          <Text style={checklistText}>🧢 Sun hat and sunscreen</Text>
          <Text style={checklistText}>🎒 Small backpack</Text>
          <Text style={checklistText}>📱 Fully charged phone</Text>
          <Text style={checklistText}>🧥 Weather-appropriate clothing</Text>
        </Section>

        {/* Important Notes */}
        <Section style={notesSection}>
          <Heading style={sectionTitle}>Important Information</Heading>
          
          <Text style={noteText}>
            📍 <strong>Meeting Point:</strong> Please arrive 15 minutes early at {meeting_point}
          </Text>
          
          <Text style={noteText}>
            📞 <strong>Contact:</strong> Your guide will contact you 24 hours before the tour with final details
          </Text>
          
          <Text style={noteText}>
            🌦️ <strong>Weather:</strong> Tours run rain or shine. Check the weather forecast and dress appropriately
          </Text>
          
          <Text style={noteText}>
            ❌ <strong>Cancellation:</strong> Free cancellation up to 24 hours before the tour
          </Text>
        </Section>

        {/* Action Buttons */}
        <Section style={actionSection}>
          <Button href="https://madetohike.com/dashboard" style={primaryButton}>
            View Full Details
          </Button>
          
          <Text style={spacer}> </Text>
          
          <Button href="mailto:support@madetohike.com" style={secondaryButton}>
            Contact Support
          </Button>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            Questions about your booking?{' '}
            <Link href="mailto:support@madetohike.com" style={footerLink}>
              Contact our support team
            </Link>
          </Text>
          <Text style={footerText}>
            © 2024 MadeToHike. Safe travels and happy hiking!
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

// Styles
const main = {
  backgroundColor: '#f8fafc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
}

const header = {
  background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f97316 100%)',
  padding: '32px 40px 24px',
  textAlign: 'center' as const,
}

const logoText = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0 0 8px 0',
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
}

const headerSubtitle = {
  fontSize: '16px',
  color: '#fecaca',
  margin: '0',
  fontWeight: '500',
}

const hero = {
  padding: '48px 40px 32px',
  textAlign: 'center' as const,
}

const confirmationIcon = {
  fontSize: '48px',
  margin: '0 0 16px 0',
}

const heroTitle = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: '0 0 16px 0',
  lineHeight: '1.2',
}

const heroSubtitle = {
  fontSize: '16px',
  color: '#64748b',
  margin: '0',
  lineHeight: '1.5',
}

const bookingDetails = {
  padding: '32px 40px',
  backgroundColor: '#f8fafc',
}

const sectionTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: '0 0 24px 0',
}

const detailRow = {
  margin: '0 0 16px 0',
  paddingBottom: '12px',
  borderBottom: '1px solid #e2e8f0',
}

const detailLabel = {
  fontSize: '14px',
  color: '#64748b',
  fontWeight: '500',
}

const detailValue = {
  fontSize: '14px',
  color: '#1e293b',
  fontWeight: '600',
}

const divider = {
  borderColor: '#ef4444',
  borderWidth: '2px',
  margin: '16px 0',
}

const totalRow = {
  margin: '16px 0 0 0',
  padding: '16px 0 0 0',
}

const totalLabel = {
  fontSize: '16px',
  color: '#1e293b',
  fontWeight: 'bold',
}

const totalValue = {
  fontSize: '18px',
  color: '#ef4444',
  fontWeight: 'bold',
}

const preparationSection = {
  padding: '32px 40px',
}

const checklistText = {
  fontSize: '14px',
  color: '#374151',
  margin: '8px 0',
  lineHeight: '1.5',
}

const notesSection = {
  padding: '32px 40px',
  backgroundColor: '#fef3cd',
}

const noteText = {
  fontSize: '14px',
  color: '#92400e',
  margin: '0 0 12px 0',
  lineHeight: '1.5',
}

const actionSection = {
  padding: '32px 40px',
  textAlign: 'center' as const,
}

const primaryButton = {
  backgroundColor: '#ef4444',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '16px 32px',
  borderRadius: '8px',
  display: 'inline-block',
  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
}

const secondaryButton = {
  backgroundColor: 'transparent',
  color: '#ef4444',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '12px 24px',
  borderRadius: '8px',
  display: 'inline-block',
  border: '2px solid #ef4444',
}

const spacer = {
  height: '12px',
  margin: '12px 0',
}

const footer = {
  padding: '32px 40px',
  textAlign: 'center' as const,
  backgroundColor: '#1e293b',
}

const footerText = {
  fontSize: '12px',
  color: '#94a3b8',
  margin: '0 0 8px 0',
}

const footerLink = {
  color: '#f97316',
  textDecoration: 'none',
}
