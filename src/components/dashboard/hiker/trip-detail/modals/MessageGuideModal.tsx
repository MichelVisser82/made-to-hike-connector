import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { TripDetails } from '@/hooks/useTripDetails';
import { Loader2 } from 'lucide-react';

interface MessageGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripDetails: TripDetails;
}

export function MessageGuideModal({ isOpen, onClose, tripDetails }: MessageGuideModalProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  const { guide, booking, tour } = tripDetails;

  if (!tour || !guide) {
    return null;
  }

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({
        title: 'Message required',
        description: 'Please enter a message to send.',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Find or create conversation
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('hiker_id', user.id)
        .eq('guide_id', guide.user_id)
        .eq('booking_id', booking.id)
        .maybeSingle();

      let conversationId = existingConv?.id;

      if (!conversationId) {
        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert({
            hiker_id: user.id,
            guide_id: guide.user_id,
            tour_id: tour.id,
            booking_id: booking.id,
            conversation_type: 'booking_related'
          })
          .select('id')
          .single();

        if (convError) throw convError;
        conversationId = newConv.id;
      }

      // Send message using edge function
      const { error: sendError } = await supabase.functions.invoke('send-message', {
        body: {
          conversationId: conversationId,
          content: message.trim(),
          senderType: 'hiker'
        }
      });

      if (sendError) throw sendError;

      toast({
        title: 'Message sent',
        description: `Your message has been sent to ${guide.display_name}.`,
      });

      setMessage('');
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Message {guide.display_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Send a message about your trip: {tour.title}
            </p>
            <Textarea
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose} disabled={sending}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage} disabled={sending || !message.trim()}>
              {sending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Send Message
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
