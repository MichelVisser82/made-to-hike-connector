import { Play, Video } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

interface VideoIntroductionCardProps {
  videoUrl?: string;
  thumbnailUrl?: string;
  guideName: string;
}

export function VideoIntroductionCard({ videoUrl, thumbnailUrl, guideName }: VideoIntroductionCardProps) {
  if (!videoUrl) return null;

  return (
    <Card className="border-burgundy/20 shadow-lg bg-cream overflow-hidden">
      <CardContent className="p-0">
        <div className="relative aspect-video bg-charcoal/10 group cursor-pointer">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={`${guideName} introduction video`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-burgundy/10 to-burgundy/5">
              <Video className="h-16 w-16 text-burgundy/40" />
            </div>
          )}
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-charcoal/30 flex items-center justify-center group-hover:bg-charcoal/40 transition-colors">
            <div className="w-16 h-16 rounded-full bg-burgundy flex items-center justify-center shadow-elegant group-hover:scale-110 transition-transform">
              <Play className="h-8 w-8 text-white ml-1" />
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <h4 className="font-semibold mb-1 text-charcoal" style={{fontFamily: 'Playfair Display, serif'}}>
            Meet {guideName}
          </h4>
          <p className="text-sm text-charcoal/70">
            Watch introduction to learn more about my guiding style and experience
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
