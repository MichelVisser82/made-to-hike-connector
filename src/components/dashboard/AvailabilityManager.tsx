import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isBefore, startOfDay, differenceInDays, isSameMonth, parseISO } from 'date-fns';
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
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  
  const MAX_VISIBLE_TOURS = 2;

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

  // Calculate tour segments with absolute positioning and improved lane-based stacking
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

    // Track which "lanes" (vertical levels) are occupied for each date
    const occupiedLanes = new Map<string, Set<number>>();
    
    // Assign lanes to each tour based on which dates they occupy
    const tourLanes = new Map<string, number>(); // tourId -> lane
    
    filteredSlots.forEach(tour => {
      // Get all days this tour occupies
      const tourDays = eachDayOfInterval({
        start: startOfDay(new Date(tour.date)),
        end: startOfDay(new Date(tour.endDate))
      });
      
      // Find the first available lane across ALL days this tour occupies
      let lane = 0;
      while (true) {
        const canUseLane = tourDays.every(day => {
          const key = format(day, 'yyyy-MM-dd');
          return !occupiedLanes.get(key)?.has(lane);
        });
        
        if (canUseLane) {
          // Mark this lane as occupied for all tour days
          tourDays.forEach(day => {
            const key = format(day, 'yyyy-MM-dd');
            if (!occupiedLanes.has(key)) {
              occupiedLanes.set(key, new Set());
            }
            occupiedLanes.get(key)!.add(lane);
          });
          tourLanes.set(tour.slotId, lane);
          break;
        }
        lane++;
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

      const stackIndex = tourLanes.get(tour.slotId) || 0;

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

  // Get tours starting on a specific date
  const getToursStartingOnDate = (date: Date) => {
    return filteredSlots.filter(tour => isSameDay(new Date(tour.date), date));
  };

  // Calculate dynamic cell height based on visible tours
  const getCellHeight = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const toursOnDate = getToursStartingOnDate(date);
    const isExpanded = expandedDates.has(dateKey);
    
    const visibleCount = isExpanded 
      ? toursOnDate.length 
      : Math.min(toursOnDate.length, MAX_VISIBLE_TOURS);
    
    const dateHeight = 2; // rem for date number
    const pillHeight = 1.75; // rem per tour pill
    const collapseButtonHeight = toursOnDate.length > MAX_VISIBLE_TOURS ? 1.5 : 0;
    
    return Math.max(
      5, // minimum 5rem (h-20)
      dateHeight + (visibleCount * pillHeight) + collapseButtonHeight
    );
  };

  // Filter visible tour segments based on collapse state
  const visibleTourSegments = useMemo(() => {
    return tourSegments.filter(segment => {
      const dateKey = format(new Date(segment.tour.date), 'yyyy-MM-dd');
      const toursOnDate = getToursStartingOnDate(new Date(segment.tour.date));
      const isExpanded = expandedDates.has(dateKey);
      
      if (isExpanded || toursOnDate.length <= MAX_VISIBLE_TOURS) {
        return true;
      }
      
      // Only show first MAX_VISIBLE_TOURS
      const tourIndex = toursOnDate.findIndex(t => t.slotId === segment.tour.slotId);
      return tourIndex < MAX_VISIBLE_TOURS;
    });
  }, [tourSegments, expandedDates, MAX_VISIBLE_TOURS, filteredSlots]);

  const toggleExpandDate = (dateKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedDates(prev => {
      const next = new Set(prev);
      if (next.has(dateKey)) {
        next.delete(dateKey);
      } else {
        next.add(dateKey);
      }
      return next;
    });
  };

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
              <div className="relative">
                {/* Date Grid with Dynamic Heights */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, index) => {
                    const isPast = isBefore(day, startOfDay(new Date()));
                    const isCurrentMonth = isSameMonth(day, selectedMonth);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const toursOnDate = getToursStartingOnDate(day);
                    const hiddenCount = toursOnDate.length - MAX_VISIBLE_TOURS;
                    const isExpanded = expandedDates.has(dateKey);
                    const cellHeight = getCellHeight(day);

                    return (
                      <div key={day.toISOString()} className="relative">
                        <button
                          onClick={() => handleDateClick(day)}
                          disabled={isPast}
                          style={{ minHeight: `${cellHeight}rem` }}
                          className={`
                            w-full p-2 rounded-lg border text-left
                            transition-all flex flex-col items-start justify-start
                            ${isPast ? 'opacity-40 cursor-not-allowed bg-muted/50' : 'cursor-pointer hover:border-primary'}
                            ${!isCurrentMonth ? 'text-muted-foreground bg-muted/20' : 'bg-background'}
                            ${isSelected ? 'ring-2 ring-primary bg-primary/5' : ''}
                          `}
                        >
                          <div className={`text-sm font-semibold mb-1 ${isPast ? 'line-through' : ''}`}>
                            {format(day, 'd')}
                          </div>
                        </button>

                        {/* Collapse/Expand Button */}
                        {hiddenCount > 0 && (
                          <button
                            onClick={(e) => toggleExpandDate(dateKey, e)}
                            className="absolute bottom-1 left-2 right-2 text-xs text-primary 
                                     bg-background/95 border border-primary/20 rounded px-2 py-1
                                     hover:bg-primary/10 transition-colors z-20 font-medium
                                     shadow-sm"
                          >
                            {isExpanded ? 'Show less' : `+${hiddenCount} more`}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Tour Pills Overlay Layer */}
                <div className="absolute inset-0 pointer-events-none">
                  {visibleTourSegments.map((segment, idx) => {
                    const { tour, row, col, span, stackIndex, isFirstSegment, isLastSegment } = segment;
                    const isPastTour = isBefore(new Date(tour.endDate), startOfDay(new Date()));
                    
                    // Calculate positioning - pills sit inside cells, below date number
                    const dateNumberHeight = 2; // 2rem space for date number
                    const pillHeight = 1.75; // 1.75rem per pill including gap
                    const gapSize = 0.5; // 0.5rem (8px), matches gap-2
                    
                    // Get the actual cell height for this row's first day
                    const rowStartDay = calendarDays[row * 7];
                    const rowCellHeight = getCellHeight(rowStartDay);
                    
                    const cellWidth = `calc((100% - ${6 * gapSize}rem) / 7)`;
                    const left = `calc(${col} * (${cellWidth} + ${gapSize}rem))`;
                    const width = `calc(${span} * ${cellWidth} + ${span - 1} * ${gapSize}rem)`;
                    
                    // Calculate cumulative top position
                    let cumulativeTop = 0;
                    for (let i = 0; i < row; i++) {
                      const rowDay = calendarDays[i * 7];
                      cumulativeTop += getCellHeight(rowDay);
                    }
                    
                    const top = `calc(${cumulativeTop}rem + ${dateNumberHeight}rem + ${stackIndex * pillHeight}rem + ${row * gapSize}rem)`;
                    
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
                              top,
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
