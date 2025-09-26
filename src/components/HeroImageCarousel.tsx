import { useState, useEffect } from 'react';
import { SmartImage } from './SmartImage';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroImage {
  category: string;
  usageContext: string;
  tags: string[];
  fallbackSrc: string;
  alt: string;
  title: string;
  subtitle: string;
  cta?: {
    text: string;
    action: () => void;
  };
}

interface HeroImageCarouselProps {
  images: HeroImage[];
  autoPlay?: boolean;
  interval?: number;
  className?: string;
}

export function HeroImageCarousel({ 
  images, 
  autoPlay = true, 
  interval = 5000,
  className = ''
}: HeroImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  if (images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div className={`relative h-screen overflow-hidden ${className}`}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <SmartImage
          category={currentImage.category}
          usageContext={currentImage.usageContext}
          tags={currentImage.tags}
          className="w-full h-full object-cover"
          fallbackSrc={currentImage.fallbackSrc}
          alt={currentImage.alt}
          priority="high"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-center text-center text-white">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            {currentImage.title}
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 animate-fade-in-delay">
            {currentImage.subtitle}
          </p>
          {currentImage.cta && (
            <Button 
              size="lg" 
              onClick={currentImage.cta.action}
              className="text-lg px-8 py-6 h-auto bg-primary hover:bg-primary/90 animate-fade-in-delay-2"
            >
              {currentImage.cta.text}
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm transition-all"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm transition-all"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        </>
      )}

      {/* Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}