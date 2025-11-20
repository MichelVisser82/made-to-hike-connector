import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { TourCard } from '../tour/TourCard';
import { type Tour } from '../../types';
import { supabase } from '@/integrations/supabase/client';
import { useCountries, useRegionsByCountry, useSubregionsByRegion } from '@/hooks/useHikingRegions';

interface GuideOption {
  user_id: string;
  display_name: string;
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tours, setTours] = useState<Tour[]>([]);
  const [guides, setGuides] = useState<GuideOption[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Read filters from URL
  const country = searchParams.get('country') || '';
  const region = searchParams.get('region') || '';
  const subregion = searchParams.get('subregion') || '';
  const difficulty = searchParams.get('difficulty') || '';
  const dateRange = searchParams.get('dateRange') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const guideId = searchParams.get('guide') || '';

  // Fetch hierarchical region data
  const { countries } = useCountries();
  const { regions, hasRegions } = useRegionsByCountry(country);
  const { subregions } = useSubregionsByRegion(country, region);

  useEffect(() => {
    fetchTours();
    fetchGuides();
  }, []);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .eq('is_active', true)
        .eq('is_custom_tour', false) // Exclude custom tours from public search
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

  const fetchGuides = async () => {
    try {
      const { data, error } = await supabase
        .from('guide_profiles')
        .select('user_id, display_name')
        .eq('verified', true)
        .order('display_name', { ascending: true });

      if (error) throw error;

      if (data) {
        setGuides(data as GuideOption[]);
      }
    } catch (error) {
      console.error('Error fetching guides:', error);
    }
  };

  const filteredTours = tours.filter(tour => {
    // Safety check: exclude custom tours
    if (tour.is_custom_tour) return false;
    // Hierarchical region filtering using new structured columns
    if (country && (tour as any).region_country !== country) return false;
    if (region && (tour as any).region_region !== region) return false;
    if (subregion && (tour as any).region_subregion !== subregion) return false;
    if (difficulty && tour.difficulty !== difficulty.toLowerCase()) return false;
    if (guideId && tour.guide_id !== guideId) return false;
    return true;
  });
  
  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };
  
  const clearFilters = () => {
    setSearchParams({});
  };
  
  const handleTourClick = (tour: Tour) => {
    navigate(`/tours/${tour.slug}`);
  };
  
  const handleBookTour = (tour: Tour) => {
    navigate(`/tours/${tour.slug}`);
  };

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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <select
                value={country}
                onChange={(e) => {
                  updateFilter('country', e.target.value);
                  // Clear region/subregion when country changes
                  if (e.target.value !== country) {
                    updateFilter('region', '');
                    updateFilter('subregion', '');
                  }
                }}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">All Countries</option>
                {countries?.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            {country && hasRegions && (
              <div>
                <label className="block text-sm font-medium mb-2">Region</label>
                <select
                  value={region}
                  onChange={(e) => {
                    updateFilter('region', e.target.value);
                    // Clear subregion when region changes
                    if (e.target.value !== region) {
                      updateFilter('subregion', '');
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="">All Regions</option>
                  {regions?.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            )}
            {country && (hasRegions ? region : true) && (
              <div>
                <label className="block text-sm font-medium mb-2">Subregion</label>
                <select
                  value={subregion}
                  onChange={(e) => updateFilter('subregion', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="">All Subregions</option>
                  {subregions?.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => updateFilter('difficulty', e.target.value)}
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
              <label className="block text-sm font-medium mb-2">Guide</label>
              <select
                value={guideId}
                onChange={(e) => updateFilter('guide', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">All Guides</option>
                {guides.map((guide) => (
                  <option key={guide.user_id} value={guide.user_id}>
                    {guide.display_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => updateFilter('dateRange', e.target.value)}
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
                value={maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">Any Price</option>
                <option value="500">Under €500</option>
                <option value="1000">Under €1000</option>
                <option value="1500">Under €1500</option>
              </select>
            </div>
          </div>
          {(country || region || subregion || difficulty || guideId || dateRange || maxPrice) && (
            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="w-full md:w-auto"
              >
                Clear All Filters
              </Button>
            </div>
          )}
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
              onTourClick={handleTourClick}
              onBookTour={handleBookTour}
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
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          </div>
        )}
        </div>
      </div>
  );
}