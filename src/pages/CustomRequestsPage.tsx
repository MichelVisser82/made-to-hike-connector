import { useState, useEffect } from "react";
import { 
  Mountain, 
  CheckCircle2, 
  ArrowRight, 
  Users,
  Calendar,
  MapPin,
  Euro,
  Clock,
  Send,
  Sparkles,
  MessageSquare,
  TrendingUp,
  Utensils,
  Accessibility,
  Camera,
  Binoculars,
  Landmark,
  Hotel,
  Tent,
  Baby
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MainLayout } from "@/components/layout/MainLayout";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { PageSEO } from "@/components/seo/PageSEO";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function CustomRequestsPage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  
  const [formData, setFormData] = useState({
    tripName: "",
    region: "",
    dates: "",
    duration: "",
    groupSize: "",
    experience: "",
    budget: "",
    description: "",
    specialRequests: [] as string[],
    additionalDetails: "",
    name: "",
    email: "",
    phone: ""
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [heroImages, setHeroImages] = useState<string[]>([]);

  // Fetch real tour images for hero grid
  useEffect(() => {
    const fetchHeroImages = async () => {
      const { data } = await supabase
        .from('tours')
        .select('images')
        .eq('is_active', true)
        .not('images', 'is', null)
        .limit(10);
      
      if (data) {
        const allImages = data.flatMap(tour => tour.images || []).slice(0, 4);
        if (allImages.length >= 4) {
          setHeroImages(allImages);
        }
      }
    };
    fetchHeroImages();
  }, []);

  // Auto-fill from profile if logged in
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.name || '',
        email: profile.email || '',
        phone: (profile as any).phone || ''
      }));
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('create-public-tour-request', {
        body: {
          requester_id: user?.id || null,
          requester_name: formData.name,
          requester_email: formData.email,
          requester_phone: formData.phone || null,
          trip_name: formData.tripName,
          region: formData.region,
          preferred_dates: formData.dates,
          duration: formData.duration,
          group_size: formData.groupSize,
          experience_level: formData.experience,
          budget_per_person: formData.budget || null,
          description: formData.description,
          special_requests: formData.specialRequests,
          additional_details: formData.additionalDetails || null
        }
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success("Your request has been sent to our guides!");
    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast.error(error.message || "Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCheckboxChange = (option: string) => {
    setFormData(prev => ({
      ...prev,
      specialRequests: prev.specialRequests.includes(option)
        ? prev.specialRequests.filter(item => item !== option)
        : [...prev.specialRequests, option]
    }));
  };

  const regionLabel = (region: string) => {
    const labels: Record<string, string> = {
      dolomites: "Dolomites, Italy",
      pyrenees: "Pyrenees, France/Spain",
      highlands: "Scottish Highlands, UK",
      alps: "Swiss Alps",
      flexible: "Flexible / Open to suggestions"
    };
    return labels[region] || region;
  };

  return (
    <MainLayout>
      <PageSEO 
        title="Custom Hiking Requests | MadeToHike"
        description="Post your dream hiking adventure and receive tailored proposals from certified IFMGA & UIMLA guides across Europe. Get 3-5 custom offers within 48 hours."
      />
      
      <div className="min-h-screen bg-cream">
        {/* HERO SECTION - Split Screen */}
        <section className="min-h-screen flex flex-col lg:flex-row">
          {/* Left Side - Content */}
          <div className="lg:w-1/2 bg-charcoal text-white flex items-center justify-center p-8 lg:p-16 relative overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-[0.02]">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="hero-grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                    <circle cx="30" cy="30" r="1" fill="white"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hero-grid)" />
              </svg>
            </div>

            <div className="max-w-xl w-full relative z-10">
              <Badge className="bg-burgundy/30 text-burgundy-light border border-burgundy-light/50 mb-8 px-6 py-2 text-xs tracking-[0.3em] uppercase backdrop-blur-sm inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Custom Requests
              </Badge>
              
              <h1 className="text-5xl lg:text-7xl text-white mb-8 leading-tight font-playfair">
                Your Dream<br />
                Hike, Your Way
              </h1>
              
              <div className="space-y-4 mb-12 text-cream/90 text-lg leading-relaxed">
                <p>
                  Post your custom hiking adventure and receive tailored proposals from certified IFMGA & UIMLA guides across Europe.
                </p>
                <p className="text-cream/70">
                  Tell us what you want. Our guides compete to create the perfect trip for you.
                </p>
              </div>

              {/* Stats - Horizontal */}
              <div className="flex gap-12 mb-12 pb-12 border-b border-white/10">
                <div>
                  <div className="text-4xl text-burgundy-light mb-1 font-playfair">127</div>
                  <div className="text-xs text-cream/60 uppercase tracking-widest">Certified</div>
                </div>
                <div>
                  <div className="text-4xl text-burgundy-light mb-1 font-playfair">48h</div>
                  <div className="text-xs text-cream/60 uppercase tracking-widest">Response</div>
                </div>
                <div>
                  <div className="text-4xl text-burgundy-light mb-1 font-playfair">3-5</div>
                  <div className="text-xs text-cream/60 uppercase tracking-widest">Proposals</div>
                </div>
              </div>

              <Button 
                onClick={() => document.getElementById('request-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-burgundy hover:bg-burgundy-dark text-white h-14 px-10"
              >
                Create Your Request
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Right Side - Images Grid */}
          <div className="lg:w-1/2 h-[50vh] lg:h-screen grid grid-cols-2">
            {heroImages.length >= 4 ? (
              <>
                <div className="relative overflow-hidden">
                  <img
                    src={heroImages[0]}
                    alt="Mountain adventure"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="relative overflow-hidden">
                  <img
                    src={heroImages[1]}
                    alt="Hiking experience"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="relative overflow-hidden">
                  <img
                    src={heroImages[2]}
                    alt="Mountain adventure planning"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="relative overflow-hidden">
                  <img
                    src={heroImages[3]}
                    alt="Outdoor adventure team"
                    className="w-full h-full object-cover"
                  />
                </div>
              </>
            ) : (
              <div className="col-span-2 bg-cream/50 flex items-center justify-center">
                <Mountain className="w-16 h-16 text-burgundy/30" />
              </div>
            )}
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="py-24 lg:py-32 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-20">
              <div className="text-xs tracking-[0.3em] text-burgundy mb-6 uppercase">
                Simple Process
              </div>
              <h2 className="text-5xl lg:text-6xl mb-6 text-charcoal font-playfair">
                How It Works
              </h2>
              <p className="text-xl text-charcoal/70 max-w-2xl mx-auto">
                From idea to mountain peak in four simple steps
              </p>
            </div>

            <div className="grid lg:grid-cols-4 gap-12">
              {[
                {
                  step: "01",
                  title: "Submit Request",
                  description: "Tell us your destination, dates, and what you're looking for in your ideal hiking adventure.",
                  icon: MessageSquare
                },
                {
                  step: "02",
                  title: "Guides Respond",
                  description: "Certified guides in your region create custom proposals tailored to your needs.",
                  icon: Users
                },
                {
                  step: "03",
                  title: "Compare Offers",
                  description: "Review 3-5 detailed proposals. Compare pricing, itineraries, and guide credentials.",
                  icon: TrendingUp
                },
                {
                  step: "04",
                  title: "Book & Hike",
                  description: "Choose your favorite guide, finalize details, and embark on your dream adventure.",
                  icon: CheckCircle2
                }
              ].map((item) => (
                <div key={item.step}>
                  <div className="w-16 h-16 bg-burgundy/10 rounded-full flex items-center justify-center mb-6">
                    <item.icon className="w-8 h-8 text-burgundy" />
                  </div>
                  <div className="text-sm text-burgundy mb-3 tracking-[0.2em] uppercase">Step {item.step}</div>
                  <h3 className="text-2xl text-charcoal mb-3 font-playfair">
                    {item.title}
                  </h3>
                  <p className="text-charcoal/70 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* REQUEST FORM SECTION */}
        <section id="request-form" className="py-24 lg:py-32 bg-cream">
          <div className="max-w-4xl mx-auto px-6">
            {!submitted ? (
              <>
                <div className="text-center mb-16">
                  <div className="text-xs tracking-[0.3em] text-burgundy mb-6 uppercase">
                    Get Started
                  </div>
                  <h2 className="text-5xl lg:text-6xl mb-6 text-charcoal font-playfair">
                    Create Your Request
                  </h2>
                  <p className="text-xl text-charcoal/70 max-w-2xl mx-auto">
                    The more details you provide, the better proposals you'll receive
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Trip Details */}
                  <Card className="p-8 lg:p-12 border-charcoal/10 bg-white">
                    <h3 className="text-2xl text-charcoal mb-8 pb-6 border-b border-charcoal/10 font-playfair">
                      Trip Details
                    </h3>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="text-sm text-charcoal/70 uppercase tracking-wider mb-3 block">
                          Trip Name
                        </label>
                        <Input
                          type="text"
                          name="tripName"
                          placeholder="e.g., Alpine Adventure 2025"
                          value={formData.tripName}
                          onChange={handleChange}
                          required
                          className="h-14"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-sm text-charcoal/70 uppercase tracking-wider mb-3 block flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Region
                          </label>
                          <select
                            name="region"
                            value={formData.region}
                            onChange={handleChange as any}
                            required
                            className="w-full h-14 border border-charcoal/20 rounded-md px-4 bg-white"
                          >
                            <option value="">Select region</option>
                            <option value="dolomites">Dolomites, Italy</option>
                            <option value="pyrenees">Pyrenees, France/Spain</option>
                            <option value="highlands">Scottish Highlands, UK</option>
                            <option value="alps">Swiss Alps</option>
                            <option value="flexible">Flexible / Open to suggestions</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-sm text-charcoal/70 uppercase tracking-wider mb-3 block flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Dates
                          </label>
                          <Input
                            type="text"
                            name="dates"
                            placeholder="e.g., June 15-22, 2025"
                            value={formData.dates}
                            onChange={handleChange}
                            required
                            className="h-14"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-6">
                        <div>
                          <label className="text-sm text-charcoal/70 uppercase tracking-wider mb-3 block flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Duration
                          </label>
                          <select
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange as any}
                            required
                            className="w-full h-14 border border-charcoal/20 rounded-md px-4 bg-white"
                          >
                            <option value="">Select</option>
                            <option value="1-2">1-2 days</option>
                            <option value="3-4">3-4 days</option>
                            <option value="5-7">5-7 days</option>
                            <option value="8+">8+ days</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-sm text-charcoal/70 uppercase tracking-wider mb-3 block flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Group Size
                          </label>
                          <Input
                            type="text"
                            name="groupSize"
                            placeholder="e.g., 4 people"
                            value={formData.groupSize}
                            onChange={handleChange}
                            required
                            className="h-14"
                          />
                        </div>

                        <div>
                          <label className="text-sm text-charcoal/70 uppercase tracking-wider mb-3 block">
                            Experience
                          </label>
                          <select
                            name="experience"
                            value={formData.experience}
                            onChange={handleChange as any}
                            required
                            className="w-full h-14 border border-charcoal/20 rounded-md px-4 bg-white"
                          >
                            <option value="">Select</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="mixed">Mixed</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm text-charcoal/70 uppercase tracking-wider mb-3 block flex items-center gap-2">
                          <Euro className="w-4 h-4" />
                          Budget per Person (Optional)
                        </label>
                        <Input
                          type="text"
                          name="budget"
                          placeholder="e.g., €500-800"
                          value={formData.budget}
                          onChange={handleChange}
                          className="h-14"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-charcoal/70 uppercase tracking-wider mb-3 block">
                          Describe Your Dream Trip
                        </label>
                        <Textarea
                          name="description"
                          placeholder="What kind of trails? Accommodation preferences? Photography focus? Specific peaks? Any concerns?"
                          value={formData.description}
                          onChange={handleChange}
                          required
                          rows={6}
                          className="resize-none"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-charcoal/70 uppercase tracking-wider mb-4 block">
                          Special Requests (Optional)
                        </label>
                        <div className="grid md:grid-cols-2 gap-3">
                          {[
                            { id: "dietary", icon: Utensils, label: "Dietary requirements" },
                            { id: "accessibility", icon: Accessibility, label: "Accessibility needs" },
                            { id: "photography", icon: Camera, label: "Photography focused" },
                            { id: "wildlife", icon: Binoculars, label: "Wildlife observation" },
                            { id: "cultural", icon: Landmark, label: "Cultural experiences" },
                            { id: "luxury", icon: Hotel, label: "Luxury accommodations" },
                            { id: "camping", icon: Tent, label: "Camping/refuge based" },
                            { id: "family", icon: Baby, label: "Family-friendly" }
                          ].map((option) => (
                            <label key={option.id} className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.specialRequests.includes(option.id)}
                                onChange={() => handleCheckboxChange(option.id)}
                                className="w-5 h-5 text-burgundy border-charcoal/20 rounded focus:ring-burgundy"
                              />
                              <option.icon className="w-4 h-4 text-charcoal/70" />
                              <span className="text-charcoal/80">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm text-charcoal/70 uppercase tracking-wider mb-3 block">
                          Additional Details (Optional)
                        </label>
                        <Textarea
                          name="additionalDetails"
                          placeholder="Specific peaks? Accommodation style? Any concerns we should address?"
                          value={formData.additionalDetails}
                          onChange={handleChange}
                          rows={4}
                          className="resize-none"
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Contact Information */}
                  <Card className="p-8 lg:p-12 border-charcoal/10 bg-white">
                    <h3 className="text-2xl text-charcoal mb-8 pb-6 border-b border-charcoal/10 font-playfair">
                      Your Information
                    </h3>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="text-sm text-charcoal/70 uppercase tracking-wider mb-3 block">
                          Full Name
                        </label>
                        <Input
                          type="text"
                          name="name"
                          placeholder="Your name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="h-14"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-sm text-charcoal/70 uppercase tracking-wider mb-3 block">
                            Email
                          </label>
                          <Input
                            type="email"
                            name="email"
                            placeholder="your.email@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="h-14"
                          />
                        </div>

                        <div>
                          <label className="text-sm text-charcoal/70 uppercase tracking-wider mb-3 block">
                            Phone (Optional)
                          </label>
                          <Input
                            type="tel"
                            name="phone"
                            placeholder="+44 123 456 7890"
                            value={formData.phone}
                            onChange={handleChange}
                            className="h-14"
                          />
                        </div>
                      </div>

                      <div className="pt-4">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={acceptedTerms}
                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                            required
                            className="w-5 h-5 text-burgundy border-charcoal/20 rounded focus:ring-burgundy mt-0.5 flex-shrink-0"
                          />
                          <span className="text-sm text-charcoal/70 leading-relaxed">
                            I agree to receive proposals from certified guides via email and accept the <a href="/privacy" className="text-burgundy hover:underline">Privacy Statement</a>. I can unsubscribe at any time and there's no obligation to book.
                          </span>
                        </label>
                      </div>
                    </div>
                  </Card>

                  {/* Submit Button */}
                  <div className="text-center pt-4">
                    <Button 
                      type="submit"
                      disabled={isSubmitting || !acceptedTerms}
                      className="bg-burgundy hover:bg-burgundy-dark text-white h-16 px-12 text-lg disabled:opacity-50"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Request"}
                      <Send className="ml-2 w-5 h-5" />
                    </Button>
                    <p className="text-sm text-charcoal/60 mt-4">
                      Proposals typically arrive within 48 hours
                    </p>
                  </div>
                </form>
              </>
            ) : (
              // Success State
              <div className="text-center py-20">
                <div className="max-w-2xl mx-auto">
                  <div className="w-20 h-20 bg-burgundy/10 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 className="w-12 h-12 text-burgundy" />
                  </div>
                  
                  <h2 className="text-5xl lg:text-6xl text-charcoal mb-6 font-playfair">
                    Request Sent
                  </h2>
                  
                  <p className="text-xl text-charcoal/70 mb-12 leading-relaxed">
                    Your custom trip request has been sent to certified guides in the {regionLabel(formData.region)} region.
                  </p>

                  <Card className="p-10 bg-white border-charcoal/10 mb-12 text-left">
                    <h3 className="text-2xl text-charcoal mb-6 font-playfair">
                      What Happens Next?
                    </h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-burgundy flex-shrink-0 mt-1" />
                        <span className="text-charcoal/70">Guides review your request and create custom proposals</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-burgundy flex-shrink-0 mt-1" />
                        <span className="text-charcoal/70">You'll receive 3-5 proposals via email within 48 hours</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-burgundy flex-shrink-0 mt-1" />
                        <span className="text-charcoal/70">Compare pricing, itineraries, and credentials</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-burgundy flex-shrink-0 mt-1" />
                        <span className="text-charcoal/70">Message guides to ask questions</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-burgundy flex-shrink-0 mt-1" />
                        <span className="text-charcoal/70">Book when you're ready!</span>
                      </li>
                    </ul>
                  </Card>

                  <p className="text-charcoal/60 mb-10">
                    Confirmation sent to <span className="text-burgundy">{formData.email}</span>
                  </p>

                  <Button
                    onClick={() => {
                      setSubmitted(false);
                      setAcceptedTerms(false);
                      setFormData({
                        tripName: "",
                        region: "",
                        dates: "",
                        duration: "",
                        groupSize: "",
                        experience: "",
                        budget: "",
                        description: "",
                        specialRequests: [],
                        additionalDetails: "",
                        name: profile?.name || "",
                        email: profile?.email || "",
                        phone: (profile as any)?.phone || ""
                      });
                      document.getElementById('request-form')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    variant="outline"
                    className="border-2 border-burgundy text-burgundy hover:bg-burgundy hover:text-white"
                  >
                    Submit Another Request
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* SOCIAL PROOF SECTION */}
        <section className="py-24 lg:py-32 bg-charcoal text-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="text-xs tracking-[0.3em] text-burgundy-light mb-6 uppercase">
                Trusted by Hikers
              </div>
              <h2 className="text-4xl lg:text-5xl mb-6 text-white font-playfair">
                Real Experiences
              </h2>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {[
                {
                  quote: "Got 4 amazing proposals for our Dolomites trek. Each guide offered unique routes we hadn't considered. The one we chose exceeded all expectations.",
                  author: "Sarah M.",
                  trip: "Dolomites Family Trek"
                },
                {
                  quote: "Posted Friday, had 5 proposals by Sunday. The competitive pricing was great, but what impressed me most was how tailored everything was to our skill level.",
                  author: "James K.",
                  trip: "Scottish Highlands"
                },
                {
                  quote: "Custom requests brought us to guides with local knowledge we'd never find browsing tours. Made our Pyrenees experience truly special.",
                  author: "Elena P.",
                  trip: "Hidden Pyrenees"
                }
              ].map((testimonial, idx) => (
                <Card key={idx} className="p-8 bg-white/5 border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Mountain key={i} className="w-4 h-4 text-burgundy-light fill-burgundy-light" />
                    ))}
                  </div>
                  <p className="text-cream/90 leading-relaxed mb-6 italic">
                    "{testimonial.quote}"
                  </p>
                  <div className="border-t border-white/10 pt-4">
                    <div className="text-white">{testimonial.author}</div>
                    <div className="text-xs text-burgundy-light mt-1">{testimonial.trip}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
      
      <LandingFooter />
    </MainLayout>
  );
}