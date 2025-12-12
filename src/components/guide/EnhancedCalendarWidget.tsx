import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useState, useMemo } from 'react';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import type { CalendarDateView } from '@/types/tourDateSlot';
import type { Tour } from '@/types';
import { isSameDay } from 'date-fns';
import { CustomTourRequestModal } from './CustomTourRequestModal';

interface EnhancedCalendarWidgetProps {
  guideId?: string;
  guideName?: string;
  tours?: Tour[];
  calendarData?: CalendarDateView[];
  isLoading?: boolean;
}

export function EnhancedCalendarWidget({ 
  guideId,
  guideName = '',
  tours = [],
  calendarData = [],
  isLoading = false
}: EnhancedCalendarWidgetProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [customTourModalOpen, setCustomTourModalOpen] = useState(false);

  // Process calendar data to get booked dates (dates with any bookings)
  const bookedDates = useMemo(() => {
    const booked: Date[] = [];
    
    calendarData.forEach(slot => {
      // Dates where the guide is on tour (has bookings)
      if (slot.spotsBooked > 0) {
        // Add all days covered by this tour
        let currentDate = new Date(slot.date);
        for (let i = 0; i < slot.durationDays; i++) {
          booked.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    });
    
    return booked;
  }, [calendarData]);

  // Generate available dates: all future dates that are not booked
  const availableDates = useMemo(() => {
    const available: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Generate dates for next 365 days
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Check if this date is not booked
      const isBooked = bookedDates.some(d => isSameDay(d, date));
      if (!isBooked) {
        available.push(date);
      }
    }
    
    return available;
  }, [bookedDates]);

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

        <Button 
          className="w-full mt-6 bg-burgundy hover:bg-burgundy/90 text-white"
          onClick={() => setCustomTourModalOpen(true)}
        >
          Request Custom Tour
        </Button>
      </CardContent>

      {/* Custom Tour Request Modal */}
      <CustomTourRequestModal
        open={customTourModalOpen}
        onOpenChange={setCustomTourModalOpen}
        guideId={guideId || ''}
        guideName={guideName}
        tours={tours.map(tour => ({
          id: tour.id,
          title: tour.title,
          duration: tour.duration || '',
          difficulty: tour.difficulty || '',
          price_per_person: tour.price || 0
        }))}
        preSelectedDate={selectedDate}
      />
    </Card>
  );
}
