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
  Img,
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
    <Preview>🏔️ Verify your MadeToHike account - Your adventure awaits!</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header with Mountain Gradient */}
        <Section style={header}>
          <div style={logoContainer}>
            <div style={logoIcon}>🏔️</div>
            <div>
              <div style={logoText}>MadeToHike</div>
              <div style={logoSubtext}>Epic Mountain Adventures</div>
            </div>
          </div>
        </Section>

        {/* Hero Section */}
        <Section style={heroSection}>
          <div style={heroContent}>
            <Text style={heroEmoji}>🥾✨</Text>
            <Heading style={heroTitle}>Your Adventure Starts Here!</Heading>
            <Text style={heroSubtitle}>
              Welcome to Europe's premier hiking community. Let's get you verified and ready to climb!
            </Text>
          </div>
        </Section>

        {/* Main Content */}
        <Section style={content}>
          <Text style={welcomeText}>
            Hi there, fellow adventurer! 👋
          </Text>

          <Text style={text}>
            We're thrilled you've joined MadeToHike. To unlock your access to breathtaking guided tours across the Alps, Dolomites, and beyond, please verify your email address.
          </Text>

          {/* Verification Button */}
          <Section style={buttonContainer}>
            <Link
              href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
              style={button}
            >
              🚀 Verify & Start Exploring
            </Link>
          </Section>

          <Text style={urgencyText}>
            ⏰ This link expires in 24 hours - don't miss out on your adventure!
          </Text>

          <Section style={alternativeSection}>
            <Text style={alternativeTitle}>Having trouble with the button?</Text>
            <Text style={smallText}>
              Copy and paste this verification link into your browser:
            </Text>
            <Text style={linkText}>
              {`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
            </Text>
          </Section>
        </Section>

        {/* Features Showcase */}
        <Section style={featuresSection}>
          <Heading style={featuresTitle}>🎯 What Awaits You</Heading>
          <div style={featuresGrid}>
            <div style={featureCard}>
              <div style={featureIcon}>🏔️</div>
              <div style={featureTitle}>Epic Routes</div>
              <div style={featureDescription}>Guided tours across Europe's most stunning mountain ranges</div>
            </div>
            <div style={featureCard}>
              <div style={featureIcon}>🎒</div>
              <div style={featureTitle}>Expert Guides</div>
              <div style={featureDescription}>Connect with certified mountain professionals</div>
            </div>
            <div style={featureCard}>
              <div style={featureIcon}>🌟</div>
              <div style={featureTitle}>Real Reviews</div>
              <div style={featureDescription}>Read authentic experiences from fellow hikers</div>
            </div>
            <div style={featureCard}>
              <div style={featureIcon}>📱</div>
              <div style={featureTitle}>Easy Booking</div>
              <div style={featureDescription}>Book your next adventure in just a few clicks</div>
            </div>
          </div>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            📧 Didn't sign up? You can safely ignore this email.
          </Text>
          <Text style={footerText}>
            Need help? Our adventure specialists are here:{' '}
            <Link href="mailto:support@madetohike.com" style={footerLink}>
              support@madetohike.com
            </Link>
          </Text>
          <div style={footerDivider}></div>
          <Text style={footerCopyright}>
            © 2024 MadeToHike • Where every step counts • All rights reserved
          </Text>
          <Text style={footerTagline}>
            🏔️ Adventure is calling. Will you answer? 🏔️
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default VerificationEmail

// Styles
const main = {
  backgroundColor: '#f0f9ff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
}

const header = {
  background: 'linear-gradient(135deg, #0f766e 0%, #059669 50%, #0d9488 100%)',
  borderRadius: '16px 16px 0 0',
  padding: '32px 32px 24px',
  color: '#ffffff',
}

const logoContainer = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
}

const logoIcon = {
  fontSize: '40px',
  lineHeight: '1',
  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
}

const logoText = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0',
  lineHeight: '1.2',
  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
}

const logoSubtext = {
  fontSize: '16px',
  color: '#a7f3d0',
  margin: '0',
  lineHeight: '1.2',
  fontWeight: '500',
}

const heroSection = {
  background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
  padding: '40px 32px',
  textAlign: 'center' as const,
}

const heroContent = {
  maxWidth: '480px',
  margin: '0 auto',
}

const heroEmoji = {
  fontSize: '48px',
  lineHeight: '1',
  margin: '0 0 16px',
  textAlign: 'center' as const,
}

const heroTitle = {
  color: '#0f172a',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  lineHeight: '1.2',
  textAlign: 'center' as const,
}

const heroSubtitle = {
  color: '#047857',
  fontSize: '18px',
  lineHeight: '1.5',
  margin: '0',
  fontWeight: '500',
  textAlign: 'center' as const,
}

const content = {
  backgroundColor: '#ffffff',
  padding: '40px 32px',
}

const welcomeText = {
  color: '#0f172a',
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '1.6',
  margin: '0 0 20px',
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 20px',
}

const urgencyText = {
  color: '#dc2626',
  fontSize: '15px',
  fontWeight: '600',
  lineHeight: '1.5',
  margin: '24px 0',
  padding: '16px',
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  border: '1px solid #fecaca',
  textAlign: 'center' as const,
}

const alternativeSection = {
  backgroundColor: '#f8fafc',
  padding: '24px',
  borderRadius: '12px',
  margin: '32px 0',
  border: '1px solid #e2e8f0',
}

const alternativeTitle = {
  color: '#0f172a',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const smallText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 12px',
}

const linkText = {
  color: '#1d4ed8',
  fontSize: '13px',
  lineHeight: '1.4',
  margin: '0',
  wordBreak: 'break-all' as const,
  padding: '12px',
  backgroundColor: '#eff6ff',
  borderRadius: '8px',
  border: '1px solid #dbeafe',
  fontFamily: 'monospace',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
  borderRadius: '12px',
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '18px 36px',
  lineHeight: '1',
  border: 'none',
  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
  transition: 'all 0.2s ease',
}

const featuresSection = {
  backgroundColor: '#f8fafc',
  padding: '40px 32px',
  borderRadius: '0',
}

const featuresTitle = {
  color: '#0f172a',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 32px',
  textAlign: 'center' as const,
}

const featuresGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '20px',
}

const featureCard = {
  backgroundColor: '#ffffff',
  padding: '24px',
  borderRadius: '12px',
  textAlign: 'center' as const,
  border: '1px solid #e5e7eb',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
}

const featureIcon = {
  fontSize: '32px',
  lineHeight: '1',
  margin: '0 0 12px',
}

const featureTitle = {
  color: '#0f172a',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px',
  lineHeight: '1.3',
}

const featureDescription = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.4',
  margin: '0',
}

const footer = {
  backgroundColor: '#1f2937',
  borderRadius: '0 0 16px 16px',
  padding: '32px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#d1d5db',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 12px',
}

const footerLink = {
  color: '#60a5fa',
  textDecoration: 'none',
  fontWeight: '500',
}

const footerDivider = {
  height: '1px',
  backgroundColor: '#374151',
  margin: '24px 0',
  border: 'none',
}

const footerCopyright = {
  color: '#9ca3af',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '0 0 16px',
  fontWeight: '500',
}

const footerTagline = {
  color: '#6ee7b7',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '0',
  fontWeight: '600',
}