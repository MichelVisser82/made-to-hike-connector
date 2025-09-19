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

interface WelcomeEmailProps {
  user_name: string
  first_tour_discount?: string
}

export const WelcomeEmail = ({
  user_name,
  first_tour_discount = '10'
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to MadeToHike! Your adventure begins now 🏔️</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <div style={logoContainer}>
            <Text style={logoText}>🏔️ MadeToHike</Text>
          </div>
        </Section>

        {/* Hero Section */}
        <Section style={hero}>
          <Heading style={heroTitle}>Welcome, {user_name}!</Heading>
          <Text style={heroSubtitle}>
            Your hiking adventure starts here. Discover amazing trails with local experts.
          </Text>
        </Section>

        {/* Main Content */}
        <Section style={content}>
          <Text style={text}>
            We're thrilled to have you join the MadeToHike community! You're now part of a network of adventure seekers who choose authentic experiences with verified local guides.
          </Text>

          <div style={discountSection}>
            <Text style={discountTitle}>🎉 Special Welcome Offer</Text>
            <Text style={discountText}>
              Get {first_tour_discount}% off your first hiking tour with code:
            </Text>
            <Text style={discountCode}>WELCOME{first_tour_discount}</Text>
          </div>

          <div style={buttonContainer}>
            <Button
              href="https://madetohike.com/search"
              style={ctaButton}
            >
              Explore Tours Now
            </Button>
          </div>
        </Section>

        {/* What's Next Section */}
        <Section style={nextStepsSection}>
          <Heading style={sectionTitle}>What's next?</Heading>
          
          <div style={stepsList}>
            <div style={step}>
              <Text style={stepNumber}>1</Text>
              <div>
                <Text style={stepTitle}>Browse Tours</Text>
                <Text style={stepDescription}>Discover hiking experiences in your favorite destinations</Text>
              </div>
            </div>
            
            <div style={step}>
              <Text style={stepNumber}>2</Text>
              <div>
                <Text style={stepTitle}>Read Reviews</Text>
                <Text style={stepDescription}>See what other hikers say about their adventures</Text>
              </div>
            </div>
            
            <div style={step}>
              <Text style={stepNumber}>3</Text>
              <div>
                <Text style={stepTitle}>Book Your Adventure</Text>
                <Text style={stepDescription}>Choose your dates and join experienced guides</Text>
              </div>
            </div>
          </div>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            Have questions? We're here to help!{' '}
            <Link href="mailto:support@madetohike.com" style={footerLink}>
              Contact Support
            </Link>
          </Text>
          <Text style={footerText}>
            © 2024 MadeToHike. Adventure awaits.
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
  background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
  padding: '32px 40px',
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
  margin: '0',
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
}

const hero = {
  padding: '48px 40px 32px',
  textAlign: 'center' as const,
}

const heroTitle = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: '0 0 16px 0',
  lineHeight: '1.2',
}

const heroSubtitle = {
  fontSize: '18px',
  color: '#64748b',
  margin: '0',
  lineHeight: '1.5',
}

const content = {
  padding: '32px 40px',
}

const text = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#475569',
  margin: '0 0 32px 0',
}

const discountSection = {
  backgroundColor: '#f0fdf4',
  border: '2px solid #10b981',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
  margin: '24px 0',
}

const discountTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#059669',
  margin: '0 0 12px 0',
}

const discountText = {
  fontSize: '16px',
  color: '#374151',
  margin: '0 0 16px 0',
}

const discountCode = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#059669',
  backgroundColor: '#ffffff',
  padding: '12px 20px',
  borderRadius: '8px',
  display: 'inline-block',
  border: '2px dashed #10b981',
  margin: '0',
  letterSpacing: '2px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const ctaButton = {
  backgroundColor: '#10b981',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '16px 32px',
  borderRadius: '8px',
  display: 'inline-block',
  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
}

const nextStepsSection = {
  padding: '32px 40px',
  backgroundColor: '#f8fafc',
}

const sectionTitle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1e293b',
  textAlign: 'center' as const,
  margin: '0 0 32px 0',
}

const stepsList = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '24px',
}

const step = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '16px',
}

const stepNumber = {
  backgroundColor: '#10b981',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: '0',
  margin: '0',
}

const stepTitle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1e293b',
  margin: '0 0 4px 0',
}

const stepDescription = {
  fontSize: '14px',
  color: '#64748b',
  margin: '0',
  lineHeight: '1.5',
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
  color: '#34d399',
  textDecoration: 'none',
}