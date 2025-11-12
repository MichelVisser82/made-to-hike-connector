import { Card, CardContent } from '@/components/ui/card';
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
      <Card>
        <CardContent className="p-12 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Itinerary Coming Soon</h3>
          <p className="text-muted-foreground">
            Your guide will share the detailed day-by-day itinerary shortly.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-serif font-semibold mb-2">Day-by-Day Itinerary</h2>
        <p className="text-muted-foreground">
          Your complete journey broken down by day
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {itinerary.days.map((day, index) => (
          <AccordionItem key={index} value={`day-${day.day_number}`} className="border rounded-lg">
            <AccordionTrigger className="px-6 hover:no-underline hover:bg-accent/50 rounded-t-lg">
              <div className="flex items-center gap-4 w-full text-left">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                  {day.day_number}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{day.title}</h3>
                  {day.date && (
                    <p className="text-sm text-muted-foreground">{day.date}</p>
                  )}
                  {day.stats && (
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      {day.stats.distance_km && (
                        <span>{day.stats.distance_km} km</span>
                      )}
                      {day.stats.elevation_gain_m && (
                        <span>↗ {day.stats.elevation_gain_m}m</span>
                      )}
                      {day.stats.hiking_time_hours && (
                        <span>⏱ {day.stats.hiking_time_hours}h</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-4">
              <div className="space-y-6">
                {/* Time Range */}
                {(day.start_time || day.end_time) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>
                      {day.start_time} {day.end_time && `- ${day.end_time}`}
                    </span>
                  </div>
                )}

                {/* Overview */}
                {day.overview && (
                  <div>
                    <h4 className="font-semibold mb-2">Overview</h4>
                    <p className="text-muted-foreground">{day.overview}</p>
                  </div>
                )}

                {/* Activities */}
                {day.activities && day.activities.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Activities</h4>
                    <div className="space-y-4">
                      {day.activities.map((activity, actIdx) => (
                        <div key={actIdx} className="flex gap-3 pb-4 border-b last:border-0">
                          <div className="flex-shrink-0 w-16 text-sm text-muted-foreground font-medium">
                            {activity.time || ''}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium mb-1">{activity.title}</h5>
                            <p className="text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                {day.stats && (
                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                    {day.stats.distance_km && (
                      <div className="text-center">
                        <MapPin className="w-5 h-5 mx-auto mb-1 text-primary" />
                        <div className="text-lg font-bold">{day.stats.distance_km} km</div>
                        <div className="text-xs text-muted-foreground">Distance</div>
                      </div>
                    )}
                    {day.stats.elevation_gain_m && (
                      <div className="text-center">
                        <TrendingUp className="w-5 h-5 mx-auto mb-1 text-primary" />
                        <div className="text-lg font-bold">{day.stats.elevation_gain_m}m</div>
                        <div className="text-xs text-muted-foreground">Elevation Gain</div>
                      </div>
                    )}
                    {day.stats.hiking_time_hours && (
                      <div className="text-center">
                        <Mountain className="w-5 h-5 mx-auto mb-1 text-primary" />
                        <div className="text-lg font-bold">{day.stats.hiking_time_hours}h</div>
                        <div className="text-xs text-muted-foreground">Hiking Time</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Photo Opportunities */}
                {day.photo_opportunities && (
                  <div className="bg-accent/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Camera className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-medium mb-1">Photo Opportunities</h5>
                        <p className="text-sm text-muted-foreground">
                          {day.photo_opportunities}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
