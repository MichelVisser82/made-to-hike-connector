import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useState } from 'react';
import { Badge } from '../ui/badge';

interface EnhancedCalendarWidgetProps {
  availableDates?: Date[];
  bookedDates?: Date[];
  limitedDates?: Date[];
}

export function EnhancedCalendarWidget({ 
  availableDates = [], 
  bookedDates = [],
  limitedDates = []
}: EnhancedCalendarWidgetProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const isDateBooked = (date: Date) => {
    return bookedDates.some(d => 
      d.getDate() === date.getDate() && 
      d.getMonth() === date.getMonth() && 
      d.getFullYear() === date.getFullYear()
    );
  };

  const isDateLimited = (date: Date) => {
    return limitedDates.some(d => 
      d.getDate() === date.getDate() && 
      d.getMonth() === date.getMonth() && 
      d.getFullYear() === date.getFullYear()
    );
  };

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
          disabled={(date) => date < new Date() || isDateBooked(date)}
          modifiers={{
            booked: bookedDates,
            limited: limitedDates,
          }}
          modifiersStyles={{
            booked: { 
              backgroundColor: 'hsl(var(--burgundy))',
              color: 'white',
              opacity: 0.5
            },
            limited: {
              backgroundColor: 'hsl(var(--accent))',
              color: 'white'
            }
          }}
        />

        {/* Legend */}
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-primary" />
            <span className="text-charcoal/70">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-accent" />
            <span className="text-charcoal/70">Limited Spots</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-burgundy opacity-50" />
            <span className="text-charcoal/70">Fully Booked</span>
          </div>
        </div>

        <Button className="w-full mt-6 bg-burgundy hover:bg-burgundy/90 text-white">
          Check Tour Availability
        </Button>
      </CardContent>
    </Card>
  );
}
