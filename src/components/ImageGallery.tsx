import { SmartImage } from './SmartImage';
import { Card } from './ui/card';

interface GalleryImage {
  category: string;
  usageContext: string;
  tags: string[];
  fallbackSrc: string;
  alt: string;
  title?: string;
  subtitle?: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  columns?: 2 | 3 | 4;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
  showOverlay?: boolean;
  className?: string;
}

export function ImageGallery({ 
  images, 
  columns = 3, 
  aspectRatio = 'portrait', 
  showOverlay = true,
  className = ''
}: ImageGalleryProps) {
  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'square': return 'aspect-square';
      case 'landscape': return 'aspect-video';
      case 'portrait': return 'aspect-[4/5]';
      default: return 'aspect-[4/5]';
    }
  };

  const getColumnsClass = () => {
    switch (columns) {
      case 2: return 'grid-cols-1 md:grid-cols-2';
      case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  return (
    <div className={`grid ${getColumnsClass()} gap-6 ${className}`}>
      {images.map((image, index) => (
        <div 
          key={index}
          className={`relative ${getAspectClass()} rounded-xl overflow-hidden group cursor-pointer`}
        >
          <SmartImage
            category={image.category}
            usageContext={image.usageContext}
            tags={image.tags}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            fallbackSrc={image.fallbackSrc}
            alt={image.alt}
          />
          {showOverlay && (image.title || image.subtitle) && (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                {image.title && (
                  <h3 className="text-xl font-bold mb-1">{image.title}</h3>
                )}
                {image.subtitle && (
                  <p className="text-sm opacity-90">{image.subtitle}</p>
                )}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export function FeaturedImageSection({
  title,
  subtitle,
  images,
  className = '',
  onViewMore
}: {
  title: string;
  subtitle?: string;
  images: GalleryImage[];
  className?: string;
  onViewMore?: () => void;
}) {
  return (
    <section className={`py-20 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">{title}</h2>
          {subtitle && (
            <p className="text-xl text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <ImageGallery 
          images={images}
          columns={3}
          aspectRatio="portrait"
          className="max-w-6xl mx-auto"
        />

        {onViewMore && (
          <div className="text-center mt-12">
            <button
              onClick={onViewMore}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg text-lg hover:bg-primary/90 transition-colors"
            >
              View More Adventures
            </button>
          </div>
        )}
      </div>
    </section>
  );
}