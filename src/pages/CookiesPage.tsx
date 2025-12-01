import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { Cookie, CheckCircle, Info, Shield } from 'lucide-react';

export default function CookiesPage() {
  const { openPreferences } = useCookieConsent();

  return (
    <>
      <Helmet>
        <title>Cookie Policy - Made to Hike</title>
        <meta name="description" content="Learn about how Made to Hike uses cookies to improve your browsing experience and manage your cookie preferences." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-burgundy via-burgundy/90 to-burgundy/80 text-cream py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-4">
              <Cookie className="h-12 w-12" />
              <h1 className="text-4xl md:text-5xl font-playfair font-bold">Cookie Policy</h1>
            </div>
            <p className="text-cream/90 text-lg max-w-3xl">
              This Cookie Policy explains how Made to Hike uses cookies and similar tracking technologies on our platform.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Cookie Settings Card */}
            <Card className="p-6 border-burgundy/20">
              <div className="flex items-start gap-4">
                <Shield className="h-6 w-6 text-burgundy mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h2 className="text-2xl font-playfair font-semibold text-burgundy mb-3">
                    Manage Your Cookie Preferences
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    You have full control over the cookies we use. Click the button below to customize your cookie preferences at any time.
                  </p>
                  <Button onClick={openPreferences} size="lg" className="gap-2">
                    <Cookie className="h-4 w-4" />
                    Open Cookie Settings
                  </Button>
                </div>
              </div>
            </Card>

            {/* What Are Cookies */}
            <section>
              <h2 className="text-3xl font-playfair font-semibold text-burgundy mb-4">
                What Are Cookies?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Cookies are small text files that are placed on your device when you visit a website. They help websites remember information about your visit, making your experience more efficient and personalized.
              </p>
            </section>

            {/* Cookie Categories */}
            <section>
              <h2 className="text-3xl font-playfair font-semibold text-burgundy mb-6">
                Types of Cookies We Use
              </h2>
              
              <div className="space-y-6">
                {/* Necessary Cookies */}
                <Card className="p-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Necessary Cookies</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        <strong>Always Active</strong> - These cookies are essential for the website to function properly.
                      </p>
                      <p className="text-muted-foreground mb-3">
                        These cookies enable core functionality such as security, authentication, and accessibility features. The website cannot function properly without these cookies.
                      </p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        <li>Authentication and login session management</li>
                        <li>Security and fraud prevention</li>
                        <li>Load balancing and site performance</li>
                        <li>Cookie consent preferences</li>
                      </ul>
                    </div>
                  </div>
                </Card>

                {/* Performance Cookies */}
                <Card className="p-6">
                  <div className="flex items-start gap-3">
                    <Info className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Performance Cookies (Analytics)</h3>
                      <p className="text-sm text-burgundy mb-3">
                        <strong>Optional</strong> - Requires your consent
                      </p>
                      <p className="text-muted-foreground mb-3">
                        These cookies help us understand how visitors interact with our website by collecting anonymous information about pages visited, time spent, and errors encountered.
                      </p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        <li>Google Analytics (anonymous usage statistics)</li>
                        <li>Page performance monitoring</li>
                        <li>Error tracking and debugging</li>
                        <li>User journey analysis</li>
                      </ul>
                    </div>
                  </div>
                </Card>

                {/* Functional Cookies */}
                <Card className="p-6">
                  <div className="flex items-start gap-3">
                    <Info className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Functional Cookies</h3>
                      <p className="text-sm text-burgundy mb-3">
                        <strong>Optional</strong> - Requires your consent
                      </p>
                      <p className="text-muted-foreground mb-3">
                        These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.
                      </p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        <li>Language and region preferences</li>
                        <li>Currency selection</li>
                        <li>Theme and display preferences</li>
                        <li>Map interactions and saved locations</li>
                      </ul>
                    </div>
                  </div>
                </Card>

                {/* Advertising Cookies */}
                <Card className="p-6">
                  <div className="flex items-start gap-3">
                    <Info className="h-6 w-6 text-orange-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Advertising Cookies (Marketing)</h3>
                      <p className="text-sm text-burgundy mb-3">
                        <strong>Optional</strong> - Requires your consent
                      </p>
                      <p className="text-muted-foreground mb-3">
                        These cookies track your browsing activity to deliver relevant advertisements and measure campaign effectiveness.
                      </p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        <li>Social media integration (Facebook, Instagram)</li>
                        <li>Retargeting and remarketing</li>
                        <li>Conversion tracking</li>
                        <li>Interest-based advertising</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            {/* Third-Party Cookies */}
            <section>
              <h2 className="text-3xl font-playfair font-semibold text-burgundy mb-4">
                Third-Party Services
              </h2>
              <p className="text-muted-foreground mb-4">
                We use the following trusted third-party services that may set cookies:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Stripe</strong> - Payment processing (necessary for transactions)</li>
                <li><strong>Supabase</strong> - Backend infrastructure and authentication</li>
                <li><strong>Google Analytics</strong> - Website analytics (performance cookies)</li>
                <li><strong>Google Maps</strong> - Interactive maps and route visualization</li>
                <li><strong>Thunderforest</strong> - Outdoor mapping tiles</li>
              </ul>
            </section>

            {/* Cookie Duration */}
            <section>
              <h2 className="text-3xl font-playfair font-semibold text-burgundy mb-4">
                How Long Do Cookies Last?
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <strong>Session Cookies:</strong> These are temporary and are deleted when you close your browser.
                </p>
                <p>
                  <strong>Persistent Cookies:</strong> These remain on your device for a set period or until you delete them. Most of our cookies expire within 12 months.
                </p>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-3xl font-playfair font-semibold text-burgundy mb-4">
                Your Rights and Choices
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Accept or reject optional cookies via our cookie banner</li>
                  <li>Change your cookie preferences at any time</li>
                  <li>Delete cookies through your browser settings</li>
                  <li>Block cookies entirely (this may affect site functionality)</li>
                </ul>
                <p className="mt-4">
                  Please note that blocking necessary cookies will prevent essential features from working correctly, including authentication and secure booking processes.
                </p>
              </div>
            </section>

            {/* Browser Settings */}
            <section>
              <h2 className="text-3xl font-playfair font-semibold text-burgundy mb-4">
                Managing Cookies in Your Browser
              </h2>
              <p className="text-muted-foreground mb-4">
                Most browsers allow you to control cookies through their settings. Here's how to manage cookies in popular browsers:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Google Chrome:</strong> Settings → Privacy and Security → Cookies</li>
                <li><strong>Mozilla Firefox:</strong> Settings → Privacy & Security → Cookies</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
                <li><strong>Microsoft Edge:</strong> Settings → Privacy → Cookies</li>
              </ul>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-3xl font-playfair font-semibold text-burgundy mb-4">
                Questions About Cookies?
              </h2>
              <p className="text-muted-foreground">
                If you have questions about our use of cookies, please contact us at{' '}
                <a href="mailto:privacy@madetohike.com" className="text-burgundy hover:underline">
                  privacy@madetohike.com
                </a>
              </p>
            </section>

            {/* Last Updated */}
            <section className="pt-8 border-t">
              <p className="text-sm text-muted-foreground">
                <strong>Last Updated:</strong> December 2025
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                This Cookie Policy is part of our{' '}
                <a href="/privacy" className="text-burgundy hover:underline">Privacy Policy</a>.
              </p>
            </section>

            {/* CTA Button */}
            <div className="flex justify-center pt-8">
              <Button onClick={openPreferences} size="lg" className="gap-2">
                <Cookie className="h-5 w-5" />
                Manage Cookie Preferences
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
