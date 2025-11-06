import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import type { MessageTemplate } from '@/types';

interface TemplateEditorDialogProps {
  template: MessageTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (templateId: string, updates: Partial<MessageTemplate>) => void;
}

const VARIABLE_SUGGESTIONS = [
  { label: 'Guest First Name', value: '{guest-firstname}' },
  { label: 'Guest Last Name', value: '{guest-lastname}' },
  { label: 'Tour Name', value: '{tour-name}' },
  { label: 'Tour Date', value: '{tour-date}' },
  { label: 'Number of Guests', value: '{guest-count}' },
  { label: 'Guide Name', value: '{guide-name}' },
  { label: 'Meeting Point', value: '{meeting-point}' },
  { label: 'Start Time', value: '{start-time}' },
];

export const TemplateEditorDialog = ({
  template,
  open,
  onOpenChange,
  onSave,
}: TemplateEditorDialogProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update local state when template changes
  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description);
      setContent(template.content);
    } else {
      setName('');
      setDescription('');
      setContent('');
    }
  }, [template]);

  const handleInsertVariable = (variable: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + variable + content.substring(end);
    
    setContent(newContent);
    
    // Set cursor position after the inserted variable
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  };

  const handleSave = () => {
    if (!template) return;
    
    onSave(template.id, {
      name,
      description,
      content,
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Quick Reply Template</DialogTitle>
          <DialogDescription>
            Customize your template and use variables to personalize messages
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Template Name */}
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              placeholder="e.g., Welcome Message"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Template Description */}
          <div className="space-y-2">
            <Label htmlFor="template-description">Description</Label>
            <Input
              id="template-description"
              placeholder="e.g., Initial greeting for new bookings"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Variable Suggestions */}
          <div className="space-y-2">
            <Label>Insert Variables</Label>
            <div className="flex flex-wrap gap-2">
              {VARIABLE_SUGGESTIONS.map((variable) => (
                <Badge
                  key={variable.value}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => handleInsertVariable(variable.value)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {variable.label}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Click a variable to insert it at your cursor position
            </p>
          </div>

          {/* Template Content */}
          <div className="space-y-2">
            <Label htmlFor="template-content">Message Template</Label>
            <Textarea
              ref={textareaRef}
              id="template-content"
              placeholder="Write your message template here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="resize-none"
            />
          </div>

          {/* Preview Section */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="p-4 rounded-lg border bg-muted/50">
              <p className="text-sm whitespace-pre-wrap">
                {content || 'Your message preview will appear here...'}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name || !content}>
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
