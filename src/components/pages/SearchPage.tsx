import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { TourCard } from '../tour/TourCard';
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
            <TourCard
              key={tour.id}
              tour={tour}
              onTourClick={onTourClick}
              onBookTour={onBookTour}
            />
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