import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface GuidePortfolioGalleryProps {
  images: string[];
}

export function GuidePortfolioGallery({ images }: GuidePortfolioGalleryProps) {
  const [showAll, setShowAll] = useState(false);
  
  if (!images || images.length === 0) return null;

  const displayImages = showAll ? images : images.slice(0, 6);

  return (
    <section className="py-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Tour Photography</h2>
        {images.length > 6 && (
          <button 
            onClick={() => setShowAll(!showAll)}
            className="text-primary hover:underline flex items-center gap-1"
          >
            {showAll ? 'Show Less' : 'Load More'} <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayImages.map((image, index) => (
          <div 
            key={index} 
            className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
          >
            <img
              src={image}
              alt={`Tour photography ${index + 1}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </div>
        ))}
      </div>
    </section>
  );
}
