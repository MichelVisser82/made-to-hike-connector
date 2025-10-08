import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Mountain, Users, Shield, Award, DollarSign, Globe, MapPin, Compass, Heart, CheckCircle, Star, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SmartImage } from '@/components/SmartImage';
import { EmailSignupCard } from './EmailSignupCard';
import { MockGuideCard } from './MockGuideCard';
import { MockTourCard } from './MockTourCard';
import { TopographicLines } from './decorations/TopographicLines';
import { MountainRidge } from './decorations/MountainRidge';
import { CertificationBadge } from '@/components/ui/certification-badge';
export function ComingSoonPage() {
  const [activeSection, setActiveSection] = useState('');
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
        <title>Made to Hike - Coming Soon | Certified Mountain Guides Marketplace</title>
        <meta name="description" content="Connect with certified mountain guides across Europe. Join our waitlist to be first to experience the premium hiking guide marketplace." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-cream-light">
        
        {/* Fixed Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-burgundy/10">
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

        {/* Hero Section */}
        <section className="relative pt-24 pb-20 min-h-[90vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <SmartImage category="hero" usageContext="landing" tags={['mountain', 'landscape', 'adventure']} priority="high" className="w-full h-full object-cover" alt="Mountain landscape" />
            <div className="absolute inset-0 bg-gradient-to-b from-charcoal/70 via-charcoal/50 to-cream-light" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <Badge className="bg-burgundy text-white border-0 px-4 py-1">
                Coming Soon
              </Badge>

              <h1 className="font-playfair text-5xl md:text-7xl font-bold text-white leading-tight">
                Connect Certified Guides with Adventure Seekers
              </h1>

              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Europe's first premium marketplace connecting certified mountain guides with adventurers seeking authentic, safe mountain experiences.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button onClick={() => scrollToSection('for-guides')} size="lg" className="bg-burgundy hover:bg-burgundy-dark text-lg">
                  I'm a Guide
                </Button>
                <Button onClick={() => scrollToSection('for-hikers')} size="lg" className="bg-white text-burgundy hover:bg-white/90 text-lg">
                  I'm a Hiker
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-12 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-4xl font-playfair font-bold text-white">100+</div>
                  <div className="text-sm text-white/80">Guides</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-playfair font-bold text-white">1000+</div>
                  <div className="text-sm text-white/80">Adventures</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* For Guides Section */}
        <section id="for-guides" className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div className="space-y-6">
                <Badge variant="secondary" className="bg-burgundy/10 text-burgundy">
                  For Professional Guides
                </Badge>
                
                <h2 className="font-playfair text-4xl md:text-5xl font-bold text-charcoal">
                  Own Your Business. Share Your Passion.
                </h2>

                <div className="space-y-4">
                  {[{
                  icon: DollarSign,
                  title: 'Keep More of What You Earn',
                  desc: 'Low commission rates'
                }, {
                  icon: Award,
                  title: 'Showcase Your Certifications',
                  desc: 'Display IFMGA, IML, and regional qualifications'
                }, {
                  icon: Users,
                  title: 'Build Your Community',
                  desc: 'Connect directly with your ideal clients'
                }, {
                  icon: Globe,
                  title: 'Reach Beyond Borders',
                  desc: 'Access hikers across Europe'
                }].map((item, idx) => <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0 p-2 bg-burgundy/10 rounded-lg h-fit">
                        <item.icon className="h-5 w-5 text-burgundy" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-charcoal">{item.title}</h3>
                        <p className="text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>)}
                </div>

                <EmailSignupCard userType="guide" sectionName="For Guides Section" />
              </div>

              <div className="relative">
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                  <SmartImage category="portrait" usageContext="landing" tags={['guide', 'professional', 'mountain']} className="w-full h-full object-cover" alt="Professional mountain guide" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cream" />
                </div>

                <Card className="absolute bottom-6 right-6 p-4 bg-burgundy text-white max-w-xs">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Star className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">"Finally, a platform built for guides, by guides."</p>
                      <p className="text-xs text-white/80 mt-1">— Alex M., IFMGA Guide</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Trust & Safety Section */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-burgundy-dark to-charcoal">
            <TopographicLines />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-12">
              <div className="space-y-4">
                <h2 className="font-playfair text-4xl md:text-5xl font-bold text-white">
                  Built on Trust & Verification
                </h2>
                <p className="text-lg text-white/80 max-w-2xl mx-auto">
                  Every guide is manually verified. Every certification checked. Safety first, always.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[{
                icon: Shield,
                title: '100% Verified',
                desc: 'All guides manually verified by our team'
              }, {
                icon: Award,
                title: 'Professional Standards',
                desc: 'Recognized international certifications'
              }, {
                icon: Heart,
                title: 'Sustainability First',
                desc: 'Support local communities and environment'
              }].map((item, idx) => <Card key={idx} className="p-6 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-colors">
                    <div className="space-y-3 text-center">
                      <div className="inline-flex p-3 bg-white/10 rounded-lg">
                        <item.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-white">{item.title}</h3>
                      <p className="text-sm text-white/80">{item.desc}</p>
                    </div>
                  </Card>)}
              </div>
            </div>
          </div>
        </section>

        {/* For Hikers Section */}
        <section id="for-hikers" className="py-24 bg-cream">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div className="relative order-2 md:order-1">
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
              <SmartImage category="hiking" usageContext="landing" tags={['trail', 'adventure', 'group']} className="w-full h-full object-cover" alt="Hikers on mountain trail" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cream" />
                </div>

                <Card className="absolute bottom-6 left-6 p-4 bg-white max-w-xs">
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-4 w-4 fill-gold text-gold" />)}
                    </div>
                    <p className="text-sm">"An unforgettable experience with a knowledgeable guide."</p>
                    <p className="text-xs text-muted-foreground">— Sarah K., Munich</p>
                  </div>
                </Card>
              </div>

              <div className="space-y-6 order-1 md:order-2">
                <Badge variant="secondary" className="bg-burgundy/10 text-burgundy">
                  For Adventure Seekers
                </Badge>
                
                <h2 className="font-playfair text-4xl md:text-5xl font-bold text-charcoal">
                  Discover Your Next Mountain Adventure
                </h2>

                <div className="space-y-4">
                  {[{
                  icon: MapPin,
                  title: 'Authentic Local Expertise',
                  desc: 'Experience mountains through local eyes'
                }, {
                  icon: Shield,
                  title: 'Safety Guaranteed',
                  desc: 'All guides certified and insured'
                }, {
                  icon: Compass,
                  title: 'Personalized Adventures',
                  desc: 'Custom experiences for your skill level'
                }, {
                  icon: Heart,
                  title: 'Support Local Communities',
                  desc: 'Your bookings directly benefit guides'
                }].map((item, idx) => <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0 p-2 bg-burgundy/10 rounded-lg h-fit">
                        <item.icon className="h-5 w-5 text-burgundy" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-charcoal">{item.title}</h3>
                        <p className="text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>)}
                </div>

                <EmailSignupCard userType="hiker" sectionName="For Hikers Section" />
              </div>
            </div>
          </div>
        </section>

        {/* Founder's Story Section */}
        <section className="py-24 bg-gradient-to-b from-white to-cream">
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
                    <SmartImage category="portrait" usageContext="about" tags={['guide', 'professional', 'outdoor']} className="w-full h-full object-cover" alt="Founder" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cream" />
                  </div>
                  <Badge className="absolute top-4 right-4 bg-burgundy text-white border-0">
                    UK Mountain Leader
                  </Badge>
                </div>

                <div className="space-y-6">
                  <p className="text-lg text-charcoal leading-relaxed">
                    As a UK-trained Mountain Leader and entrepreneur, I've spent years guiding groups through some of Europe's most stunning landscapes.
                  </p>
                  <p className="text-lg text-charcoal leading-relaxed">
                    For years, I searched for a platform where certified guides could truly own their brand, set their own rates, and connect directly with adventurers without losing half their earnings to middlemen.
                  </p>
                  <p className="text-lg text-charcoal leading-relaxed font-semibold">
                    So I built it.
                  </p>
                  <p className="text-lg text-charcoal leading-relaxed">
                    Made to Hike isn't just another booking platform—it's a movement to empower professional mountain guides across Europe while ensuring hikers get authentic, safe experiences with verified experts.
                  </p>

                  <Card className="p-6 border-2 border-burgundy bg-burgundy/5">
                    <div className="flex gap-3">
                      <Compass className="h-6 w-6 text-burgundy flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-charcoal font-semibold mb-2">Our Mission</p>
                        <p className="text-muted-foreground">
                          To create a sustainable marketplace where guides thrive, hikers explore safely, and mountain communities prosper.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <div className="grid grid-cols-3 gap-4 pt-4">
                    {['Guide-First Platform', 'Authentic Experiences', 'Built on Trust'].map((item, idx) => <div key={idx} className="flex items-center gap-2">
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
                  <MockGuideCard name="Marco Bianchi" certification="IFMGA" location="Dolomites, Italy" experience={12} rating={4.9} verified={true} />
                  <MockGuideCard name="Sophie Durand" certification="IML" location="Chamonix, France" experience={8} rating={5.0} verified={true} />
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

        {/* Certifications Section */}
        <section className="py-24 bg-white">
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

        {/* Featured Regions Section */}
        <section className="py-24 bg-cream">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto space-y-12">
              <div className="text-center">
                <h2 className="font-playfair text-4xl md:text-5xl font-bold text-charcoal">
                  Explore Europe's Finest Mountains
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {[{
                name: 'Scottish Highlands',
                guides: 120,
                tags: ['scotland', 'highlands']
              }, {
                name: 'French Pyrenees',
                guides: 85,
                tags: ['pyrenees', 'france']
              }, {
                name: 'Italian Dolomites',
                guides: 95,
                tags: ['dolomites']
              }].map((region, idx) => <Card key={idx} className="overflow-hidden group cursor-pointer hover:shadow-elegant transition-shadow">
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <SmartImage category="landscape" usageContext="landing" tags={region.tags} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" alt={region.name} />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cream" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-playfair text-xl font-bold text-charcoal">{region.name}</h3>
                      <p className="text-muted-foreground">{region.guides}+ guides available</p>
                    </div>
                  </Card>)}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-burgundy to-burgundy-dark">
            <MountainRidge />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h2 className="font-playfair text-4xl md:text-6xl font-bold text-white">
                Ready to Join the Movement?
              </h2>
              <p className="text-xl text-white/90">
                Be among the first to experience Europe's most authentic mountain guide marketplace
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button onClick={() => scrollToSection('for-guides')} size="lg" className="bg-white text-burgundy hover:bg-white/90 text-lg">
                  Join as a Guide
                </Button>
                <Button onClick={() => scrollToSection('for-hikers')} size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg">
                  Find Your Adventure
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 bg-charcoal text-white/60 text-center text-sm">
          <div className="container mx-auto px-4">
            <p>© 2025 Made to Hike. Built with passion for the mountains.</p>
            <p className="mt-2">Press Ctrl+Shift+L for preview access</p>
          </div>
        </footer>
      </div>
    </>;
}