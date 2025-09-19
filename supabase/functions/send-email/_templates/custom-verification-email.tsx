import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface CustomVerificationEmailProps {
  user_name: string
  verification_url: string
  user_email: string
}

export const CustomVerificationEmail = ({
  user_name = 'Adventurer',
  verification_url = '',
  user_email = '',
}: CustomVerificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Verify your MadeToHike account</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={logo}>🏔️ MadeToHike</Text>
        </Section>
        
        <Section style={heroSection}>
          <Heading style={h1}>Welcome to MadeToHike!</Heading>
          <Text style={heroText}>
            Hi {user_name}, we're excited to have you join our community of hiking enthusiasts!
          </Text>
        </Section>

        <Section style={mainContent}>
          <Text style={paragraph}>
            To get started with discovering amazing hiking tours and connecting with expert guides, 
            please verify your email address by clicking the button below:
          </Text>

          <Button style={button} href={verification_url}>
            Verify My Email
          </Button>

          <Text style={paragraph}>
            Or copy and paste this link in your browser:
          </Text>
          <Link href={verification_url} style={link}>
            {verification_url}
          </Link>
        </Section>

        <Section style={featuresSection}>
          <Text style={featuresTitle}>What awaits you:</Text>
          <Text style={featureItem}>🥾 Access to premium hiking tours</Text>
          <Text style={featureItem}>🗺️ Personalized route recommendations</Text>
          <Text style={featureItem}>👥 Connect with certified guides</Text>
          <Text style={featureItem}>📱 Track your hiking adventures</Text>
        </Section>

        <Section style={footer}>
          <Text style={footerText}>
            This verification link will expire in 24 hours for security reasons.
          </Text>
          <Text style={footerText}>
            If you didn't create an account with MadeToHike, you can safely ignore this email.
          </Text>
          <Text style={footerCopyright}>
            © 2025 MadeToHike. Happy hiking! 🏔️
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

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
  padding: '32px 20px',
  textAlign: 'center' as const,
}

const logo = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#1a73e8',
  margin: '0',
}

const heroSection = {
  padding: '0 20px',
  textAlign: 'center' as const,
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '30px 0',
  lineHeight: '42px',
}

const heroText = {
  color: '#666666',
  fontSize: '18px',
  lineHeight: '28px',
  margin: '16px 0 32px',
}

const mainContent = {
  padding: '0 20px',
}

const paragraph = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
}

const button = {
  backgroundColor: '#1a73e8',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '16px 24px',
  margin: '32px 0',
}

const link = {
  color: '#1a73e8',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
}

const featuresSection = {
  padding: '32px 20px',
  backgroundColor: '#f8f9fa',
  margin: '32px 0',
  borderRadius: '8px',
}

const featuresTitle = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px',
}

const featureItem = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '8px 0',
}

const footer = {
  padding: '20px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '12px 0',
}

const footerCopyright = {
  color: '#8898aa',
  fontSize: '12px',
  margin: '24px 0 0',
}