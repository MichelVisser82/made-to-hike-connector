import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MapPin, Phone, Mail, Navigation, Shield, 
  Info, ExternalLink, Share2, Home as HomeIcon 
} from 'lucide-react';
import type { TripDetails } from '@/hooks/useTripDetails';
import { format } from 'date-fns';
import { HikingLocationMap } from '@/components/tour/HikingLocationMap';
import { MessageGuideModal } from '../modals/MessageGuideModal';

interface TripLogisticsTabProps {
  tripDetails: TripDetails;
}

export function TripLogisticsTab({ tripDetails }: TripLogisticsTabProps) {
  const { tour, guide, booking } = tripDetails;
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  const handleOpenMaps = () => {
    if (tour.meeting_point_lat && tour.meeting_point_lng) {
      const url = `https://www.google.com/maps/search/?api=1&query=${tour.meeting_point_lat},${tour.meeting_point_lng}`;
      window.open(url, '_blank');
    }
  };

  const guideInitials = guide.display_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Meeting Point & Contact Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meeting Point */}
        <Card className="p-6 bg-white border-burgundy/10 shadow-md">
          <h2 className="text-2xl mb-6 text-charcoal flex items-center gap-2 font-playfair">
            <MapPin className="w-6 h-6 text-burgundy" />
            Meeting Point
          </h2>
          
          {(tour.meeting_point_lat && tour.meeting_point_lng) ? (
            <div className="mb-6">
              <HikingLocationMap
                latitude={tour.meeting_point_lat}
                longitude={tour.meeting_point_lng}
                title={tour.meeting_point || 'Meeting Point'}
                height="300px"
                zoom={14}
                showControls={true}
              />
            </div>
          ) : (
            <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center mb-6">
              <MapPin className="w-16 h-16 text-charcoal/30" />
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-charcoal mb-2">Location Details</h4>
              <p className="text-charcoal/70 mb-1">
                {tour.meeting_point || 'Meeting point to be confirmed'}
              </p>
              {tour.meeting_point_formatted && (
                <p className="text-charcoal/70 mb-1">{tour.meeting_point_formatted}</p>
              )}
              {(tour.meeting_point_lat && tour.meeting_point_lng) && (
                <p className="text-sm text-charcoal/60">
                  GPS: {tour.meeting_point_lat.toFixed(4)}° N, {tour.meeting_point_lng.toFixed(4)}° E
                </p>
              )}
            </div>

            <Separator />

            <div>
              <h4 className="font-medium text-charcoal mb-2">Meeting Time</h4>
              <p className="text-lg text-burgundy mb-1 font-playfair">
                {format(new Date(booking.booking_date), 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-sm text-charcoal/60">
                Please arrive 15 minutes early for check-in
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium text-charcoal mb-2">Parking Information</h4>
              <p className="text-charcoal/70 mb-1">Check with your guide for parking details</p>
              <p className="text-sm text-charcoal/60">
                Your guide will confirm the exact meeting time closer to the date
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              {(tour.meeting_point_lat && tour.meeting_point_lng) && (
                <Button 
                  onClick={handleOpenMaps}
                  className="flex-1 bg-burgundy hover:bg-burgundy-dark text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in Maps
                </Button>
              )}
              <Button 
                variant="outline" 
                className="flex-1 border-burgundy/30 text-burgundy hover:bg-burgundy/5"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </Card>

        {/* Contact & Emergency */}
        <Card className="p-6 bg-white border-burgundy/10 shadow-md">
          <h2 className="text-2xl mb-6 text-charcoal flex items-center gap-2 font-playfair">
            <Phone className="w-6 h-6 text-burgundy" />
            Contact Information
          </h2>

          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-charcoal mb-3">Your Guide</h4>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  {guide.profile_image_url ? (
                    <img src={guide.profile_image_url} alt={guide.display_name} />
                  ) : (
                    <AvatarFallback className="bg-burgundy text-white">
                      {guideInitials}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <div className="font-medium text-charcoal">{guide.display_name}</div>
                  <div className="text-sm text-charcoal/60">Professional Mountain Guide</div>
                </div>
              </div>
              <div className="space-y-2">
                {guide.phone && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                    onClick={() => window.location.href = `tel:${guide.phone}`}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    {guide.phone}
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                  onClick={() => setIsMessageModalOpen(true)}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Message through dashboard
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium text-charcoal mb-3">Emergency Contacts</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2 p-3 bg-cream rounded-lg">
                  <Shield className="w-4 h-4 text-burgundy mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-charcoal">Mountain Rescue</div>
                    <div className="text-charcoal/70">112 (European Emergency Number)</div>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-cream rounded-lg">
                  <Phone className="w-4 h-4 text-burgundy mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-charcoal">Made to Hike Support</div>
                    <div className="text-charcoal/70">Emergency support available</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gold/10 border border-gold/20 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                <p className="text-sm text-charcoal">
                  For non-emergencies, contact your guide directly. For urgent matters on the day of departure, call the guide's mobile number.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Transportation & Accommodation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-white border-burgundy/10 shadow-md">
          <h3 className="text-xl mb-4 text-charcoal flex items-center gap-2 font-playfair">
            <Navigation className="w-5 h-5 text-burgundy" />
            Getting There
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-charcoal mb-2 text-sm">By Car</h4>
              <p className="text-sm text-charcoal/70">
                Directions to the meeting point will be provided by your guide closer to the tour date
              </p>
            </div>
            <div>
              <h4 className="font-medium text-charcoal mb-2 text-sm">By Public Transport</h4>
              <p className="text-sm text-charcoal/70">
                Your guide will provide information about public transport options for reaching the meeting point
              </p>
            </div>
            <div>
              <h4 className="font-medium text-charcoal mb-2 text-sm">Travel Planning</h4>
              <p className="text-sm text-charcoal/70">
                Contact your guide for recommendations on the best way to reach the meeting location
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border-burgundy/10 shadow-md">
          <h3 className="text-xl mb-4 text-charcoal flex items-center gap-2 font-playfair">
            <HomeIcon className="w-5 h-5 text-burgundy" />
            Accommodation
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-charcoal mb-2 text-sm">Tour Accommodation</h4>
              <p className="text-sm text-charcoal/70 mb-1">
                {tour.includes && tour.includes.some(item => 
                  item.toLowerCase().includes('accommodation') || 
                  item.toLowerCase().includes('lodging') ||
                  item.toLowerCase().includes('hut')
                ) 
                  ? 'Accommodation is included in your tour price'
                  : 'Check tour inclusions for accommodation details'
                }
              </p>
              <p className="text-sm text-charcoal/60">
                Your guide will provide specific accommodation information
              </p>
            </div>
            <div>
              <h4 className="font-medium text-charcoal mb-2 text-sm">Pre/Post Trip</h4>
              <p className="text-sm text-charcoal/70">
                Consider booking accommodation near the meeting point for nights before/after the trek (not included)
              </p>
            </div>
          </div>
        </Card>
      </div>

      <MessageGuideModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        tripDetails={tripDetails}
      />
    </div>
  );
}
