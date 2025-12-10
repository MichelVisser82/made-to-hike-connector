import { useState } from 'react';
import { Forward, Loader2, Mail, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PublicTourRequest {
  id: string;
  trip_name: string;
  region: string;
  preferred_dates: string;
  duration: string;
  group_size: string;
  experience_level: string;
  budget_per_person: string | null;
  description: string;
  special_requests: string[] | null;
  requester_name: string;
}

interface ForwardRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: PublicTourRequest | null;
  guideId: string;
  onForwarded: () => void;
}

export function ForwardRequestModal({
  open,
  onOpenChange,
  request,
  guideId,
  onForwarded,
}: ForwardRequestModalProps) {
  const [email, setEmail] = useState('');
  const [personalNote, setPersonalNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !request) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('respond-to-public-request', {
        body: {
          request_id: request.id,
          guide_id: guideId,
          response_type: 'forwarded',
          forwarded_to_email: email,
          personal_note: personalNote || null,
        },
      });

      if (error) throw error;

      toast.success(`Request forwarded to ${email}`);
      setEmail('');
      setPersonalNote('');
      onOpenChange(false);
      onForwarded();
    } catch (error) {
      console.error('Error forwarding request:', error);
      toast.error('Failed to forward request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {/* Burgundy Gradient Header */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-burgundy to-burgundy/80 rounded-t-lg" />
        
        <DialogHeader className="relative z-10 pt-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Forward className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="text-white font-playfair text-xl">
              Forward Request
            </DialogTitle>
          </div>
          <DialogDescription className="text-white/80">
            Share this tour request with another guide
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Request Summary */}
          <div className="bg-cream/50 rounded-lg p-3 border border-burgundy/10">
            <p className="font-playfair font-semibold text-charcoal">
              {request.trip_name}
            </p>
            <p className="text-sm text-charcoal/60">
              {request.region} • {request.duration} • {request.group_size}
            </p>
          </div>

          {/* Recipient Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-charcoal">
              <Mail className="w-4 h-4 inline mr-2" />
              Recipient Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="guide@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-charcoal/20 focus:border-burgundy"
              required
            />
          </div>

          {/* Personal Note */}
          <div className="space-y-2">
            <Label htmlFor="note" className="text-charcoal">
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Personal Note (Optional)
            </Label>
            <Textarea
              id="note"
              placeholder="Add a personal message for the recipient..."
              value={personalNote}
              onChange={(e) => setPersonalNote(e.target.value)}
              className="border-charcoal/20 focus:border-burgundy"
              rows={3}
            />
          </div>

          {/* Preview Collapsible */}
          <Collapsible open={showPreview} onOpenChange={setShowPreview}>
            <CollapsibleTrigger asChild>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full text-burgundy hover:text-burgundy/80 hover:bg-burgundy/5"
              >
                {showPreview ? 'Hide Preview' : 'Show Email Preview'}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="bg-white border border-charcoal/10 rounded-lg p-4 text-sm space-y-2">
                <p className="font-medium text-charcoal">Email Preview:</p>
                <hr className="border-charcoal/10" />
                <p className="text-charcoal/80">
                  <strong>Subject:</strong> Tour Request Forwarded: {request.trip_name}
                </p>
                <p className="text-charcoal/80">
                  A fellow guide has forwarded a tour request to you:
                </p>
                {personalNote && (
                  <div className="bg-cream/50 p-2 rounded italic text-charcoal/70">
                    "{personalNote}"
                  </div>
                )}
                <ul className="list-disc list-inside text-charcoal/70 space-y-1">
                  <li><strong>Trip:</strong> {request.trip_name}</li>
                  <li><strong>Region:</strong> {request.region}</li>
                  <li><strong>Dates:</strong> {request.preferred_dates}</li>
                  <li><strong>Duration:</strong> {request.duration}</li>
                  <li><strong>Group:</strong> {request.group_size}</li>
                  <li><strong>Level:</strong> {request.experience_level}</li>
                </ul>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="border-charcoal/20"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !email}
              className="bg-burgundy hover:bg-burgundy/90 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Forward className="w-4 h-4 mr-2" />
                  Forward Request
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
