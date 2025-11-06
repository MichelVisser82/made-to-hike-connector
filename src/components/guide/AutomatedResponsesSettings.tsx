import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AutomatedMessage {
  id: string;
  trigger_type: string;
  message_template: string;
  delay_minutes: number;
  is_active: boolean;
}

const quickTemplates = [
  {
    label: 'Welcome & Trip Preparation',
    message: 'Hello everyone! I\'m excited to have you join the tour. Please make sure to bring appropriate hiking gear and check the weather forecast. Looking forward to meeting you!',
    delay: 0,
  },
  {
    label: '48-Hour Reminder',
    message: 'Hi team! Just a friendly reminder that our tour is coming up in 48 hours. See you at the meeting point soon!',
    delay: 0,
  },
  {
    label: 'Weather Update',
    message: 'Weather update for our upcoming tour: Conditions look favorable for hiking. Please dress in layers and bring rain gear just in case.',
    delay: 0,
  },
  {
    label: 'Post-Trip Thank You',
    message: 'Thank you all for joining the tour! It was a pleasure guiding you. I\'d appreciate if you could leave a review of your experience.',
    delay: 0,
  },
];

export function AutomatedResponsesSettings() {
  const [messages, setMessages] = useState<AutomatedMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [delayMinutes, setDelayMinutes] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchAutomatedMessages();
  }, [user?.id]);

  const fetchAutomatedMessages = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('automated_messages')
      .select('*')
      .eq('guide_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching automated messages:', error);
      return;
    }

    setMessages(data || []);
  };

  const handleCreate = async () => {
    if (!newMessage.trim()) return;

    const { error } = await supabase
      .from('automated_messages')
      .insert({
        guide_id: user?.id,
        trigger_type: 'new_inquiry',
        message_template: newMessage,
        delay_minutes: delayMinutes,
        is_active: true
      });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to create automated response',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Automated response created'
    });

    setNewMessage('');
    setDelayMinutes(0);
    fetchAutomatedMessages();
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('automated_messages')
      .update({ is_active: !isActive })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update response',
        variant: 'destructive'
      });
      return;
    }

    fetchAutomatedMessages();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('automated_messages')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete response',
        variant: 'destructive'
      });
      return;
    }

    fetchAutomatedMessages();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Automated Responses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Set up automatic replies to new tour inquiries. Use variables like {"{{hiker_name}}"} and {"{{tour_title}}"}.
          </p>

          {/* Quick Templates */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Quick Templates</Label>
            <div className="grid grid-cols-2 gap-2">
              {quickTemplates.map((template, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="justify-start h-auto py-2 px-3 text-left border-burgundy/20 hover:bg-burgundy/5"
                  onClick={() => {
                    setNewMessage(template.message);
                    setDelayMinutes(template.delay);
                  }}
                >
                  <FileText className="w-4 h-4 mr-2 flex-shrink-0 text-burgundy" />
                  <span className="text-xs line-clamp-1">{template.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Message Template</Label>
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Hi {{hiker_name}}! Thanks for your interest in {{tour_title}}. I'll get back to you within 24 hours."
                rows={4}
              />
            </div>

            <div>
              <Label>Delay (minutes)</Label>
              <Input
                type="number"
                value={delayMinutes}
                onChange={(e) => setDelayMinutes(parseInt(e.target.value) || 0)}
                placeholder="0"
                min="0"
              />
            </div>

            <Button onClick={handleCreate} className="bg-burgundy hover:bg-burgundy/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Automated Response
            </Button>
          </div>
        </CardContent>
      </Card>

      {messages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Automated Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="flex items-start justify-between p-4 border rounded-lg border-burgundy/10">
                  <div className="flex-1">
                    <p className="text-sm">{msg.message_template}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Delay: {msg.delay_minutes} minutes
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={msg.is_active}
                      onCheckedChange={() => handleToggle(msg.id, msg.is_active)}
                      className="data-[state=checked]:bg-burgundy"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(msg.id)}
                      className="text-burgundy hover:bg-burgundy/5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
