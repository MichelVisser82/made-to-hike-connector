import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Euro, Clock, MapPin, FileText, Send, ChevronRight, ChevronLeft, Users } from "lucide-react";
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
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Extract data from conversation metadata
  const requestData = conversation.metadata as any || {};
  const groupSize = parseInt(requestData.group_size) || 1;
  const hikerLevel = requestData.hiker_level || '';
  const requestedDate = requestData.preferred_date;
  const tourType = requestData.tour_type || '';
  const region = requestData.region || '';
  
  // Form state
  const [formData, setFormData] = useState({
    pricePerPerson: '',
    duration: '',
    preferredDate: requestedDate ? new Date(requestedDate) : undefined,
    meetingPoint: '',
    meetingTime: '',
    itinerary: '',
    includedItems: '',
    personalNote: '',
  });

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
      setStep(1);
      setFormData({
        pricePerPerson: '',
        duration: '',
        preferredDate: requestedDate ? new Date(requestedDate) : undefined,
        meetingPoint: '',
        meetingTime: '',
        itinerary: '',
        includedItems: '',
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

  const canProceedStep1 = formData.pricePerPerson && formData.duration && formData.preferredDate;
  const canProceedStep2 = formData.meetingPoint && formData.meetingTime && formData.itinerary && formData.includedItems;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <FileText className="w-6 h-6 text-primary" />
            Create Tour Offer
          </DialogTitle>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-medium transition-colors",
                  step >= num ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                {num}
              </div>
              {num < 3 && (
                <div
                  className={cn(
                    "w-24 h-1 mx-2 transition-colors",
                    step > num ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Request Summary */}
        <div className="bg-muted/50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-2">Request Details</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="font-medium">Group Size:</span> {groupSize} people</div>
            {hikerLevel && <div><span className="font-medium">Level:</span> {hikerLevel}</div>}
            {tourType && <div><span className="font-medium">Type:</span> {tourType}</div>}
            {region && <div><span className="font-medium">Region:</span> {region}</div>}
          </div>
        </div>

        {/* Step 1: Pricing & Duration */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="pricePerPerson">Price per Person (€)</Label>
              <div className="relative">
                <Euro className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="pricePerPerson"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="150.00"
                  className="pl-10"
                  value={formData.pricePerPerson}
                  onChange={(e) => setFormData({ ...formData, pricePerPerson: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="duration">Duration</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="duration"
                  placeholder="e.g., 2 days, 4 hours"
                  className="pl-10"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Tour Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.preferredDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
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

            {formData.pricePerPerson && (
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">Total for {groupSize} {groupSize === 1 ? 'person' : 'people'}:</span>
                  </div>
                  <span className="text-lg font-bold">€{totalPrice}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Meeting Details */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="meetingPoint">Meeting Point</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="meetingPoint"
                  placeholder="e.g., Main Square, Parking Lot B"
                  className="pl-10"
                  value={formData.meetingPoint}
                  onChange={(e) => setFormData({ ...formData, meetingPoint: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="meetingTime">Meeting Time</Label>
              <Input
                id="meetingTime"
                type="time"
                value={formData.meetingTime}
                onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="itinerary">Itinerary</Label>
              <Textarea
                id="itinerary"
                placeholder="Describe the tour route, key stops, and activities..."
                rows={6}
                value={formData.itinerary}
                onChange={(e) => setFormData({ ...formData, itinerary: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="includedItems">What's Included</Label>
              <Textarea
                id="includedItems"
                placeholder="List what's included (e.g., Guide services, Safety equipment, Snacks...)"
                rows={4}
                value={formData.includedItems}
                onChange={(e) => setFormData({ ...formData, includedItems: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Step 3: Personal Touch & Review */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="personalNote">Personal Message (Optional)</Label>
              <Textarea
                id="personalNote"
                placeholder="Add a personal message to your client..."
                rows={4}
                value={formData.personalNote}
                onChange={(e) => setFormData({ ...formData, personalNote: e.target.value })}
              />
            </div>

            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <h3 className="font-semibold text-lg">Review Your Offer</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price per person:</span>
                  <span className="font-medium">€{formData.pricePerPerson}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Group size:</span>
                  <span className="font-medium">{groupSize} people</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>Total:</span>
                  <span>€{totalPrice}</span>
                </div>
              </div>

              <div className="border-t pt-3 space-y-1 text-sm">
                <div><span className="font-medium">Duration:</span> {formData.duration}</div>
                <div><span className="font-medium">Date:</span> {formData.preferredDate ? format(formData.preferredDate, "PPP") : 'Not set'}</div>
                <div><span className="font-medium">Meeting:</span> {formData.meetingPoint} at {formData.meetingTime}</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              if (step === 1) {
                onOpenChange(false);
              } else {
                setStep(step - 1);
              }
            }}
            disabled={loading}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>

          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={(step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              <Send className="w-4 h-4 mr-2" />
              {loading ? 'Sending...' : 'Send Offer'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
