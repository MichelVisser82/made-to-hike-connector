import { useState } from 'react';
import { Camera, ChevronDown, ChevronUp, Eye, X } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent } from '../ui/dialog';

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
  const [startIndex, setStartIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<Photo | null>(null);

  const filteredPhotos = selectedCategory === 'all' 
    ? photos 
    : photos.filter(p => p.category === selectedCategory);

  const displayedPhotos = filteredPhotos.slice(startIndex, startIndex + 9);
  const hasMore = startIndex + 9 < filteredPhotos.length;
  const hasPrevious = startIndex > 0;

  const handleLoadMore = () => {
    setStartIndex(prev => prev + 3);
  };

  const handleShowPrevious = () => {
    setStartIndex(prev => Math.max(0, prev - 3));
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setStartIndex(0); // Reset to start when changing category
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

      {/* Show Previous Button */}
      {hasPrevious && (
        <div className="flex justify-center">
          <Button
            onClick={handleShowPrevious}
            variant="outline"
            className="border-burgundy text-burgundy hover:bg-burgundy hover:text-white transition-colors gap-2"
          >
            <ChevronUp className="h-4 w-4 animate-bounce" />
            Show Previous Photos
          </Button>
        </div>
      )}

      {/* Photo Grid - Mobile: Horizontal Scroll | Desktop: Grid */}
      <div className="lg:hidden">
        {/* Mobile: Horizontal Scroll with Peek */}
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 pb-4">
          {displayedPhotos.map((photo, index) => (
            <div 
              key={index} 
              className="relative flex-shrink-0 w-[85%] aspect-square rounded-lg overflow-hidden group cursor-pointer shadow-lg active:shadow-elegant transition-all duration-300 snap-start"
              onClick={() => setSelectedImage(photo)}
            >
              <img
                src={photo.url}
                alt={photo.alt || `${guideName} tour photo ${index + 1}`}
                className="w-full h-full object-cover active:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-charcoal/0 active:bg-charcoal/20 transition-colors" />
              
              {/* Eye Icon Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 active:opacity-100 transition-opacity duration-300">
                <div className="bg-white/90 rounded-full p-3 backdrop-blur-sm">
                  <Eye className="h-6 w-6 text-burgundy" />
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-charcoal/60 to-transparent" />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: Grid Layout */}
      <div className={`hidden lg:grid gap-4 ${
        displayedPhotos.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
        displayedPhotos.length === 2 ? 'grid-cols-2 max-w-2xl mx-auto' :
        displayedPhotos.length <= 4 ? 'grid-cols-2 max-w-3xl mx-auto' :
        'grid-cols-3'
      }`}>
        {displayedPhotos.map((photo, index) => (
          <div 
            key={index} 
            className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer shadow-lg hover:shadow-elegant transition-all duration-300 animate-fade-in"
            onClick={() => setSelectedImage(photo)}
          >
            <img
              src={photo.url}
              alt={photo.alt || `${guideName} tour photo ${index + 1}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/30 transition-colors" />
            
            {/* Eye Icon Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white/90 rounded-full p-4 backdrop-blur-sm transform group-hover:scale-110 transition-transform duration-300">
                <Eye className="h-8 w-8 text-burgundy" />
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-charcoal/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>

      {/* Image Lightbox Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-charcoal/95 border-none">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 rounded-full p-2 backdrop-blur-sm transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6 text-white" />
          </button>
          {selectedImage && (
            <div className="w-full h-full flex items-center justify-center p-6">
              <img
                src={selectedImage.url}
                alt={selectedImage.alt || 'Enlarged photo'}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

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
