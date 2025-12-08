import { useState, lazy, Suspense } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { MapSkeleton } from '@/components/common/MapSkeleton';
import { SafeHtml } from '@/components/ui/safe-html';
import type { TripDetails, TripItineraryDay } from '@/hooks/useTripDetails';

const FullMapReveal = lazy(() => 
  import('@/components/booking/FullMapReveal').then(m => ({ default: m.FullMapReveal }))
);

interface TripItineraryTabProps {
  tripDetails: TripDetails;
}

export function TripItineraryTab({ tripDetails }: TripItineraryTabProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const { tour } = tripDetails;
  
  // Handle itinerary data - it might be stored in different formats
  let itineraryDays: TripItineraryDay[] = [];
  
  if (tour?.itinerary) {
    // If itinerary has a days array directly
    if (Array.isArray(tour.itinerary.days)) {
      itineraryDays = tour.itinerary.days;
    }
    // If itinerary is an array itself
    else if (Array.isArray(tour.itinerary)) {
      itineraryDays = tour.itinerary;
    }
  }

  return (
    <div className="space-y-6">
      {/* Route Map Section */}
      <Card className="p-6 bg-card border-burgundy/10 shadow-sm">
        <h2 className="text-2xl mb-6 text-foreground font-playfair">
          Your Route Map
        </h2>
        <Suspense fallback={<MapSkeleton />}>
          <FullMapReveal 
            tourId={tripDetails.tour.id} 
            bookingId={tripDetails.booking.id} 
          />
        </Suspense>
      </Card>

      {/* Day-by-Day Itinerary Section */}
      <Card className="p-6 bg-card border-burgundy/10 shadow-sm">
        <h2 className="text-2xl mb-6 text-foreground font-playfair">
          Day-by-Day Itinerary
        </h2>
        
        {!itineraryDays || itineraryDays.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Detailed itinerary will be shared closer to your trip date.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {itineraryDays.map((day) => (
              <div key={day.day} className="border border-burgundy/10 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                  className="w-full flex items-center justify-between p-4 bg-cream hover:bg-cream/70 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-burgundy text-white flex items-center justify-center text-lg font-playfair">
                      {day.day}
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-foreground">{day.title}</h3>
                    </div>
                  </div>
                  {expandedDay === day.day ? (
                    <ChevronUp className="w-5 h-5 text-burgundy" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-burgundy" />
                  )}
                </button>
                
                {expandedDay === day.day && (
                  <div className="p-6 border-t border-burgundy/10">
                    <div className="space-y-6">
                      {/* Image */}
                      {day.image_url && (
                        <div className="rounded-lg overflow-hidden">
                          <img 
                            src={day.image_url} 
                            alt={day.title}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      )}

                      {/* Description */}
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Overview</h4>
                        <SafeHtml html={day.description || ''} className="text-muted-foreground" />
                      </div>

                      {/* Activities */}
                      {day.activities && day.activities.length > 0 && (
                        <div>
                          <h4 className="font-medium text-foreground mb-3">Activities</h4>
                          <ul className="space-y-2">
                            {day.activities.map((activity, idx) => (
                              <li key={idx} className="flex gap-2 text-muted-foreground">
                                <span className="text-burgundy">•</span>
                                <span>{activity}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Accommodation */}
                      {day.accommodation && (
                        <div className="p-4 bg-cream rounded-lg">
                          <h4 className="font-medium text-foreground mb-2">Accommodation</h4>
                          <p className="text-sm text-muted-foreground">{day.accommodation}</p>
                        </div>
                      )}

                      {/* Meals */}
                      {day.meals && (
                        <div className="p-4 bg-sage/10 border border-sage/20 rounded-lg">
                          <h4 className="font-medium text-foreground mb-2">Meals Included</h4>
                          <p className="text-sm text-muted-foreground">{day.meals}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
