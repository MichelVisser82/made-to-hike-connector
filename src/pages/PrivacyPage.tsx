import { Helmet } from "react-helmet-async";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, Check, Mail, MapPin } from "lucide-react";

export default function PrivacyPage() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | MadeToHike - GDPR Compliant</title>
        <meta 
          name="description" 
          content="MadeToHike Privacy Policy. Learn how we collect, use, and protect your data. GDPR compliant with EU data storage. Your privacy matters to us."
        />
        <meta name="keywords" content="privacy policy, GDPR, data protection, MadeToHike, EU privacy, data rights" />
        <link rel="canonical" href="https://madetohike.com/privacy" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Privacy Policy",
            "description": "MadeToHike Privacy Policy - GDPR compliant data protection",
            "url": "https://madetohike.com/privacy",
            "publisher": {
              "@type": "Organization",
              "name": "MadeToHike",
              "url": "https://madetohike.com"
            }
          })}
        </script>
      </Helmet>

      <MainLayout>
        <div className="min-h-screen bg-cream-light">
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-burgundy via-burgundy to-charcoal text-white py-12 md:py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center space-y-4">
                <Shield className="h-12 w-12 mx-auto" />
                <h1 className="text-3xl md:text-4xl font-bold font-playfair">
                  Privacy Policy
                </h1>
                <p className="text-white/90 text-lg">Last updated: December 1, 2025</p>
              </div>
            </div>
          </section>

          {/* Content */}
          <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="space-y-8">
              {/* Data Promise */}
              <Card className="border-l-4 border-l-burgundy bg-cream">
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-2xl font-semibold text-charcoal mb-4 font-playfair">
                    Our Data Promise
                  </h2>
                  <div className="space-y-3 text-charcoal/80 leading-relaxed">
                    <p>
                      Your privacy matters to us—and we think you should understand exactly how your data is handled without needing a law degree.
                    </p>
                    <p>
                      MadeToHike will <strong>never sell your data</strong>, show you ads from third parties, or share your information with anyone except what's needed to complete your booking or deliver our services. Guides control their own profiles and business data. Hikers control their own accounts. Full stop.
                    </p>
                    <p>
                      This policy explains what data we collect, why we need it, how long we keep it, and who we share it with. We name every service we use because transparency matters.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair">Quick Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-burgundy">Who we are</h3>
                      <p className="text-charcoal/80 text-sm">
                        MadeToHike, a Dutch company connecting certified mountain guides with adventure travelers.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-burgundy">What we collect</h3>
                      <ul className="text-charcoal/80 text-sm space-y-1">
                        <li><strong>Hikers:</strong> Account details, booking information, payment data (via Stripe), messages with guides</li>
                        <li><strong>Guides:</strong> Professional credentials, identity verification (via Stripe), bank details, tour listings, reviews</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-burgundy">Why we collect it</h3>
                      <p className="text-charcoal/80 text-sm">
                        To facilitate bookings, process payments, verify guide certifications, enable communication, improve our platform, and comply with legal requirements.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-burgundy">Who we share with</h3>
                      <p className="text-charcoal/80 text-sm">
                        Stripe (payments), Supabase (database hosting), Resend (transactional emails), Brevo (marketing emails with your consent), CookieFirst (cookie management), and the other party to your booking.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-burgundy/10">
                    <p className="text-charcoal/80 text-sm">
                      <strong>Your rights:</strong> Access, correct, delete, export, restrict, or object to processing of your data. Withdraw consent anytime.
                    </p>
                    <p className="text-charcoal/80 text-sm mt-2">
                      <strong>Where data is stored:</strong> EU servers with limited transfers to US services protected by EU-US Data Privacy Framework.
                    </p>
                    <p className="text-charcoal/80 text-sm mt-2">
                      <strong>Contact us:</strong> privacy@madetohike.com
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 1. Who We Are */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair">1. Who We Are</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-charcoal/80">
                  <div>
                    <p className="font-semibold text-charcoal">Data Controller:</p>
                    <p>MadeToHike - Baarn, Utrecht, Netherlands</p>
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal">Contact for Privacy Matters:</p>
                    <p>Email: privacy@madetohike.com</p>
                  </div>
                  <p>
                    We are the data controller responsible for your personal data when you use MadeToHike. This means we decide what data we collect and how we use it.
                  </p>
                  <div>
                    <p className="font-semibold text-charcoal">Supervisory Authority:</p>
                    <p>
                      If you're based in the Netherlands, your supervisory authority is the Autoriteit Persoonsgegevens (Dutch DPA). You have the right to lodge a complaint at: <a href="https://autoriteitpersoonsgegevens.nl" className="text-burgundy hover:underline" target="_blank" rel="noopener noreferrer">autoriteitpersoonsgegevens.nl</a>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 2. What This Policy Covers */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair">2. What This Policy Covers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-charcoal/80">
                  <div>
                    <p className="font-semibold text-charcoal mb-2">This privacy policy applies to all personal data we collect through:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Our website (madetohike.com)</li>
                      <li>Mobile applications (when launched)</li>
                      <li>Email communications</li>
                      <li>Customer support interactions</li>
                      <li>Social media interactions on our official channels</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal mb-2">This policy does not cover:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Third-party websites we link to (check their privacy policies)</li>
                      <li>Data processing by guides as independent business owners (they act as separate data controllers for any data they collect directly from you beyond the booking)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* 3. Data We Collect From Hikers */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair">3. Data We Collect From Hikers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-charcoal/80">
                  <div>
                    <h3 className="font-semibold text-charcoal mb-2">Account Information</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Full name</li>
                      <li>Email address</li>
                      <li>Phone number (optional but recommended for safety)</li>
                      <li>Password (encrypted, never stored in plain text)</li>
                      <li>Country/region</li>
                      <li>Preferred language</li>
                      <li>Profile photo (optional)</li>
                    </ul>
                    <p className="text-sm mt-2 text-charcoal/60">Legal basis: Contract performance (Article 6(1)(b) GDPR)</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-charcoal mb-2">Booking Information</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Tour dates and selections</li>
                      <li>Number of participants</li>
                      <li>Special requirements (dietary restrictions, fitness level, accessibility needs)</li>
                      <li>Emergency contact details</li>
                      <li>Medical information (only if you voluntarily provide it and only shared with your guide for safety)</li>
                    </ul>
                    <p className="text-sm mt-2 text-charcoal/60">Legal basis: Contract performance (Article 6(1)(b) GDPR)</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-charcoal mb-2">Payment Information</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Payment is processed entirely by Stripe</li>
                      <li>We never see or store your full card details</li>
                      <li>We receive confirmation of successful payment and transaction IDs</li>
                      <li>Stripe retains minimal payment method details (last 4 digits, expiry, brand) for your convenience</li>
                    </ul>
                    <p className="text-sm mt-2 text-charcoal/60">Legal basis: Contract performance (Article 6(1)(b) GDPR)</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-charcoal mb-2">Communication Data</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Messages exchanged with guides through our platform</li>
                      <li>Customer support inquiries and responses</li>
                      <li>Email communication history</li>
                    </ul>
                    <p className="text-sm mt-2 text-charcoal/60">Legal basis: Contract performance (Article 6(1)(b) GDPR) and legitimate interest (Article 6(1)(f) GDPR) for support</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-charcoal mb-2">Usage Information</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Pages visited on our platform</li>
                      <li>Search queries and filters used</li>
                      <li>Device information (browser type, operating system, IP address)</li>
                      <li>Referral source (how you found us)</li>
                      <li>Session duration and interactions</li>
                    </ul>
                    <p className="text-sm mt-2 text-charcoal/60">Legal basis: Legitimate interest (Article 6(1)(f) GDPR) for analytics and service improvement</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-charcoal mb-2">Location Data</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Approximate location based on IP address (for regional tour recommendations)</li>
                      <li>We do not track your real-time GPS location</li>
                    </ul>
                    <p className="text-sm mt-2 text-charcoal/60">Legal basis: Legitimate interest (Article 6(1)(f) GDPR)</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-charcoal mb-2">Marketing Data (Only With Your Consent)</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Newsletter subscription status</li>
                      <li>Email open and click rates</li>
                      <li>Marketing preferences</li>
                    </ul>
                    <p className="text-sm mt-2 text-charcoal/60">Legal basis: Consent (Article 6(1)(a) GDPR) - you can withdraw anytime</p>
                  </div>
                </CardContent>
              </Card>

              {/* 4. Data We Collect From Guides */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair">4. Data We Collect From Guides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-charcoal/80">
                  <p>If you offer tours as a guide on MadeToHike, we collect additional information:</p>

                  <div>
                    <h3 className="font-semibold text-charcoal mb-2">Professional Information</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Full legal name</li>
                      <li>Business name (if operating as a company)</li>
                      <li>Professional certifications (IFMGA, UIMLA, etc.)</li>
                      <li>Certification numbers and expiry dates</li>
                      <li>Professional experience and qualifications</li>
                      <li>Languages spoken</li>
                      <li>Specializations and expertise areas</li>
                      <li>Professional insurance details and coverage amounts</li>
                    </ul>
                    <p className="text-sm mt-2 text-charcoal/60">Legal basis: Contract performance (Article 6(1)(b) GDPR) and legitimate interest (Article 6(1)(f) GDPR) for quality assurance and platform safety</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-charcoal mb-2">Identity Verification</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Government-issued ID (processed by Stripe Connect for KYC compliance)</li>
                      <li>Date of birth</li>
                      <li>Nationality</li>
                      <li>Proof of address</li>
                      <li>Business registration documents (if applicable)</li>
                      <li>Tax identification numbers</li>
                    </ul>
                    <p className="text-sm mt-2 text-charcoal/60">Legal basis: Legal obligation (Article 6(1)(c) GDPR) under anti-money laundering and financial regulations</p>
                    <div className="bg-cream p-4 rounded-lg mt-3 border border-burgundy/20">
                      <p className="text-sm">
                        <strong>Important:</strong> Identity verification is processed by Stripe. Stripe may use biometric data (facial recognition) to verify your identity documents. This requires your explicit consent under Article 9(2)(a) GDPR. You provide this consent directly to Stripe during their verification process.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-charcoal mb-2">Financial Information</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Bank account details (IBAN, account holder name)</li>
                      <li>Tax residency information</li>
                      <li>VAT number (if applicable)</li>
                      <li>Earnings and payout history</li>
                      <li>Transaction records</li>
                    </ul>
                    <p className="text-sm mt-2 text-charcoal/60">Legal basis: Contract performance (Article 6(1)(b) GDPR) and legal obligation (Article 6(1)(c) GDPR) for tax reporting</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-charcoal mb-2">Business Performance Data</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Bookings received and completed</li>
                      <li>Response times to inquiries</li>
                      <li>Cancellation rates</li>
                      <li>Customer reviews and ratings</li>
                      <li>Overall performance metrics</li>
                    </ul>
                    <p className="text-sm mt-2 text-charcoal/60">Legal basis: Contract performance (Article 6(1)(b) GDPR) and legitimate interest (Article 6(1)(f) GDPR) for quality assurance</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-charcoal mb-2">Tour Listings</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Tour descriptions and itineraries</li>
                      <li>Pricing information</li>
                      <li>Photos and videos</li>
                      <li>GPX files and route maps</li>
                      <li>Availability calendars</li>
                      <li>Packing lists and recommendations</li>
                    </ul>
                    <p className="text-sm mt-2 text-charcoal/60">Legal basis: Contract performance (Article 6(1)(b) GDPR)</p>
                  </div>
                </CardContent>
              </Card>

              {/* 5. How We Use Your Data */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair">5. How We Use Your Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-charcoal/80 mb-4">We use your personal data for the following purposes:</p>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-burgundy text-white">
                          <th className="p-3 text-left font-semibold">Purpose</th>
                          <th className="p-3 text-left font-semibold">Data Used</th>
                          <th className="p-3 text-left font-semibold">Legal Basis</th>
                          <th className="p-3 text-left font-semibold">Who Sees It</th>
                        </tr>
                      </thead>
                      <tbody className="text-charcoal/80">
                        <tr className="border-b border-burgundy/20">
                          <td className="p-3">Account Management</td>
                          <td className="p-3">Name, email, password, preferences</td>
                          <td className="p-3">Contract (Art. 6(1)(b))</td>
                          <td className="p-3">MadeToHike only</td>
                        </tr>
                        <tr className="border-b border-burgundy/20 bg-cream">
                          <td className="p-3">Process Bookings</td>
                          <td className="p-3">All booking details, contact info</td>
                          <td className="p-3">Contract (Art. 6(1)(b))</td>
                          <td className="p-3">MadeToHike, relevant guide, Stripe</td>
                        </tr>
                        <tr className="border-b border-burgundy/20">
                          <td className="p-3">Payment Processing</td>
                          <td className="p-3">Payment details, transaction amounts</td>
                          <td className="p-3">Contract (Art. 6(1)(b))</td>
                          <td className="p-3">Stripe (payment processor)</td>
                        </tr>
                        <tr className="border-b border-burgundy/20 bg-cream">
                          <td className="p-3">Guide Payouts</td>
                          <td className="p-3">Bank details, earnings data</td>
                          <td className="p-3">Contract (Art. 6(1)(b))</td>
                          <td className="p-3">Stripe, relevant guide</td>
                        </tr>
                        <tr className="border-b border-burgundy/20">
                          <td className="p-3">Facilitate Communication</td>
                          <td className="p-3">Messages, contact details</td>
                          <td className="p-3">Contract (Art. 6(1)(b))</td>
                          <td className="p-3">MadeToHike, message recipients</td>
                        </tr>
                        <tr className="border-b border-burgundy/20 bg-cream">
                          <td className="p-3">Safety & Support</td>
                          <td className="p-3">Emergency contacts, special requirements</td>
                          <td className="p-3">Contract (Art. 6(1)(b))</td>
                          <td className="p-3">Relevant guide for your booking</td>
                        </tr>
                        <tr className="border-b border-burgundy/20">
                          <td className="p-3">Verify Guide Credentials</td>
                          <td className="p-3">Professional credentials, certification documents</td>
                          <td className="p-3">Contract (Art. 6(1)(b)), Legitimate interest (Art. 6(1)(f))</td>
                          <td className="p-3">MadeToHike</td>
                        </tr>
                        <tr className="border-b border-burgundy/20 bg-cream">
                          <td className="p-3">Send Booking Emails</td>
                          <td className="p-3">Email address, booking details</td>
                          <td className="p-3">Contract (Art. 6(1)(b))</td>
                          <td className="p-3">Resend (email service), recipients</td>
                        </tr>
                        <tr className="border-b border-burgundy/20">
                          <td className="p-3">Send Marketing Emails</td>
                          <td className="p-3">Email address, preferences</td>
                          <td className="p-3">Consent (Art. 6(1)(a))</td>
                          <td className="p-3">Brevo (email service), you (recipient)</td>
                        </tr>
                        <tr className="border-b border-burgundy/20 bg-cream">
                          <td className="p-3">Improve Our Platform</td>
                          <td className="p-3">Usage data, search queries, analytics</td>
                          <td className="p-3">Legitimate interest (Art. 6(1)(f))</td>
                          <td className="p-3">MadeToHike, aggregated analytics</td>
                        </tr>
                        <tr className="border-b border-burgundy/20">
                          <td className="p-3">Prevent Fraud</td>
                          <td className="p-3">IP address, device data, transaction patterns</td>
                          <td className="p-3">Legitimate interest (Art. 6(1)(f))</td>
                          <td className="p-3">MadeToHike, Stripe</td>
                        </tr>
                        <tr className="border-b border-burgundy/20 bg-cream">
                          <td className="p-3">Comply With Laws</td>
                          <td className="p-3">Transaction records, identity data, tax info</td>
                          <td className="p-3">Legal obligation (Art. 6(1)(c))</td>
                          <td className="p-3">MadeToHike, tax authorities if required</td>
                        </tr>
                        <tr className="border-b border-burgundy/20">
                          <td className="p-3">Handle Disputes</td>
                          <td className="p-3">Booking records, communications, reviews</td>
                          <td className="p-3">Legitimate interest (Art. 6(1)(f))</td>
                          <td className="p-3">MadeToHike, involved parties</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-6 p-4 bg-cream rounded-lg border border-burgundy/20">
                    <p className="font-semibold text-charcoal mb-2">We will never:</p>
                    <ul className="space-y-1 text-charcoal/80">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-sage shrink-0 mt-0.5" />
                        <span>Sell your data to third parties</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-sage shrink-0 mt-0.5" />
                        <span>Use your data for advertising outside our own platform</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* 6. Who We Share Your Data With */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair">6. Who We Share Your Data With</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-charcoal/80">
                  <p>We believe in radical transparency. Here's exactly who sees your data and why:</p>

                  <div>
                    <h3 className="font-semibold text-charcoal text-lg mb-3 font-playfair">Essential Service Providers</h3>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-cream rounded-lg border border-burgundy/20">
                        <h4 className="font-semibold text-burgundy mb-2">Stripe (stripe.com/privacy)</h4>
                        <div className="space-y-2 text-sm">
                          <p><strong>What they do:</strong> Payment processing and guide payouts via Stripe Connect</p>
                          <p><strong>What they get:</strong> Transaction details, payment methods, identity verification data for guides</p>
                          <p><strong>Why:</strong> You can't have a marketplace without payment processing</p>
                          <p><strong>Protections:</strong> PCI-DSS compliant, certified under EU-US Data Privacy Framework, uses encryption</p>
                          <p><strong>Location:</strong> US (covered by Data Privacy Framework)</p>
                        </div>
                      </div>

                      <div className="p-4 bg-cream rounded-lg border border-burgundy/20">
                        <h4 className="font-semibold text-burgundy mb-2">Supabase (supabase.com/privacy)</h4>
                        <div className="space-y-2 text-sm">
                          <p><strong>What they do:</strong> Database hosting, authentication, and backend infrastructure</p>
                          <p><strong>What they get:</strong> All data stored in our platform database</p>
                          <p><strong>Why:</strong> Secure, scalable database infrastructure</p>
                          <p><strong>Protections:</strong> Data Processing Agreement (DPA), processes data only per our instructions</p>
                          <p><strong>Location:</strong> EU servers (Frankfurt, Germany)</p>
                        </div>
                      </div>

                      <div className="p-4 bg-cream rounded-lg border border-burgundy/20">
                        <h4 className="font-semibold text-burgundy mb-2">Resend (resend.com/legal/privacy-policy)</h4>
                        <div className="space-y-2 text-sm">
                          <p><strong>What they do:</strong> Transactional email delivery (booking confirmations, password resets, etc.)</p>
                          <p><strong>What they get:</strong> Recipient email addresses, email content we send</p>
                          <p><strong>Why:</strong> Reliable delivery of critical account and booking emails</p>
                          <p><strong>Protections:</strong> GDPR compliant, certified under EU-US Data Privacy Framework</p>
                          <p><strong>Location:</strong> US (covered by Data Privacy Framework)</p>
                        </div>
                      </div>

                      <div className="p-4 bg-cream rounded-lg border border-burgundy/20">
                        <h4 className="font-semibold text-burgundy mb-2">Brevo / Sendinblue (brevo.com/legal/privacypolicy)</h4>
                        <div className="space-y-2 text-sm">
                          <p><strong>What they do:</strong> Marketing email and newsletter delivery (only if you opt in)</p>
                          <p><strong>What they get:</strong> Email addresses of subscribers, email engagement data</p>
                          <p><strong>Why:</strong> Professional newsletter management with unsubscribe handling</p>
                          <p><strong>Protections:</strong> EU company (France), data stored in Germany</p>
                          <p><strong>Location:</strong> EU (Germany)</p>
                        </div>
                      </div>

                      <div className="p-4 bg-cream rounded-lg border border-burgundy/20">
                        <h4 className="font-semibold text-burgundy mb-2">CookieFirst</h4>
                        <div className="space-y-2 text-sm">
                          <p><strong>What they do:</strong> Cookie consent management</p>
                          <p><strong>What they get:</strong> Your cookie preferences and consent timestamp</p>
                          <p><strong>Why:</strong> GDPR-compliant cookie consent management</p>
                          <p><strong>Protections:</strong> EU company (Netherlands), GDPR compliant</p>
                          <p><strong>Location:</strong> EU (Netherlands)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-charcoal text-lg mb-3 font-playfair">The Other Party to Your Booking</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold text-charcoal mb-1">When you book a tour:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                          <li>The guide receives: your name, contact details, booking requirements, special needs, emergency contact</li>
                          <li>You receive: the guide's name, contact details, meeting point information</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-charcoal mb-1">When you offer a tour:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                          <li>Hikers see: your professional name, certifications, experience, tour listings, reviews, profile photo</li>
                          <li>Hikers do NOT see: your home address, bank details, ID documents, or earnings</li>
                        </ul>
                      </div>
                      <p className="text-sm mt-3">
                        Both parties act as independent data controllers for any direct communication or arrangement beyond the MadeToHike platform.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-charcoal text-lg mb-3 font-playfair">Legal Obligations</h3>
                    <p className="mb-2">We may share data with:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>Tax authorities:</strong> As required under Dutch tax law for marketplace transactions</li>
                      <li><strong>Law enforcement:</strong> When required by valid legal process (court order, subpoena)</li>
                      <li><strong>Regulatory bodies:</strong> For anti-money laundering compliance, certification verification</li>
                    </ul>
                    <p className="text-sm mt-3">We will notify you of any such disclosure unless legally prohibited.</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-charcoal text-lg mb-3 font-playfair">Business Transfers</h3>
                    <p className="text-sm">
                      If MadeToHike is acquired or merges with another company, your data would transfer to the new entity. We would notify you beforehand and ensure the new entity honors this privacy policy.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 7. International Data Transfers */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair">7. International Data Transfers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-charcoal/80">
                  <div>
                    <p className="font-semibold text-charcoal">Primary storage:</p>
                    <p>All data is stored on EU-based servers (Germany) via Supabase.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal">US Transfers:</p>
                    <p>We use some US-based service providers (Stripe, Resend) that are certified under the EU-US Data Privacy Framework. This framework provides adequate protection for data transfers to the US under GDPR Article 45.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal mb-2">Safeguards:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Data Processing Agreements (DPAs) with all processors</li>
                      <li>Standard Contractual Clauses (SCCs) where applicable</li>
                      <li>Encryption in transit (TLS 1.3) and at rest (AES-256)</li>
                      <li>Regular security audits of all service providers</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal">No other international transfers:</p>
                    <p>We do not transfer data outside the EU/EEA except to US companies covered by the Data Privacy Framework as listed above.</p>
                  </div>
                </CardContent>
              </Card>

              {/* 8. How Long We Keep Your Data */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair">8. How Long We Keep Your Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-charcoal/80">
                  <p>We keep your data only as long as necessary. Here are specific retention periods:</p>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-burgundy text-white">
                          <th className="p-3 text-left font-semibold">Data Type</th>
                          <th className="p-3 text-left font-semibold">Retention Period</th>
                          <th className="p-3 text-left font-semibold">Why</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-burgundy/20">
                          <td className="p-3">Account data</td>
                          <td className="p-3">Account lifetime + 6 years after deletion</td>
                          <td className="p-3">Legal obligation (tax records)</td>
                        </tr>
                        <tr className="border-b border-burgundy/20 bg-cream">
                          <td className="p-3">Booking records</td>
                          <td className="p-3">6 years after completion</td>
                          <td className="p-3">Legal obligation (tax, contracts)</td>
                        </tr>
                        <tr className="border-b border-burgundy/20">
                          <td className="p-3">Payment transactions</td>
                          <td className="p-3">6 years</td>
                          <td className="p-3">Legal obligation (Dutch tax law)</td>
                        </tr>
                        <tr className="border-b border-burgundy/20 bg-cream">
                          <td className="p-3">Identity verification</td>
                          <td className="p-3">6 years after relationship ends</td>
                          <td className="p-3">Legal obligation (AML/KYC)</td>
                        </tr>
                        <tr className="border-b border-burgundy/20">
                          <td className="p-3">Guide certifications</td>
                          <td className="p-3">6 years after expiry or delisting</td>
                          <td className="p-3">Liability protection</td>
                        </tr>
                        <tr className="border-b border-burgundy/20 bg-cream">
                          <td className="p-3">Messages between users</td>
                          <td className="p-3">6 years after booking completion</td>
                          <td className="p-3">Contract evidence, dispute resolution</td>
                        </tr>
                        <tr className="border-b border-burgundy/20">
                          <td className="p-3">Customer support inquiries</td>
                          <td className="p-3">3 years</td>
                          <td className="p-3">Legitimate interest (service improvement)</td>
                        </tr>
                        <tr className="border-b border-burgundy/20 bg-cream">
                          <td className="p-3">Marketing consent records</td>
                          <td className="p-3">3 years after withdrawal</td>
                          <td className="p-3">Legal obligation (proof of consent)</td>
                        </tr>
                        <tr className="border-b border-burgundy/20">
                          <td className="p-3">Usage logs and analytics</td>
                          <td className="p-3">24 months</td>
                          <td className="p-3">Legitimate interest (analytics, security)</td>
                        </tr>
                        <tr className="border-b border-burgundy/20 bg-cream">
                          <td className="p-3">Cookie consent</td>
                          <td className="p-3">24 months</td>
                          <td className="p-3">Legal obligation (proof of consent)</td>
                        </tr>
                        <tr className="border-b border-burgundy/20">
                          <td className="p-3">Reviews and ratings</td>
                          <td className="p-3">Indefinite (pseudonymized after account deletion)</td>
                          <td className="p-3">Legitimate interest (guide quality)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="pt-4">
                    <p className="font-semibold text-charcoal">After retention periods:</p>
                    <p>Data is securely deleted or anonymized beyond recovery.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal">Exception:</p>
                    <p>We may retain data longer if required by law, pending legal proceedings, or to defend legal claims.</p>
                  </div>
                </CardContent>
              </Card>

              {/* 9. Your Rights Under GDPR */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair">9. Your Rights Under GDPR</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-charcoal/80">
                  <p>You have strong rights over your personal data. Here's what you can do:</p>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="access">
                      <AccordionTrigger className="text-burgundy hover:text-burgundy/80">
                        1. Right of Access (Article 15)
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p className="font-semibold">Request a copy of all personal data we hold about you.</p>
                        <div>
                          <p className="mb-2">We'll provide:</p>
                          <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>What data we have</li>
                            <li>Why we're processing it</li>
                            <li>Who we've shared it with</li>
                            <li>How long we'll keep it</li>
                            <li>A copy in portable format (CSV/JSON)</li>
                          </ul>
                        </div>
                        <p><strong>How:</strong> Email privacy@madetohike.com with "Data Access Request"</p>
                        <p><strong>Timeline:</strong> We respond within 1 month (may extend to 3 months for complex requests)</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="rectification">
                      <AccordionTrigger className="text-burgundy hover:text-burgundy/80">
                        2. Right to Rectification (Article 16)
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p className="font-semibold">Correct inaccurate or incomplete data.</p>
                        <p>You can update most information yourself in account settings. For data you can't edit directly, contact us.</p>
                        <p><strong>How:</strong> Account Settings or email privacy@madetohike.com</p>
                        <p><strong>Timeline:</strong> Immediate for self-service updates, within 72 hours for assisted corrections</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="erasure">
                      <AccordionTrigger className="text-burgundy hover:text-burgundy/80">
                        3. Right to Erasure / "Right to be Forgotten" (Article 17)
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p className="font-semibold">Delete your account and personal data.</p>
                        <div>
                          <p className="mb-2">When you delete your account:</p>
                          <ul className="space-y-1 ml-4">
                            <li className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-sage shrink-0 mt-0.5" />
                              <span>Your profile is immediately removed from public view</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-sage shrink-0 mt-0.5" />
                              <span>Personal identifiers are deleted within 30 days</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-sage shrink-0 mt-0.5" />
                              <span>Some data is retained for legal compliance (see retention periods)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-sage shrink-0 mt-0.5" />
                              <span>Reviews you wrote are pseudonymized (name removed, content remains for guide quality)</span>
                            </li>
                          </ul>
                        </div>
                        <p><strong>Limits:</strong> We cannot delete data if we have legal obligation to retain it (tax records, fraud investigation, pending disputes).</p>
                        <p><strong>How:</strong> Account Settings → Delete Account, or email privacy@madetohike.com</p>
                        <p><strong>Timeline:</strong> Public profile removed immediately, full deletion within 30 days</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="restriction">
                      <AccordionTrigger className="text-burgundy hover:text-burgundy/80">
                        4. Right to Restriction (Article 18)
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p className="font-semibold">Limit how we process your data while disputing accuracy or lawfulness.</p>
                        <p><strong>How:</strong> Email privacy@madetohike.com with "Restriction Request"</p>
                        <p><strong>Timeline:</strong> We implement restrictions within 72 hours</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="portability">
                      <AccordionTrigger className="text-burgundy hover:text-burgundy/80">
                        5. Right to Data Portability (Article 20)
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p className="font-semibold">Receive your data in machine-readable format to move to another service.</p>
                        <p><strong>What you get:</strong> JSON file with all your personal data (account info, bookings, messages, reviews)</p>
                        <p><strong>How:</strong> Account Settings → Export Data, or email privacy@madetohike.com</p>
                        <p><strong>Timeline:</strong> Export available immediately in account settings</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="object">
                      <AccordionTrigger className="text-burgundy hover:text-burgundy/80">
                        6. Right to Object (Article 21)
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p className="font-semibold">Object to processing based on legitimate interests or for direct marketing.</p>
                        <p><strong>Marketing:</strong> Unsubscribe from any email or email privacy@madetohike.com</p>
                        <p><strong>Profiling/Analytics:</strong> Email privacy@madetohike.com to opt out of analytics</p>
                        <p><strong>Timeline:</strong> Marketing stops immediately, analytics within 48 hours</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="withdraw">
                      <AccordionTrigger className="text-burgundy hover:text-burgundy/80">
                        7. Right to Withdraw Consent (Article 7(3))
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p className="font-semibold">Withdraw consent for processing based on consent (marketing, cookies).</p>
                        <p><strong>How:</strong> Unsubscribe link in emails, Cookie Settings in footer, or email privacy@madetohike.com</p>
                        <p><strong>Effect:</strong> We stop processing from withdrawal forward (doesn't affect past processing)</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="complaint">
                      <AccordionTrigger className="text-burgundy hover:text-burgundy/80">
                        8. Right to Lodge a Complaint (Article 77)
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p className="font-semibold">File a complaint with your supervisory authority if you believe we've violated GDPR.</p>
                        <p><strong>Netherlands:</strong> Autoriteit Persoonsgegevens (<a href="https://autoriteitpersoonsgegevens.nl" className="text-burgundy hover:underline" target="_blank" rel="noopener noreferrer">autoriteitpersoonsgegevens.nl</a>)</p>
                        <p><strong>Your country:</strong> Find your DPA at <a href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" className="text-burgundy hover:underline" target="_blank" rel="noopener noreferrer">edpb.europa.eu</a></p>
                        <p className="text-sm">We'd appreciate the chance to address your concerns directly first—please contact privacy@madetohike.com.</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              {/* 10. How We Protect Your Data */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair">10. How We Protect Your Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-charcoal/80">
                  <div>
                    <p className="font-semibold text-charcoal mb-2">Security measures:</p>
                    <ul className="space-y-1 ml-4">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-sage shrink-0 mt-0.5" />
                        <span><strong>Encryption in transit:</strong> TLS 1.3 for all connections</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-sage shrink-0 mt-0.5" />
                        <span><strong>Encryption at rest:</strong> AES-256 for database storage</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-sage shrink-0 mt-0.5" />
                        <span><strong>Secure authentication:</strong> Bcrypt password hashing (never plain text)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-sage shrink-0 mt-0.5" />
                        <span>Regular security audits of infrastructure and code</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-sage shrink-0 mt-0.5" />
                        <span><strong>Employee access controls:</strong> Only authorized staff can access personal data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-sage shrink-0 mt-0.5" />
                        <span><strong>Two-factor authentication:</strong> Available for all accounts (required for guides)</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal">Breach notification:</p>
                    <p>If a data breach occurs that poses high risk to your rights, we will notify you within 72 hours per GDPR Article 33.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal">Your role:</p>
                    <p>Use strong, unique passwords. Enable two-factor authentication. Don't share your account credentials.</p>
                  </div>
                </CardContent>
              </Card>

              {/* 11. Cookies and Tracking */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair">11. Cookies and Tracking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-charcoal/80">
                  <p>We use cookies to make MadeToHike work and to understand how people use our platform.</p>
                  
                  <div>
                    <h3 className="font-semibold text-charcoal mb-2">Essential cookies (always active):</h3>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Authentication (keeps you logged in)</li>
                      <li>Security (protects against CSRF attacks)</li>
                      <li>Session management (remembers your preferences during visit)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-charcoal mb-2">Analytics cookies (optional, requires consent):</h3>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Plausible Analytics (privacy-friendly, GDPR-compliant, no personal data)</li>
                      <li>Aggregated usage patterns (most visited pages, popular search terms)</li>
                      <li>No cross-site tracking or advertising cookies</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-charcoal mb-2">Marketing cookies (optional, requires consent):</h3>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Brevo (tracks email campaign engagement if you're subscribed)</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold text-charcoal">Your control:</p>
                    <p>Manage all cookie preferences via the "Cookie Settings" link in the footer (powered by CookieFirst). You can withdraw consent anytime.</p>
                  </div>
                </CardContent>
              </Card>

              {/* 12. Children's Privacy */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair">12. Children's Privacy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-charcoal/80">
                  <p>MadeToHike is not intended for children under 16. We do not knowingly collect data from children.</p>
                  <p>If you're a parent and believe your child has provided us data, contact privacy@madetohike.com and we'll delete it immediately.</p>
                  <p><strong>For family bookings:</strong> The booking adult is responsible for children's participation and must provide any necessary information on their behalf.</p>
                </CardContent>
              </Card>

              {/* 13. Automated Decision-Making */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair">13. Automated Decision-Making</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-charcoal/80">
                  <p>We do not use automated decision-making or profiling that produces legal effects or similarly significantly affects you.</p>
                  <p>All decisions about account approval, booking confirmations, and guide verification involve human review.</p>
                </CardContent>
              </Card>

              {/* 14. Guide Data Ownership */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair">14. Guide Data Ownership</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-charcoal/80">
                  <div>
                    <p className="font-semibold text-charcoal mb-2">Guides: You own your business data.</p>
                    <ul className="space-y-1 ml-4">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-sage shrink-0 mt-0.5" />
                        <span>You can export your complete booking history, earnings records, customer communications, and tour listings anytime</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-sage shrink-0 mt-0.5" />
                        <span>If you leave MadeToHike, we'll help you take your data with you</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-sage shrink-0 mt-0.5" />
                        <span>We won't use your tour content for purposes beyond operating the marketplace</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-sage shrink-0 mt-0.5" />
                        <span>Your reviews remain visible (pseudonymized) after account deletion to maintain guide quality information</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold text-charcoal mb-2">Your responsibilities as a guide:</p>
                    <ul className="space-y-1 ml-4">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-sage shrink-0 mt-0.5" />
                        <span>You're an independent data controller for any data you collect directly from hikers</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-sage shrink-0 mt-0.5" />
                        <span>You must have your own privacy policy if you collect data beyond the booking</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-sage shrink-0 mt-0.5" />
                        <span>You must comply with GDPR for any personal data you handle</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-sage shrink-0 mt-0.5" />
                        <span>You cannot use hiker contact details for unauthorized marketing</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* 15. Changes to This Policy */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair">15. Changes to This Policy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-charcoal/80">
                  <p>We may update this privacy policy as our platform evolves or laws change.</p>
                  
                  <div>
                    <p className="font-semibold text-charcoal mb-2">How we notify you:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Email notification for significant changes (if you have an account)</li>
                      <li>Notice on website for 30 days before changes take effect</li>
                      <li>Updated "Last updated" date at the top</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold text-charcoal mb-2">Your options:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Continue using MadeToHike (acceptance of new policy)</li>
                      <li>Delete your account before changes take effect (if you disagree)</li>
                    </ul>
                  </div>

                  <p className="text-sm"><strong>Version history:</strong> Previous versions available upon request to privacy@madetohike.com</p>
                </CardContent>
              </Card>

              {/* 16. Contact Us */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair">16. Contact Us</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-burgundy shrink-0 mt-1" />
                        <div>
                          <p className="font-semibold text-charcoal">Privacy questions or requests:</p>
                          <p className="text-charcoal/80">Email: privacy@madetohike.com</p>
                          <p className="text-sm text-charcoal/60">Response time: Within 3 business days for inquiries, within 1 month for formal requests</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-burgundy shrink-0 mt-1" />
                        <div>
                          <p className="font-semibold text-charcoal">General support:</p>
                          <p className="text-charcoal/80">Email: hello@madetohike.com</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-burgundy/10">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-burgundy shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-charcoal">MadeToHike B.V.</p>
                        <p className="text-charcoal/80">Postal address:</p>
                        <p className="text-charcoal/80">MadeToHike B.V.</p>
                        <p className="text-charcoal/80">Baarn, Utrecht</p>
                        <p className="text-charcoal/80">Netherlands</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 17. Legal Framework */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair">17. Legal Framework</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-charcoal/80">
                  <div>
                    <p className="font-semibold text-charcoal mb-2">This privacy policy is governed by:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>EU General Data Protection Regulation (GDPR) 2016/679</li>
                      <li>Dutch Implementation Act (UAVG)</li>
                      <li>Dutch Telecommunications Act</li>
                      <li>ePrivacy Directive 2002/58/EC</li>
                    </ul>
                  </div>
                  <p>For any disputes, Dutch law applies and courts in the Netherlands have jurisdiction.</p>
                  <div className="pt-4 border-t border-burgundy/10 text-center">
                    <p className="text-charcoal">Thank you for trusting MadeToHike with your data. We take that responsibility seriously.</p>
                    <p className="text-sm text-charcoal/60 mt-2">Last updated: December 1, 2025 • Version: 1.0</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
}
