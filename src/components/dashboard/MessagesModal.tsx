import { useState } from 'react';
import { format } from 'date-fns';
import { X, MessageSquare, Mail, Phone, Calendar, Send, Paperclip } from 'lucide-react';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import type { BookingWithDetails, Message } from '@/types';

interface MessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingWithDetails;
  messages: Message[];
}

export function MessagesModal({
  isOpen,
  onClose,
  booking,
  messages,
}: MessagesModalProps) {
  const [newMessage, setNewMessage] = useState('');
  const { toast } = useToast();

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    toast({
      title: 'Message sent',
      description: 'Your message has been sent to the guest',
    });
    setNewMessage('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-cream to-cream-light border-b border-burgundy/10 px-6 py-4 -mx-6 -mt-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-burgundy to-burgundy-dark flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-medium text-charcoal">
                  Messages with {booking.guest?.name}
                </h2>
                <p className="text-sm text-charcoal/60">
                  Booking #{booking.id.slice(0, 12)} • {booking.tour?.title}
                </p>
              </div>
            </div>
            <DialogClose>
              <X className="w-5 h-5 text-charcoal/60 hover:text-burgundy transition-colors" />
            </DialogClose>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="hidden md:block">
            <Card className="p-4 space-y-4">
              <div className="flex gap-3">
                <Avatar className="w-10 h-10 bg-gradient-to-br from-burgundy to-burgundy-dark">
                  <AvatarFallback className="bg-gradient-to-br from-burgundy to-burgundy-dark text-white">
                    {getInitials(booking.guest?.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-charcoal">{booking.guest?.name}</p>
                  <p className="text-xs text-charcoal/60">Primary Guest</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-charcoal/60" />
                  <span className="text-charcoal/80 truncate">{booking.guest?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-charcoal/60" />
                  <span className="text-charcoal/80">{booking.guest?.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-charcoal/60" />
                  <span className="text-charcoal/80">
                    {format(new Date(booking.booking_date), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>
              <Separator />
              <p className="text-sm text-charcoal">{booking.tour?.title}</p>
            </Card>
          </div>

          {/* Messages Area */}
          <div className="md:col-span-2">
            {messages.length === 0 ? (
              <div className="py-12 text-center">
                <MessageSquare className="w-16 h-16 text-burgundy/20 mx-auto mb-4" />
                <h3 className="text-lg font-playfair text-charcoal mb-2">
                  No messages yet
                </h3>
                <p className="text-sm text-charcoal/60">
                  Send the first message to start the conversation
                </p>
              </div>
            ) : (
              <ScrollArea className="h-96 pr-4">
                <div className="space-y-4">
                  {messages.map((message) =>
                    message.sender_type === 'hiker' ? (
                      // Guest message
                      <div key={message.id} className="flex justify-start">
                        <div className="max-w-[80%]">
                          <div className="flex items-start gap-2">
                            <Avatar className="w-8 h-8 bg-burgundy text-white flex-shrink-0">
                              <AvatarFallback className="bg-burgundy text-white">
                                {getInitials(booking.guest?.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="bg-cream border border-burgundy/10 rounded-lg p-3">
                                <p className="text-charcoal">{message.message}</p>
                              </div>
                              <p className="text-xs text-charcoal/50 mt-1 ml-1">
                                {format(new Date(message.created_at), 'h:mm a')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Guide message
                      <div key={message.id} className="flex justify-end">
                        <div className="max-w-[80%]">
                          <div className="bg-gradient-to-br from-burgundy to-burgundy-dark rounded-lg p-3">
                            <p className="text-white">{message.message}</p>
                          </div>
                          <p className="text-xs text-charcoal/50 mt-1 text-right mr-1">
                            {format(new Date(message.created_at), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </ScrollArea>
            )}

            {/* Message Input */}
            <div className="mt-4 space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 border-burgundy/20"
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-burgundy hover:bg-burgundy-dark"
                  disabled={!newMessage.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Paperclip className="w-4 h-4 mr-2" />
                  Attach File
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Guest
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
