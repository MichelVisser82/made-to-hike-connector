import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Phone, Star, Award } from 'lucide-react';
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
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Your Guide</h3>
        
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="w-16 h-16 border-2 border-gray-100">
            {guide.profile_image_url && (
              <AvatarImage src={guide.profile_image_url} alt={guide.display_name} />
            )}
            <AvatarFallback className="bg-[#7c2843] text-white text-lg font-semibold">
              {getInitials(guide.display_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h4 className="font-semibold text-base text-gray-900">{guide.display_name}</h4>
            <p className="text-sm text-gray-600">Professional Mountain Guide</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">4.8</span>
              <span className="text-xs text-gray-500">(127 reviews)</span>
            </div>
          </div>
        </div>

        {/* Certification Badges */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg border border-red-100">
            <Award className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="text-xs font-medium text-red-900">UIMLA Certified</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
            <Award className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="text-xs font-medium text-blue-900">First Aid</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            className="w-full bg-[#7c2843] hover:bg-[#5d1e32] text-white font-medium"
            onClick={() => setShowMessageModal(true)}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Message Guide
          </Button>
          <Button variant="outline" className="w-full font-medium">
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
