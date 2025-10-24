import { useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { HelpCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HelpSearchBar } from '@/components/help/HelpSearchBar';
import { HelpFAQSection } from '@/components/help/HelpFAQSection';
import { SupportContactForm } from '@/components/help/SupportContactForm';
import { MainLayout } from '@/components/layout/MainLayout';

export default function HelpPage() {
  const contactFormRef = useRef<HTMLDivElement>(null);

  const scrollToContact = () => {
    contactFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <MainLayout>
      <Helmet>
        <title>Help Center | MadeToHike Support</title>
        <meta 
          name="description" 
          content="Find answers to common questions about booking tours, becoming a guide, and using MadeToHike. Get instant help or contact support." 
        />
        <link rel="canonical" href="https://madetohike.com/help" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Hero Section with Search */}
        <section className="bg-gradient-to-br from-burgundy via-burgundy-dark to-charcoal text-white py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-12 w-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <HelpCircle className="h-6 w-6" />
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold">
                How Can We Help You?
              </h1>
              
              <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto">
                Search our knowledge base or browse frequently asked questions below
              </p>

              <div className="pt-2">
                <HelpSearchBar onNoResults={scrollToContact} />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
                <p className="text-muted-foreground">
                  Browse common questions organized by topic
                </p>
              </div>

              <HelpFAQSection />

              <div className="text-center pt-8">
                <p className="text-muted-foreground mb-4">
                  Still have questions? We're here to help.
                </p>
                <Button onClick={scrollToContact} size="lg" variant="outline">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section 
          ref={contactFormRef} 
          className="py-12 md:py-16 bg-muted/30"
          id="contact-support"
        >
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <SupportContactForm />
            </div>
          </div>
        </section>

        {/* Additional Resources */}
        <section className="py-12 border-t">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <h3 className="font-semibold">Email Support</h3>
                  <p className="text-sm text-muted-foreground">
                    support@madetohike.com
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Response Time</h3>
                  <p className="text-sm text-muted-foreground">
                    Usually within 24 hours
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Business Hours</h3>
                  <p className="text-sm text-muted-foreground">
                    Mon-Fri, 9:00 - 17:00 CET
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
