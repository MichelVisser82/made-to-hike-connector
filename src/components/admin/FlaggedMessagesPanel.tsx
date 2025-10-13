import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Check, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Message } from '@/types/chat';

export function FlaggedMessagesPanel() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchFlaggedMessages();

    // Subscribe to new flagged messages
    const channel = supabase
      .channel('flagged-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: 'moderation_status=eq.flagged'
        },
        () => {
          fetchFlaggedMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchFlaggedMessages = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        conversations!inner(
          tour_id,
          hiker_id,
          guide_id,
          tours(title)
        )
      `)
      .eq('moderation_status', 'flagged')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching flagged messages:', error);
    } else {
      setMessages((data || []) as any);
    }

    setLoading(false);
  };

  const handleApprove = async (messageId: string) => {
    const { error } = await supabase
      .from('messages')
      .update({ moderation_status: 'approved' })
      .eq('id', messageId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve message',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Message approved',
      description: 'The message is now visible to all users'
    });

    fetchFlaggedMessages();
  };

  const handleDelete = async (messageId: string) => {
    const { error } = await supabase
      .from('messages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', messageId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Message deleted',
      description: 'The message has been removed'
    });

    fetchFlaggedMessages();
  };

  const filteredMessages = filter === 'all'
    ? messages
    : messages.filter((msg) =>
        msg.moderation_flags?.includes(filter)
      );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Flagged Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4 flex-wrap">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All ({messages.length})
            </Button>
            <Button
              variant={filter === 'phone_number_detected' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('phone_number_detected')}
            >
              Phone Numbers
            </Button>
            <Button
              variant={filter === 'email_detected' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('email_detected')}
            >
              Emails
            </Button>
            <Button
              variant={filter === 'external_url_detected' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('external_url_detected')}
            >
              External URLs
            </Button>
          </div>

          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Loading...</p>
          ) : filteredMessages.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No flagged messages</p>
          ) : (
            <div className="space-y-4">
              {filteredMessages.map((message) => (
                <Card key={message.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          {message.moderation_flags?.map((flag: string) => (
                            <Badge key={flag} variant="destructive">
                              {flag.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium">Original:</p>
                            <p className="text-sm text-muted-foreground">{message.content}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Moderated:</p>
                            <p className="text-sm text-muted-foreground">{message.moderated_content}</p>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground mt-2">
                          From: {message.sender_name} • Tour: {message.conversations?.tours?.title}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprove(message.id)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(message.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
