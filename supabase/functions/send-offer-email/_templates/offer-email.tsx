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
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface OfferEmailProps {
  guideName: string;
  guideEmail: string;
  guidePhone: string;
  hikerName: string;
  duration: string;
  date: string;
  groupSize: number;
  meetingPoint: string;
  meetingTime: string;
  pricePerPerson: number;
  totalPrice: number;
  currency: string;
  itinerary: string;
  includedItems: string;
  personalNote?: string;
  acceptUrl: string;
  declineUrl: string;
}

export const OfferEmail = ({
  guideName,
  guideEmail,
  guidePhone,
  hikerName,
  duration,
  date,
  groupSize,
  meetingPoint,
  meetingTime,
  pricePerPerson,
  totalPrice,
  currency,
  itinerary,
  includedItems,
  personalNote,
  acceptUrl,
  declineUrl,
}: OfferEmailProps) => (
  <Html>
    <Head />
    <Preview>Your Custom Tour Offer from {guideName}</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <Heading style={h1}>Your Custom Tour Offer is Ready!</Heading>
        </Section>

        {/* Greeting */}
        <Text style={text}>Hi {hikerName},</Text>
        <Text style={text}>
          Great news! {guideName} has created a custom tour offer just for you based on your request.
        </Text>

        {/* Personal Note */}
        {personalNote && (
          <Section style={noteSection}>
            <Text style={noteHeading}>Personal Message from {guideName}:</Text>
            <Text style={noteText}>{personalNote}</Text>
          </Section>
        )}

        {/* Tour Details Card */}
        <Section style={detailsCard}>
          <Heading style={h2}>Tour Details</Heading>
          
          <div style={detailRow}>
            <Text style={detailLabel}>Duration:</Text>
            <Text style={detailValue}>{duration}</Text>
          </div>

          <div style={detailRow}>
            <Text style={detailLabel}>Date:</Text>
            <Text style={detailValue}>{date ? new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Flexible'}</Text>
          </div>

          <div style={detailRow}>
            <Text style={detailLabel}>Group Size:</Text>
            <Text style={detailValue}>{groupSize} {groupSize === 1 ? 'person' : 'people'}</Text>
          </div>

          <div style={detailRow}>
            <Text style={detailLabel}>Meeting Point:</Text>
            <Text style={detailValue}>{meetingPoint}</Text>
          </div>

          <div style={detailRow}>
            <Text style={detailLabel}>Meeting Time:</Text>
            <Text style={detailValue}>{meetingTime}</Text>
          </div>

          <Hr style={hr} />

          {/* Itinerary */}
          <Heading style={h3}>Itinerary</Heading>
          <Text style={itineraryText}>{itinerary}</Text>

          {/* What's Included */}
          <Heading style={h3}>What's Included</Heading>
          <Text style={itineraryText}>{includedItems}</Text>
        </Section>

        {/* Pricing */}
        <Section style={pricingSection}>
          <div style={pricingRow}>
            <Text style={pricingLabel}>Price per person:</Text>
            <Text style={pricingValue}>{currency === 'EUR' ? '€' : currency}{pricePerPerson}</Text>
          </div>
          <div style={pricingRow}>
            <Text style={pricingLabel}>Number of people:</Text>
            <Text style={pricingValue}>{groupSize}</Text>
          </div>
          <Hr style={hr} />
          <div style={totalRow}>
            <Text style={totalLabel}>Total:</Text>
            <Text style={totalValue}>{currency === 'EUR' ? '€' : currency}{totalPrice}</Text>
          </div>
        </Section>

        {/* CTA Buttons */}
        <Section style={buttonSection}>
          <Button href={acceptUrl} style={acceptButton}>
            Accept & Pay
          </Button>
          <Button href={declineUrl} style={declineButton}>
            Decline Offer
          </Button>
        </Section>

        {/* Footer */}
        <Text style={footerText}>
          This offer is valid for 48 hours. If you have any questions, feel free to reply directly to {guideName}.
        </Text>

        <Section style={contactSection}>
          <Text style={contactHeading}>Guide Contact Information:</Text>
          <Text style={contactText}>
            {guideName}<br />
            {guideEmail}<br />
            {guidePhone && `${guidePhone}`}
          </Text>
        </Section>

        <Text style={footer}>
          <Link href="https://madetohike.com" style={link}>MadeToHike</Link> - Connecting adventurers with certified mountain guides
        </Text>
      </Container>
    </Body>
  </Html>
);

export default OfferEmail;

// Styles
const main = {
  backgroundColor: '#FFF8F0',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
};

const header = {
  backgroundColor: '#8B1538',
  padding: '32px 20px',
  textAlign: 'center' as const,
  borderRadius: '8px 8px 0 0',
};

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0',
};

const h2 = {
  color: '#2C2C2C',
  fontSize: '22px',
  fontWeight: '600',
  marginTop: '0',
  marginBottom: '16px',
};

const h3 = {
  color: '#2C2C2C',
  fontSize: '18px',
  fontWeight: '600',
  marginTop: '24px',
  marginBottom: '12px',
};

const text = {
  color: '#2C2C2C',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const noteSection = {
  backgroundColor: '#F5E6D3',
  padding: '20px',
  borderRadius: '8px',
  borderLeft: '4px solid #8B1538',
  margin: '24px 0',
};

const noteHeading = {
  color: '#8B1538',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px 0',
};

const noteText = {
  color: '#2C2C2C',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  fontStyle: 'italic',
};

const detailsCard = {
  backgroundColor: '#ffffff',
  padding: '24px',
  borderRadius: '8px',
  border: '1px solid #E5E5E5',
  margin: '24px 0',
};

const detailRow = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '12px',
};

const detailLabel = {
  color: '#6B6B6B',
  fontSize: '14px',
  margin: '0',
};

const detailValue = {
  color: '#2C2C2C',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
};

const itineraryText = {
  color: '#2C2C2C',
  fontSize: '14px',
  lineHeight: '22px',
  whiteSpace: 'pre-wrap' as const,
  margin: '8px 0',
};

const hr = {
  borderColor: '#E5E5E5',
  margin: '20px 0',
};

const pricingSection = {
  backgroundColor: '#F5E6D3',
  padding: '24px',
  borderRadius: '8px',
  margin: '24px 0',
};

const pricingRow = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '8px',
};

const pricingLabel = {
  color: '#2C2C2C',
  fontSize: '16px',
  margin: '0',
};

const pricingValue = {
  color: '#2C2C2C',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0',
};

const totalRow = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '12px',
};

const totalLabel = {
  color: '#2C2C2C',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0',
};

const totalValue = {
  color: '#8B1538',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const acceptButton = {
  backgroundColor: '#8B1538',
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '16px 0',
  borderRadius: '8px',
  marginBottom: '12px',
};

const declineButton = {
  backgroundColor: 'transparent',
  color: '#8B1538',
  fontSize: '16px',
  fontWeight: '500',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px 0',
  border: '2px solid #8B1538',
  borderRadius: '8px',
};

const footerText = {
  color: '#6B6B6B',
  fontSize: '14px',
  lineHeight: '20px',
  textAlign: 'center' as const,
  margin: '24px 0',
};

const contactSection = {
  backgroundColor: '#ffffff',
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid #E5E5E5',
  margin: '24px 0',
};

const contactHeading = {
  color: '#8B1538',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px 0',
};

const contactText = {
  color: '#2C2C2C',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const footer = {
  color: '#6B6B6B',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  margin: '24px 0',
};

const link = {
  color: '#8B1538',
  textDecoration: 'underline',
};
