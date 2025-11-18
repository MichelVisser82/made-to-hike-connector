import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CalendarIcon, Users, Mountain, Mail, TrendingUp, MapPin, ChevronsUpDown, Plus, Check } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useHikingRegions } from '@/hooks/useHikingRegions';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';

interface Tour {
  id: string;
  title: string;
  duration: string;
  difficulty: string;
  price_per_person: number;
}

interface CustomTourRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guideId: string;
  guideName: string;
  tours?: Tour[];
  preSelectedDate?: Date;
}

export function CustomTourRequestModal({
  open,
  onOpenChange,
  guideId,
  guideName,
  tours = [],
  preSelectedDate,
}: CustomTourRequestModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: hikingRegions, isLoading: regionsLoading } = useHikingRegions();
  const [showCustomRegionInput, setShowCustomRegionInput] = useState(false);
  const [customRegionText, setCustomRegionText] = useState("");
  const [regionPopoverOpen, setRegionPopoverOpen] = useState(false);
  const [dateCalendarOpen, setDateCalendarOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    selectedTour: "",
    tourType: "",
    region: "",
    groupSize: "",
    hikerLevel: "",
    preferredDate: preSelectedDate || undefined as Date | undefined,
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get current user or use anonymous
      const isAuthenticated = !!user;
      
      const finalRegion = showCustomRegionInput ? customRegionText : formData.region;
      
      // Call edge function to create custom tour request conversation
      const { data, error } = await supabase.functions.invoke('create-custom-tour-request', {
        body: {
          guide_id: guideId,
          hiker_id: user?.id,
          anonymous_name: !isAuthenticated ? formData.name : undefined,
          anonymous_email: !isAuthenticated ? formData.email : undefined,
          tour_id: formData.selectedTour === "other" ? null : formData.selectedTour || null,
          metadata: {
            group_size: formData.groupSize,
            hiker_level: formData.hikerLevel,
            preferred_date: formData.preferredDate?.toISOString(),
            initial_message: formData.message,
            tour_type: formData.tourType || undefined,
            region: finalRegion || undefined,
          },
        }
      });

      if (error) throw error;

      toast.success("Request sent successfully!", {
        description: `${guideName} will respond within 2 hours.`,
      });

      // Navigate to inbox with the new conversation
      if (isAuthenticated) {
        navigate(`/dashboard?section=inbox&conversation=${data.conversation_id}`);
      }

      // Reset form
      setFormData({
        name: "",
        email: "",
        selectedTour: "",
        tourType: "",
        region: "",
        groupSize: "",
        hikerLevel: "",
        preferredDate: undefined,
        message: "",
      });
      setShowCustomRegionInput(false);
      setCustomRegionText("");
      
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating custom tour request:', error);
      toast.error("Failed to send request", {
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-burgundy" style={{ fontFamily: 'Playfair Display, serif' }}>
            Request Custom Tour
          </DialogTitle>
          <DialogDescription>
            Tell {guideName} about your ideal hiking experience. They'll respond within 2 hours with a personalized tour proposal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          {/* Contact Information - Only show for non-authenticated users */}
          {!user && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-charcoal/80">
                  Your Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Smith"
                  className="border-burgundy/20 focus:border-burgundy"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center text-charcoal/80">
                  <Mail className="h-3.5 w-3.5 mr-1.5 text-burgundy" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="border-burgundy/20 focus:border-burgundy"
                  required
                />
              </div>
            </div>
          )}

          {/* Tour Details */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-lg text-charcoal">Tour Details</h3>
            
            <div className="space-y-2">
              <Label htmlFor="tour" className="flex items-center text-charcoal/80">
                <Mountain className="h-3.5 w-3.5 mr-1.5 text-burgundy" />
                Select Tour *
              </Label>
              <Select
                value={formData.selectedTour}
                onValueChange={(value) => {
                  setFormData({ 
                    ...formData, 
                    selectedTour: value,
                    // Reset conditional fields when switching away from "other"
                    tourType: value === "other" ? formData.tourType : "",
                    region: value === "other" ? formData.region : "",
                  });
                }}
                required
              >
                <SelectTrigger id="tour" className="border-burgundy/20 focus:border-burgundy">
                  <SelectValue placeholder="Choose a tour or custom request" />
                </SelectTrigger>
                <SelectContent>
                  {tours.map((tour) => (
                    <SelectItem key={tour.id} value={tour.id}>
                      {tour.title}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">Other - Custom Tour Request</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conditional fields for custom tour request */}
            {formData.selectedTour === "other" && (
              <div className="space-y-4 pl-4 border-l-2 border-burgundy/20">
                <div className="space-y-2">
                  <Label htmlFor="tourType" className="flex items-center text-charcoal/80">
                    <Mountain className="h-3.5 w-3.5 mr-1.5 text-burgundy" />
                    Tour Type / Interest *
                  </Label>
                  <Select
                    value={formData.tourType}
                    onValueChange={(value) => setFormData({ ...formData, tourType: value })}
                    required
                  >
                    <SelectTrigger id="tourType" className="border-burgundy/20 focus:border-burgundy">
                      <SelectValue placeholder="Select tour type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day_hike">Day Hike</SelectItem>
                      <SelectItem value="multi_day_trek">Multi-Day Trek</SelectItem>
                      <SelectItem value="summit_expedition">Summit Expedition</SelectItem>
                      <SelectItem value="winter_mountaineering">Winter Mountaineering</SelectItem>
                      <SelectItem value="photography_tour">Photography Tour</SelectItem>
                      <SelectItem value="family_friendly">Family-Friendly</SelectItem>
                      <SelectItem value="wildlife_nature">Wildlife & Nature</SelectItem>
                      <SelectItem value="custom_experience">Custom Experience</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region" className="flex items-center text-charcoal/80">
                    <MapPin className="h-3.5 w-3.5 mr-1.5 text-burgundy" />
                    Preferred Region *
                  </Label>
                  
                  <Popover open={regionPopoverOpen} onOpenChange={setRegionPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={regionPopoverOpen}
                        className="w-full justify-between border-burgundy/20 focus:border-burgundy"
                      >
                        {formData.region || "Select region..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search regions..." />
                        <CommandList>
                          <CommandEmpty>No region found.</CommandEmpty>
                          <CommandGroup>
                            {regionsLoading ? (
                              <CommandItem disabled>Loading regions...</CommandItem>
                            ) : (
                              <>
                                {hikingRegions?.map((region) => {
                                  const displayValue = region.region 
                                    ? `${region.country} - ${region.region} - ${region.subregion}`
                                    : `${region.country} - ${region.subregion}`;
                                  
                                  return (
                                    <CommandItem
                                      key={region.id}
                                      value={displayValue.toLowerCase()}
                                      onSelect={() => {
                                        setFormData(prev => ({ ...prev, region: displayValue }));
                                        setShowCustomRegionInput(false);
                                        setCustomRegionText("");
                                        setRegionPopoverOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          formData.region === displayValue ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {displayValue}
                                    </CommandItem>
                                  );
                                })}
                                <CommandItem
                                  value="other"
                                  onSelect={() => {
                                    setFormData(prev => ({ ...prev, region: "Other / Not Listed / Flexible" }));
                                    setShowCustomRegionInput(true);
                                    setRegionPopoverOpen(false);
                                  }}
                                  className="border-t mt-2 pt-2"
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  Other / Not Listed / Flexible
                                </CommandItem>
                              </>
                            )}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {/* Conditional custom region text input */}
                  {showCustomRegionInput && (
                    <div className="mt-2">
                      <Input
                        placeholder="Please specify your preferred region..."
                        value={customRegionText}
                        onChange={(e) => setCustomRegionText(e.target.value)}
                        className="border-burgundy/20 focus:border-burgundy"
                        required
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center text-charcoal/80">
                  <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-burgundy" />
                  Preferred Date *
                </Label>
                <Collapsible open={dateCalendarOpen} onOpenChange={setDateCalendarOpen}>
                  <CollapsibleTrigger asChild>
                    <Button
                      id="date"
                      type="button"
                      variant="outline"
                      className="w-full justify-start text-left font-normal border-burgundy/20 hover:border-burgundy"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.preferredDate ? (
                        format(formData.preferredDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="border rounded-md bg-popover shadow-lg pointer-events-auto relative z-50 w-fit">
                      <Calendar
                        mode="single"
                        selected={formData.preferredDate}
                        onSelect={(date) => {
                          setFormData({ ...formData, preferredDate: date });
                          setDateCalendarOpen(false);
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              <div className="space-y-2">
                <Label htmlFor="groupSize" className="flex items-center text-charcoal/80">
                  <Users className="h-3.5 w-3.5 mr-1.5 text-burgundy" />
                  Group Size *
                </Label>
                <Select
                  value={formData.groupSize}
                  onValueChange={(value) => setFormData({ ...formData, groupSize: value })}
                  required
                >
                  <SelectTrigger id="groupSize" className="border-burgundy/20 focus:border-burgundy">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Solo (1 person)</SelectItem>
                    <SelectItem value="2">2 people</SelectItem>
                    <SelectItem value="3-4">3-4 people</SelectItem>
                    <SelectItem value="5-6">5-6 people</SelectItem>
                    <SelectItem value="7-8">7-8 people</SelectItem>
                    <SelectItem value="8+">8+ people</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hikerLevel" className="flex items-center text-charcoal/80">
                <TrendingUp className="h-3.5 w-3.5 mr-1.5 text-burgundy" />
                Hiker Level *
              </Label>
              <Select
                value={formData.hikerLevel}
                onValueChange={(value) => setFormData({ ...formData, hikerLevel: value })}
                required
              >
                <SelectTrigger id="hikerLevel" className="border-burgundy/20 focus:border-burgundy">
                  <SelectValue placeholder="Select your experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner - New to hiking</SelectItem>
                  <SelectItem value="intermediate">Intermediate - Regular hiker</SelectItem>
                  <SelectItem value="advanced">Advanced - Experienced hiker</SelectItem>
                  <SelectItem value="expert">Expert - Technical terrain comfortable</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Helps guide tailor the tour to your fitness and experience
              </p>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-charcoal/80">Tell us about your ideal tour *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Share any special requests, interests, or questions about your ideal hiking experience..."
              rows={4}
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
