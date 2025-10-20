import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isBefore, startOfDay, differenceInDays, isSameMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGuideTours } from '@/hooks/useGuideTours';
import { useGuideCalendarView } from '@/hooks/useGuideCalendarView';
import { useTourDateSlotMutations } from '@/hooks/useTourDateSlotMutations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import type { CalendarDateView } from '@/types/tourDateSlot';

export function AvailabilityManager() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTourFilter, setSelectedTourFilter] = useState<string>('all');

  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const { data: tours = [], isLoading: isLoadingTours } = useGuideTours(user?.id);
  const { data: calendarSlots = [], isLoading: isLoadingSlots } = useGuideCalendarView({
    guideId: user?.id,
    startDate: calendarStart,
    endDate: calendarEnd,
  });

  const { deleteDateSlot } = useTourDateSlotMutations();

  // Filter slots by selected tour
  const filteredSlots = useMemo(() => {
    if (selectedTourFilter === 'all') return calendarSlots;
    return calendarSlots.filter(slot => slot.tourId === selectedTourFilter);
  }, [calendarSlots, selectedTourFilter]);

  // Get slots for selected date
  const selectedDateSlots = useMemo(() => {
    if (!selectedDate) return [];
    return filteredSlots.filter(slot => {
      const slotStart = startOfDay(slot.date);
      const slotEnd = startOfDay(slot.endDate);
      const checkDate = startOfDay(selectedDate);
      return checkDate >= slotStart && checkDate <= slotEnd;
    });
  }, [filteredSlots, selectedDate]);

  // Generate calendar days
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Calculate tour segments with absolute positioning data
  const tourSegments = useMemo(() => {
    const segments: Array<{
      tour: CalendarDateView;
      row: number;
      col: number;
      span: number;
      stackIndex: number;
      isFirstSegment: boolean;
      isLastSegment: boolean;
    }> = [];

    // Group tours by their starting date to calculate vertical stacking
    const toursByStartDate = new Map<string, CalendarDateView[]>();
    
    filteredSlots.forEach(tour => {
      const startDayIndex = differenceInDays(startOfDay(new Date(tour.date)), calendarStart);
      
      if (startDayIndex >= 0 && startDayIndex < calendarDays.length) {
        const key = format(new Date(tour.date), 'yyyy-MM-dd');
        if (!toursByStartDate.has(key)) {
          toursByStartDate.set(key, []);
        }
        toursByStartDate.get(key)!.push(tour);
      }
    });

    // Calculate segments for each tour
    filteredSlots.forEach(tour => {
      const startDayIndex = differenceInDays(startOfDay(new Date(tour.date)), calendarStart);
      const endDayIndex = differenceInDays(startOfDay(new Date(tour.endDate)), calendarStart);
      
      if (startDayIndex < 0 || startDayIndex >= calendarDays.length) return;
      
      const startRow = Math.floor(startDayIndex / 7);
      const startCol = startDayIndex % 7;
      const endRow = Math.floor(Math.min(endDayIndex, calendarDays.length - 1) / 7);
      const endCol = Math.min(endDayIndex, calendarDays.length - 1) % 7;

      // Calculate stack index (vertical position within day)
      const startKey = format(new Date(tour.date), 'yyyy-MM-dd');
      const toursOnSameDate = toursByStartDate.get(startKey) || [];
      const stackIndex = toursOnSameDate.indexOf(tour);

      // If tour spans multiple weeks, create multiple segments
      if (startRow !== endRow) {
        for (let row = startRow; row <= endRow; row++) {
          const isFirst = row === startRow;
          const isLast = row === endRow;
          
          segments.push({
            tour,
            row,
            col: isFirst ? startCol : 0,
            span: isFirst ? (7 - startCol) : isLast ? (endCol + 1) : 7,
            stackIndex,
            isFirstSegment: isFirst,
            isLastSegment: isLast,
          });
        }
      } else {
        // Single week tour
        segments.push({
          tour,
          row: startRow,
          col: startCol,
          span: endCol - startCol + 1,
          stackIndex,
          isFirstSegment: true,
          isLastSegment: true,
        });
      }
    });

    return segments;
  }, [filteredSlots, calendarDays, calendarStart]);

  const handlePreviousMonth = () => setSelectedMonth(subMonths(selectedMonth, 1));
  const handleNextMonth = () => setSelectedMonth(addMonths(selectedMonth, 1));

  const handleDateClick = (day: Date) => {
    const isPast = isBefore(day, startOfDay(new Date()));
    if (isPast) return;
    setSelectedDate(day);
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this date slot?')) return;
    await deleteDateSlot.mutateAsync(slotId);
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-sage';
      case 'limited': return 'bg-amber-500';
      case 'booked': return 'bg-burgundy';
      default: return 'bg-muted';
    }
  };

  if (isLoadingTours || isLoadingSlots) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Loading calendar...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tours & Availability Calendar</CardTitle>
              <CardDescription>Manage your tour dates and availability</CardDescription>
            </div>
            <Select value={selectedTourFilter} onValueChange={setSelectedTourFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by tour" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tours</SelectItem>
                {tours.map(tour => (
                  <SelectItem key={tour.id} value={tour.id}>{tour.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-semibold">{format(selectedMonth, 'MMMM yyyy')}</h3>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <TooltipProvider>
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Container with Absolute Positioned Tours */}
              <div className="relative" style={{ minHeight: `${Math.ceil(calendarDays.length / 7) * 7}rem` }}>
                {/* Date Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, index) => {
                    const isPast = isBefore(day, startOfDay(new Date()));
                    const isCurrentMonth = isSameMonth(day, selectedMonth);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => handleDateClick(day)}
                        disabled={isPast}
                        className={`
                          h-20 lg:h-24 p-2 rounded-lg border text-left
                          transition-all flex items-start justify-start
                          ${isPast ? 'opacity-40 cursor-not-allowed bg-muted/50' : 'cursor-pointer hover:border-primary'}
                          ${!isCurrentMonth ? 'text-muted-foreground bg-muted/20' : 'bg-background'}
                          ${isSelected ? 'ring-2 ring-primary bg-primary/5' : ''}
                        `}
                      >
                        <div className={`text-sm font-semibold ${isPast ? 'line-through' : ''}`}>
                          {format(day, 'd')}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Tour Pills Overlay Layer */}
                <div className="absolute inset-0 pointer-events-none">
                  {tourSegments.map((segment, idx) => {
                    const { tour, row, col, span, stackIndex, isFirstSegment, isLastSegment } = segment;
                    const isPastTour = isBefore(new Date(tour.endDate), startOfDay(new Date()));
                    
                    // Calculate positioning
                    const rowHeight = 5; // 5rem (80px) on mobile, matches h-20
                    const rowHeightLg = 6; // 6rem (96px) on desktop, matches lg:h-24
                    const gapSize = 0.5; // 0.5rem (8px), matches gap-2
                    const cellWidth = `calc((100% - ${6 * gapSize}rem) / 7)`;
                    
                    const left = `calc(${col} * (${cellWidth} + ${gapSize}rem))`;
                    const width = `calc(${span} * ${cellWidth} + ${span - 1} * ${gapSize}rem)`;
                    const topMobile = `calc(${row * rowHeight}rem + ${stackIndex * 1.75}rem + 2rem)`;
                    const topDesktop = `calc(${row * rowHeightLg}rem + ${stackIndex * 1.75}rem + 2rem)`;
                    
                    return (
                      <Tooltip key={`${tour.slotId}-${idx}`}>
                        <TooltipTrigger asChild>
                          <div
                            className={`
                              absolute h-6 px-2 py-1 flex items-center gap-1.5 transition-all 
                              pointer-events-auto cursor-pointer z-10 text-xs font-medium 
                              whitespace-nowrap overflow-hidden
                              ${isPastTour 
                                ? 'bg-muted/50 border border-muted opacity-50 grayscale' 
                                : 'bg-burgundy/10 border border-burgundy/20 hover:bg-burgundy/20'
                              }
                              ${isFirstSegment && isLastSegment ? 'rounded-md' : ''}
                              ${isFirstSegment && !isLastSegment ? 'rounded-l-md' : ''}
                              ${!isFirstSegment && isLastSegment ? 'rounded-r-md' : ''}
                              ${!isFirstSegment && !isLastSegment ? 'rounded-none' : ''}
                            `}
                            style={{
                              left,
                              width,
                              top: topMobile,
                            }}
                            onClick={() => setSelectedDate(new Date(tour.date))}
                          >
                            {isFirstSegment && (
                              <>
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusDotColor(tour.availabilityStatus)}`} />
                                <span className="truncate">{tour.tourTitle}</span>
                              </>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p className="font-semibold">{tour.tourTitle}</p>
                            <p className="text-sm">
                              {format(new Date(tour.date), 'MMM d')} - {format(new Date(tour.endDate), 'MMM d, yyyy')}
                            </p>
                            <p className="text-sm">{tour.durationDays} days</p>
                            <p className="text-sm">{tour.spotsBooked}/{tour.spotsTotal} spots booked</p>
                            <p className="text-sm">{tour.currency} {tour.price}</p>
                            {tour.discountPercentage && (
                              <p className="text-sm text-green-600">{tour.discountPercentage}% off</p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            </TooltipProvider>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-sage" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span>Limited</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-burgundy" />
                <span>Fully Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted opacity-40" />
                <span>Past</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date Details Panel */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
            </CardTitle>
            <CardDescription>
              {selectedDate ? `${selectedDateSlots.length} tour(s) scheduled` : 'Click on a date to view details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDate && selectedDateSlots.length > 0 ? (
              <div className="space-y-4">
                {selectedDateSlots.map(slot => (
                  <Card key={slot.slotId}>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getStatusDotColor(slot.availabilityStatus)}`} />
                            <h4 className="font-semibold">{slot.tourTitle}</h4>
                          </div>
                          <Badge variant={slot.availabilityStatus === 'booked' ? 'destructive' : 'default'}>
                            {slot.availabilityStatus}
                          </Badge>
                        </div>
                        
                        <div className="text-sm space-y-1 text-muted-foreground">
                          <p>Duration: {format(slot.date, 'MMM d')} - {format(slot.endDate, 'MMM d, yyyy')}</p>
                          <p>Spots: {slot.spotsBooked}/{slot.spotsTotal} booked ({slot.spotsRemaining} remaining)</p>
                          <p>Price: {slot.currency} {slot.price}</p>
                          {slot.discountPercentage && (
                            <p className="text-green-600">Discount: {slot.discountPercentage}% off</p>
                          )}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Pencil className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteSlot(slot.slotId)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : selectedDate ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No tours scheduled for this date</p>
                <Button className="mt-4" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Date Slot
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Select a date to view or manage tour slots</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
