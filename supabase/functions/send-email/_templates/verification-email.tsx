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

interface VerificationEmailProps {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
  user_email: string
}

export const VerificationEmail = ({
  token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
  user_email,
}: VerificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Verify your MadeToHike account and start your adventure</Preview>
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
          <Heading style={heroTitle}>Welcome to Your Adventure!</Heading>
          <Text style={heroSubtitle}>
            You're just one click away from discovering amazing hiking experiences
          </Text>
        </Section>

        {/* Main Content */}
        <Section style={content}>
          <Text style={greeting}>Hello {user_email},</Text>
          
          <Text style={text}>
            Thank you for joining MadeToHike! We're excited to help you discover incredible hiking adventures with experienced local guides.
          </Text>

          <Text style={text}>
            To complete your registration and start exploring tours, please verify your email address:
          </Text>

          <div style={buttonContainer}>
            <Button
              href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
              style={verifyButton}
            >
              Verify Your Account
            </Button>
          </div>

          <Text style={alternativeText}>
            Or copy and paste this link in your browser:
          </Text>
          
          <Text style={linkText}>
            {`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
          </Text>
        </Section>

        {/* Features Section */}
        <Section style={featuresSection}>
          <Heading style={featuresTitle}>What's waiting for you:</Heading>
          
          <div style={featureGrid}>
            <div style={featureItem}>
              <Text style={featureIcon}>🥾</Text>
              <Text style={featureTitle}>Expert Guides</Text>
              <Text style={featureDescription}>Connect with certified local guides who know the best trails</Text>
            </div>
            
            <div style={featureItem}>
              <Text style={featureIcon}>⭐</Text>
              <Text style={featureTitle}>Verified Reviews</Text>
              <Text style={featureDescription}>Read authentic reviews from fellow hikers</Text>
            </div>
            
            <div style={featureItem}>
              <Text style={featureIcon}>🏔️</Text>
              <Text style={featureTitle}>Amazing Destinations</Text>
              <Text style={featureDescription}>Discover hidden gems and breathtaking landscapes</Text>
            </div>
          </div>
        </Section>

        {/* Urgency */}
        <Section style={urgencySection}>
          <Text style={urgencyText}>
            ⏰ This verification link will expire in 24 hours for your security.
          </Text>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            Need help? Contact us at{' '}
            <Link href="mailto:support@madetohike.com" style={footerLink}>
              support@madetohike.com
            </Link>
          </Text>
          <Text style={footerText}>
            © 2024 MadeToHike. Your adventure starts here.
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
  background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)',
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
  background: 'linear-gradient(to bottom, #ffffff, #f1f5f9)',
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

const greeting = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1e293b',
  margin: '0 0 24px 0',
}

const text = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#475569',
  margin: '0 0 20px 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const verifyButton = {
  backgroundColor: '#2563eb',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '16px 32px',
  borderRadius: '8px',
  display: 'inline-block',
  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
  transition: 'all 0.2s ease',
}

const alternativeText = {
  fontSize: '14px',
  color: '#64748b',
  textAlign: 'center' as const,
  margin: '24px 0 8px 0',
}

const linkText = {
  fontSize: '12px',
  color: '#3b82f6',
  textAlign: 'center' as const,
  wordBreak: 'break-all' as const,
  backgroundColor: '#f1f5f9',
  padding: '12px',
  borderRadius: '6px',
  margin: '0 0 24px 0',
}

const featuresSection = {
  padding: '32px 40px',
  backgroundColor: '#f8fafc',
}

const featuresTitle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1e293b',
  textAlign: 'center' as const,
  margin: '0 0 32px 0',
}

const featureGrid = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '24px',
}

const featureItem = {
  textAlign: 'center' as const,
}

const featureIcon = {
  fontSize: '32px',
  margin: '0 0 12px 0',
}

const featureTitle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1e293b',
  margin: '0 0 8px 0',
}

const featureDescription = {
  fontSize: '14px',
  color: '#64748b',
  margin: '0',
  lineHeight: '1.5',
}

const urgencySection = {
  padding: '24px 40px',
  backgroundColor: '#fef3cd',
  borderTop: '1px solid #fbbf24',
  borderBottom: '1px solid #fbbf24',
}

const urgencyText = {
  fontSize: '14px',
  color: '#92400e',
  textAlign: 'center' as const,
  margin: '0',
  fontWeight: '500',
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
  color: '#60a5fa',
  textDecoration: 'none',
}