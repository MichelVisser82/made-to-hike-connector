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

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
              <HelpCircle className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Help Center</h1>
          </div>
          <p className="text-muted-foreground mb-6">
            Search our knowledge base or browse frequently asked questions below
          </p>
          <HelpSearchBar onNoResults={scrollToContact} />
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Frequently Asked Questions</h2>
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

        {/* Contact Form Section */}
        <div 
          ref={contactFormRef} 
          className="max-w-2xl mx-auto mb-12"
          id="contact-support"
        >
          <SupportContactForm />
        </div>

        {/* Additional Resources */}
        <div className="max-w-4xl mx-auto py-8 border-t">
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
    </MainLayout>
  );
}
