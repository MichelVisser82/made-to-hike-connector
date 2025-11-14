import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useState, useMemo, useEffect } from 'react';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import type { CalendarDateView } from '@/types/tourDateSlot';
import { isSameDay } from 'date-fns';

interface EnhancedCalendarWidgetProps {
  guideId?: string;
  calendarData?: CalendarDateView[];
  isLoading?: boolean;
}

export function EnhancedCalendarWidget({ 
  guideId,
  calendarData = [],
  isLoading = false
}: EnhancedCalendarWidgetProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Debug calendar data
  useEffect(() => {
    console.log('[EnhancedCalendarWidget] Props received:', { 
      guideId, 
      calendarData, 
      isLoading,
      dataLength: calendarData?.length 
    });
  }, [guideId, calendarData, isLoading]);

  // Process calendar data to get booked dates (dates with any bookings)
  const { bookedDates, availableDates } = useMemo(() => {
    console.log('[EnhancedCalendarWidget] Processing calendar data...', calendarData);
    const booked: Date[] = [];
    const available: Date[] = [];
    
    calendarData.forEach(slot => {
      console.log('[EnhancedCalendarWidget] Processing slot:', slot);
      // Dates where the guide is on tour (has bookings)
      if (slot.spotsBooked > 0) {
        // Add all days covered by this tour
        let currentDate = new Date(slot.date);
        for (let i = 0; i < slot.durationDays; i++) {
          booked.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else {
        // Available dates (no bookings yet)
        available.push(new Date(slot.date));
      }
    });
    
    console.log('[EnhancedCalendarWidget] Processed dates:', { 
      bookedCount: booked.length, 
      availableCount: available.length 
    });
    return { bookedDates: booked, availableDates: available };
  }, [calendarData]);

  const isDateBooked = (date: Date) => {
    return bookedDates.some(d => isSameDay(d, date));
  };

  if (isLoading) {
    return (
      <Card className="border-burgundy/20 shadow-lg bg-cream">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="h-5 w-5 text-burgundy" />
            <h4 className="font-semibold text-charcoal" style={{fontFamily: 'Playfair Display, serif'}}>
              Availability Calendar
            </h4>
          </div>
          <Skeleton className="h-[280px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-burgundy/20 shadow-lg bg-cream">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <CalendarIcon className="h-5 w-5 text-burgundy" />
          <h4 className="font-semibold text-charcoal" style={{fontFamily: 'Playfair Display, serif'}}>
            Availability Calendar
          </h4>
        </div>

        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border-burgundy/20 pointer-events-auto"
          disabled={(date) => date < new Date()}
          modifiers={{
            onTour: bookedDates,
            available: availableDates,
          }}
          modifiersStyles={{
            onTour: { 
              backgroundColor: 'hsl(var(--burgundy))',
              color: 'white',
              fontWeight: '600'
            },
            available: {
              backgroundColor: 'hsl(var(--primary) / 0.2)',
              color: 'hsl(var(--charcoal))',
              fontWeight: '500'
            }
          }}
        />

        {/* Legend */}
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: 'hsl(var(--primary) / 0.2)' }} />
            <span className="text-charcoal/70">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-burgundy" />
            <span className="text-charcoal/70">On Tour</span>
          </div>
        </div>

        <Button className="w-full mt-6 bg-burgundy hover:bg-burgundy/90 text-white">
          Check Tour Availability
        </Button>
      </CardContent>
    </Card>
  );
}
