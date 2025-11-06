import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Wand2 } from 'lucide-react'
import type { EmailTemplate } from '@/hooks/useEmailTemplates'

const VARIABLE_SUGGESTIONS = [
  { variable: '{guest-firstname}', description: "Guest's first name" },
  { variable: '{guest-lastname}', description: "Guest's last name" },
  { variable: '{guest-fullname}', description: "Guest's full name" },
  { variable: '{tour-name}', description: 'Tour title' },
  { variable: '{tour-date}', description: 'Booking date' },
  { variable: '{guest-count}', description: 'Number of participants' },
  { variable: '{guide-name}', description: 'Your name' },
  { variable: '{meeting-point}', description: 'Meeting location' },
  { variable: '{start-time}', description: 'Start time' },
]

const TRIGGER_TYPES = [
  { value: 'booking_confirmed', label: 'Booking Confirmed', description: 'Send when booking is confirmed' },
  { value: 'booking_reminder', label: 'Tour Reminder', description: 'Send before tour date' },
  { value: 'tour_completed', label: 'Tour Completed', description: 'Send after tour completes' },
  { value: 'custom', label: 'Custom Timing', description: 'Configure custom timing' },
]

interface EmailTemplateEditorDialogProps {
  template: Partial<EmailTemplate> | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (templateData: Partial<EmailTemplate>) => void
}

