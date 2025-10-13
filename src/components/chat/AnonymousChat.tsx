import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageCircle, Send, Mail, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AnonymousChatProps {
  isOpen: boolean;
  onClose: () => void;
  tourId: string;
  guideId: string;
  tourTitle: string;
}

export function AnonymousChat({ isOpen, onClose, tourId, guideId, tourTitle }: AnonymousChatProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim() || !name.trim() || !message.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setSending(true);
    setError(null);

    try {
      // Create anonymous conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          tour_id: tourId,
          guide_id: guideId,
          anonymous_email: email,
          anonymous_name: name,
          conversation_type: 'tour_inquiry',
          status: 'active'
        })
        .select()
        .single();

      if (convError) throw convError;

      // Send initial message
      await supabase.functions.invoke('send-message', {
        body: {
          conversationId: conversation.id,
          content: message,
          senderType: 'anonymous',
          senderName: name
        }
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setEmail('');
        setName('');
        setMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-burgundy" />
            Ask about {tourTitle}
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle className="w-16 h-16 text-sage mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-charcoal mb-2">
              Message Sent!
            </h3>
            <p className="text-sm text-charcoal/60">
              Check your email for the guide's response.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                The guide will respond to your email address. You don't need to create an account.
              </AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Smith"
                disabled={sending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                disabled={sending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Your Question</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="I'd like to know more about..."
                rows={4}
                disabled={sending}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={sending}
                className="flex-1 bg-burgundy hover:bg-burgundy-dark"
              >
                {sending ? 'Sending...' : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                disabled={sending}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
