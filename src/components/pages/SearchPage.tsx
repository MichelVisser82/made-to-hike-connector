import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Star, MapPin, Users, Clock, ArrowLeft } from 'lucide-react';
import { type Tour, type SearchFilters } from '../../types';

interface SearchPageProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onTourClick: (tour: Tour) => void;
  onBookTour: (tour: Tour) => void;
}

export function SearchPage({ filters, onFiltersChange, onTourClick, onBookTour }: SearchPageProps) {
  // Mock tours data
  const tours: Tour[] = [
    {
      id: '1',
      title: 'Dolomites High Alpine Circuit',
      guide_id: 'guide1',
      guide_name: 'Marco Alpine',
      guide_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      region: 'dolomites',
      difficulty: 'challenging',
      duration: '5 days',
      group_size: 8,
      price: 890,
      currency: 'EUR',
      description: 'Experience the dramatic limestone peaks of the Dolomites on this challenging multi-day trek through UNESCO World Heritage landscapes.',
      highlights: ['Tre Cime di Lavaredo', 'Seceda Ridge', 'Alpe di Siusi'],
      includes: ['Professional guide', 'Accommodation', 'All meals', 'Safety equipment'],
      meeting_point: 'Bolzano Train Station',
      images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'],
      available_dates: ['2024-06-15', '2024-07-10', '2024-08-05'],
      rating: 4.9,
      reviews_count: 47,
      created_at: '2024-01-15'
    },
    {
      id: '2',
      title: 'Scottish Highlands Adventure',
      guide_id: 'guide2',
      guide_name: 'Sarah Mountain',
      guide_avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=100&h=100&fit=crop&crop=face',
      region: 'scotland',
      difficulty: 'moderate',
      duration: '3 days',
      group_size: 6,
      price: 450,
      currency: 'GBP',
      description: 'Discover the rugged beauty of the Scottish Highlands with breathtaking lochs, ancient castles, and dramatic mountain vistas.',
      highlights: ['Ben Nevis Views', 'Glen Coe Valley', 'Loch Katrine'],
      includes: ['Expert guide', 'Transportation', 'Lunch daily', 'Safety gear'],
      meeting_point: 'Glasgow Central Station',
      images: ['https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&h=600&fit=crop'],
      available_dates: ['2024-05-20', '2024-06-25', '2024-07-30'],
      rating: 4.8,
      reviews_count: 32,
      created_at: '2024-01-10'
    }
  ];

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
            Showing {filteredTours.length} tour{filteredTours.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Tour Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTours.map((tour) => (
            <Card key={tour.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <div onClick={() => onTourClick(tour)}>
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={tour.images[0]}
                    alt={tour.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <Badge
                    className="absolute top-3 left-3"
                    variant={tour.difficulty === 'easy' ? 'secondary' : 
                            tour.difficulty === 'moderate' ? 'default' : 'destructive'}
                  >
                    {tour.difficulty}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="mb-3">
                  <h3 
                    className="text-lg font-semibold mb-1 hover:text-primary cursor-pointer"
                    onClick={() => onTourClick(tour)}
                  >
                    {tour.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <img
                      src={tour.guide_avatar}
                      alt={tour.guide_name}
                      className="w-5 h-5 rounded-full"
                    />
                    <span>by {tour.guide_name}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
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
                  <div className="text-lg font-semibold">
                    {tour.currency === 'EUR' ? '€' : '£'}{tour.price}
                  </div>
                  <Button 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookTour(tour);
                    }}
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