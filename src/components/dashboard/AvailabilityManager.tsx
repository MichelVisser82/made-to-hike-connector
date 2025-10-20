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

  // Group calendar days into weeks
  const calendarWeeks = useMemo(() => {
    const weeks: Date[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }
    return weeks;
  }, [calendarDays]);

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
      case 'available': return 'bg-green-500';
      case 'limited': return 'bg-yellow-500';
      case 'booked': return 'bg-red-500';
      default: return 'bg-gray-400';
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
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid - Full Month View */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day) => {
                const isPast = isBefore(day, startOfDay(new Date()));
                const isCurrentMonth = isSameMonth(day, selectedMonth);
                const isSelected = selectedDate && isSameDay(day, selectedDate);

                // Get tours that include this specific day
                const dayTours = filteredSlots.filter(slot => {
                  const slotStart = startOfDay(slot.date);
                  const slotEnd = startOfDay(slot.endDate);
                  const checkDate = startOfDay(day);
                  return checkDate >= slotStart && checkDate <= slotEnd;
                });

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleDateClick(day)}
                    disabled={isPast}
                    className={`
                      min-h-[120px] p-2 rounded-lg border text-left
                      transition-colors flex flex-col gap-1
                      ${isPast ? 'opacity-40 cursor-not-allowed bg-muted/50' : 'cursor-pointer hover:bg-accent'}
                      ${!isCurrentMonth ? 'text-muted-foreground' : ''}
                      ${isSelected ? 'ring-2 ring-primary' : ''}
                    `}
                  >
                    {/* Date number - always at top */}
                    <div className={`text-sm font-semibold mb-1 ${isPast ? 'line-through' : ''}`}>
                      {format(day, 'd')}
                    </div>

                    {/* Tour pills for this day */}
                    <div className="flex flex-col gap-1 w-full">
                      {dayTours.map((slot) => {
                        const isPastTour = isBefore(slot.endDate, startOfDay(new Date()));
                        const isFirstDay = isSameDay(slot.date, day);

                        return (
                          <TooltipProvider key={slot.slotId}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`
                                    px-2 py-1 rounded text-xs font-medium
                                    flex items-center gap-1.5
                                    border shadow-sm
                                    ${isPastTour ? 'opacity-50 grayscale' : ''}
                                    bg-card hover:bg-accent transition-colors w-full
                                  `}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedDate(day);
                                  }}
                                >
                                  {isFirstDay && (
                                    <>
                                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusDotColor(slot.availabilityStatus)}`} />
                                      <span className="truncate flex-1">{slot.tourTitle}</span>
                                    </>
                                  )}
                                  {!isFirstDay && (
                                    <div className="w-full h-0.5 bg-border rounded" />
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="space-y-1">
                                  <p className="font-semibold">{slot.tourTitle}</p>
                                  <p className="text-sm">{format(slot.date, 'MMM d')} - {format(slot.endDate, 'MMM d, yyyy')}</p>
                                  <p className="text-sm">{slot.spotsBooked}/{slot.spotsTotal} spots booked</p>
                                  <p className="text-sm">{slot.currency} {slot.price}</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>Limited</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Fully Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400 opacity-40" />
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
