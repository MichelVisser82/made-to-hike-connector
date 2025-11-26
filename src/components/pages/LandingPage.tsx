import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mountain, CheckCircle2, ArrowRight, Leaf, Shield, Users, Star, Mail, MapPin, Award, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { SmartImage } from '../SmartImage';
import { CertificationBadge } from '../ui/certification-badge';
import { useFeaturedRegions, formatRegionPath } from '@/hooks/useFeaturedRegions';
import { useFeaturedTours } from '@/hooks/useFeaturedTours';
import { useAllGuides } from '@/hooks/useAllGuides';
import { useWebsiteImages } from '@/hooks/useWebsiteImages';
import type { User } from '../../types';
interface LandingPageProps {
  onNavigateToSearch: (filters?: any) => void;
  onShowGuideSignup: () => void;
  user: User | null;
  onNavigateToDashboard: () => void;
}
export function LandingPage({
  onNavigateToSearch,
  onShowGuideSignup,
  user,
  onNavigateToDashboard
}: LandingPageProps) {
  const navigate = useNavigate();
  const {
    data: featuredRegions,
    isLoading: isLoadingRegions
  } = useFeaturedRegions();
  const {
    data: featuredTours,
    isLoading: isLoadingTours
  } = useFeaturedTours(3);
  const {
    data: guides
  } = useAllGuides();
  const {
    getImagesByContext,
    getImageUrl
  } = useWebsiteImages();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Get top 3 guides for display
  const topGuides = guides?.slice(0, 3) || [];

  // Calculate real statistics
  const totalGuides = guides?.length || 0;
  const totalRoutes = featuredTours?.length || 0;
  const avgRating = guides?.length > 0 ? (guides.reduce((sum, g) => sum + (g.average_rating || 0), 0) / guides.length).toFixed(1) : "4.9";
  useEffect(() => {
    if (featuredRegions && featuredRegions.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % featuredRegions.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [featuredRegions]);
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };
  const nextSlide = () => {
    if (featuredRegions) {
      setCurrentSlide(prev => (prev + 1) % featuredRegions.length);
    }
  };
  const prevSlide = () => {
    if (featuredRegions) {
      setCurrentSlide(prev => (prev - 1 + featuredRegions.length) % featuredRegions.length);
    }
  };
  if (isLoadingRegions || isLoadingTours) {
    return <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Mountain className="w-12 h-12 animate-pulse mx-auto mb-4 text-burgundy" />
          <p className="text-charcoal/60">Loading...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-cream">
      {/* SECTION 1: Split-Screen Hero */}
      <section className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Image */}
        <div className="lg:w-1/2 h-[50vh] lg:h-screen relative overflow-hidden">
          <SmartImage category="hero" usageContext="landing_split_hero" tags={['guide', 'mountain', 'hiking']} className="w-full h-full object-cover" alt="Mountain guide with topographic map" />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-charcoal/30" />
          {/* Subtle contour lines overlay */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="contours" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M0,20 Q25,10 50,20 T100,20" stroke="white" fill="none" strokeWidth="0.5" />
                  <path d="M0,40 Q25,35 50,40 T100,40" stroke="white" fill="none" strokeWidth="0.5" />
                  <path d="M0,60 Q25,55 50,60 T100,60" stroke="white" fill="none" strokeWidth="0.5" />
                  <path d="M0,80 Q25,75 50,80 T100,80" stroke="white" fill="none" strokeWidth="0.5" />
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
              Built by guides, for guides
            </div>
            
            <h1 className="text-4xl lg:text-6xl mb-8 leading-tight text-white" style={{
            fontFamily: 'Playfair Display, serif'
          }}>
              Discover the mountains with Certified Guides
            </h1>

            <div className="space-y-4 mb-12 text-cream/90 leading-relaxed">
              <p>Join other passionate hikers with certified guides across different regions like the Dolomites, Pyrenees, and Scottish Highlands.</p>
              <p>Authentic and safe experiences. Fair guide compensation.</p>
              <p>Sustainable mountain tourism.</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-6 mb-12 pb-12 border-b border-white/20">
              <div>
                <div className="text-3xl lg:text-4xl text-burgundy-light mb-2" style={{
                fontFamily: 'Playfair Display, serif'
              }}>95%</div>
                <div className="text-sm text-cream/70 uppercase tracking-wider">To Guides</div>
              </div>
              <div>
                <div className="text-3xl lg:text-4xl text-burgundy-light mb-2" style={{
                fontFamily: 'Playfair Display, serif'
              }}>{totalGuides}</div>
                <div className="text-sm text-cream/70 uppercase tracking-wider">Certified</div>
              </div>
              <div>
                <div className="text-3xl lg:text-4xl text-burgundy-light mb-2" style={{
                fontFamily: 'Playfair Display, serif'
              }}>{totalRoutes}+</div>
                <div className="text-sm text-cream/70 uppercase tracking-wider">Routes</div>
              </div>
            </div>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="border-2 border-burgundy text-burgundy hover:bg-burgundy hover:text-white transition-all px-8 py-6" onClick={() => navigate('/tours')}>
                Find Your Next Hike <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button className="bg-burgundy text-white hover:bg-burgundy-dark transition-all px-8 py-6" onClick={() => navigate('/guide/signup')}>
                Become a Guide <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>

            {/* Scroll Indicator */}
            <div className="mt-16 flex justify-center">
              <div className="flex flex-col items-center gap-2 animate-bounce">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-50">
                  <path d="M5,10 Q20,5 35,10" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <path d="M5,20 Q20,15 35,20" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <path d="M5,30 Q20,25 35,30" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Featured Adventures */}
      <section className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl mb-6 text-charcoal" style={{
            fontFamily: 'Playfair Display, serif'
          }}>
              Featured Adventures
            </h2>
            <p className="text-xl text-charcoal/70 max-w-3xl mx-auto">
              Hand-picked experiences from our most sought-after guides
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTours && featuredTours.map(tour => {
            const guideName = tour.guide_display_name || 'Expert Guide';
            const tourRegion = `${tour.region_country}, ${tour.region_region || tour.region_subregion}`;
            const durationDays = tour.duration_days || parseInt(tour.duration) || 1;
            const difficultyLabel = tour.difficulty_level || tour.difficulty;
            const primaryCert = tour.guide_certifications?.[0];
            const certTitle = primaryCert?.title || 'Certified';
            return <Card key={tour.id} className="overflow-hidden border-burgundy/10 hover:shadow-2xl transition-all duration-300 cursor-pointer" onClick={() => navigate(`/tour/${tour.slug}`)}>
                  <div className="relative h-64">
                    <SmartImage category="tour" usageContext={`tour-${tour.region_country}-${tour.region_subregion}`} tags={[`location:${tour.region_country.toLowerCase().replace(/\s+/g, '-')}-${tour.region_subregion.toLowerCase().replace(/\s+/g, '-')}`, 'hiking', 'mountain']} className="w-full h-full object-cover" alt={`${tour.title} in ${tourRegion}`} />
                    <div className="absolute bottom-4 left-4">
                      <div className="flex items-center gap-1 bg-white/95 px-3 py-1 rounded-full">
                        <Star className="w-3 h-3 fill-burgundy text-burgundy" />
                        <span className="text-sm font-medium text-charcoal">{tour.rating?.toFixed(1) || '5.0'}</span>
                        <span className="text-xs text-charcoal/60">({tour.reviews_count || 0})</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-white">
                    <h3 className="text-2xl mb-2 text-charcoal" style={{
                  fontFamily: 'Playfair Display, serif'
                }}>
                      {tour.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm mb-4">
                      <span className="text-charcoal">{guideName}</span>
                      {primaryCert && <CertificationBadge certification={primaryCert} size="mini" displayMode="simple" showTooltip={true} />}
                    </div>

                    <div className="space-y-2 text-sm text-charcoal/70 mb-4 pb-4 border-b border-charcoal/10">
                      <div className="flex justify-between">
                        <span className="text-charcoal/50">Duration:</span>
                        <span>{durationDays} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal/50">Difficulty:</span>
                        <span className="capitalize">{difficultyLabel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal/50">Group Size:</span>
                        <span>Up to {tour.group_size} people</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl text-burgundy" style={{
                      fontFamily: 'Playfair Display, serif'
                    }}>
                          {tour.currency === 'GBP' ? '£' : '€'}{tour.price}
                        </div>
                        <div className="text-xs text-charcoal/60">per person</div>
                      </div>
                      <Button className="bg-burgundy hover:bg-burgundy-dark text-white">
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>;
          })}
          </div>

          <div className="mt-16 text-center">
            <Button variant="outline" className="border-2 border-burgundy text-burgundy hover:bg-burgundy hover:text-white px-8 py-6 text-lg" onClick={() => navigate('/tours')}>
              Explore All {totalRoutes}+ Routes <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 3: Regions - Where Do You Want to Go */}
      {featuredRegions && featuredRegions.length > 0 && <section className="py-24 bg-charcoal text-white">
          <div className="relative">
            <div className="text-center mb-12 px-6">
              <h2 className="text-4xl lg:text-5xl text-white" style={{
            fontFamily: 'Playfair Display, serif'
          }}>
                Where Do You Want to Go?
              </h2>
            </div>

            {/* Full-width carousel */}
            <div className="relative overflow-hidden">
              <div className="relative">
                {featuredRegions.map((region, index) => <div key={region.id} className={`absolute inset-0 transition-opacity duration-700 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`} style={{
              position: index === 0 ? 'relative' : 'absolute'
            }}>
                    <div className="relative h-[70vh] md:h-[80vh]">
                    <SmartImage category="landscape" usageContext={`${region.country}-${region.region || region.subregion}`} tags={[`location:${region.country.toLowerCase().replace(/\s+/g, '-')}-${region.subregion.toLowerCase().replace(/\s+/g, '-')}`, 'mountain', 'alpine']} className="w-full h-full object-cover" alt={`${region.country} - ${region.region || region.subregion} mountain landscape`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent" />
                      
                      {/* Country badge - top left */}
                      <div className="absolute top-6 left-6 z-20">
                        <Badge className="bg-burgundy text-white border-0 px-4 py-1">
                          {region.country}
                        </Badge>
                      </div>

                      {/* Content overlay */}
                      <div className="absolute inset-0 flex items-end">
                        <div className="w-full max-w-7xl mx-auto px-6 pb-16 md:pb-24">
                          <div className="max-w-3xl">
                            
                            <h3 className="text-4xl md:text-6xl text-white mb-4" style={{
                        fontFamily: 'Playfair Display, serif'
                      }}>
                              {region.region || region.subregion}
                            </h3>
                            
                            <p className="text-xl text-cream/90 mb-6 leading-relaxed">
                              {region.description}
                            </p>

                            <Button className="bg-burgundy hover:bg-burgundy-dark text-white px-8 py-6" onClick={() => {
                        const params = new URLSearchParams();
                        params.set('country', region.country);
                        if (region.region) params.set('region', region.region);
                        params.set('subregion', region.subregion);
                        navigate(`/tours?${params.toString()}`);
                      }}>
                              Explore {region.region || region.subregion} <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>)}
              </div>

              {/* Navigation Arrows */}
              <button onClick={prevSlide} className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 transition-all" aria-label="Previous slide">
                <ChevronLeft className="w-8 h-8 text-white" />
              </button>
              <button onClick={nextSlide} className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 transition-all" aria-label="Next slide">
                <ChevronRight className="w-8 h-8 text-white" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
                {featuredRegions.map((_, index) => <button key={index} onClick={() => goToSlide(index)} className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-burgundy w-8' : 'bg-white/50 hover:bg-white/80'}`} aria-label={`Go to slide ${index + 1}`} />)}
              </div>
            </div>
          </div>
        </section>}

      {/* SECTION 4: Meet Our Guides */}
      {topGuides.length > 0 && <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl lg:text-5xl text-center mb-4 text-charcoal" style={{
          fontFamily: 'Playfair Display, serif'
        }}>
              Meet Our Guides
            </h2>
            <p className="text-center text-charcoal/60 mb-16">Certified professionals with decades of mountain experience</p>

            <div className="grid md:grid-cols-3 gap-8">
              {topGuides.map(guide => {
            const guideSlug = guide.slug || guide.user_id;
            const primaryCert = guide.certifications?.[0];
            const certTitle = primaryCert?.title || 'Certified Guide';
            return <Card key={guide.user_id} className="overflow-hidden border-burgundy/10 hover:shadow-2xl transition-all duration-300 cursor-pointer" onClick={() => navigate(`/guide/${guideSlug}`)}>
                    <div className="relative h-80">
                      {guide.profile_image_url ? <img src={guide.profile_image_url} alt={guide.display_name} className="w-full h-full object-cover" /> : <SmartImage category="guide" usageContext="profile_portrait" tags={['guide', 'portrait', 'professional']} className="w-full h-full object-cover" alt={guide.display_name} />}
                      <div className="absolute top-4 right-4">
                        {primaryCert && <CertificationBadge certification={primaryCert} size="compact" displayMode="simple" showTooltip={true} />}
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <div className="flex items-center gap-1 bg-white/90 px-3 py-1 rounded-full">
                          <Star className="w-3 h-3 fill-burgundy text-burgundy" />
                          <span className="text-sm font-medium text-charcoal">{guide.average_rating?.toFixed(1) || '5.0'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 bg-white">
                      <h3 className="text-2xl mb-1 text-charcoal" style={{
                  fontFamily: 'Playfair Display, serif'
                }}>
                        {guide.display_name}
                      </h3>
                      {guide.specialties && guide.specialties.length > 0 && <div className="flex flex-wrap gap-2 mb-4">
                          {guide.specialties.slice(0, 3).map((specialty, idx) => <Badge key={idx} variant="outline" className="text-xs border-burgundy/30 text-burgundy bg-burgundy/5">
                              {specialty}
                            </Badge>)}
                        </div>}

                      <div className="space-y-2 text-sm text-charcoal/70 mb-4 pb-4 border-b border-charcoal/10">
                        <div className="flex justify-between">
                          <span className="text-charcoal/50">Experience:</span>
                          <span>{guide.experience_years || 10}+ years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-charcoal/50">Routes:</span>
                          <span>{guide.tours_count || 0} Active</span>
                        </div>
                      </div>

                      {guide.bio && <div className="p-4 bg-cream rounded-lg mb-4">
                          <p className="text-sm text-charcoal/80 italic leading-relaxed line-clamp-3">
                            "{guide.bio}"
                          </p>
                        </div>}

                      <Button className="w-full bg-burgundy hover:bg-burgundy-dark text-white">
                        View {guide.display_name.split(' ')[0]}'s Routes
                      </Button>
                    </div>
                  </Card>;
          })}
            </div>

            <div className="mt-12 text-center">
              <Button className="bg-charcoal text-white hover:bg-charcoal/90" onClick={() => navigate('/guides')}>
                All Certified Guides <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>}

      {/* SECTION 5: Why Made to Hike Exists */}
      <section className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl lg:text-5xl text-center mb-4 text-charcoal" style={{
          fontFamily: 'Playfair Display, serif'
        }}>
            Why Made to Hike Exists
          </h2>
          <p className="text-center text-charcoal/70 mb-16 text-lg max-w-3xl mx-auto">
            We're changing how mountain guiding works
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {/* Column 1 */}
            <div className="border-l-4 border-burgundy pl-6">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-8 h-8 text-burgundy" />
                <h3 className="text-2xl text-charcoal" style={{
                fontFamily: 'Playfair Display, serif'
              }}>
                  Fair to Guides
                </h3>
              </div>
              <p className="text-charcoal/70 mb-4 leading-relaxed">
                Guides keep 95% of booking revenue. No hidden fees. No algorithm games. Just fair compensation for expert mountain professionals.
              </p>
              <div className="flex items-center gap-2 text-burgundy">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm">Paid within 48 hours</span>
              </div>
            </div>

            {/* Column 2 */}
            <div className="border-l-4 border-burgundy/60 pl-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-8 h-8 text-burgundy" />
                <h3 className="text-2xl text-charcoal" style={{
                fontFamily: 'Playfair Display, serif'
              }}>
                  Certified Expertise
                </h3>
              </div>
              <p className="text-charcoal/70 mb-4 leading-relaxed">Every guide is certified. We personally verify credentials and check with official registries. No exceptions.

            </p>
              <div className="flex items-center gap-2 text-burgundy">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm">100% certified professionals</span>
              </div>
            </div>

            {/* Column 3 */}
            <div className="border-l-4 border-charcoal/30 pl-6">
              <div className="flex items-center gap-3 mb-4">
                <Leaf className="w-8 h-8 text-burgundy" />
                <h3 className="text-2xl text-charcoal" style={{
                fontFamily: 'Playfair Display, serif'
              }}>
                  Mountain Stewardship
                </h3>
              </div>
              <p className="text-charcoal/70 mb-4 leading-relaxed">
                Carbon-negative operations, renewable energy hosting, and partnerships with Alpine conservation projects. We protect what we love.
              </p>
              <div className="flex items-center gap-2 text-burgundy">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm">-400kg CO₂ net annually</span>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-lg text-charcoal/70 italic">"We're building what I wished existed when I started guiding."</p>
            <p className="text-charcoal mt-2" style={{
            fontFamily: 'Playfair Display, serif'
          }}>— Michel Visser, Founder & ML Mountain Guide</p>
          </div>
        </div>
      </section>

      {/* SECTION 6: Understanding Certifications */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl mb-6 text-charcoal" style={{
            fontFamily: 'Playfair Display, serif'
          }}>
              What Guide Certifications Mean
            </h2>
            <p className="text-xl text-charcoal/70 max-w-3xl mx-auto leading-relaxed">
              Not all mountain guides are equal. Here's what the certifications on our platform actually represent.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* IFMGA */}
            <Card className="p-8 bg-cream border-burgundy/10">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-burgundy rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl text-charcoal" style={{
                  fontFamily: 'Playfair Display, serif'
                }}>
                    IFMGA / UIAGM
                  </h3>
                  <p className="text-sm text-charcoal/60">International Federation of Mountain Guides Associations</p>
                </div>
              </div>

              <div className="flex justify-center mb-6">
                <CertificationBadge certification={{
                certificationType: 'standard',
                title: "IFMGA",
                certifyingBody: "International Federation of Mountain Guides Associations",
                verificationPriority: 1,
                isPrimary: true
              }} size="full" showTooltip={true} displayMode="detailed" />
              </div>

              <p className="text-charcoal/80 leading-relaxed mb-6">
                The gold standard of mountain guiding. IFMGA guides complete 3+ years of intensive training 
                covering technical climbing, skiing, mountaineering, avalanche safety, and rescue techniques.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-burgundy flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-charcoal/70">Can guide technical alpine climbing, glacier travel, and ski mountaineering</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-burgundy flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-charcoal/70">Internationally recognized across all mountain ranges</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-burgundy flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-charcoal/70">Required for technical routes and winter mountaineering</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-charcoal/10">
                <p className="text-sm text-charcoal/60">
                  <strong>Training Duration:</strong> 200+ days over 3-5 years<br />
                  <strong>Best For:</strong> Technical alpine routes, glacier crossings, multi-pitch climbing
                </p>
              </div>
            </Card>

            {/* UIMLA */}
            <Card className="p-8 bg-cream border-burgundy/10">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-burgundy rounded-full flex items-center justify-center flex-shrink-0">
                  <Mountain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl text-charcoal" style={{
                  fontFamily: 'Playfair Display, serif'
                }}>
                    UIMLA / IML
                  </h3>
                  <p className="text-sm text-charcoal/60">International Mountain Leader</p>
                </div>
              </div>

              <div className="flex justify-center mb-6">
                <CertificationBadge certification={{
                certificationType: 'standard',
                title: "UIMLA",
                certifyingBody: "International Mountain Leader",
                verificationPriority: 2,
                isPrimary: false
              }} size="full" showTooltip={true} displayMode="detailed" />
              </div>

              <p className="text-charcoal/80 leading-relaxed mb-6">
                Professional mountain leaders trained to guide non-technical mountain terrain, trekking routes, 
                and alpine hiking. Extensive training in navigation, weather, emergency procedures, and group management.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-burgundy flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-charcoal/70">Expert in mountain trekking and non-technical routes</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-burgundy flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-charcoal/70">Wilderness first aid and mountain rescue trained</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-burgundy flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-charcoal/70">Perfect for hut-to-hut treks and non-technical routes</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-charcoal/10">
                <p className="text-sm text-charcoal/60">
                  <strong>Training Duration:</strong> 40-80 days over 1-2 years<br />
                  <strong>Best For:</strong> Alpine trekking, via ferrata, non-technical high routes
                </p>
              </div>
            </Card>
          </div>

        </div>
      </section>

      {/* SECTION 7: Final Conversion - Choose Your Path */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <SmartImage category="landscape" usageContext="trail_junction" tags={['trail', 'path', 'junction', 'mountain']} className="w-full h-full object-cover" alt="Mountain trail junction signpost" />
          <div className="absolute inset-0 bg-charcoal/80" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 text-center">
          <h2 className="text-5xl lg:text-6xl mb-16 text-white" style={{
          fontFamily: 'Playfair Display, serif'
        }}>
            Two Paths. One Community.
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Path 1: Hikers */}
            <Card className="p-8 bg-white text-charcoal hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <Mountain className="w-16 h-16 mx-auto mb-6 text-burgundy" />
              <h3 className="text-3xl mb-4" style={{
              fontFamily: 'Playfair Display, serif'
            }}>
                Find Your Guide
              </h3>
              <p className="text-charcoal/70 mb-6 leading-relaxed">
                Explore {totalRoutes}+ routes across<br />
                Dolomites, Pyrenees, Scottish Highlands
              </p>
              <Button className="w-full bg-burgundy text-white hover:bg-burgundy-dark text-lg py-6 mb-4" onClick={() => navigate('/tours')}>
                Browse Adventures <ArrowRight className="ml-2" />
              </Button>
              <div className="text-sm text-charcoal/60 space-y-1">
                <p>Starting from €120/day</p>
                <p>Multi-day treks available</p>
              </div>
            </Card>

            {/* Path 2: Guides */}
            <Card className="p-8 bg-burgundy text-white hover:shadow-2xl transition-all duration-300 hover:scale-105 border-4 border-burgundy">
              <Users className="w-16 h-16 mx-auto mb-6 text-white" />
              <h3 className="text-3xl mb-4" style={{
              fontFamily: 'Playfair Display, serif'
            }}>
                Become a Guide
              </h3>
              <p className="text-white/90 mb-6 leading-relaxed">
                Own your guiding business<br />
                Keep 95% of revenue
              </p>
              <Button className="w-full bg-white text-burgundy hover:bg-cream text-lg py-6 mb-4" onClick={() => navigate('/guide/signup')}>
                Start Application <ArrowRight className="ml-2" />
              </Button>
              <div className="text-sm text-white/70 space-y-1">
                <p>10-min application</p>
                <p>Verified in 3-5 days</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-charcoal text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Main Footer Content */}
          <div className="text-center mb-12 pb-12 border-b border-white/10">
            <h3 className="text-3xl mb-4 text-burgundy-light" style={{
            fontFamily: 'Playfair Display, serif'
          }}>
              MADETOHIKE
            </h3>
            <p className="text-white/80 mb-6">
              Built by guides, for guides, in the European Alps
            </p>

            <div className="max-w-2xl mx-auto p-6 bg-white/5 rounded-lg">
              <div className="flex items-start gap-4 mb-3">
                <Mountain className="w-6 h-6 text-burgundy-light flex-shrink-0 mt-1" />
                <div className="text-left">
                  <p className="text-white mb-2">
                    <strong>Michel Visser, Founder</strong><br />
                    <span className="text-white/60">UK Mountain Guide | ML Certified</span>
                  </p>
                  <p className="text-white/70 italic text-sm">
                    "I built this because platforms were extracting too much value from guides. We're changing that."
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-burgundy-light" />
                <a href="mailto:hello@madetohike.com" className="text-white/80 hover:text-burgundy-light">
                  hello@madetohike.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-burgundy-light" />
                <span className="text-white/80">Based in European Alps</span>
              </div>
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-burgundy-light" />
                <span className="text-white/80">100% Renewable Energy Hosting</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div>
              <h4 className="text-burgundy-light mb-4 uppercase text-sm tracking-wider">For Hikers</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><button onClick={() => navigate('/tours')} className="hover:text-burgundy-light">Browse Tours</button></li>
                <li><button onClick={() => navigate('/guides')} className="hover:text-burgundy-light">Our Guides</button></li>
                <li><button onClick={() => navigate('/how-it-works')} className="hover:text-burgundy-light">How It Works</button></li>
                <li><button onClick={() => navigate('/safety')} className="hover:text-burgundy-light">Safety Standards</button></li>
                <li><button onClick={() => navigate('/certifications')} className="hover:text-burgundy-light">Certification Reference Guide</button></li>
                <li><button onClick={() => navigate('/reviews')} className="hover:text-burgundy-light">Reviews</button></li>
                <li><button onClick={() => navigate('/custom-requests')} className="hover:text-burgundy-light">Custom Requests</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-burgundy-light mb-4 uppercase text-sm tracking-wider">For Guides</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><button onClick={() => navigate('/guide/signup')} className="hover:text-burgundy-light">Become a Guide</button></li>
                <li><button onClick={() => navigate('/guide/economics')} className="hover:text-burgundy-light">Economics</button></li>
                <li><button onClick={() => navigate('/guide/verification')} className="hover:text-burgundy-light">Verification</button></li>
                <li><button onClick={() => navigate('/guide/resources')} className="hover:text-burgundy-light">Guide Resources</button></li>
                <li><button onClick={() => navigate('/partnerships')} className="hover:text-burgundy-light">Brand Partnerships</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-burgundy-light mb-4 uppercase text-sm tracking-wider">Company</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><button onClick={() => navigate('/about')} className="hover:text-burgundy-light">Our Story</button></li>
                <li><button onClick={() => navigate('/environmental')} className="hover:text-burgundy-light">Environmental Report</button></li>
                <li><button onClick={() => navigate('/press')} className="hover:text-burgundy-light">Press Kit</button></li>
                <li><button onClick={() => navigate('/contact')} className="hover:text-burgundy-light">Contact</button></li>
                <li><button onClick={() => navigate('/careers')} className="hover:text-burgundy-light">Careers</button></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10 text-center text-sm text-white/60">
            <p className="mb-4">
              © 2025 MadeToHike | <button onClick={() => navigate('/privacy')} className="hover:text-burgundy-light">Privacy Policy</button> | <button onClick={() => navigate('/terms')} className="hover:text-burgundy-light">Terms</button> | GDPR Compliant
            </p>
            <p className="text-xs">
              Hosted on renewable energy (Hetzner, DE) | Payment processing by Stripe
            </p>
          </div>
        </div>
      </footer>
    </div>;
}
