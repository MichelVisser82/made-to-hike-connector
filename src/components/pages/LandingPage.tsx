import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Star, MapPin, Users, Shield, Calendar, Search, CheckCircle } from 'lucide-react';
import { SmartImage } from "../SmartImage";
import { useWebsiteImages } from "@/hooks/useWebsiteImages";
import { supabase } from "@/integrations/supabase/client";
import { imageRecommendations } from '@/lib/imageRecommendations';
import { type User } from '../../types';

interface LandingPageProps {
  onNavigateToSearch: (filters?: any) => void;
  onShowGuideSignup: () => void;
  user: User | null;
  onNavigateToDashboard: () => void;
}

export function LandingPage({ onNavigateToSearch, onShowGuideSignup, user, onNavigateToDashboard }: LandingPageProps) {
  const [selectedRegion, setSelectedRegion] = useState('dolomites');
  const { getRandomImage, getImagesByContext } = useWebsiteImages();

  const regions = [
    {
      id: 'dolomites',
      name: 'Dolomites',
      country: 'Italy',
      tours: 47,
      difficulty: 'Easy - Expert',
      bestSeason: 'May - October',
      description: 'Dramatic limestone peaks and alpine meadows'
    },
    {
      id: 'pyrenees',
      name: 'Pyrenees',
      country: 'France/Spain',
      tours: 32,
      difficulty: 'Moderate - Expert',
      bestSeason: 'June - September',
      description: 'Pristine wilderness between France and Spain'
    },
    {
      id: 'scottish-highlands',
      name: 'Scottish Highlands',
      country: 'Scotland',
      tours: 28,
      difficulty: 'Easy - Challenging',
      bestSeason: 'April - October',
      description: 'Rugged landscapes and ancient castles'
    }
  ];

  const currentRegion = regions.find(r => r.id === selectedRegion) || regions[0];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen">
        <SmartImage
          category="hero"
          usageContext="landing"
          className="absolute inset-0 w-full h-full object-cover"
          fallbackSrc="https://images.unsplash.com/photo-1464822759844-d150ad6d1904?w=1920&h=1080&fit=crop"
          alt="Hikers on mountain trail with dramatic alpine landscape"
          priority="high"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative container mx-auto px-4 h-full flex items-center justify-center">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Find Your Next
              <br />
              <span className="text-accent">Hiking Adventure</span>
            </h1>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              One hiking step away from nature. Join hand-selected, certified
              guides for unforgettable experiences across Europe's most
              stunning mountain ranges.
            </p>
            <Button 
              size="lg" 
              onClick={() => onNavigateToSearch()}
              className="text-lg px-8 py-6 h-auto bg-primary hover:bg-primary/90"
            >
              Find Your Next Hiking Adventure
            </Button>

            {/* Trust Indicators with Background */}
            <div className="relative mt-12">
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <SmartImage
                  category="statistics"
                  usageContext="trust_indicators"
                  tags={['hikers', 'group', 'celebration', 'success']}
                  className="w-full h-full object-cover opacity-20"
                  fallbackSrc="https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=200&fit=crop"
                  alt="Group of successful hikers celebrating their mountain adventure"
                />
                <div className="absolute inset-0 bg-primary/10" />
              </div>
              <div className="relative flex flex-wrap justify-center gap-8 py-8 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  <span className="font-medium">4.9/5 Avg. Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-medium">1,200+ Happy Hikers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="font-medium">100% Verified Guides</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Our Regions */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Explore Our Regions</h2>
            <p className="text-xl text-muted-foreground">
              Three incredible mountain ranges, countless adventures waiting for you
            </p>
          </div>

          {/* Featured Region with Side Selection */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main Featured Region */}
              <div className="lg:col-span-3">
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden">
                  <SmartImage
                    category={currentRegion.id === 'dolomites' ? 'landscape' : currentRegion.id === 'pyrenees' ? 'mountains' : 'landscape'}
                    usageContext="hero"
                    tags={
                      currentRegion.id === 'dolomites' 
                        ? ['dolomites', 'limestone', 'alpine', 'dramatic', 'peaks', 'autumn'] 
                        : currentRegion.id === 'pyrenees'
                        ? ['pyrenees', 'alpine', 'meadows', 'wildflowers', 'peaks', 'pristine']
                        : ['scotland', 'highlands', 'loch', 'rugged', 'castle', 'misty']
                    }
                    className="w-full h-full object-cover"
                    fallbackSrc=""
                    alt={`${currentRegion.name} mountain landscape - ${currentRegion.description}`}
                    priority="high"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-8 left-8 text-white">
                    <Badge className="mb-3 bg-primary/90">Most Popular</Badge>
                    <h3 className="text-4xl font-bold mb-2">{currentRegion.name}</h3>
                    <p className="text-lg opacity-90 mb-4">{currentRegion.description}</p>
                    <Button 
                      variant="secondary" 
                      onClick={() => onNavigateToSearch({ region: currentRegion.id })}
                    >
                      Explore {currentRegion.name}
                    </Button>
                  </div>
                </div>

                {/* Region Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <h4 className="font-semibold text-muted-foreground text-sm">Difficulty Range</h4>
                    <p className="font-medium">{currentRegion.difficulty}</p>
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-muted-foreground text-sm">Best Season</h4>
                    <p className="font-medium">{currentRegion.bestSeason}</p>
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-muted-foreground text-sm">Available Tours</h4>
                    <p className="font-medium">{currentRegion.tours} guided experiences</p>
                  </div>
                </div>
              </div>

              {/* Region Selection */}
              <div className="space-y-4">
                {regions.map((region) => (
                  <Button
                    key={region.id}
                    variant={selectedRegion === region.id ? "default" : "outline"}
                    className="w-full justify-start h-auto p-4"
                    onClick={() => setSelectedRegion(region.id)}
                  >
                    <div className="text-left">
                      <div className="font-semibold">{region.name}</div>
                      <div className="text-sm opacity-70">{region.country}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Share Your Mountain Expertise */}
      <section className="py-20 relative">
        <div className="absolute inset-0">
          <SmartImage
            category="guide"
            usageContext="teaching"
            tags={['guide', 'mountain', 'expert', 'teaching']}
            className="w-full h-full object-cover"
            fallbackSrc="https://images.unsplash.com/photo-1551632811-561732d1e306?w=1920&h=800&fit=crop"
            alt="Professional mountain guide teaching hiking techniques to a group"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Share Your Mountain Expertise</h2>
            <p className="text-xl opacity-90 mb-8">
              Turn your passion for hiking into income. Join our community of hand-selected, certified mountain guides.
            </p>
            {!user && (
              <Button size="lg" onClick={onShowGuideSignup} className="bg-primary hover:bg-primary/90">
                Become a Guide
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Hand-Selected & Verified Guides */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Hand-Selected & Verified Guides</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We hand-check all certifications and display them prominently. Every guide is personally 
              vetted for safety, expertise, and authentic mountain experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Hand-Selected Guides</h3>
              <p className="text-sm text-muted-foreground">
                Every guide is personally vetted for safety and expertise by our experienced mountaineering team.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Verified Certifications</h3>
              <p className="text-sm text-muted-foreground">
                All guiding certifications are verified by our certification specialists and updated annually.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Authentic Only</h3>
              <p className="text-sm text-muted-foreground">
                Guides available online to accept or withdraw bookings only. No false details or fake tours.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                <Star className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Verified Reviews</h3>
              <p className="text-sm text-muted-foreground">
                Only users who have completed a tour with a guide can post tour reviews.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications & Trust Indicators */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Certifications */}
              <div>
                <h3 className="text-2xl font-bold mb-8">Recognised Certifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>First Aid/Advanced First Aid</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Wilderness First Aid (WFA)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Mountain Leader Training Association</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Local Safety Permits</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Avalanche Safety Training</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Rock Climbing Instructor</span>
                  </div>
                </div>
              </div>

              {/* Verified Features */}
              <div>
                <h3 className="text-2xl font-bold mb-8">Verified Features</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Document Verification Reviews</h4>
                      <p className="text-sm text-muted-foreground">
                        Document verification takes 3-5 business days. Our verification team responds to queries within 2 hours.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Shield className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Authentic Locations</h4>
                      <p className="text-sm text-muted-foreground">
                        All photos taken by guide themselves, that include authentic locations. No stock use or digital copy.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">100%</div>
                <div className="text-sm font-medium text-muted-foreground">Verified Guides</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
                <div className="text-sm font-medium text-muted-foreground">Certified Guides</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-600 mb-2">4.9</div>
                <div className="text-sm font-medium text-muted-foreground">Average Rating</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
                <div className="text-sm font-medium text-muted-foreground">Safety Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Our Hikers Say */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Our Hikers Say</h2>
            <p className="text-xl text-muted-foreground">Real experiences from real adventurers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="relative overflow-hidden">
              <SmartImage
                category="hiker"
                usageContext="testimonial"
                tags={['hiker', 'portrait', 'happy', 'dolomites']}
                className="w-full h-48 object-cover"
                fallbackSrc="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=200&fit=crop"
                alt="Happy female hiker Sarah enjoying her Dolomites adventure"
              />
              <div className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Amazing experience in the Dolomites! Our guide Marco was incredibly knowledgeable and made us feel very safe throughout the challenging route."
                </p>
                <div className="font-semibold">Sarah M.</div>
                <div className="text-sm text-muted-foreground">Dolomites Adventure - 5 days</div>
              </div>
            </Card>

            <Card className="relative overflow-hidden">
              <SmartImage
                category="hiker"
                usageContext="testimonial"
                tags={['hiker', 'portrait', 'male', 'scotland']}
                className="w-full h-48 object-cover"
                fallbackSrc="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=200&fit=crop"
                alt="Satisfied male hiker James after his Scottish Highlands tour"
              />
              <div className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "The Scottish Highlands tour exceeded my expectations. The guide was attentive to our group's needs and shared amazing local stories."
                </p>
                <div className="font-semibold">James R.</div>
                <div className="text-sm text-muted-foreground">Scottish Highlands - 3 days</div>
              </div>
            </Card>

            <Card className="relative overflow-hidden">
              <SmartImage
                category="hiker"
                usageContext="testimonial"
                tags={['hiker', 'portrait', 'group', 'pyrenees']}
                className="w-full h-48 object-cover"
                fallbackSrc="https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=200&fit=crop"
                alt="Group of hikers celebrating their successful Pyrenees expedition"
              />
              <div className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Unforgettable Pyrenees adventure! The pristine wilderness and our guide's expertise made this the highlight of our year."
                </p>
                <div className="font-semibold">Maria & Carlos</div>
                <div className="text-sm text-muted-foreground">Pyrenees Wilderness - 7 days</div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Adventures Gallery */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Featured Adventures</h2>
            <p className="text-xl text-muted-foreground">Discover breathtaking moments from recent expeditions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="relative aspect-[4/5] rounded-xl overflow-hidden group cursor-pointer">
              <SmartImage
                category="adventure"
                usageContext="dolomites_summit"
                tags={['dolomites', 'summit', 'tre_cime', 'dramatic', 'clouds']}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                fallbackSrc="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=750&fit=crop"
                alt="Dramatic Dolomites Tre Cime peaks rising above sea of clouds at sunrise"
                priority="medium"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-xl font-bold mb-1">Dolomites Summit</h3>
                <p className="text-sm opacity-90">Tre Cime Adventure</p>
              </div>
            </div>

            <div className="relative aspect-[4/5] rounded-xl overflow-hidden group cursor-pointer">
              <SmartImage
                category="adventure"
                usageContext="highland_mysteries"
                tags={['scotland', 'glen_coe', 'boats', 'tropical', 'mystery']}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                fallbackSrc="https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&h=750&fit=crop"
                alt="Traditional wooden boats in crystal clear tropical waters of Glen Coe area"
                priority="medium"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-xl font-bold mb-1">Highland Mysteries</h3>
                <p className="text-sm opacity-90">Glen Coe Explorer</p>
              </div>
            </div>

            <div className="relative aspect-[4/5] rounded-xl overflow-hidden group cursor-pointer">
              <SmartImage
                category="adventure"
                usageContext="alpine_paradise"
                tags={['pyrenees', 'alpine', 'meadows', 'wildflowers', 'peaks']}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                fallbackSrc="https://images.unsplash.com/photo-1464822759844-d150ad6d1904?w=600&h=750&fit=crop"
                alt="Pristine Pyrenees alpine meadows blooming with wildflowers beneath snow-capped peaks"
                priority="medium"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-xl font-bold mb-1">Alpine Paradise</h3>
                <p className="text-sm opacity-90">Pyrenees Wilderness</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" onClick={() => onNavigateToSearch()} className="bg-primary hover:bg-primary/90">
              Explore All Adventures
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready for Your Next Adventure?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of hikers who've discovered amazing trails with expert guides
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => onNavigateToSearch()}
              className="bg-white text-primary hover:bg-white/90"
            >
              Browse All Tours
            </Button>
            {!user && (
              <Button 
                size="lg" 
                variant="outline"
                onClick={onShowGuideSignup}
                className="border-white text-white hover:bg-white hover:text-primary"
              >
                Become a Guide
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}