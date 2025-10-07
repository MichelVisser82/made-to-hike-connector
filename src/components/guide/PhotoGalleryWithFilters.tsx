import { useState } from 'react';
import { Camera } from 'lucide-react';
import { Badge } from '../ui/badge';

interface Photo {
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

  const filteredPhotos = selectedCategory === 'all' 
    ? photos 
    : photos.filter(p => p.category === selectedCategory);

  if (!photos || photos.length === 0) return null;

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold mb-6" style={{fontFamily: 'Playfair Display, serif'}}>
        {guideName} - Adventure Gallery
      </h2>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <Badge
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`cursor-pointer transition-colors ${
              selectedCategory === cat.id
                ? 'bg-burgundy text-white border-burgundy'
                : 'bg-burgundy/10 text-burgundy border-burgundy/20 hover:bg-burgundy/20'
            }`}
          >
            {cat.label}
          </Badge>
        ))}
      </div>

      {/* Photo Grid - Masonry Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPhotos.map((photo, index) => (
          <div 
            key={index} 
            className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer shadow-lg hover:shadow-elegant transition-shadow"
          >
            <img
              src={photo.url}
              alt={photo.alt || `${guideName} tour photo ${index + 1}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors" />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-charcoal/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>

      {filteredPhotos.length === 0 && (
        <div className="text-center py-12 text-charcoal/60">
          <Camera className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>No photos in this category yet</p>
        </div>
      )}
    </section>
  );
}
