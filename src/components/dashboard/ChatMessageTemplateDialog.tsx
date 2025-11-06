import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ChatMessageTemplate } from '@/hooks/useChatMessageTemplates';

interface ChatMessageTemplateDialogProps {
  template?: Partial<ChatMessageTemplate> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (templateData: Partial<ChatMessageTemplate>) => void;
}

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'greeting', label: 'Greeting' },
  { value: 'booking', label: 'Booking Info' },
  { value: 'safety', label: 'Safety' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'weather', label: 'Weather' },
  { value: 'farewell', label: 'Farewell' },
];

export function ChatMessageTemplateDialog({
  template,
  open,
  onOpenChange,
  onSave,
}: ChatMessageTemplateDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [category, setCategory] = useState('general');

  useEffect(() => {
    if (template) {
      setName(template.name || '');
      setDescription(template.description || '');
      setMessageContent(template.message_content || '');
      setCategory(template.category || 'general');
    } else {
      setName('');
      setDescription('');
      setMessageContent('');
      setCategory('general');
    }
  }, [template, open]);

  const handleSave = () => {
    const templateData: Partial<ChatMessageTemplate> = {
      ...(template?.id && { id: template.id }),
      name,
      description: description || undefined,
      message_content: messageContent,
      category,
      is_active: template?.is_active ?? true,
      sort_order: template?.sort_order ?? 0,
    };

    onSave(templateData);
    onOpenChange(false);
  };

  const isValid = name.trim() && messageContent.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-[1001]">
        <DialogHeader>
          <DialogTitle>
            {template?.id ? 'Edit Chat Message Template' : 'Create Chat Message Template'}
          </DialogTitle>
          <DialogDescription>
            Create standardized messages that you can quickly insert into chat conversations.
          </DialogDescription>
        </DialogHeader>

        {!template?.id && (
          <div className="space-y-2 py-4 border-b">
            <Label>Quick Templates</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Start with a suggested template and customize it
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setName('Welcome & Trip Preparation');
                  setDescription('Initial greeting and preparation info');
                  setMessageContent('Hello everyone! I\'m excited to have you join the tour. Please make sure to bring appropriate hiking gear and check the weather forecast. Looking forward to meeting you!');
                  setCategory('greeting');
                }}
              >
                Welcome Message
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setName('48-Hour Reminder');
                  setDescription('Friendly reminder before the tour');
                  setMessageContent('Hi team! Just a friendly reminder that our tour is coming up in 48 hours. See you at the meeting point soon!');
                  setCategory('booking');
                }}
              >
                Tour Reminder
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setName('Weather Update');
                  setDescription('Share weather conditions');
                  setMessageContent('Weather update for our upcoming tour: Conditions look favorable for hiking. Please dress in layers and bring rain gear just in case.');
                  setCategory('weather');
                }}
              >
                Weather Update
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setName('Post-Trip Thank You');
                  setDescription('Thank participants after the tour');
                  setMessageContent('Thank you all for joining the tour! It was a pleasure guiding you. I\'d appreciate if you could leave a review of your experience.');
                  setCategory('farewell');
                }}
              >
                Thank You
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Welcome Message"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="Brief description of when to use this template"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[1100]">
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message Content *</Label>
            <Textarea
              id="message"
              placeholder="Enter your message template here..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              This message will be available to insert in any chat conversation.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            {template?.id ? 'Update Template' : 'Create Template'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
