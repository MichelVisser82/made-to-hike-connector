import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Euro, Clock, MapPin, FileText, Send, ChevronRight, ChevronLeft, Users, CheckCircle, X, Mail, Mountain, TrendingUp, Info, MessageCircle, Lightbulb } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Conversation } from "@/types/chat";
import { cn } from "@/lib/utils";

interface QuickOfferFormProps {
  conversation: Conversation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOfferSent: () => void;
}

export function QuickOfferForm({ conversation, open, onOpenChange, onOfferSent }: QuickOfferFormProps) {
  const [step, setStep] = useState(0); // Start at 0 for request review
  const [loading, setLoading] = useState(false);
  
  // Extract data from conversation metadata - support both snake_case and camelCase
  const requestData = conversation.metadata as any || {};
  const groupSize = parseInt(requestData.group_size || requestData.groupSize) || 1;
  const hikerLevel = requestData.hiker_level || requestData.hikerLevel || '';
  const requestedDate = requestData.preferred_date || requestData.preferredDate;
  const tourType = requestData.tour_type || requestData.tourType || '';
  const region = requestData.region || '';
  const initialMessage = requestData.initial_message || requestData.initialMessage || '';
  
  // Get client info
  const clientName = conversation.anonymous_name || conversation.hiker_profile?.name || 'Client';
  const clientEmail = conversation.anonymous_email || '';
  
  // Get tour name - prioritize actual tour title from relationship
  const tourName = conversation.tours?.title || tourType || 'Custom Tour Request';
  const requestCreatedAt = conversation.created_at;
  
  // Parse date as calendar date (ignore time & timezone)
  const parseLocalDate = (dateString: string | undefined) => {
    if (!dateString || typeof dateString !== "string") {
      return undefined;
    }

    try {
      let normalized = dateString;

      // If ISO datetime (e.g. 2025-11-28T23:00:00.000Z), keep only the date part
      if (normalized.includes("T")) {
        [normalized] = normalized.split("T");
      }

      // Format 1: YYYY-MM-DD
      if (normalized.includes("-")) {
        const parts = normalized.split("-");
        if (parts.length === 3) {
          const [year, month, day] = parts.map(Number);
          if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            const date = new Date(year, month - 1, day);
            if (!isNaN(date.getTime())) {
              return date;
            }
          }
        }
      }

      // Format 2: MM/DD/YYYY
      if (normalized.includes("/")) {
        const parts = normalized.split("/");
        if (parts.length === 3) {
          const [month, day, year] = parts.map(Number);
          if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            const date = new Date(year, month - 1, day);
            if (!isNaN(date.getTime())) {
              return date;
            }
          }
        }
      }

      // As a very last resort, try Date constructor (should rarely be needed)
      const fallback = new Date(normalized);
      if (!isNaN(fallback.getTime())) {
        return fallback;
      }

      return undefined;
    } catch {
      return undefined;
    }
  };
  // Form state
  const [formData, setFormData] = useState({
    pricePerPerson: '',
    duration: '',
    preferredDate: undefined as Date | undefined,
    meetingPoint: '',
    meetingTime: '',
    itinerary: '',
    includedItems: 'Professional certified guide\nAll safety equipment\nFirst aid kit\nPhotos from the tour',
    personalNote: '',
  });

  // Set initial date from request when component mounts
  useEffect(() => {
    if (requestedDate && !formData.preferredDate) {
      const parsedDate = parseLocalDate(requestedDate);
      if (parsedDate) {
        setFormData(prev => ({ ...prev, preferredDate: parsedDate }));
      }
    }
  }, [requestedDate]);

  const totalPrice = formData.pricePerPerson ? (parseFloat(formData.pricePerPerson) * groupSize).toFixed(2) : '0.00';

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Get hiker email from conversation
      const hikerEmail = conversation.anonymous_email || 
        (conversation.hiker_id ? (await supabase.from('profiles').select('email').eq('id', conversation.hiker_id).single()).data?.email : null);

      if (!hikerEmail) {
        throw new Error('Could not determine hiker email');
      }

      const { data, error } = await supabase.functions.invoke('create-tour-offer', {
        body: {
          conversation_id: conversation.id,
          guide_id: conversation.guide_id,
          hiker_id: conversation.hiker_id,
          hiker_email: hikerEmail,
          price_per_person: parseFloat(formData.pricePerPerson),
          total_price: parseFloat(totalPrice),
          currency: 'EUR',
          duration: formData.duration,
          preferred_date: formData.preferredDate?.toISOString().split('T')[0],
          group_size: groupSize,
          meeting_point: formData.meetingPoint,
          meeting_time: formData.meetingTime,
          itinerary: formData.itinerary,
          included_items: formData.includedItems,
          personal_note: formData.personalNote,
        },
      });

      if (error) throw error;

      toast({
        title: "Offer Sent",
        description: "Your tour offer has been sent to the client via email.",
      });
      
      onOfferSent();
      onOpenChange(false);
      
      // Reset form
      setStep(0);
      setFormData({
        pricePerPerson: '',
        duration: '',
        preferredDate: requestedDate ? parseLocalDate(requestedDate) : undefined,
        meetingPoint: '',
        meetingTime: '',
        itinerary: '',
        includedItems: 'Professional certified guide\nAll safety equipment\nFirst aid kit\nPhotos from the tour',
        personalNote: '',
      });
    } catch (error) {
      console.error('Error creating offer:', error);
      toast({
        title: "Error",
        description: "Failed to create offer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceedToNextStep = () => {
    if (step === 0) return true;
    if (step === 1) return formData.pricePerPerson && formData.duration;
    if (step === 2) return formData.meetingPoint && formData.meetingTime && formData.itinerary && formData.includedItems;
    return true;
  };

  const getHikerLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      expert: 'Expert',
    };
    return labels[level] || level;
  };

  const renderStepIndicator = () => {
    if (step === 0) return null;
    
    return (
      <div className="flex items-center justify-center gap-4 mb-6">
        {[1, 2, 3].map((stepNum) => (
          <div key={stepNum} className="flex items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all",
                step === stepNum
                  ? "bg-burgundy text-white"
                  : step > stepNum
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-500"
              )}
            >
              {step > stepNum ? <CheckCircle className="w-5 h-5" /> : stepNum}
            </div>
            <div className="ml-2 text-sm">
              <div className={cn("font-medium", step >= stepNum ? "text-charcoal" : "text-gray-400")}>
                {stepNum === 1 && "Pricing"}
                {stepNum === 2 && "Details"}
                {stepNum === 3 && "Review"}
              </div>
            </div>
            {stepNum < 3 && (
              <div className={cn("w-12 h-0.5 mx-3", step > stepNum ? "bg-green-500" : "bg-gray-200")} />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {step === 0 ? (
          // Request Review Step
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-charcoal">
                Tour Request Details
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Received {requestCreatedAt ? format(new Date(requestCreatedAt), "MMMM d, yyyy 'at' h:mm a") : 'recently'}
              </p>
            </DialogHeader>

            <Separator className="my-4" />

            <div className="space-y-4">
              {/* Client Information */}
              <div className="bg-cream/30 rounded-lg p-5 border border-burgundy/10">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-charcoal mb-4">
                  <Mail className="w-5 h-5 text-burgundy" />
                  Client Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Name</p>
                    <p className="text-base font-medium text-charcoal">{clientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <p className="text-base font-medium text-burgundy">{clientEmail}</p>
                  </div>
                </div>
              </div>

              {/* Tour Details */}
              <div className="bg-cream/30 rounded-lg p-5 border border-burgundy/10">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-charcoal mb-4">
                  <Mountain className="w-5 h-5 text-burgundy" />
                  Tour Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Selected Tour</p>
                    <Badge className="bg-burgundy text-white px-3 py-1 text-sm">
                      {tourName}
                    </Badge>
                  </div>
                  
                  <Separator className="bg-burgundy/10" />
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Preferred Date</p>
                      <div className="flex items-center gap-2 text-base font-medium text-charcoal">
                        <CalendarIcon className="w-4 h-4 text-burgundy" />
                        <span>
                          {(() => {
                            const parsedDate = parseLocalDate(requestedDate);
                            return parsedDate ? format(parsedDate, "EEEE, MMMM d, yyyy") : 'Not specified';
                          })()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Group Size</p>
                      <div className="flex items-center gap-2 text-base font-medium text-charcoal">
                        <Users className="w-4 h-4 text-burgundy" />
                        <span>{groupSize === 1 ? 'Solo' : groupSize === 2 ? 'Couple (2 people)' : `${groupSize} people`}</span>
                      </div>
                    </div>
                  </div>
                  
                  {hikerLevel && (
                    <>
                      <Separator className="bg-burgundy/10" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Hiker Experience Level</p>
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-burgundy" />
                          <Badge variant="outline" className="border-blue-300 text-blue-700">
                            {getHikerLevelLabel(hikerLevel)}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-charcoal mt-2">Regular hiker</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Consider this when planning difficulty, pace, and safety requirements
                        </p>
                      </div>
                    </>
                  )}
                  
                  {region && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Region</p>
                      <p className="text-base font-medium text-charcoal">{region}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Client's Message */}
              {initialMessage && (
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-charcoal mb-3">
                    <MessageCircle className="w-5 h-5 text-burgundy" />
                    Client's Message
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-base text-charcoal leading-relaxed">{initialMessage}</p>
                  </div>
                  
                  {/* Quick Assessment Tips */}
                  <div className="mt-4 bg-rose-50 rounded-lg p-4 border border-rose-200">
                    <div className="flex items-start gap-2 mb-3">
                      <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <h4 className="font-semibold text-burgundy">Quick Assessment Tips</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-charcoal/80">
                      <li className="flex items-start gap-2">
                        <span className="text-burgundy mt-1">•</span>
                        <span>Check your calendar availability for {requestedDate ? format(parseLocalDate(requestedDate)!, "MMMM d") : 'the requested date'}</span>
                      </li>
                      {hikerLevel && (
                        <li className="flex items-start gap-2">
                          <span className="text-burgundy mt-1">•</span>
                          <span>Ensure tour difficulty matches {getHikerLevelLabel(hikerLevel).toLowerCase()} level</span>
                        </li>
                      )}
                      <li className="flex items-start gap-2">
                        <span className="text-burgundy mt-1">•</span>
                        <span>Consider weather conditions for the preferred date</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-burgundy mt-1">•</span>
                        <span>Review equipment requirements for group of {groupSize}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-burgundy mt-1">•</span>
                        <span>Respond within 24 hours for best conversion rates</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 border-burgundy text-burgundy hover:bg-burgundy/10"
              >
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
              <Button
                onClick={() => setStep(1)}
                className="flex-1 bg-burgundy hover:bg-burgundy-dark text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Create Quick Offer
              </Button>
            </div>
          </>
        ) : (
          // Offer Creation Steps (1-3)
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-burgundy">
                Create Quick Offer
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Send a professional offer to {clientName} in 3 easy steps
              </p>
            </DialogHeader>

            {renderStepIndicator()}

            {/* Request Summary Card - Always visible */}
            <div className="bg-cream/30 border border-burgundy/20 rounded-lg p-4 mb-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Request from</p>
                  <p className="font-semibold text-charcoal">{clientName}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3 text-burgundy" />
                      {(() => {
                        const parsedDate = parseLocalDate(requestedDate);
                        return parsedDate ? format(parsedDate, "MMM d") : 'TBD';
                      })()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-burgundy" />
                      {groupSize} {groupSize === 1 ? 'person' : 'people'}
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-burgundy" />
                      <Badge variant="outline" className="border-blue-300 text-blue-700 text-xs">
                        {getHikerLevelLabel(hikerLevel)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Tour</p>
                  <Badge variant="outline" className="border-burgundy text-burgundy">
                    {tourName}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {step === 1 && (
                // Step 1: Pricing & Duration
                <div className="space-y-4">
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-burgundy/10 p-4 rounded-full">
                      <Euro className="w-8 h-8 text-burgundy" />
                    </div>
                  </div>
                  <h3 className="text-center text-xl font-semibold text-charcoal">Pricing & Duration</h3>
                  <p className="text-center text-sm text-muted-foreground">Set your offer price and tour length</p>

                  <div className="space-y-4 mt-6">
                    <div>
                      <Label htmlFor="pricePerPerson" className="flex items-center gap-2 text-burgundy font-medium">
                        <Euro className="w-4 h-4" />
                        Price per Person (€) *
                      </Label>
                      <Input
                        id="pricePerPerson"
                        type="number"
                        placeholder="150"
                        value={formData.pricePerPerson}
                        onChange={(e) => setFormData({ ...formData, pricePerPerson: e.target.value })}
                        className="mt-1.5 border-burgundy/30 focus:border-burgundy"
                        required
                      />
                      {formData.pricePerPerson && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Total for {groupSize} {groupSize === 1 ? 'person' : 'people'}: <span className="font-semibold text-burgundy">€{totalPrice}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="duration" className="flex items-center gap-2 text-burgundy font-medium">
                        <Clock className="w-4 h-4" />
                        Duration *
                      </Label>
                      <Input
                        id="duration"
                        type="text"
                        placeholder="e.g., 1 day, 2 days, 4 hours"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="mt-1.5 border-burgundy/30 focus:border-burgundy"
                        required
                      />
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 text-burgundy font-medium mb-2">
                        <CalendarIcon className="w-4 h-4" />
                        Tour Date
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal border-burgundy/30",
                              !formData.preferredDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-burgundy" />
                            {formData.preferredDate ? format(formData.preferredDate, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.preferredDate}
                            onSelect={(date) => setFormData({ ...formData, preferredDate: date })}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                // Step 2: Meeting Details & Itinerary
                <div className="space-y-4">
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-burgundy/10 p-4 rounded-full">
                      <MapPin className="w-8 h-8 text-burgundy" />
                    </div>
                  </div>
                  <h3 className="text-center text-xl font-semibold text-charcoal">Tour Details</h3>
                  <p className="text-center text-sm text-muted-foreground">Provide meeting point and itinerary</p>

                  <div className="space-y-4 mt-6">
                    <div>
                      <Label htmlFor="meetingPoint" className="flex items-center gap-2 text-burgundy font-medium">
                        <MapPin className="w-4 h-4" />
                        Meeting Point *
                      </Label>
                      <Input
                        id="meetingPoint"
                        type="text"
                        placeholder="e.g., Village parking lot"
                        value={formData.meetingPoint}
                        onChange={(e) => setFormData({ ...formData, meetingPoint: e.target.value })}
                        className="mt-1.5 border-burgundy/30 focus:border-burgundy"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="meetingTime" className="flex items-center gap-2 text-burgundy font-medium">
                        <Clock className="w-4 h-4" />
                        Meeting Time *
                      </Label>
                      <Input
                        id="meetingTime"
                        type="text"
                        placeholder="e.g., 9:00 AM"
                        value={formData.meetingTime}
                        onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
                        className="mt-1.5 border-burgundy/30 focus:border-burgundy"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="itinerary" className="flex items-center gap-2 text-burgundy font-medium">
                        <Mountain className="w-4 h-4" />
                        Tour Itinerary *
                      </Label>
                      <Textarea
                        id="itinerary"
                        placeholder="Brief description of the route, highlights, and what to expect..."
                        rows={4}
                        value={formData.itinerary}
                        onChange={(e) => setFormData({ ...formData, itinerary: e.target.value })}
                        className="mt-1.5 border-burgundy/30 focus:border-burgundy"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Mention key viewpoints and any special considerations for their group
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="includedItems" className="flex items-center gap-2 text-burgundy font-medium">
                        <CheckCircle className="w-4 h-4" />
                        What's Included *
                      </Label>
                      <Textarea
                        id="includedItems"
                        placeholder="Professional certified guide&#10;All safety equipment&#10;First aid kit&#10;Photos from the tour"
                        rows={4}
                        value={formData.includedItems}
                        onChange={(e) => setFormData({ ...formData, includedItems: e.target.value })}
                        className="mt-1.5 border-burgundy/30 focus:border-burgundy font-mono text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                // Step 3: Review & Personal Note
                <div className="space-y-4">
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-green-500/10 p-4 rounded-full">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-center text-xl font-semibold text-charcoal">Review & Send</h3>
                  <p className="text-center text-sm text-muted-foreground">Add a personal touch before sending</p>

                  <div className="bg-cream/30 border border-burgundy/20 rounded-lg p-4 space-y-3 mt-6">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Price per person</p>
                        <p className="font-semibold text-burgundy">€{formData.pricePerPerson}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total price</p>
                        <p className="font-semibold text-burgundy">€{totalPrice}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="font-semibold text-charcoal">{formData.duration}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Date</p>
                        <p className="font-semibold text-charcoal">
                          {formData.preferredDate ? format(formData.preferredDate, "MMM d, yyyy") : 'TBD'}
                        </p>
                      </div>
                    </div>
                    <Separator className="my-2" />
                    <div className="text-sm">
                      <p className="text-muted-foreground mb-1">Meeting point</p>
                      <p className="font-medium text-charcoal">{formData.meetingPoint} at {formData.meetingTime}</p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="personalNote" className="text-burgundy font-medium">
                      Personal Note (Optional)
                    </Label>
                    <Textarea
                      id="personalNote"
                      placeholder="Add a personal message to make your offer stand out..."
                      rows={3}
                      value={formData.personalNote}
                      onChange={(e) => setFormData({ ...formData, personalNote: e.target.value })}
                      className="mt-1.5 border-burgundy/30 focus:border-burgundy"
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <div className="flex gap-2">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold text-blue-900 mb-2">📧 What happens next?</p>
                        <ul className="space-y-1 text-blue-800">
                          <li>• {clientName} receives this offer via email</li>
                          <li>• They can book instantly or decline with one click</li>
                          <li>• You'll be notified immediately of their decision</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="border-burgundy/30 text-charcoal hover:bg-burgundy/5"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}
              {step === 1 && (
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="border-burgundy/30 text-charcoal hover:bg-burgundy/5"
                >
                  Cancel
                </Button>
              )}
              {step < 3 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceedToNextStep()}
                  className="flex-1 bg-burgundy hover:bg-burgundy-dark text-white disabled:opacity-50"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-burgundy hover:bg-burgundy-dark text-white"
                >
                  {loading ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Offer
                    </>
                  )}
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
