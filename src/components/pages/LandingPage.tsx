import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Star, MapPin, Users, Shield, Calendar, Search, CheckCircle } from 'lucide-react';
import { type User } from '../../types';

interface LandingPageProps {
  onNavigateToSearch: (filters?: any) => void;
  onShowAuth: () => void;
  onShowGuideSignup: () => void;
  user: User | null;
  onNavigateToDashboard: () => void;
}

export function LandingPage({ onNavigateToSearch, onShowAuth, onShowGuideSignup, user, onNavigateToDashboard }: LandingPageProps) {
  const [selectedRegion, setSelectedRegion] = useState(0);

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedRegion(prev => (prev + 1) % regions.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const regions = [
    {
      name: 'Dolomites',
      country: 'Italy',
      tours: 47,
      difficulty: 'Easy - Expert',
      bestSeason: 'May - October',
      description: 'Dramatic limestone peaks and alpine meadows',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop'
    },
    {
      name: 'Pyrenees',
      country: 'France/Spain',
      tours: 32,
      difficulty: 'Moderate - Expert',
      bestSeason: 'June - September',
      description: 'Pristine wilderness between France and Spain',
      image: 'https://images.unsplash.com/photo-1464822759844-d150ad6d1904?w=800&h=500&fit=crop'
    },
    {
      name: 'Scottish Highlands',
      country: 'Scotland',
      tours: 28,
      difficulty: 'Easy - Challenging',
      bestSeason: 'April - October',
      description: 'Rugged landscapes and ancient castles',
      image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&h=500&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1464822759844-d150ad6d1904?w=1920&h=1080&fit=crop')] bg-cover bg-center opacity-5" />
        <div className="relative container mx-auto px-4 pt-20 pb-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Find Your Next
              <br />
              <span className="text-primary">Hiking Adventure</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              One hiking step away from nature. Join hand-selected, certified
              guides for unforgettable experiences across Europe's most
              stunning mountain ranges.
            </p>
            <Button 
              size="lg" 
              onClick={() => onNavigateToSearch()}
              className="text-lg px-8 py-6 h-auto"
            >
              <Search className="mr-2 h-5 w-5" />
              Find Your Next Hiking Adventure
            </Button>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 mt-16 text-sm">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-accent fill-current" />
                <span className="font-medium">4.9/5</span> Average Rating
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="font-medium">1,200+</span> Happy Hikers
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-medium">100%</span> Verified Guides
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Our Regions */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Explore Our Regions</h2>
            <p className="text-xl text-muted-foreground">
              Three incredible mountain ranges, countless adventures waiting for you
            </p>
          </div>

          {/* Region Carousel */}
          <div className="relative max-w-6xl mx-auto">
            <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-8">
              <img
                src={regions[selectedRegion].image}
                alt={regions[selectedRegion].name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-8 left-8 text-white">
                <h3 className="text-3xl font-bold mb-2">{regions[selectedRegion].name}</h3>
                <p className="text-lg opacity-90">{regions[selectedRegion].description}</p>
              </div>
            </div>

            {/* Region Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {regions.map((region, index) => (
                <Card
                  key={region.name}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    index === selectedRegion ? 'ring-2 ring-primary shadow-lg' : ''
                  }`}
                  onClick={() => setSelectedRegion(index)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-semibold">{region.name}</h4>
                        <p className="text-sm text-muted-foreground">{region.country}</p>
                      </div>
                      <Badge variant="secondary">{region.tours} tours</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{region.difficulty}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{region.bestSeason}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToSearch({ region: region.name.toLowerCase() });
                      }}
                    >
                      Explore {region.name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Certified Guides</h3>
              <p className="text-muted-foreground">
                All our guides are professionally certified and thoroughly vetted for your safety.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Reviews</h3>
              <p className="text-muted-foreground">
                Read authentic reviews from real hikers who've experienced these adventures.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Small Groups</h3>
              <p className="text-muted-foreground">
                Intimate group sizes ensure personalized attention and better experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready for Your Adventure?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied hikers who've discovered their perfect mountain adventure with us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => onNavigateToSearch()}>
              <Search className="mr-2 h-5 w-5" />
              Start Exploring
            </Button>
            {!user && (
              <Button variant="outline" size="lg" onClick={onShowGuideSignup}>
                Become a Guide
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}