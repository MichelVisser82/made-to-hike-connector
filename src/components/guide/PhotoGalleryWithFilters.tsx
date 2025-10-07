import { useState } from 'react';
import { Camera, ChevronDown } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export interface Photo {
  url: string;
  category: 'all' | 'tours' | 'landscapes' | 'groups' | 'action';
  alt?: string;
}

interface PhotoGalleryWithFiltersProps {
  photos: Photo[];
  guideName: string;
}

const categories = [
  { id: 'all', label: 'All Photos' },
  { id: 'tours', label: 'Tours' },
  { id: 'landscapes', label: 'Landscapes' },
  { id: 'groups', label: 'Groups' },
  { id: 'action', label: 'Action' },
] as const;

export function PhotoGalleryWithFilters({ photos, guideName }: PhotoGalleryWithFiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState(9);

  const filteredPhotos = selectedCategory === 'all' 
    ? photos 
    : photos.filter(p => p.category === selectedCategory);

  const displayedPhotos = filteredPhotos.slice(0, visibleCount);
  const hasMore = filteredPhotos.length > visibleCount;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 9);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setVisibleCount(9); // Reset to 9 when changing category
  };

  if (!photos || photos.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Badge
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`cursor-pointer transition-all px-4 py-2 ${
              selectedCategory === cat.id
                ? 'bg-burgundy text-white border-burgundy hover:bg-burgundy/90'
                : 'bg-cream border-burgundy/30 text-burgundy hover:bg-burgundy/10'
            }`}
          >
            {cat.label}
          </Badge>
        ))}
      </div>

      {/* Photo Grid */}
      <div className={`grid gap-4 ${
        displayedPhotos.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
        displayedPhotos.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto' :
        displayedPhotos.length <= 4 ? 'grid-cols-2 lg:grid-cols-2 max-w-3xl mx-auto' :
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      }`}>
        {displayedPhotos.map((photo, index) => (
          <div 
            key={index} 
            className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer shadow-lg hover:shadow-elegant transition-all duration-300 animate-fade-in"
          >
            <img
              src={photo.url}
              alt={photo.alt || `${guideName} tour photo ${index + 1}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors" />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-charcoal/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-6">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            className="border-burgundy text-burgundy hover:bg-burgundy hover:text-white transition-colors gap-2"
          >
            Load More Photos
            <ChevronDown className="h-4 w-4 animate-bounce" />
          </Button>
        </div>
      )}

      {filteredPhotos.length === 0 && (
        <div className="text-center py-12 text-charcoal/60">
          <Camera className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>No photos in this category yet</p>
        </div>
      )}
    </div>
  );
}
