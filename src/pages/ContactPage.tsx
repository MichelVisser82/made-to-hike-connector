import { useState } from "react"
import { 
  Send, 
  CheckCircle,
  Mountain,
  Loader2,
  Instagram,
  Globe,
  Leaf,
  Clock,
  MessageSquare,
  Users,
  HelpCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ImageWithFallback } from "@/components/common/ImageWithFallback"
import { PageSEO } from "@/components/seo/PageSEO"
import { supabase } from "@/integrations/supabase/client"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    userType: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { data, error } = await supabase.functions.invoke('contact-form', {
        body: formData
      })

      if (error) throw error

      setIsSubmitted(true)
      toast.success("Message sent successfully!")

      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({ name: "", email: "", userType: "", subject: "", message: "" })
        setIsSubmitted(false)
      }, 3000)
    } catch (error) {
      console.error('Contact form error:', error)
      toast.error("Failed to send message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <>
      <PageSEO
        title="Contact Us | MadeToHike - Get in Touch"
        description="Have questions about guided hiking tours in Europe? Contact the MadeToHike team. We typically respond within 2 hours during business hours."
        canonicalUrl="https://madetohike.com/contact"
        keywords="contact MadeToHike, hiking tour questions, mountain guide contact, European hiking support"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-cream">
        {/* SECTION 1: Split-Screen Hero */}
        <section className="min-h-screen flex flex-col lg:flex-row">
          {/* Left Side - Image */}
          <div className="lg:w-1/2 h-[50vh] lg:h-screen relative overflow-hidden">
            <ImageWithFallback
              src="https://ohecxwxumzpfcfsokfkg.supabase.co/storage/v1/object/public/hero-images/guides/93487995-df40-4765-9243-e2831abfaced/hero/0.03892489494938478.webp"
              alt="Mountain guide planning route"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-charcoal/30" />
            {/* Subtle contour lines overlay */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="contours" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                    <path d="M0,20 Q25,10 50,20 T100,20" stroke="white" fill="none" strokeWidth="0.5"/>
                    <path d="M0,40 Q25,35 50,40 T100,40" stroke="white" fill="none" strokeWidth="0.5"/>
                    <path d="M0,60 Q25,55 50,60 T100,60" stroke="white" fill="none" strokeWidth="0.5"/>
                    <path d="M0,80 Q25,75 50,80 T100,80" stroke="white" fill="none" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#contours)" />
              </svg>
            </div>
          </div>

          {/* Right Side - Hero Content */}
          <div className="lg:w-1/2 bg-charcoal text-white flex items-center justify-center p-8 lg:p-16">
            <div className="max-w-2xl">
              <div className="text-xs tracking-[0.3em] text-burgundy-light mb-8 uppercase">
                We're here to help
              </div>
              
              <h1 className="font-playfair text-4xl lg:text-6xl mb-8 leading-tight text-white">
                Let's Talk About<br />
                Your Next Adventure
              </h1>

              <div className="space-y-4 mb-12 text-cream/90 leading-relaxed">
                <p>Whether you're planning your first alpine trek or joining our guide community, we're here to help.</p>
                <p>Get personalized assistance from mountain professionals who understand your journey.</p>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-6 mb-12 pb-12 border-b border-white/20">
                <div>
                  <div className="font-playfair text-3xl lg:text-4xl text-burgundy-light mb-2">{"< 2h"}</div>
                  <div className="text-sm text-cream/70 uppercase tracking-wider">Response Time</div>
                </div>
                <div>
                  <div className="font-playfair text-3xl lg:text-4xl text-burgundy-light mb-2">24/7</div>
                  <div className="text-sm text-cream/70 uppercase tracking-wider">Emergency</div>
                </div>
                <div>
                  <div className="font-playfair text-3xl lg:text-4xl text-burgundy-light mb-2">5.0★</div>
                  <div className="text-sm text-cream/70 uppercase tracking-wider">Rated</div>
                </div>
              </div>

              {/* Scroll Indicator */}
              <div className="flex justify-center">
                <div className="flex flex-col items-center gap-2 animate-bounce">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-50">
                    <path d="M5,10 Q20,5 35,10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    <path d="M5,20 Q20,15 35,20" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    <path d="M5,30 Q20,25 35,30" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Contact Form - Clean White Section */}
        <section className="py-24 bg-white" id="contact-form">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-playfair text-4xl lg:text-5xl mb-6 text-charcoal">
                Send Us a Message
              </h2>
              <p className="text-xl text-charcoal/70 max-w-3xl mx-auto">
                Fill out the form below and we'll respond within 2 hours during business hours
              </p>
            </div>

            <Card className="overflow-hidden border-burgundy/10">
              <div className="p-8 md:p-12 bg-white">
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-sage" />
                    </div>
                    <h3 className="font-playfair text-3xl text-charcoal mb-3">
                      Message Received
                    </h3>
                    <p className="text-charcoal/70 text-lg">
                      Thank you for reaching out. We'll respond to you shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Name & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">
                          Your Name *
                        </label>
                        <Input
                          required
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Anna Kowalski"
                          className="border-burgundy/20 py-6"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">
                          Email Address *
                        </label>
                        <Input
                          required
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="anna@example.com"
                          className="border-burgundy/20 py-6"
                        />
                      </div>
                    </div>

                    {/* User Type */}
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        I am a... *
                      </label>
                      <select
                        required
                        name="userType"
                        value={formData.userType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-burgundy/20 rounded-md bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-burgundy/50"
                      >
                        <option value="">Select one</option>
                        <option value="hiker">Hiker / Adventure Seeker</option>
                        <option value="prospective-guide">Prospective Guide</option>
                        <option value="current-guide">Current Guide</option>
                        <option value="partner">Business Partner / Media</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        Subject *
                      </label>
                      <Input
                        required
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="How can we help you?"
                        className="border-burgundy/20 py-6"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        Message *
                      </label>
                      <Textarea
                        required
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us more about your inquiry..."
                        rows={8}
                        className="border-burgundy/20 resize-none"
                      />
                    </div>

                    {/* Privacy Note */}
                    <div className="bg-cream border border-burgundy/10 rounded-lg p-6">
                <p className="text-sm text-charcoal/70 leading-relaxed">
                  By submitting this form, you agree to our{' '}
                  <a href="/privacy" className="text-burgundy hover:underline font-medium">
                    Privacy Policy
                  </a>
                  . We'll only use your information to respond to your inquiry and won't share it with third parties.
                </p>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-burgundy hover:bg-burgundy-dark text-white py-6 text-lg"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </Card>
          </div>
        </section>

        {/* SECTION 3: Quick Help Topics - Cream Background */}
        <section className="py-24 bg-cream">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-playfair text-4xl lg:text-5xl text-charcoal mb-6">
                How Can We Help?
              </h2>
              <p className="text-xl text-charcoal/70 max-w-3xl mx-auto">
                Find the right support for your needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* For Hikers */}
              <Card className="overflow-hidden border-burgundy/10 hover:shadow-xl transition-all duration-300">
                <div className="p-8 bg-white">
                  <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mb-6">
                    <Mountain className="w-8 h-8 text-sage" />
                  </div>
                  <h3 className="font-playfair text-xl text-charcoal mb-3">
                    For Hikers
                  </h3>
                  <p className="text-sm text-charcoal/70 mb-6 leading-relaxed">
                    Booking questions, tour details, payment help
                  </p>
                  <button 
                    onClick={() => {
                      document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="text-sm text-burgundy hover:underline font-medium"
                  >
                    Send us a message →
                  </button>
                </div>
              </Card>

              {/* For Guides */}
              <Card className="overflow-hidden border-burgundy/10 hover:shadow-xl transition-all duration-300">
                <div className="p-8 bg-white">
                  <div className="w-16 h-16 bg-burgundy/10 rounded-full flex items-center justify-center mb-6">
                    <Users className="w-8 h-8 text-burgundy" />
                  </div>
                  <h3 className="font-playfair text-xl text-charcoal mb-3">
                    For Guides
                  </h3>
                  <p className="text-sm text-charcoal/70 mb-6 leading-relaxed">
                    Application status, platform help, payouts
                  </p>
                  <button 
                    onClick={() => {
                      document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="text-sm text-burgundy hover:underline font-medium"
                  >
                    Send us a message →
                  </button>
                </div>
              </Card>

              {/* Partnerships */}
              <Card className="overflow-hidden border-burgundy/10 hover:shadow-xl transition-all duration-300">
                <div className="p-8 bg-white">
                  <div className="w-16 h-16 bg-burgundy/10 rounded-full flex items-center justify-center mb-6">
                    <MessageSquare className="w-8 h-8 text-burgundy" />
                  </div>
                  <h3 className="font-playfair text-xl text-charcoal mb-3">
                    Partnerships
                  </h3>
                  <p className="text-sm text-charcoal/70 mb-6 leading-relaxed">
                    Business inquiries, media, collaborations
                  </p>
                  <button 
                    onClick={() => {
                      document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="text-sm text-burgundy hover:underline font-medium"
                  >
                    Send us a message →
                  </button>
                </div>
              </Card>

              {/* Help Center */}
              <Card className="overflow-hidden border-burgundy/10 hover:shadow-xl transition-all duration-300">
                <div className="p-8 bg-white">
                  <div className="w-16 h-16 bg-burgundy/10 rounded-full flex items-center justify-center mb-6">
                    <HelpCircle className="w-8 h-8 text-burgundy" />
                  </div>
                  <h3 className="font-playfair text-xl text-charcoal mb-3">
                    Help Center
                  </h3>
                  <p className="text-sm text-charcoal/70 mb-6 leading-relaxed">
                    FAQs, guides, troubleshooting
                  </p>
                  <a href="/help" className="text-sm text-burgundy hover:underline font-medium">
                    Visit Help Center →
                  </a>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* SECTION 4: Additional Contact Info - Charcoal Background */}
        <section className="py-24 bg-charcoal text-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-playfair text-4xl lg:text-5xl text-white mb-6">
                Other Ways to Connect
              </h2>
              <p className="text-xl text-cream/70 max-w-3xl mx-auto">
                Choose the best way to reach us based on your needs
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Business Hours */}
              <Card className="overflow-hidden border-burgundy/20 bg-white/5 backdrop-blur-sm">
                <div className="p-8">
                  <div className="w-16 h-16 bg-burgundy/20 rounded-full flex items-center justify-center mb-6">
                    <Clock className="w-8 h-8 text-burgundy-light" />
                  </div>
                  <h3 className="font-playfair text-2xl text-white mb-4">
                    Business Hours
                  </h3>
                  <div className="space-y-3 text-cream/80">
                    <div className="flex justify-between pb-3 border-b border-white/10">
                      <span>Monday - Friday</span>
                      <span className="text-white">9:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between pb-3 border-b border-white/10">
                      <span>Saturday</span>
                      <span className="text-white">10:00 - 14:00</span>
                    </div>
                    <div className="flex justify-between pb-3 border-b border-white/10">
                      <span>Sunday</span>
                      <span className="text-cream/50">Closed</span>
                    </div>
                    <div className="bg-sage/20 border border-sage/30 rounded-lg p-4 mt-6">
                      <div className="flex items-center gap-2 text-sage-light mb-1">
                        <div className="w-2 h-2 bg-sage-light rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">Currently Online</span>
                      </div>
                      <p className="text-xs text-cream/70">
                        Expected response: {"< 2 hours"}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Emergency Support */}
              <Card className="overflow-hidden border-burgundy/20 bg-white/5 backdrop-blur-sm">
                <div className="p-8">
                  <div className="w-16 h-16 bg-burgundy/20 rounded-full flex items-center justify-center mb-6">
                    <MessageSquare className="w-8 h-8 text-burgundy-light" />
                  </div>
                  <h3 className="font-playfair text-2xl text-white mb-4">
                    Emergency Support
                  </h3>
                  <p className="text-cream/80 mb-6 leading-relaxed">
                    For active tour emergencies only. Available 24/7 for hikers currently on guided tours.
                  </p>
                  <Badge className="bg-burgundy text-white border-0 px-4 py-2">
                    24/7 Active Tours Only
                  </Badge>
                </div>
              </Card>

              {/* Social Media */}
              <Card className="overflow-hidden border-burgundy/20 bg-white/5 backdrop-blur-sm">
                <div className="p-8">
                  <div className="w-16 h-16 bg-burgundy/20 rounded-full flex items-center justify-center mb-6">
                    <Instagram className="w-8 h-8 text-burgundy-light" />
                  </div>
                  <h3 className="font-playfair text-2xl text-white mb-4">
                    Follow Our Journey
                  </h3>
                  <p className="text-cream/80 mb-6 leading-relaxed">
                    Join our community on Instagram for trail updates, guide stories, and alpine inspiration.
                  </p>
                  <a 
                    href="https://instagram.com/madetohike" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-burgundy hover:bg-burgundy-dark text-white px-6 py-3 rounded-md transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                    @madetohike
                  </a>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* SECTION 5: Values - Cream Background */}
        <section className="py-24 bg-cream">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-playfair text-4xl lg:text-5xl text-charcoal mb-6">
                Built on Trust & Expertise
              </h2>
              <p className="text-xl text-charcoal/70 max-w-3xl mx-auto">
                Every interaction reflects our commitment to authentic mountain experiences
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              {/* Mountain Experts */}
              <div className="text-center">
                <div className="w-24 h-24 bg-burgundy/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mountain className="w-12 h-12 text-burgundy" />
                </div>
                <h3 className="font-playfair text-2xl text-charcoal mb-3">
                  Mountain Experts
                </h3>
                <p className="text-charcoal/70 leading-relaxed">
                  Our support team includes certified guides who understand the mountains and your questions.
                </p>
              </div>

              {/* Local Knowledge */}
              <div className="text-center">
                <div className="w-24 h-24 bg-burgundy/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Globe className="w-12 h-12 text-burgundy" />
                </div>
                <h3 className="font-playfair text-2xl text-charcoal mb-3">
                  Local Knowledge
                </h3>
                <p className="text-charcoal/70 leading-relaxed">
                  Deep regional expertise across the Dolomites, Pyrenees, and Scottish Highlands.
                </p>
              </div>

              {/* Sustainable Focus */}
              <div className="text-center">
                <div className="w-24 h-24 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Leaf className="w-12 h-12 text-sage" />
                </div>
                <h3 className="font-playfair text-2xl text-charcoal mb-3">
                  Sustainable Focus
                </h3>
                <p className="text-charcoal/70 leading-relaxed">
                  Committed to responsible tourism that protects alpine environments for future generations.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
