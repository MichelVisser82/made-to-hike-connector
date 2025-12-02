import { PageSEO } from '@/components/seo/PageSEO'
import { ContactForm } from '@/components/forms/ContactForm'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, MessageSquare, HelpCircle, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const ContactPage = () => {
  const navigate = useNavigate()

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact MadeToHike",
    "description": "Get in touch with the MadeToHike team for questions about guided hiking tours in Europe.",
    "url": "https://madetohike.com/contact",
    "mainEntity": {
      "@type": "Organization",
      "name": "MadeToHike",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "availableLanguage": ["English", "German", "French", "Dutch"]
      }
    }
  }

  return (
    <>
      <PageSEO
        title="Contact Us | MadeToHike - Get in Touch"
        description="Have questions about guided hiking tours in Europe? Contact the MadeToHike team. We typically respond within 24 hours."
        canonicalUrl="https://madetohike.com/contact"
        keywords="contact MadeToHike, hiking tour questions, mountain guide contact, European hiking support"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-cream">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-burgundy to-burgundy-dark py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-playfair text-4xl md:text-5xl text-white mb-4">
              Get in Touch
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Have a question about our guided hiking tours? We're here to help you plan your next mountain adventure.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Contact Form - Takes 2 columns */}
              <div className="lg:col-span-2">
                <Card className="border-border/50">
                  <CardContent className="p-6 md:p-8">
                    <h2 className="font-playfair text-2xl text-charcoal mb-6">
                      Send Us a Message
                    </h2>
                    <ContactForm />
                  </CardContent>
                </Card>
              </div>

              {/* Info Cards - 1 column */}
              <div className="space-y-6">
                {/* Response Time */}
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-burgundy/10 rounded-lg">
                        <Clock className="w-5 h-5 text-burgundy" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-charcoal mb-1">Quick Response</h3>
                        <p className="text-charcoal/60 text-sm">
                          We typically respond within 24 hours during business days.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Help Center */}
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-sage/20 rounded-lg">
                        <HelpCircle className="w-5 h-5 text-sage-dark" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-charcoal mb-1">Help Center</h3>
                        <p className="text-charcoal/60 text-sm mb-3">
                          Find answers to common questions in our help center.
                        </p>
                        <button 
                          onClick={() => navigate('/help')}
                          className="text-burgundy hover:text-burgundy-dark text-sm font-medium"
                        >
                          Browse FAQ →
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* For Guides */}
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-burgundy/10 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-burgundy" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-charcoal mb-1">For Guides</h3>
                        <p className="text-charcoal/60 text-sm mb-3">
                          Interested in joining our platform as a certified guide?
                        </p>
                        <button 
                          onClick={() => navigate('/guide/signup')}
                          className="text-burgundy hover:text-burgundy-dark text-sm font-medium"
                        >
                          Become a Guide →
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Location */}
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-sage/20 rounded-lg">
                        <MapPin className="w-5 h-5 text-sage-dark" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-charcoal mb-1">Based in Europe</h3>
                        <p className="text-charcoal/60 text-sm">
                          Our team operates from the European Alps, connecting adventurers with certified mountain guides across the continent.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default ContactPage
