import { Body, Container, Head, Heading, Html, Link, Text, Section } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface NewMessageEmailProps {
  recipientName: string;
  senderName: string;
  messagePreview: string;
  conversationUrl: string;
}

export const NewMessageEmail = ({
  recipientName,
  senderName,
  messagePreview,
  conversationUrl
}: NewMessageEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New Message from {senderName}</Heading>
        <Text style={text}>Hi {recipientName},</Text>
        <Text style={text}>You received a new message on MadeToHike:</Text>
        <Section style={messageBox}>
          <Text style={messageText}>{messagePreview}</Text>
        </Section>
        <Link href={conversationUrl} style={button}>
          View Conversation
        </Link>
        <Text style={footer}>
          Best regards,<br />
          The MadeToHike Team
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const messageBox = {
  backgroundColor: '#f4f4f5',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const messageText = {
  color: '#52525b',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0',
};

const button = {
  backgroundColor: '#059669',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
  margin: '24px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '32px 0 0',
};
