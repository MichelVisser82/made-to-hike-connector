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
import { CalendarIcon, Users, Mountain, Mail, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    selectedTour: "",
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
      
      // Call edge function to create custom tour request conversation
      const { data, error } = await supabase.functions.invoke('create-custom-tour-request', {
        body: {
          guide_id: guideId,
          hiker_id: user?.id,
          anonymous_name: !isAuthenticated ? formData.name : undefined,
          anonymous_email: !isAuthenticated ? formData.email : undefined,
          tour_id: formData.selectedTour || null,
          metadata: {
            group_size: formData.groupSize,
            hiker_level: formData.hikerLevel,
            preferred_date: formData.preferredDate?.toISOString(),
            initial_message: formData.message,
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
        groupSize: "",
        hikerLevel: "",
        preferredDate: undefined,
        message: "",
      });
      
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
          <DialogTitle className="text-2xl font-serif text-primary">
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
                <Label htmlFor="name">
                  Your Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Smith"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center">
                  <Mail className="h-3.5 w-3.5 mr-1.5" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>
          )}

          {/* Tour Details */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold">Tour Details</h3>
            
            <div className="space-y-2">
              <Label htmlFor="tour" className="flex items-center">
                <Mountain className="h-3.5 w-3.5 mr-1.5 text-primary" />
                Select Tour *
              </Label>
              <Select
                value={formData.selectedTour}
                onValueChange={(value) => setFormData({ ...formData, selectedTour: value })}
                required
              >
                <SelectTrigger id="tour">
                  <SelectValue placeholder="Choose a tour or custom request" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom Tour Request</SelectItem>
                  {tours.map((tour) => (
                    <SelectItem key={tour.id} value={tour.id}>
                      {tour.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center">
                  <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  Preferred Date *
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.preferredDate ? (
                        format(formData.preferredDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
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

              <div className="space-y-2">
                <Label htmlFor="groupSize" className="flex items-center">
                  <Users className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  Group Size *
                </Label>
                <Select
                  value={formData.groupSize}
                  onValueChange={(value) => setFormData({ ...formData, groupSize: value })}
                  required
                >
                  <SelectTrigger id="groupSize">
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
              <Label htmlFor="hikerLevel" className="flex items-center">
                <TrendingUp className="h-3.5 w-3.5 mr-1.5 text-primary" />
                Hiker Level *
              </Label>
              <Select
                value={formData.hikerLevel}
                onValueChange={(value) => setFormData({ ...formData, hikerLevel: value })}
                required
              >
                <SelectTrigger id="hikerLevel">
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
            <Label htmlFor="message">Tell us about your ideal tour *</Label>
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
