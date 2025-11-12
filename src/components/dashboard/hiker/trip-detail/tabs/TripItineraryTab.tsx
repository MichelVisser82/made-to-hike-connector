import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { MapPin, Clock, TrendingUp, Mountain, Camera, Calendar } from 'lucide-react';
import type { TripDetails } from '@/hooks/useTripDetails';

interface TripItineraryTabProps {
  tripDetails: TripDetails;
}

export function TripItineraryTab({ tripDetails }: TripItineraryTabProps) {
  const { tour } = tripDetails;
  const itinerary = tour.itinerary;

  if (!itinerary || !itinerary.days || itinerary.days.length === 0) {
    return (
      <div className="bg-white rounded-lg p-12 text-center shadow-sm">
        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold mb-2 text-gray-900">Itinerary Coming Soon</h3>
        <p className="text-gray-600">
          Your guide will share the detailed day-by-day itinerary shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-playfair font-semibold text-gray-900 mb-2">Complete Day-by-Day Itinerary</h2>
      </div>

      <Accordion type="single" collapsible className="space-y-4" defaultValue="day-1">
        {itinerary.days.map((day, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <AccordionItem value={`day-${day.day_number}`} className="border-0">
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4 w-full text-left">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#7c2843] text-white flex items-center justify-center text-lg font-bold">
                    {day.day_number}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base text-gray-900">Day {day.day_number}: {day.title}</h3>
                    {day.date && (
                      <p className="text-sm text-gray-600 mt-0.5">October {16 + day.day_number - 1} • {day.start_time || '8:00 AM'} - {day.end_time || '8:00 PM'}</p>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2">
                <div className="space-y-6">
                  {/* Overview */}
                  {day.overview && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Overview</h4>
                      <p className="text-gray-600 leading-relaxed">{day.overview}</p>
                    </div>
                  )}

                  {/* Detailed Schedule */}
                  {day.activities && day.activities.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Detailed Schedule</h4>
                      <div className="space-y-4">
                        {day.activities.map((activity, actIdx) => (
                          <div key={actIdx} className="flex gap-4">
                            <div className="flex-shrink-0 w-20 text-sm font-semibold text-gray-900">
                              {activity.time || ''}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900 mb-1">{activity.title}</h5>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {activity.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stats Bar */}
                  {day.stats && (
                    <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                      {day.stats.distance_km && (
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Distance</div>
                          <div className="text-lg font-bold text-gray-900">{day.stats.distance_km} km</div>
                        </div>
                      )}
                      {day.stats.elevation_gain_m && (
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Elevation Gain</div>
                          <div className="text-lg font-bold text-gray-900">+{day.stats.elevation_gain_m}m</div>
                        </div>
                      )}
                      {day.stats.hiking_time_hours && (
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Hiking Time</div>
                          <div className="text-lg font-bold text-gray-900">{day.stats.hiking_time_hours} hours</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Photo Opportunities */}
                  {day.photo_opportunities && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Camera className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h5 className="font-semibold text-blue-900 mb-1">Photo Opportunities</h5>
                          <p className="text-sm text-blue-800">
                            {day.photo_opportunities}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </div>
        ))}
      </Accordion>
    </div>
  );
}
