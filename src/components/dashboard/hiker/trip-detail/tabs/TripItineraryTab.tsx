import { useState } from 'react';
import { ChevronDown, ChevronUp, Camera } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { TripDetails, TripItineraryDay } from '@/hooks/useTripDetails';

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
    <Card className="p-6 bg-white border-burgundy/10 shadow-md">
      <h2 className="text-2xl mb-6 text-charcoal font-playfair">
        Complete Day-by-Day Itinerary
      </h2>
      
      {!itineraryDays || itineraryDays.length === 0 ? (
        <div className="text-center py-8 text-charcoal/60">
          <p>Detailed itinerary will be shared closer to your trip date.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {itineraryDays.map((day) => (
            <div key={day.day_number} className="border border-burgundy/10 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedDay(expandedDay === day.day_number ? null : day.day_number)}
                className="w-full flex items-center justify-between p-4 bg-cream hover:bg-cream/70 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-burgundy text-white flex items-center justify-center text-lg font-playfair">
                    {day.day_number}
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-charcoal">{day.title}</h3>
                    {day.date && day.start_time && day.end_time && (
                      <div className="text-sm text-charcoal/60">
                        {day.date} • {day.start_time} - {day.end_time}
                      </div>
                    )}
                  </div>
                </div>
                {expandedDay === day.day_number ? (
                  <ChevronUp className="w-5 h-5 text-burgundy" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-burgundy" />
                )}
              </button>
              
              {expandedDay === day.day_number && (
                <div className="p-6 border-t border-burgundy/10">
                  <div className="space-y-6">
                    {/* Overview */}
                    <div>
                      <h4 className="font-medium text-charcoal mb-2">Overview</h4>
                      <p className="text-charcoal/70">{day.overview}</p>
                    </div>

                    {/* Detailed Schedule */}
                    {day.activities && day.activities.length > 0 && (
                      <div>
                        <h4 className="font-medium text-charcoal mb-3">Detailed Schedule</h4>
                        <div className="space-y-4">
                          {day.activities.map((activity, idx) => (
                            <div key={idx} className="flex gap-3">
                              {activity.time && (
                                <div className="w-20 flex-shrink-0 text-sm text-burgundy font-medium">
                                  {activity.time}
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="font-medium text-charcoal text-sm mb-1">
                                  {activity.title}
                                </div>
                                <p className="text-sm text-charcoal/70">{activity.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    {day.stats && (day.stats.distance_km || day.stats.elevation_gain_m || day.stats.hiking_time_hours) && (
                      <div className="grid grid-cols-3 gap-4 p-4 bg-cream rounded-lg">
                        {day.stats.distance_km && (
                          <div>
                            <div className="text-xs text-charcoal/60 mb-1">Distance</div>
                            <div className="font-medium text-charcoal">{day.stats.distance_km} km</div>
                          </div>
                        )}
                        {day.stats.elevation_gain_m && (
                          <div>
                            <div className="text-xs text-charcoal/60 mb-1">Elevation Gain</div>
                            <div className="font-medium text-charcoal">+{day.stats.elevation_gain_m}m</div>
                          </div>
                        )}
                        {day.stats.hiking_time_hours && (
                          <div>
                            <div className="text-xs text-charcoal/60 mb-1">Hiking Time</div>
                            <div className="font-medium text-charcoal">{day.stats.hiking_time_hours} hours</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Photo Opportunities */}
                    {day.photo_opportunities && (
                      <div className="bg-sage/10 border border-sage/20 rounded-lg p-4">
                        <div className="flex items-start gap-2 mb-2">
                          <Camera className="w-4 h-4 text-sage mt-0.5" />
                          <h4 className="font-medium text-charcoal text-sm">Photo Opportunities</h4>
                        </div>
                        <p className="text-sm text-charcoal/70">{day.photo_opportunities}</p>
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
  );
}
