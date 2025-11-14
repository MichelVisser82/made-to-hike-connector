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
    
    if (!calendarData || calendarData.length === 0) {
      return { bookedDates: [], availableDates: [] };
    }
    
    calendarData.forEach(slot => {
      console.log('[EnhancedCalendarWidget] Processing slot:', slot);
      const slotDate = new Date(slot.date);
      
      // Dates where the guide is on tour (has bookings)
      if (slot.spotsBooked && slot.spotsBooked > 0) {
        // Add all days covered by this tour
        for (let i = 0; i < (slot.durationDays || 1); i++) {
          const dateToAdd = new Date(slotDate);
          dateToAdd.setDate(slotDate.getDate() + i);
          booked.push(dateToAdd);
          console.log('[EnhancedCalendarWidget] Added booked date:', dateToAdd);
        }
      } else {
        // Available dates (no bookings yet)
        available.push(new Date(slotDate));
        console.log('[EnhancedCalendarWidget] Added available date:', slotDate);
      }
    });
    
    console.log('[EnhancedCalendarWidget] Processed dates:', { 
      bookedCount: booked.length, 
      availableCount: available.length,
      booked,
      available
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
          className="rounded-md border-burgundy/20"
          disabled={(date) => date < new Date()}
          modifiers={{
            onTour: bookedDates,
            available: availableDates,
          }}
          modifiersClassNames={{
            onTour: 'bg-burgundy text-white font-semibold',
            available: 'bg-primary/20 text-charcoal font-medium',
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
