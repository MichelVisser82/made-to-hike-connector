import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Star, MapPin, Users, Clock, ArrowLeft } from 'lucide-react';
import { SmartImage } from '../SmartImage';
import { type Tour, type SearchFilters } from '../../types';
import { supabase } from '@/integrations/supabase/client';

interface SearchPageProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onTourClick: (tour: Tour) => void;
  onBookTour: (tour: Tour) => void;
}

export function SearchPage({ filters, onFiltersChange, onTourClick, onBookTour }: SearchPageProps) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setTours(data as Tour[]);
      }
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTours = tours.filter(tour => {
    if (filters.region && tour.region !== filters.region.toLowerCase()) return false;
    if (filters.difficulty && tour.difficulty !== filters.difficulty.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Your Perfect Hiking Adventure</h1>
          <p className="text-muted-foreground">
            Discover expertly guided tours across Europe's most stunning mountain ranges
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 p-6 bg-card rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Region</label>
              <select
                value={filters.region}
                onChange={(e) => onFiltersChange({ ...filters, region: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">All Regions</option>
                <option value="dolomites">Dolomites</option>
                <option value="pyrenees">Pyrenees</option>
                <option value="scotland">Scottish Highlands</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <select
                value={filters.difficulty}
                onChange={(e) => onFiltersChange({ ...filters, difficulty: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">All Levels</option>
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="challenging">Challenging</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => onFiltersChange({ ...filters, dateRange: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">Any Time</option>
                <option value="next-month">Next Month</option>
                <option value="summer">Summer 2024</option>
                <option value="autumn">Autumn 2024</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Price</label>
              <select
                value={filters.maxPrice}
                onChange={(e) => onFiltersChange({ ...filters, maxPrice: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">Any Price</option>
                <option value="500">Under €500</option>
                <option value="1000">Under €1000</option>
                <option value="1500">Under €1500</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {loading ? 'Loading tours...' : `Showing ${filteredTours.length} tour${filteredTours.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Tour Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTours.map((tour) => (
            <Card key={tour.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <div onClick={() => onTourClick(tour)}>
                <div className="aspect-[4/5] relative overflow-hidden">
                  <SmartImage
                    category="tour"
                    usageContext={tour.region}
                    tags={[tour.region, tour.difficulty, 'landscape', 'hiking']}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    fallbackSrc="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=500&fit=crop"
                    alt={`${tour.title} - ${tour.region} hiking tour`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <Badge
                    className="absolute top-4 left-4 bg-white/90 text-foreground hover:bg-white"
                    variant="secondary"
                  >
                    {tour.difficulty}
                  </Badge>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-lg font-bold mb-1 group-hover:text-primary-foreground transition-colors">
                      {tour.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm opacity-90">
                      {tour.guide_display_name && (
                        <>
                          <SmartImage
                            category="guide"
                            usageContext="avatar"
                            tags={['portrait', 'guide', 'professional']}
                            className="w-5 h-5 rounded-full object-cover"
                            fallbackSrc="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                            alt={`${tour.guide_display_name} - Professional hiking guide`}
                          />
                          <span>by {tour.guide_display_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="capitalize">{tour.region.replace('-', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{tour.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>Max {tour.group_size} people</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-accent fill-current" />
                    <span>{tour.rating} ({tour.reviews_count} reviews)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xl font-bold text-primary">
                    {tour.currency === 'EUR' ? '€' : '£'}{tour.price}
                  </div>
                  <Button 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookTour(tour);
                    }}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Book Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTours.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground mb-4">
              No tours found matching your criteria
            </p>
            <Button
              variant="outline"
              onClick={() => onFiltersChange({ region: '', difficulty: '', dateRange: '', maxPrice: '' })}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}