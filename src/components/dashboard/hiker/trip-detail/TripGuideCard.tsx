import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Phone, Star, Shield } from 'lucide-react';
import type { TripDetails } from '@/hooks/useTripDetails';
import { MessageGuideModal } from './modals/MessageGuideModal';

interface TripGuideCardProps {
  tripDetails: TripDetails;
}

export function TripGuideCard({ tripDetails }: TripGuideCardProps) {
  const [showMessageModal, setShowMessageModal] = useState(false);
  const { guide } = tripDetails;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <>
      <div className="p-6 bg-white border border-burgundy/10 rounded-lg shadow-md">
        <h3 className="text-lg mb-4 text-charcoal font-playfair">Your Guide</h3>
        
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-16 w-16">
            {guide.profile_image_url && (
              <AvatarImage src={guide.profile_image_url} alt={guide.display_name} />
            )}
            <AvatarFallback className="bg-burgundy text-white text-lg">
              {getInitials(guide.display_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h4 className="font-medium text-charcoal mb-1">{guide.display_name}</h4>
            <div className="text-sm text-charcoal/60 mb-2">Professional Mountain Guide</div>
            {guide.review_count > 0 ? (
              <div className="flex items-center gap-1 text-xs text-charcoal/70">
                <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                <span className="font-medium">{guide.average_rating.toFixed(1)}</span>
                <span className="text-charcoal/50">({guide.review_count} {guide.review_count === 1 ? 'review' : 'reviews'})</span>
              </div>
            ) : (
              <div className="text-xs text-charcoal/50">No reviews yet</div>
            )}
          </div>
        </div>

        {/* Certification Badges */}
        {guide.certifications && guide.certifications.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {guide.certifications.slice(0, 2).map((cert: any, index: number) => (
              <Badge 
                key={index}
                className={index === 0 ? "bg-sage/10 text-sage border-sage/20 text-xs" : "bg-burgundy/10 text-burgundy border-burgundy/20 text-xs"}
              >
                <Shield className="w-3 h-3 mr-1" />
                {cert.name || cert}
              </Badge>
            ))}
          </div>
        )}

        <div className="border-t border-burgundy/10 my-4" />

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            className="w-full bg-burgundy hover:bg-burgundy-dark text-white"
            onClick={() => setShowMessageModal(true)}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Message Guide
          </Button>
          <Button variant="outline" className="w-full border-burgundy/30 text-burgundy hover:bg-burgundy/5">
            <Phone className="w-4 h-4 mr-2" />
            Call Guide
          </Button>
        </div>
      </div>

      <MessageGuideModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        tripDetails={tripDetails}
      />
    </>
  );
}
