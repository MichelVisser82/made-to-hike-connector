import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Phone, Globe } from 'lucide-react';
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16">
              {guide.profile_image_url && (
                <AvatarImage src={guide.profile_image_url} alt={guide.display_name} />
              )}
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {getInitials(guide.display_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{guide.display_name}</h3>
              {guide.experience_years && (
                <p className="text-sm text-muted-foreground">
                  {guide.experience_years} years experience
                </p>
              )}
              {guide.certifications && guide.certifications.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">Certified</Badge>
                </div>
              )}
            </div>
          </div>

          {guide.bio && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {guide.bio}
            </p>
          )}

          {guide.languages_spoken && guide.languages_spoken.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">Languages</div>
              <div className="flex flex-wrap gap-2">
                {guide.languages_spoken.map((lang, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2 pt-4 border-t">
            <Button
              className="w-full bg-[#7c2843] hover:bg-[#5d1e32] text-white"
              onClick={() => setShowMessageModal(true)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Message Guide
            </Button>
            {guide.phone && (
              <Button variant="outline" className="w-full" asChild>
                <a href={`tel:${guide.phone}`}>
                  <Phone className="w-4 h-4 mr-2" />
                  Call Guide
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <MessageGuideModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        tripDetails={tripDetails}
      />
    </>
  );
}
