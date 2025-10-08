import { useState, useMemo, useEffect } from 'react';
import { Search, Mountain } from 'lucide-react';
import { useWebsiteImages } from '@/hooks/useWebsiteImages';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAllGuides } from '@/hooks/useAllGuides';
import { GuideCard } from '@/components/guide/GuideCard';
import { GuideFilters } from '@/components/guide/GuideFilters';
import { QuickFilters } from '@/components/guide/QuickFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

type SortOption = 'featured' | 'rating' | 'experience' | 'price';

export function GuidesSearchPage() {
  const navigate = useNavigate();
  const { data: guides, isLoading } = useAllGuides();
  const { fetchImages, getImageUrl } = useWebsiteImages();
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadHeroImage = async () => {
      const images = await fetchImages({ category: 'hero', usage_context: 'guides-page' });
      if (images && images.length > 0) {
        setHeroImageUrl(getImageUrl(images[0]));
      } else {
        // Fallback to any hero or landscape image
        const fallbackImages = await fetchImages({ category: 'hero' });
        if (fallbackImages && fallbackImages.length > 0) {
          setHeroImageUrl(getImageUrl(fallbackImages[0]));
        }
      }
    };
    loadHeroImage();
  }, [fetchImages, getImageUrl]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [filters, setFilters] = useState({
    location: 'all',
    specialties: [] as string[],
    certifications: [] as string[],
    priceRange: 'all',
    difficultyLevels: [] as string[],
  });

  // Extract unique locations from guides
  const availableLocations = useMemo(() => {
    if (!guides) return [];
    const locations = guides
      .map(g => g.location)
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i);
    return locations.sort();
  }, [guides]);

  // Extract available specialties from guides
  const availableSpecialties = useMemo(() => {
    if (!guides) return [];
    const specialties = new Set<string>();
    guides.forEach(guide => {
      guide.specialties?.forEach(s => specialties.add(s));
    });
    return Array.from(specialties).sort();
  }, [guides]);

  // Extract available certifications from guides
  const availableCertifications = useMemo(() => {
    if (!guides) return [];
    const certIds = new Set<string>();
    guides.forEach(guide => {
      guide.certifications?.forEach(c => certIds.add(c.certificationId));
    });
    return Array.from(certIds);
  }, [guides]);

  // Extract available difficulty levels from guides
  const availableDifficultyLevels = useMemo(() => {
    if (!guides) return [];
    const levels = new Set<string>();
    guides.forEach(guide => {
      guide.difficulty_levels?.forEach(d => levels.add(d));
    });
    return Array.from(levels).sort();
  }, [guides]);

  // Calculate available price ranges based on actual guide pricing
  const availablePriceRanges = useMemo(() => {
    if (!guides) return [];
    const rates = guides.map(g => g.daily_rate).filter(Boolean);
    if (rates.length === 0) return [];
    
    const ranges = [];
    if (rates.some(r => r <= 200)) ranges.push({ value: '0-200', label: '€0 - €200' });
    if (rates.some(r => r > 200 && r <= 400)) ranges.push({ value: '200-400', label: '€200 - €400' });
    if (rates.some(r => r > 400 && r <= 600)) ranges.push({ value: '400-600', label: '€400 - €600' });
    if (rates.some(r => r > 600)) ranges.push({ value: '600+', label: '€600+' });
    
    return ranges;
  }, [guides]);

  // Filter and sort guides
  const filteredGuides = useMemo(() => {
    if (!guides) return [];

    let filtered = guides;

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(guide => 
        guide.display_name.toLowerCase().includes(query) ||
        guide.location?.toLowerCase().includes(query) ||
        guide.bio?.toLowerCase().includes(query) ||
        guide.specialties?.some(s => s.toLowerCase().includes(query))
      );
    }

    // Location filter
    if (filters.location !== 'all') {
      filtered = filtered.filter(guide => guide.location === filters.location);
    }

    // Specialties filter
    if (filters.specialties.length > 0) {
      filtered = filtered.filter(guide =>
        guide.specialties?.some(s => 
          filters.specialties.some(fs => s.toLowerCase().includes(fs.toLowerCase()))
        )
      );
    }

    // Certifications filter
    if (filters.certifications.length > 0) {
      filtered = filtered.filter(guide =>
        guide.certifications?.some(c => 
          filters.certifications.includes(c.certificationId)
        )
      );
    }

    // Price range filter
    if (filters.priceRange !== 'all' && filters.priceRange) {
      filtered = filtered.filter(guide => {
        if (!guide.daily_rate) return false;
        const rate = guide.daily_rate;
        
        if (filters.priceRange === '0-200') return rate <= 200;
        if (filters.priceRange === '200-400') return rate > 200 && rate <= 400;
        if (filters.priceRange === '400-600') return rate > 400 && rate <= 600;
        if (filters.priceRange === '600+') return rate > 600;
        
        return true;
      });
    }

    // Difficulty levels filter
    if (filters.difficultyLevels.length > 0) {
      filtered = filtered.filter(guide =>
        guide.difficulty_levels?.some(d => filters.difficultyLevels.includes(d))
      );
    }

    // Sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'featured':
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return b.average_rating - a.average_rating;
        
        case 'rating':
          return b.average_rating - a.average_rating || b.reviews_count - a.reviews_count;
        
        case 'experience':
          return (b.experience_years || 0) - (a.experience_years || 0);
        
        case 'price':
          return (a.daily_rate || 999999) - (b.daily_rate || 999999);
        
        default:
          return 0;
      }
    });

    return sorted;
  }, [guides, searchQuery, filters, sortBy]);

  const handleToggleSpecialty = (specialty: string) => {
    const newSpecialties = filters.specialties.includes(specialty)
      ? filters.specialties.filter(s => s !== specialty)
      : [...filters.specialties, specialty];
    
    setFilters({ ...filters, specialties: newSpecialties });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-br from-gray-900 to-gray-800">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: heroImageUrl 
              ? `url(${heroImageUrl})` 
              : 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2000&q=80)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/15 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-32 md:h-40 bg-gradient-to-b from-transparent to-cream-light" />
        </div>
        
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-serif text-white mb-6">
            Find Your Perfect Guide
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Connect with certified mountain guides across Europe for unforgettable hiking adventures
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, location, or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg bg-white"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Filters */}
      <section className="border-b bg-background">
        <div className="container mx-auto px-4 py-6">
          <QuickFilters
            selectedSpecialties={filters.specialties}
            onToggleSpecialty={handleToggleSpecialty}
            availableSpecialties={availableSpecialties}
          />
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        {/* Filters and Sort */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <GuideFilters
            filters={filters}
            onFilterChange={setFilters}
            availableLocations={availableLocations}
            availableSpecialties={availableSpecialties}
            availableCertifications={availableCertifications}
            availableDifficultyLevels={availableDifficultyLevels}
            availablePriceRanges={availablePriceRanges}
          />

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {filteredGuides.length} {filteredGuides.length === 1 ? 'guide' : 'guides'} found
            </span>
            
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="experience">Most Experience</SelectItem>
                <SelectItem value="price">Lowest Price</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[4/3] w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && filteredGuides.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuides.map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredGuides.length === 0 && (
          <div className="text-center py-16">
            <Mountain className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No guides found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or search query
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setFilters({
                  location: 'all',
                  specialties: [],
                  certifications: [],
                  priceRange: 'all',
                  difficultyLevels: [],
                });
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </section>

      {/* CTA Footer */}
      <section className="bg-[#881337] text-white py-16 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">
            Are you a certified mountain guide?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Join our community of professional guides and connect with adventurers seeking authentic mountain experiences
          </p>
          <Button
            size="lg"
            variant="outline"
            className="bg-white text-[#881337] hover:bg-white/90 border-white"
            onClick={() => navigate('/guide/signup')}
          >
            Become a Guide
          </Button>
        </div>
      </section>
    </div>
  );
}
