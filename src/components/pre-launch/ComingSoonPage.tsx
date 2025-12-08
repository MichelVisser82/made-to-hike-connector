import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Mountain, Users, Shield, Award, Heart, MapPin, ArrowRight, CheckCircle2, Star, Compass, CheckCircle, TrendingUp, Euro } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SmartImage } from '@/components/SmartImage';
import { EmailSignupCard } from './EmailSignupCard';
import { MockGuideCard } from './MockGuideCard';
import { MockTourCard } from './MockTourCard';
import { CertificationBadge } from '@/components/ui/certification-badge';
import type { GuideCertification } from '@/types/guide';
import { useGuideProfileByEmail } from '@/hooks/useGuideProfileByEmail';
import { PreLaunchStructuredData } from '@/components/seo/PreLaunchStructuredData';
import { FAQSection } from './FAQSection';
type UserType = 'hiker' | 'guide' | null;
export function ComingSoonPage() {
  const [userType, setUserType] = useState<UserType>(null);
  const [submitted, setSubmitted] = useState(false);
  const {
    data: founderProfile,
    isLoading: isLoadingFounder
  } = useGuideProfileByEmail('guide@madetohike.com');
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };
  return <>
      <Helmet>
        <title>Made to Hike - Certified Mountain Guides Marketplace Europe | Coming Soon</title>
        <meta name="description" content="Connect with IFMGA certified mountain guides across Europe. Premium hiking marketplace launching soon. Join waitlist for authentic mountain adventures in Dolomites, Pyrenees, Alps." />
        <meta name="keywords" content="mountain guides Europe, IFMGA guides, certified mountain guides, hiking marketplace, book mountain guide, IML guides, alpine hiking tours, verified guides" />
        <meta name="robots" content="index, follow" />
        <meta name="geo.region" content="EU" />
        <meta httpEquiv="content-language" content="en-EU" />
        <link rel="canonical" href="https://madetohike.com/" />
        
        <meta property="og:title" content="Made to Hike - Europe's Premium Mountain Guide Marketplace" />
        <meta property="og:description" content="Join the waitlist for Europe's first guide-centric marketplace. Connect with certified IFMGA & IML mountain guides for authentic alpine adventures." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://madetohike.com/" />
        
        <meta name="twitter:title" content="Made to Hike - Certified Mountain Guides Europe" />
        <meta name="twitter:description" content="Premium marketplace connecting certified mountain guides with adventurers. Launching soon across Europe." />
      </Helmet>

      <PreLaunchStructuredData />

      <div className="min-h-screen bg-cream">
        {/* Fixed Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-burgundy/10">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mountain className="h-6 w-6 text-burgundy" />
              <span className="font-playfair text-xl font-bold text-charcoal">Made to Hike</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <button onClick={() => scrollToSection('for-guides')} className="text-sm text-charcoal hover:text-burgundy transition-colors">
                For Guides
              </button>
              <button onClick={() => scrollToSection('for-hikers')} className="text-sm text-charcoal hover:text-burgundy transition-colors">
                For Hikers
              </button>
            </nav>

            <Button onClick={() => scrollToSection('for-guides')} className="bg-burgundy hover:bg-burgundy-dark">
              Join Waitlist
            </Button>
          </div>
        </header>

        {/* HERO SECTION - Split Screen Premium Design */}
        <section className="min-h-screen flex flex-col lg:flex-row pt-16">
          {/* Left Side - Content */}
          <div className="lg:w-1/2 bg-charcoal text-white flex items-center justify-center p-8 lg:p-20 relative overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-[0.02]">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="hero-grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                    <circle cx="30" cy="30" r="1" fill="white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hero-grid)" />
              </svg>
            </div>

            <div className="max-w-xl w-full relative z-10">
              {/* Logo/Brand Mark */}
              <div className="mb-12">
                <Mountain className="w-12 h-12 text-burgundy-light mb-6" strokeWidth={1.5} />
                <h1 className="text-6xl lg:text-7xl text-white mb-4 leading-none font-playfair">
                  Made to<br />Hike
                </h1>
                <div className="h-0.5 w-24 bg-burgundy-light mt-6" />
              </div>
              
              <div className="space-y-6 mb-12">
                <p className="text-xl text-cream/90 leading-relaxed">
                  Europe's first guide-owned marketplace connecting certified mountain professionals with passionate hikers.
                </p>
                <p className="text-lg text-cream/70 leading-relaxed">
                  Dolomites • Pyrenees • Highlands &amp; more  
                </p>
              </div>

              {/* Stats - Horizontal */}
              <div className="flex gap-12 mb-16 pb-12 border-b border-white/10">
                <div>
                  <div className="text-4xl text-burgundy-light mb-1 font-playfair">95%</div>
                  <div className="text-xs text-cream/60 uppercase tracking-widest">To Guides</div>
                </div>
                <div>
                  <div className="text-4xl text-burgundy-light mb-1 font-playfair">All</div>
                  <div className="text-xs text-cream/60 uppercase tracking-widest">Certified</div>
                </div>
                <div>
                  <div className="text-4xl text-burgundy-light mb-1 font-playfair">280+</div>
                  <div className="text-xs text-cream/60 uppercase tracking-widest">Routes</div>
                </div>
              </div>

              {/* User Type Selection */}
              {!submitted && <div className="space-y-6">
                  <p className="text-xs text-burgundy-light uppercase tracking-widest mb-6">Join As</p>
                  
                  {/* Buttons - Stacked */}
                  <div className="space-y-4">
                    <button onClick={() => setUserType("hiker")} className={`w-full group text-left p-6 border transition-all duration-300 ${userType === "hiker" ? "border-burgundy bg-burgundy/5" : "border-white/10 hover:border-burgundy/50"}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Users className={`w-6 h-6 transition-colors ${userType === "hiker" ? "text-burgundy-light" : "text-cream/40 group-hover:text-burgundy-light"}`} />
                          <div>
                            <div className={`text-lg transition-colors font-playfair ${userType === "hiker" ? "text-white" : "text-cream/80 group-hover:text-white"}`}>
                              I'm a Hiker
                            </div>
                            <div className="text-xs text-cream/50 mt-1">Discover adventures</div>
                          </div>
                        </div>
                        <ArrowRight className={`w-5 h-5 transition-all ${userType === "hiker" ? "text-burgundy-light translate-x-0" : "text-cream/20 -translate-x-2 group-hover:translate-x-0 group-hover:text-burgundy-light"}`} />
                      </div>
                    </button>
                    
                    <button onClick={() => setUserType("guide")} className={`w-full group text-left p-6 border transition-all duration-300 ${userType === "guide" ? "border-burgundy bg-burgundy/5" : "border-white/10 hover:border-burgundy/50"}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Mountain className={`w-6 h-6 transition-colors ${userType === "guide" ? "text-burgundy-light" : "text-cream/40 group-hover:text-burgundy-light"}`} />
                          <div>
                            <div className={`text-lg transition-colors font-playfair ${userType === "guide" ? "text-white" : "text-cream/80 group-hover:text-white"}`}>
                              I'm a Guide
                            </div>
                            <div className="text-xs text-cream/50 mt-1">Join the platform</div>
                          </div>
                        </div>
                        <ArrowRight className={`w-5 h-5 transition-all ${userType === "guide" ? "text-burgundy-light translate-x-0" : "text-cream/20 -translate-x-2 group-hover:translate-x-0 group-hover:text-burgundy-light"}`} />
                      </div>
                    </button>
                  </div>

                  {/* Email Form via EmailSignupCard */}
                  {userType && <div className="mt-8 pt-8 border-t border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <EmailSignupCard userType={userType} sectionName="Hero Section" className="bg-transparent border-0 p-0 shadow-none" />
                    </div>}
                </div>}

              {/* Success State */}
              {submitted && <div className="border border-burgundy/30 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <CheckCircle2 className="w-12 h-12 text-burgundy-light mb-6" />
                  <h3 className="text-2xl text-white mb-3 font-playfair">
                    {userType === "hiker" ? "You're on the List" : "Application Received"}
                  </h3>
                  <p className="text-cream/70 mb-8 leading-relaxed">
                    {userType === "hiker" ? "We'll email you as soon as we launch. Get ready to explore Europe's Alps with certified guides." : "We'll review your application and reach out within 48 hours. Excited to have you join us."}
                  </p>
                  <Button variant="outline" onClick={() => {
                setSubmitted(false);
                setUserType(null);
              }} className="border border-burgundy-light/30 text-burgundy-light hover:bg-burgundy-light/5">
                    Submit Another
                  </Button>
                </div>}

              {/* Launch Badge */}
              <div className="mt-16 pt-8 border-t border-white/10">
                <Badge className="bg-transparent text-burgundy-light border border-burgundy-light/30 px-4 py-2 text-xs tracking-[0.3em] uppercase">
                  Launching Q1 2025
                </Badge>
              </div>
            </div>
          </div>

          {/* Right Side - Image Grid */}
          <div className="lg:w-1/2 h-[60vh] lg:h-screen relative overflow-hidden bg-charcoal">
            <div className="grid grid-cols-2 h-full">
              {/* Top Left - Solo hiker with vista */}
              <div className="relative overflow-hidden group">
                <SmartImage category="tour" usageContext="hero" tags={["hiker", "backpacker", "mountain vista"]} alt="Hiker overlooking mountain landscape" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" priority="high" />
                <div className="absolute inset-0 bg-burgundy/10" />
              </div>
              
              {/* Top Right - Group hiking */}
              <div className="relative overflow-hidden group">
                <SmartImage category="adventure" usageContext="landing" tags={["group hiking", "group_activity"]} alt="Group of hikers on mountain trail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-charcoal/20" />
              </div>
              
              {/* Bottom Left - Solo hiker on trail */}
              <div className="relative overflow-hidden group">
                <SmartImage category="tour" usageContext="hero" tags={["solo-hiker", "mountain-hiking", "backpacking"]} alt="Hiker walking mountain trail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-charcoal/30" />
              </div>
              
              {/* Bottom Right - Mountaineering action */}
              <div className="relative overflow-hidden group">
                <SmartImage category="tour" usageContext="landing" tags={["mountaineering", "alpine", "summit"]} alt="Mountaineers on alpine summit" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-burgundy/20" />
              </div>
            </div>
            
            {/* Overlay gradient for depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-charcoal/20 via-transparent to-burgundy/10 pointer-events-none" />
          </div>
        </section>

        {/* SECTION 2: For Hikers - Image Cards */}
        <section id="for-hikers" className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <Badge className="bg-burgundy/10 text-burgundy border border-burgundy/20 mb-6 px-6 py-2 text-xs tracking-[0.3em] uppercase">
                For Adventure Seekers
              </Badge>
              <h2 className="text-5xl lg:text-7xl mb-8 text-charcoal font-playfair">
                Your Mountain Journey<br />Awaits
              </h2>
              <p className="text-2xl text-charcoal/60 max-w-3xl mx-auto leading-relaxed">
                Book certified guides for authentic alpine experiences
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Card 1 - Verified Expertise */}
              <div className="group relative overflow-hidden rounded-2xl h-[600px] shadow-2xl hover:shadow-burgundy/20 transition-all duration-500">
                <SmartImage category="adventure" usageContext="landing" tags={["hiker", "alpine_hiking", "backpacking"]} alt="Mountain guide leading hikers" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/60 to-transparent" />
                
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="w-16 h-16 bg-burgundy/90 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl text-white mb-4 font-playfair">
                    Certified<br />Mountain Guides
                  </h3>
                  <p className="text-cream/90 leading-relaxed text-lg mb-6">
                    Every guide is IFMGA or UIMLA certified with verified credentials, current insurance, and decades of alpine experience.
                  </p>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-burgundy text-white border-0 px-4 py-2">
                      <Award className="w-4 h-4 mr-2" />
                      127 Verified Guides
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Card 2 - Authentic Experiences */}
              <div className="group relative overflow-hidden rounded-2xl h-[600px] shadow-2xl hover:shadow-burgundy/20 transition-all duration-500">
                <SmartImage category="trails" usageContext="landing" tags={["hiking", "group", "mountains"]} alt="Hiking group on mountain trail" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/60 to-transparent" />
                
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="w-16 h-16 bg-burgundy/90 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl text-white mb-4 font-playfair">
                    Authentic<br />Alpine Culture
                  </h3>
                  <p className="text-cream/90 leading-relaxed text-lg mb-6">Small groups, sustainable practices, and deep connections to local mountain traditions.</p>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-burgundy text-white border-0 px-4 py-2">
                      <MapPin className="w-4 h-4 mr-2" />
                      3 Mountain Regions
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Card 3 - Fair & Transparent */}
              <div className="group relative overflow-hidden rounded-2xl h-[600px] shadow-2xl hover:shadow-burgundy/20 transition-all duration-500">
                <SmartImage category="mountains" usageContext="landing" tags={["summit", "view", "alpine"]} alt="Mountain summit view" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/60 to-transparent" />
                
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="w-16 h-16 bg-burgundy/90 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl text-white mb-4 font-playfair">
                    Fair Pricing,<br />Happy Guides
                  </h3>
                  <p className="text-cream/90 leading-relaxed text-lg mb-6">
                    Transparent pricing with no hidden fees. Your guides earn 95% of every booking, ensuring they're motivated and fulfilled.
                  </p>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-burgundy text-white border-0 px-4 py-2">
                      95% Revenue to Guides
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: Regions Showcase - Full Width Image Grid */}
        <section className="py-0 bg-charcoal">
          <div className="grid md:grid-cols-3">
            {[{
            name: "The Dolomites",
            country: "Italy",
            tags: ["italy-dolomites", "dolomites"],
            specialty: "Via ferrata routes & dramatic limestone peaks"
          }, {
            name: "The Pyrenees",
            country: "France & Spain",
            tags: ["france-pyrenees", "spain-pyrenees", "pyrenees"],
            specialty: "Wild, less-traveled peaks & Basque culture"
          }, {
            name: "Scottish Highlands",
            country: "Scotland, UK",
            tags: ["uk-scotland", "scotland-highlands", "highlands"],
            specialty: "Rugged wilderness & Celtic heritage"
          }].map(region => <div key={region.name} className="group relative h-[500px] overflow-hidden">
                <SmartImage category="landscape" usageContext="landing" tags={region.tags} alt={`${region.name} mountain landscape`} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent group-hover:via-charcoal/60 transition-all duration-500" />
                
                <div className="absolute inset-0 p-10 flex flex-col justify-end">
                  <Badge className="bg-burgundy text-white border-0 px-4 py-2 mb-4 inline-flex w-fit">
                    {region.country}
                  </Badge>
                  <h3 className="text-4xl text-white mb-3 font-playfair">
                    {region.name}
                  </h3>
                  <p className="text-cream/80 text-lg leading-relaxed">
                    {region.specialty}
                  </p>
                </div>
              </div>)}
          </div>
        </section>

        {/* SECTION 4: For Guides */}
        <section id="for-guides" className="py-24 bg-gradient-to-br from-burgundy via-burgundy-dark to-charcoal text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-5">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="guide-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                  <circle cx="50" cy="50" r="1" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#guide-pattern)" />
            </svg>
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-20">
              <Badge className="bg-white/20 text-white border border-white/30 mb-6 px-6 py-2 text-xs tracking-[0.3em] uppercase backdrop-blur-sm">
                For Mountain Professionals
              </Badge>
              <h2 className="text-5xl lg:text-7xl mb-8 text-white font-playfair">
                Connect to Enthusiastic<br />Hikers & Outdoor Lovers
              </h2>
              <p className="text-2xl text-cream/90 max-w-3xl mx-auto leading-relaxed">
                Let us handle the marketing while you spend your time in the mountains
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 mb-16">
              {[{
              icon: TrendingUp,
              title: "Marketing Done for You",
              description: "Professional booking platform, SEO, social media, and promotional campaigns. Focus on what you do best—guiding.",
              stats: "Full Platform Support"
            }, {
              icon: Shield,
              title: "Safety & Protection",
              description: "Automated digital waiver system, insurance verification, and emergency contact management. Professional and protected.",
              stats: "Digital Waiver System"
            }, {
              icon: Euro,
              title: "Keep What You Earn",
              description: "Only 5% platform fee. On an €800 tour, you keep €760. Paid within 48 hours. No hidden charges, ever.",
              stats: "95% Revenue Share"
            }].map(benefit => <Card key={benefit.title} className="p-10 bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/15 transition-all hover:shadow-2xl hover:shadow-white/10">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6">
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl text-white mb-4 font-playfair">
                    {benefit.title}
                  </h3>
                  <p className="text-cream/80 mb-6 leading-relaxed text-lg">
                    {benefit.description}
                  </p>
                  <div className="flex items-center gap-2 text-burgundy-light">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm">{benefit.stats}</span>
                  </div>
                </Card>)}
            </div>

            {/* First Tester Programme */}
            <div className="bg-white/10 backdrop-blur-md border-2 border-white/30 rounded-2xl p-12 lg:p-16 text-center">
              <div className="mb-10">
                <Badge className="bg-burgundy-light/30 text-white border border-white/30 mb-6 px-8 py-3 text-sm tracking-[0.3em] uppercase">
                  Limited Opportunity
                </Badge>
                <h3 className="text-4xl lg:text-5xl text-white mb-6 font-playfair">
                  First Tester Programme
                </h3>
                <p className="text-2xl text-burgundy-light">
                  Only 50 Founding Guides
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-12 text-left max-w-4xl mx-auto">
                <div>
                  <h4 className="text-xl text-white mb-6 flex items-center gap-3">
                    <Award className="w-6 h-6 text-burgundy-light" />
                    Exclusive Benefits
                  </h4>
                  <ul className="space-y-4">
                    {["0% commission for 6 months testing", "2% lifetime rate forever (vs. 5% standard)", "Featured guide status on launch day", "Shape platform features & policies", "1-on-1 onboarding support", "Co-marketing in launch campaigns"].map(item => <li key={item} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-burgundy-light flex-shrink-0 mt-1" />
                        <span className="text-cream/90 text-lg">{item}</span>
                      </li>)}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xl text-white mb-6 flex items-center gap-3">
                    <Shield className="w-6 h-6 text-burgundy-light" />
                    Platform Features
                  </h4>
                  <ul className="space-y-4">
                    {["Complete guide dashboard", "Automated waiver management", "Revenue tracking & analytics", "Booking calendar system", "Certification badge display", "Referral program (€50 per guide)"].map(item => <li key={item} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-burgundy-light flex-shrink-0 mt-1" />
                        <span className="text-cream/90 text-lg">{item}</span>
                      </li>)}
                  </ul>
                </div>
              </div>

              {/* Email Signup for Guides */}
              <div className="mt-12 max-w-md mx-auto">
                <EmailSignupCard userType="guide" sectionName="First Tester Programme" />
              </div>
            </div>
          </div>
        </section>

        {/* Founder's Story Section */}
        <section className="py-24 bg-gradient-to-b from-background to-cream">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <Badge variant="secondary" className="mb-4">Our Story</Badge>
                <h2 className="font-playfair text-4xl md:text-5xl font-bold text-charcoal">
                  Built by a Guide, for Guides
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-12 items-start">
                <div className="relative">
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                    <SmartImage category="landscape" usageContext="landing" tags={[]} className="w-full h-full object-cover" alt="Michel Visser UK Mountain Leader and Made to Hike founder" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cream" />
                  </div>
                  <Badge className="absolute top-4 right-4 bg-burgundy text-white border-0">
                    UK Mountain Leader
                  </Badge>

                  <Card className="absolute bottom-6 left-6 right-6 p-6 bg-background border-burgundy/20">
                    <div className="flex items-center gap-4">
                      {isLoadingFounder ? <div className="h-24 w-24 rounded-full bg-burgundy/10 animate-pulse flex-shrink-0" /> : founderProfile?.profile_image_url ? <img src={founderProfile.profile_image_url} className="h-24 w-24 rounded-full object-cover border-2 border-burgundy/20 flex-shrink-0" alt="Michel Visser UK Mountain Leader and Made to Hike founder" /> : <img src="https://ohecxwxumzpfcfsokfkg.supabase.co/storage/v1/object/public/hero-images/201c8159-4778-454f-b719-0cd9a61a6fbc/profile-1759929621269.jpg" className="h-24 w-24 rounded-full object-cover border-2 border-burgundy/20 flex-shrink-0" alt="Michel Visser UK Mountain Leader and Made to Hike founder" />}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-charcoal text-lg">{founderProfile?.display_name || 'Michel Visser'}</p>
                        <p className="text-sm text-muted-foreground">Mountain Guide & Founder</p>
                      </div>
                      <CertificationBadge certification={{
                      certificationType: 'standard',
                      title: 'Mountain Leader',
                      certifyingBody: 'Mountain Training UK'
                    } as GuideCertification} displayMode="simple" size="mini" isGuideVerified={true} />
                    </div>
                  </Card>
                </div>

                <div className="space-y-6">
                  <p className="text-lg text-charcoal leading-relaxed">As a UK-trained Mountain Leader (currently starting my IML training) and entrepreneur, I've been hiking through Europe's most stunning landscapes.</p>
                  <p className="text-lg text-charcoal leading-relaxed">For years, I searched for a platform where I could set up my own hiking trips as an independent certified guide. A place where I could truly own the experience, set my own rates, and connect directly with adventurers without losing half the earnings to the middlemen.</p>
                  <p className="text-lg text-charcoal leading-relaxed font-semibold">So I built it. And here to share!</p>
                  <p className="text-lg text-charcoal leading-relaxed">Made to Hike isn't just another booking platform—it's a movement to empower professional mountain guides while ensuring hikers get authentic, safe experiences with verified experts.</p>

                  <Card className="p-6 border-2 border-burgundy bg-burgundy/5">
                    <div className="flex gap-3">
                      <Compass className="h-6 w-6 text-burgundy flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-charcoal font-semibold mb-2">The Mission</p>
                        <p className="text-muted-foreground">To create a marketplace where guides thrive, hikers explore safely, and community is at it's core. Promoting sustainable mountain tourism and supporting local communities.</p>
                      </div>
                    </div>
                  </Card>

                  <div className="grid grid-cols-3 gap-4 pt-4">
                    {['Guide-first platform', 'Authentic experiences', 'Built on trust'].map((item, idx) => <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-burgundy flex-shrink-0" />
                        <span className="text-sm text-charcoal">{item}</span>
                      </div>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Preview Section */}
        <section className="py-24 bg-cream">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto space-y-16">
              <div className="text-center">
                <Badge variant="secondary" className="mb-4">Sneak Peek</Badge>
                <h2 className="font-playfair text-4xl md:text-5xl font-bold text-charcoal">
                  Experience the Platform
                </h2>
              </div>

              {/* Guide Profiles Preview */}
              <div className="space-y-8">
                <h3 className="text-2xl font-playfair font-semibold text-charcoal text-center">
                  Verified Guide Profiles
                </h3>
                <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                  <MockGuideCard name="Marco Bianchi" certification="IFMGA" location="Dolomites, Italy" experience={12} rating={4.9} verified={true} imageUrl="https://ohecxwxumzpfcfsokfkg.supabase.co/storage/v1/object/public/website-images/trails/1758891561479_93owsl.JPG" />
                  <MockGuideCard name="Sophie Durand" certification="IML" location="Chamonix, France" experience={8} rating={5.0} verified={true} imageUrl="https://ohecxwxumzpfcfsokfkg.supabase.co/storage/v1/object/public/website-images/mountains/1758891560670_mq8m9n.JPG" />
                </div>
              </div>

              {/* Tour Cards Preview */}
              <div className="space-y-8">
                <h3 className="text-2xl font-playfair font-semibold text-charcoal text-center">
                  Curated Mountain Adventures
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <MockTourCard title="Alpine Peak Expedition" location="Swiss Alps" difficulty="Challenging" duration="3 days" price={450} rating={4.8} />
                  <MockTourCard title="Dolomites Trail Adventure" location="Italian Dolomites" difficulty="Moderate" duration="5 days" price={620} rating={4.9} />
                  <MockTourCard title="Highlands Discovery Trek" location="Scottish Highlands" difficulty="Easy" duration="2 days" price={280} rating={5.0} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: Final CTA with Background Image - Be Part of the Journey */}
        <section className="relative py-32 bg-charcoal overflow-hidden">
          <div className="absolute inset-0">
            <SmartImage category="adventure" usageContext="hero" tags={["sunset", "trail", "mountains"]} alt="Mountain path at sunset" className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/90 to-charcoal/80" />
          </div>

          <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-5xl lg:text-7xl mb-8 text-white font-playfair">
              Be Part of the Journey
            </h2>
            <p className="text-2xl text-cream/80 mb-16 leading-relaxed max-w-3xl mx-auto">
              Whether you're seeking authentic mountain experiences or ready to take control of your guiding business
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-3xl mx-auto">
              <Card className="p-10 bg-background hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <Users className="w-16 h-16 text-burgundy mx-auto mb-6" />
                <h3 className="text-3xl text-charcoal mb-4 font-playfair">
                  For Hikers
                </h3>
                <p className="text-charcoal/70 mb-8 text-lg leading-relaxed">
                  Join the waitlist and be first to book when we launch
                </p>
                <Button onClick={() => {
                setUserType("hiker");
                window.scrollTo({
                  top: 0,
                  behavior: "smooth"
                });
              }} className="w-full bg-burgundy hover:bg-burgundy-dark text-white h-14 text-lg">
                  Join Waitlist
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Card>

              <Card className="p-10 bg-gradient-to-br from-burgundy to-burgundy-dark hover:shadow-2xl hover:shadow-burgundy/30 transition-all duration-500 hover:-translate-y-2">
                <Mountain className="w-16 h-16 text-white mx-auto mb-6" />
                <h3 className="text-3xl text-white mb-4 font-playfair">
                  For Guides
                </h3>
                <p className="text-cream/90 mb-8 text-lg leading-relaxed">
                  Apply for early access. First 50 get lifetime founder rates
                </p>
                <Button onClick={() => {
                setUserType("guide");
                window.scrollTo({
                  top: 0,
                  behavior: "smooth"
                });
              }} className="w-full bg-background text-burgundy hover:bg-cream h-14 text-lg">
                  Apply Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Card>
            </div>

            <div className="pt-12 border-t border-white/20">
              <p className="text-cream/60 mb-4 text-lg">
                Made to Hike • Built by Guides, For Guides
              </p>
              <div className="flex justify-center gap-6 text-burgundy-light">
                <span>IFMGA Verified</span>
                <span>•</span>
                <span>UIMLA Certified</span>
                <span>•</span>
                <span>EU Compliant</span>
              </div>
            </div>
          </div>
        </section>

        {/* Certifications Section */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto space-y-12">
              <div className="text-center">
                <Badge variant="secondary" className="mb-4">Trust & Safety</Badge>
                <h2 className="font-playfair text-4xl md:text-5xl font-bold text-charcoal mb-4">
                  Verified Professional Certifications
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  We verify internationally recognized certifications to ensure your safety
                </p>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-4 text-center">International Certifications</h3>
                  <div className="flex flex-wrap justify-center gap-4">
                    <CertificationBadge certification={{
                    title: 'IFMGA',
                    certifyingBody: 'International Federation of Mountain Guides Associations',
                    certificationType: 'standard'
                  }} displayMode="detailed" showTooltip={true} />
                    <CertificationBadge certification={{
                    title: 'IML',
                    certifyingBody: 'Union of International Mountain Leader Associations',
                    certificationType: 'standard'
                  }} displayMode="detailed" showTooltip={true} />
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-4 text-center">Regional Certifications</h3>
                  <div className="flex flex-wrap justify-center gap-4">
                    <CertificationBadge certification={{
                    title: 'AMM',
                    certifyingBody: 'UK Mountain Training - Alpine Mountain Management',
                    certificationType: 'standard'
                  }} displayMode="detailed" showTooltip={true} />
                    <CertificationBadge certification={{
                    title: 'ML',
                    certifyingBody: 'UK Mountain Training - Mountain Leader Award',
                    certificationType: 'standard'
                  }} displayMode="detailed" showTooltip={true} />
                    <CertificationBadge certification={{
                    title: 'WML',
                    certifyingBody: 'UK Mountain Training - Winter Mountain Leader Award',
                    certificationType: 'standard'
                  }} displayMode="detailed" showTooltip={true} />
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-4 text-center">Medical Certifications</h3>
                  <div className="flex flex-wrap justify-center gap-4">
                    <CertificationBadge certification={{
                    title: 'WEMT',
                    certifyingBody: 'Wilderness Medical Associates / NOLS Wilderness Medicine',
                    certificationType: 'standard'
                  }} displayMode="detailed" showTooltip={true} />
                    <CertificationBadge certification={{
                    title: 'WFR',
                    certifyingBody: 'Wilderness Medical Associates / NOLS Wilderness Medicine',
                    certificationType: 'standard'
                  }} displayMode="detailed" showTooltip={true} />
                    <CertificationBadge certification={{
                    title: 'WFA',
                    certifyingBody: 'Wilderness Medical Associates / NOLS Wilderness Medicine',
                    certificationType: 'standard'
                  }} displayMode="detailed" showTooltip={true} />
                    <CertificationBadge certification={{
                    title: 'CPR/AED',
                    certifyingBody: 'American Heart Association / Red Cross',
                    certificationType: 'standard'
                  }} displayMode="detailed" showTooltip={true} />
                    <CertificationBadge certification={{
                    title: 'FAW',
                    certifyingBody: 'Health and Safety Executive (HSE) - UK',
                    certificationType: 'standard'
                  }} displayMode="detailed" showTooltip={true} />
                    <CertificationBadge certification={{
                    title: 'EFAW',
                    certifyingBody: 'Health and Safety Executive (HSE) - UK',
                    certificationType: 'standard'
                  }} displayMode="detailed" showTooltip={true} />
                  </div>
                </div>
              </div>

              <Card className="p-6 bg-burgundy/5 border-burgundy/20">
                <div className="flex gap-3 items-start">
                  <Shield className="h-6 w-6 text-burgundy flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-charcoal mb-2">Our Verification Process</h3>
                    <p className="text-muted-foreground">
                      Every guide undergoes manual verification. We check certifications, insurance, and professional references to ensure you're in safe hands.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection />

        {/* Footer */}
        <footer className="py-8 bg-charcoal text-white/60 text-center text-sm">
          <div className="container mx-auto px-4">
            <p>© 2025 Made to Hike. Built with passion for the mountains.</p>
          </div>
        </footer>
      </div>
    </>;
}