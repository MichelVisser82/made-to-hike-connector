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
          <Section style={logoContainer}>
            <Text style={logoText}>🏔️ MadeToHike</Text>
          </Section>
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
          
          <Section style={detailsGrid}>
            <Section style={detailRow}>
              <Text style={detailLabel}>Booking ID:</Text>
              <Text style={detailValue}>#{booking_id.slice(0, 8).toUpperCase()}</Text>
            </Section>
            
            <Section style={detailRow}>
              <Text style={detailLabel}>Tour:</Text>
              <Text style={detailValue}>{tour_title}</Text>
            </Section>
            
            <Section style={detailRow}>
              <Text style={detailLabel}>Guide:</Text>
              <Text style={detailValue}>{guide_name}</Text>
            </Section>
            
            <Section style={detailRow}>
              <Text style={detailLabel}>Date:</Text>
              <Text style={detailValue}>{new Date(booking_date).toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</Text>
            </Section>
            
            <Section style={detailRow}>
              <Text style={detailLabel}>Participants:</Text>
              <Text style={detailValue}>{participants} {participants === 1 ? 'person' : 'people'}</Text>
            </Section>
            
            <Section style={detailRow}>
              <Text style={detailLabel}>Meeting Point:</Text>
              <Text style={detailValue}>{meeting_point}</Text>
            </Section>
            
            <Section style={totalRow}>
              <Text style={totalLabel}>Total Amount:</Text>
              <Text style={totalValue}>{currency} {total_price.toFixed(2)}</Text>
            </Section>
          </Section>
        </Section>

        {/* What to Bring */}
        <Section style={preparationSection}>
          <Heading style={sectionTitle}>What to Bring</Heading>
          
          <Section style={checklistGrid}>
            <Section style={checklistItem}>
              <Text style={checkIcon}>🥾</Text>
              <Text style={checklistText}>Comfortable hiking boots</Text>
            </Section>
            
            <Section style={checklistItem}>
              <Text style={checkIcon}>💧</Text>
              <Text style={checklistText}>Water bottle (at least 1L)</Text>
            </Section>
            
            <Section style={checklistItem}>
              <Text style={checkIcon}>🧢</Text>
              <Text style={checklistText}>Sun hat and sunscreen</Text>
            </Section>
            
            <Section style={checklistItem}>
              <Text style={checkIcon}>🎒</Text>
              <Text style={checklistText}>Small backpack</Text>
            </Section>
            
            <Section style={checklistItem}>
              <Text style={checkIcon}>📱</Text>
              <Text style={checklistText}>Fully charged phone</Text>
            </Section>
            
            <Section style={checklistItem}>
              <Text style={checkIcon}>🧥</Text>
              <Text style={checklistText}>Weather-appropriate clothing</Text>
            </Section>
          </Section>
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
          <Section style={buttonGroup}>
            <Button href="https://madetohike.com/bookings" style={primaryButton}>
              View Full Details
            </Button>
            
            <Button href="mailto:support@madetohike.com" style={secondaryButton}>
              Contact Support
            </Button>
          </Section>
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

const logoContainer = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
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

const detailsGrid = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '12px',
}

const detailRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  padding: '8px 0',
  borderBottom: '1px solid #e2e8f0',
}

const detailLabel = {
  fontSize: '14px',
  color: '#64748b',
  fontWeight: '500',
  margin: '0',
  flex: '1',
}

const detailValue = {
  fontSize: '14px',
  color: '#1e293b',
  fontWeight: '600',
  margin: '0',
  textAlign: 'right' as const,
  flex: '2',
}

const totalRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 0',
  borderTop: '2px solid #ef4444',
  marginTop: '8px',
}

const totalLabel = {
  fontSize: '16px',
  color: '#1e293b',
  fontWeight: 'bold',
  margin: '0',
}

const totalValue = {
  fontSize: '18px',
  color: '#ef4444',
  fontWeight: 'bold',
  margin: '0',
}

const preparationSection = {
  padding: '32px 40px',
}

const checklistGrid = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '12px',
}

const checklistItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
}

const checkIcon = {
  fontSize: '20px',
  margin: '0',
}

const checklistText = {
  fontSize: '14px',
  color: '#374151',
  margin: '0',
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

const buttonGroup = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '12px',
  alignItems: 'center',
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