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
    <Preview>Verify your MadeToHike account to start your adventure</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header with Logo */}
        <Section style={header}>
          <div style={logoContainer}>
            <div style={logoIcon}>⛰️</div>
            <div>
              <div style={logoText}>MadeToHike</div>
              <div style={logoSubtext}>Guided Adventures</div>
            </div>
          </div>
        </Section>

        {/* Main Content */}
        <Section style={content}>
          <Heading style={h1}>Verify Your Account</Heading>
          
          <Text style={text}>
            Welcome to MadeToHike! We're excited to have you join our community of adventure seekers.
          </Text>

          <Text style={text}>
            To complete your account setup and start booking amazing hiking experiences, please verify your email address:
          </Text>

          {/* Verification Button */}
          <Section style={buttonContainer}>
            <Link
              href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
              style={button}
            >
              Verify Email Address
            </Link>
          </Section>

          <Text style={smallText}>
            This verification link will expire in 24 hours for security reasons.
          </Text>

          <Text style={smallText}>
            If the button doesn't work, you can copy and paste this link into your browser:
          </Text>
          
          <Text style={linkText}>
            {`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
          </Text>
        </Section>

        {/* What's Next Section */}
        <Section style={nextSteps}>
          <Heading style={h2}>What's Next?</Heading>
          <Text style={text}>
            Once verified, you'll be able to:
          </Text>
          <ul style={list}>
            <li style={listItem}>🏔️ Browse guided hiking tours across Europe</li>
            <li style={listItem}>📅 Book adventures in the Dolomites, Pyrenees, and Scottish Highlands</li>
            <li style={listItem}>🎒 Connect with certified mountain guides</li>
            <li style={listItem}>⭐ Read reviews from fellow hikers</li>
          </ul>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            If you didn't create an account with MadeToHike, you can safely ignore this email.
          </Text>
          <Text style={footerText}>
            Questions? Contact us at{' '}
            <Link href="mailto:support@madetohike.com" style={footerLink}>
              support@madetohike.com
            </Link>
          </Text>
          <Text style={footerCopyright}>
            © 2024 MadeToHike. All rights reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default VerificationEmail

// Styles
const main = {
  backgroundColor: '#f8fafc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
}

const header = {
  backgroundColor: '#ffffff',
  borderRadius: '12px 12px 0 0',
  padding: '32px 32px 24px',
  borderBottom: '1px solid #e2e8f0',
}

const logoContainer = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
}

const logoIcon = {
  fontSize: '32px',
  lineHeight: '1',
}

const logoText = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#0f172a',
  margin: '0',
  lineHeight: '1.2',
}

const logoSubtext = {
  fontSize: '14px',
  color: '#64748b',
  margin: '0',
  lineHeight: '1.2',
}

const content = {
  backgroundColor: '#ffffff',
  padding: '32px',
}

const h1 = {
  color: '#0f172a',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 24px',
  lineHeight: '1.3',
}

const h2 = {
  color: '#0f172a',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  lineHeight: '1.3',
}

const text = {
  color: '#334155',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px',
}

const smallText = {
  color: '#64748b',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 12px',
}

const linkText = {
  color: '#3b82f6',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 24px',
  wordBreak: 'break-all' as const,
  padding: '12px',
  backgroundColor: '#f1f5f9',
  borderRadius: '6px',
  border: '1px solid #e2e8f0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#059669',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
  lineHeight: '1',
  border: 'none',
}

const nextSteps = {
  backgroundColor: '#f8fafc',
  padding: '24px 32px',
  borderRadius: '8px',
  margin: '24px 0',
}

const list = {
  color: '#334155',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0',
  paddingLeft: '0',
  listStyle: 'none',
}

const listItem = {
  margin: '0 0 8px',
  paddingLeft: '0',
}

const footer = {
  backgroundColor: '#ffffff',
  borderRadius: '0 0 12px 12px',
  padding: '24px 32px',
  borderTop: '1px solid #e2e8f0',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#64748b',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 8px',
}

const footerLink = {
  color: '#3b82f6',
  textDecoration: 'none',
}

const footerCopyright = {
  color: '#94a3b8',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '16px 0 0',
}