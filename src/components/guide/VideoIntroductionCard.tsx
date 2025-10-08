import { Play, Video, X } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { useState } from 'react';
import { createPortal } from 'react-dom';

interface VideoIntroductionCardProps {
  videoUrl?: string;
  thumbnailUrl?: string;
  guideName: string;
}

export function VideoIntroductionCard({ videoUrl, thumbnailUrl, guideName }: VideoIntroductionCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    if (videoUrl) {
      setIsModalOpen(true);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Card className="border-burgundy/20 shadow-lg bg-cream overflow-hidden">
        <CardContent className="p-0">
          <div 
            className={`relative aspect-video bg-charcoal/10 group ${videoUrl ? 'cursor-pointer' : ''}`}
            onClick={handleClick}
          >
            {thumbnailUrl ? (
              <>
                <img
                  src={thumbnailUrl}
                  alt={`${guideName} introduction video`}
                  className="w-full h-full object-cover"
                />
                {/* Grey gradient overlay with video icon */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-charcoal/20 to-transparent flex items-center justify-center">
                  <Video className="h-12 w-12 text-white/90" />
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-burgundy/10 to-burgundy/5">
                <Video className="h-16 w-16 text-burgundy/40" />
              </div>
            )}
            
            {/* Play Button Overlay - only show if video exists */}
            {videoUrl && (
              <div className="absolute inset-0 bg-charcoal/30 flex items-center justify-center group-hover:bg-charcoal/40 transition-colors">
                <div className="w-16 h-16 rounded-full bg-burgundy flex items-center justify-center shadow-elegant group-hover:scale-110 transition-transform">
                  <Play className="h-8 w-8 text-white ml-1" />
                </div>
              </div>
            )}
            
            {/* Coming Soon Badge - show if no video */}
            {!videoUrl && (
              <div className="absolute top-4 right-4 bg-burgundy text-white px-3 py-1 rounded-full text-xs font-medium">
                Coming Soon
              </div>
            )}
          </div>
          
          <div className="p-4">
            <h4 className="font-semibold mb-1 text-charcoal" style={{fontFamily: 'Playfair Display, serif'}}>
              Meet {guideName}
            </h4>
            <p className="text-sm text-charcoal/70">
              {videoUrl 
                ? 'Watch introduction to learn more about my guiding style and experience'
                : 'Video introduction coming soon'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Fixed Position Modal - Rendered in Portal */}
      {isModalOpen && videoUrl && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
          onClick={handleClose}
        >
          <div 
            className="relative w-full max-w-4xl bg-charcoal rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute -top-10 right-0 text-white hover:text-burgundy transition-colors"
              aria-label="Close video"
            >
              <X className="h-8 w-8" />
            </button>

            {/* Video Container */}
            <div className="aspect-video">
              <iframe
                src={videoUrl}
                title={`${guideName} introduction video`}
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
