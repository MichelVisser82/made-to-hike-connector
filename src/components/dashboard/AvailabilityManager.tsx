import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGuideCalendarView } from '@/hooks/useGuideCalendarView';
import { useGuideTours } from '@/hooks/useGuideTours';
import { useTourDateSlotMutations } from '@/hooks/useTourDateSlotMutations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, ChevronLeft, ChevronRight, Users, DollarSign, Edit2, Trash2, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';

export function AvailabilityManager() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTourFilter, setSelectedTourFilter] = useState<string>('all');

  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  // Fetch guide's tours
  const { data: tours = [] } = useGuideTours(user?.id);

  // Fetch calendar data
  const { data: dateSlots = [], isLoading } = useGuideCalendarView({
    guideId: user?.id,
    startDate: calendarStart,
    endDate: calendarEnd
  });

  // Mutations
  const { deleteDateSlot } = useTourDateSlotMutations();

  // Filter slots by selected tour
  const filteredSlots = useMemo(() => {
    if (selectedTourFilter === 'all') return dateSlots;
    return dateSlots.filter(slot => slot.tourId === selectedTourFilter);
  }, [dateSlots, selectedTourFilter]);

  // Get slots for selected date
  const selectedDateSlots = useMemo(() => {
    if (!selectedDate) return [];
    return filteredSlots.filter(slot => isSameDay(slot.date, selectedDate));
  }, [filteredSlots, selectedDate]);

  // Generate calendar days
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Get slots for a specific day
  const getSlotsForDay = (day: Date) => {
    return filteredSlots.filter(slot => isSameDay(slot.date, day));
  };

  // Get status color for a day
  const getDayStatusColor = (day: Date) => {
    const slots = getSlotsForDay(day);
    if (slots.length === 0) return '';
    
    const hasAvailable = slots.some(s => s.availabilityStatus === 'available');
    const hasLimited = slots.some(s => s.availabilityStatus === 'limited');
    const allBooked = slots.every(s => s.availabilityStatus === 'booked');

    if (allBooked) return 'bg-red-500';
    if (hasLimited) return 'bg-yellow-500';
    if (hasAvailable) return 'bg-green-500';
    return '';
  };

  const handlePreviousMonth = () => setSelectedMonth(subMonths(selectedMonth, 1));
  const handleNextMonth = () => setSelectedMonth(addMonths(selectedMonth, 1));

  const handleDeleteSlot = async (slotId: string) => {
    if (confirm('Are you sure you want to delete this date slot?')) {
      await deleteDateSlot.mutateAsync(slotId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4">
        <Select value={selectedTourFilter} onValueChange={setSelectedTourFilter}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Filter by tour" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tours ({tours.length})</SelectItem>
            {tours.map(tour => (
              <SelectItem key={tour.id} value={tour.id}>
                {tour.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-playfair">
                {format(selectedMonth, 'MMMM yyyy')}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading calendar...</div>
            ) : (
              <>
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, index) => {
                    const slots = getSlotsForDay(day);
                    const isCurrentMonth = day.getMonth() === selectedMonth.getMonth();
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const statusColor = getDayStatusColor(day);

                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(day)}
                        className={`
                          aspect-square p-2 rounded-lg border transition-all
                          ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                          ${isSelected ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}
                          ${!isCurrentMonth && 'opacity-50'}
                        `}
                      >
                        <div className="text-sm font-medium mb-1">{format(day, 'd')}</div>
                        {slots.length > 0 && (
                          <div className="flex gap-1 justify-center flex-wrap">
                            {slots.slice(0, 3).map((slot, i) => (
                              <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  slot.availabilityStatus === 'available' ? 'bg-green-500' :
                                  slot.availabilityStatus === 'limited' ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                              />
                            ))}
                            {slots.length > 3 && (
                              <div className="text-[10px] text-muted-foreground">+{slots.length - 3}</div>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex gap-4 mt-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-muted-foreground">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-muted-foreground">Limited</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-muted-foreground">Fully Booked</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Date Details Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-playfair">
              {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Select a Date'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Click on a date to view and manage date slots
              </p>
            ) : selectedDateSlots.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground mb-4">No tours scheduled</p>
                <Button size="sm" className="bg-burgundy hover:bg-burgundy-dark">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Date Slot
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateSlots.map(slot => (
                  <Card key={slot.slotId} className="border-burgundy/20">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm line-clamp-1">{slot.tourTitle}</h4>
                            <Badge 
                              className={`mt-1 text-xs ${
                                slot.availabilityStatus === 'available' ? 'bg-green-100 text-green-700' :
                                slot.availabilityStatus === 'limited' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}
                            >
                              {slot.availabilityStatus}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>{slot.spotsBooked}/{slot.spotsTotal} spots booked</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <DollarSign className="w-4 h-4" />
                            <span>{slot.currency === 'EUR' ? '€' : '£'}{slot.price}</span>
                            {slot.discountPercentage && (
                              <Badge variant="secondary" className="text-xs">
                                -{slot.discountPercentage}%
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                          >
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSlot(slot.slotId)}
                            className="border-destructive/30 text-destructive hover:bg-destructive/5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button size="sm" className="w-full bg-burgundy hover:bg-burgundy-dark">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Slot
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
