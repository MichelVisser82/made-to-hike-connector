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
            <div className="mb-2 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs font-medium mb-2">Available Variables (click to insert):</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Guest Name', value: '{guest-name}' },
                  { label: 'Tour Name', value: '{tour-name}' },
                  { label: 'Tour Date', value: '{tour-date}' },
                  { label: 'Meeting Point', value: '{meeting-point}' },
                  { label: 'Guide Name', value: '{guide-name}' },
                ].map((variable) => (
                  <Button
                    key={variable.value}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => {
                      const textarea = document.getElementById('message') as HTMLTextAreaElement;
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const newText = messageContent.substring(0, start) + variable.value + messageContent.substring(end);
                      setMessageContent(newText);
                      setTimeout(() => {
                        textarea.focus();
                        textarea.setSelectionRange(start + variable.value.length, start + variable.value.length);
                      }, 0);
                    }}
                  >
                    {variable.label}
                  </Button>
                ))}
              </div>
            </div>
            <Textarea
              id="message"
              placeholder="Enter your message template here..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Use variables to personalize messages. They will be replaced with actual values when sending.
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