export const EmailTemplateEditorDialog = ({ template, open, onOpenChange, onSave }: EmailTemplateEditorDialogProps) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [triggerType, setTriggerType] = useState<EmailTemplate['trigger_type']>('booking_reminder')
  const [timingValue, setTimingValue] = useState(48)
  const [timingUnit, setTimingUnit] = useState<'minutes' | 'hours' | 'days'>('hours')
  const [timingDirection, setTimingDirection] = useState<'before' | 'after'>('before')
  const [sendAsEmail, setSendAsEmail] = useState(true)
  const [isActive, setIsActive] = useState(true)
  const [lastFocusedField, setLastFocusedField] = useState<'subject' | 'content'>('content')

  const subjectInputRef = useRef<HTMLInputElement>(null)
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null)
  const pendingCursorPosition = useRef<{ field: 'subject' | 'content', position: number, scrollTop?: number } | null>(null)

  useEffect(() => {
    if (template) {
      setName(template.name || '')
      setDescription(template.description || '')
      setSubject(template.subject || '')
      setContent(template.content || '')
      setTriggerType(template.trigger_type || 'booking_reminder')
      setTimingValue(template.timing_value || 48)
      setTimingUnit(template.timing_unit || 'hours')
      setTimingDirection(template.timing_direction || 'before')
      setSendAsEmail(template.send_as_email ?? true)
      setIsActive(template.is_active ?? true)
    } else {
      setName('')
      setDescription('')
      setSubject('')
      setContent('')
      setTriggerType('booking_reminder')
      setTimingValue(48)
      setTimingUnit('hours')
      setTimingDirection('before')
      setSendAsEmail(true)
      setIsActive(true)
    }
  }, [template, open])

  const handleInsertVariable = (variable: string) => {
    const field = lastFocusedField
    
    if (field === 'subject') {
      const input = subjectInputRef.current
      if (input) {
        const cursorPos = input.selectionStart || subject.length
        const newValue = subject.slice(0, cursorPos) + variable + subject.slice(cursorPos)
        setSubject(newValue)
        // Store cursor position to be set after React re-renders
        pendingCursorPosition.current = { field: 'subject', position: cursorPos + variable.length }
      } else {
        setSubject(prev => prev + variable)
      }
    } else {
      const textarea = contentTextareaRef.current
      if (textarea) {
        const cursorPos = textarea.selectionStart || content.length
        const scrollTop = textarea.scrollTop // Save scroll position
        const newValue = content.slice(0, cursorPos) + variable + content.slice(cursorPos)
        setContent(newValue)
        // Store cursor position and scroll position to be set after React re-renders
        pendingCursorPosition.current = { field: 'content', position: cursorPos + variable.length, scrollTop }
      } else {
        setContent(prev => prev + variable)
      }
    }
  }

  // Apply cursor position after React finishes rendering
  useEffect(() => {
    if (pendingCursorPosition.current) {
      const { field, position, scrollTop } = pendingCursorPosition.current
      
      if (field === 'subject' && subjectInputRef.current) {
        subjectInputRef.current.focus()
        subjectInputRef.current.setSelectionRange(position, position)
      } else if (field === 'content' && contentTextareaRef.current) {
        const textarea = contentTextareaRef.current
        // Restore scroll position first, then set cursor
        if (scrollTop !== undefined) {
          textarea.scrollTop = scrollTop
        }
        textarea.focus()
        textarea.setSelectionRange(position, position)
      }
      
      pendingCursorPosition.current = null
    }
  }, [content, subject])

  const handleSave = () => {
    onSave({
      id: template?.id,
      name,
      description,
      subject,
      content,
      trigger_type: triggerType,
      timing_value: timingValue,
      timing_unit: timingUnit,
      timing_direction: timingDirection,
      send_as_email: sendAsEmail,
      is_active: isActive
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template?.id ? 'Edit' : 'Create'} Email Template</DialogTitle>
          <DialogDescription>
            Set up automated emails with personalized variables and timing triggers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Name & Description */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., 48-Hour Reminder"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this template do?"
              />
            </div>
          </div>

          {/* Trigger Configuration */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium">Trigger & Timing</h4>
            <div>
              <Label htmlFor="trigger">Trigger Type</Label>
              <Select value={triggerType} onValueChange={(v) => setTriggerType(v as EmailTemplate['trigger_type'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGER_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>
                      <div>
                        <div className="font-medium">{t.label}</div>
                        <div className="text-xs text-muted-foreground">{t.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(triggerType === 'booking_reminder' || triggerType === 'custom') && (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="timingValue">Time Value</Label>
                  <Input
                    id="timingValue"
                    type="number"
                    value={timingValue}
                    onChange={(e) => setTimingValue(Number(e.target.value))}
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="timingUnit">Unit</Label>
                  <Select value={timingUnit} onValueChange={(v) => setTimingUnit(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timingDirection">Direction</Label>
                  <Select value={timingDirection} onValueChange={(v) => setTimingDirection(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="before">Before</SelectItem>
                      <SelectItem value="after">After</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Email Configuration */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Email Content</h4>
                <p className="text-sm text-muted-foreground">Click variable badges to insert</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={sendAsEmail} onCheckedChange={setSendAsEmail} />
                <Label>Send as Email</Label>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {VARIABLE_SUGGESTIONS.map(({ variable, description }) => (
                <Badge
                  key={variable}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleInsertVariable(variable)}
                  title={description}
                >
                  <Wand2 className="w-3 h-3 mr-1" />
                  {variable}
                </Badge>
              ))}
            </div>

            <div>
              <Label htmlFor="subject">Email Subject *</Label>
              <Input
                ref={subjectInputRef}
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                onFocus={() => setLastFocusedField('subject')}
                placeholder="Your tour with {guide-name} starts in 48 hours!"
              />
            </div>

            <div>
              <Label htmlFor="content">Email Content *</Label>
              <Textarea
                ref={contentTextareaRef}
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={() => setLastFocusedField('content')}
                placeholder="Hi {guest-firstname},&#10;&#10;This is a friendly reminder that your {tour-name} tour is coming up on {tour-date}..."
                rows={8}
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between border-t pt-4">
            <div>
              <Label>Template Status</Label>
              <p className="text-sm text-muted-foreground">Enable to start sending automated emails</p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name || !subject || !content}>
            {template?.id ? 'Update' : 'Create'} Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
