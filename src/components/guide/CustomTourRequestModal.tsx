import { useState, useEffect } from "react";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CalendarIcon, Users, Mountain, Mail, TrendingUp, MapPin } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { RegionSelector } from "@/components/tour-creation/RegionSelector";

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
  /** Pre-select a specific tour (for "On Request" flow) */
  preSelectedTour?: { id: string; title: string };
  /** Simplified mode for "On Request" - hides tour selection */
  isOnRequest?: boolean;
}

export function CustomTourRequestModal({
  open,
  onOpenChange,
  guideId,
  guideName,
  tours = [],
  preSelectedDate,
  preSelectedTour,
  isOnRequest = false,
}: CustomTourRequestModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [flexibleLocation, setFlexibleLocation] = useState(false);
  const [customRegionText, setCustomRegionText] = useState("");
  const [dateCalendarOpen, setDateCalendarOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    selectedTour: "",
    tourType: "",
    region: "",
    groupSize: "",
    hikerLevel: "",
    preferredDate: undefined as Date | undefined,
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update preferred date and tour when modal opens
  useEffect(() => {
    if (open) {
      setFormData(prev => ({
        ...prev,
        preferredDate: preSelectedDate || prev.preferredDate,
        selectedTour: preSelectedTour?.id || prev.selectedTour,
      }));
    }
  }, [open, preSelectedDate, preSelectedTour]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get current user or use anonymous
      const isAuthenticated = !!user;
      
      const finalRegion = flexibleLocation ? (customRegionText || "Flexible") : formData.region;
      
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
      setFlexibleLocation(false);
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
            {isOnRequest ? 'Request Your Preferred Date' : 'Request Custom Tour'}
          </DialogTitle>
          <DialogDescription>
            {isOnRequest 
              ? `Select your preferred date for "${preSelectedTour?.title}". ${guideName} will confirm availability within 2 hours.`
              : `Tell ${guideName} about your ideal hiking experience. They'll respond within 2 hours with a personalized tour proposal.`
            }
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
            <h3 className="font-semibold text-lg text-charcoal">
              {isOnRequest ? 'Request Details' : 'Tour Details'}
            </h3>
            
            {/* Show tour selection only if NOT in "On Request" mode */}
            {!isOnRequest && (
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
            )}
            
            {/* Show selected tour info in "On Request" mode */}
            {isOnRequest && preSelectedTour && (
              <div className="p-3 bg-burgundy/5 rounded-lg border border-burgundy/10">
                <div className="flex items-center gap-2">
                  <Mountain className="h-4 w-4 text-burgundy" />
                  <span className="font-medium text-charcoal">{preSelectedTour.title}</span>
                </div>
              </div>
            )}

            {/* Conditional fields for custom tour request - only show when NOT in "On Request" mode */}
            {!isOnRequest && formData.selectedTour === "other" && (
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
                  <Label className="flex items-center text-charcoal/80">
                    <MapPin className="h-3.5 w-3.5 mr-1.5 text-burgundy" />
                    Preferred Region *
                  </Label>
                  
                  {/* Flexible Location Checkbox */}
                  <label className="flex items-center gap-3 cursor-pointer py-2">
                    <input 
                      type="checkbox" 
                      checked={flexibleLocation} 
                      onChange={(e) => {
                        setFlexibleLocation(e.target.checked);
                        if (e.target.checked) {
                          setFormData(prev => ({ ...prev, region: "" }));
                        }
                      }} 
                      className="w-4 h-4 text-burgundy border-charcoal/20 rounded focus:ring-burgundy" 
                    />
                    <span className="text-sm text-charcoal/80">I'm flexible on location</span>
                  </label>
                  
                  {/* RegionSelector - only show if not flexible */}
                  {!flexibleLocation && (
                    <RegionSelector 
                      value={formData.region} 
                      onChange={(value) => setFormData(prev => ({ ...prev, region: value }))} 
                    />
                  )}
                  
                  {/* Custom region text input when flexible */}
                  {flexibleLocation && (
                    <Input
                      placeholder="Optionally specify preferred region or area..."
                      value={customRegionText}
                      onChange={(e) => setCustomRegionText(e.target.value)}
                      className="border-burgundy/20 focus:border-burgundy"
                    />
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
                <Input
                  id="groupSize"
                  type="number"
                  min="1"
                  max="50"
                  placeholder="Enter number of people"
                  value={formData.groupSize}
                  onChange={(e) => setFormData({ ...formData, groupSize: e.target.value })}
                  className="border-burgundy/20 focus:border-burgundy"
                  required
                />
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
              className="flex-1 border-burgundy/20 hover:bg-burgundy/5"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-burgundy hover:bg-burgundy/90 text-white"
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
