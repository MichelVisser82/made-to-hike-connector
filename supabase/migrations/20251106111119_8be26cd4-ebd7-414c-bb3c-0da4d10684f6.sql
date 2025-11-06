-- Create email_templates table for automated email campaigns
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('booking_confirmed', 'booking_reminder', 'tour_completed', 'custom')),
  timing_value INTEGER DEFAULT 0,
  timing_unit TEXT DEFAULT 'hours' CHECK (timing_unit IN ('minutes', 'hours', 'days')),
  timing_direction TEXT DEFAULT 'before' CHECK (timing_direction IN ('before', 'after')),
  is_active BOOLEAN DEFAULT true,
  send_as_email BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create email_logs table to track sent emails and prevent duplicates
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced'))
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_templates
CREATE POLICY "Guides can manage their own email templates"
  ON public.email_templates
  FOR ALL
  USING (auth.uid() = guide_id);

CREATE POLICY "Admins can manage all email templates"
  ON public.email_templates
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for email_logs
CREATE POLICY "Guides can view their email logs"
  ON public.email_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.email_templates et
      WHERE et.id = email_logs.template_id
      AND et.guide_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all email logs"
  ON public.email_logs
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_email_templates_guide_id ON public.email_templates(guide_id);
CREATE INDEX idx_email_templates_active ON public.email_templates(is_active) WHERE is_active = true;
CREATE INDEX idx_email_logs_booking_id ON public.email_logs(booking_id);
CREATE INDEX idx_email_logs_template_id ON public.email_logs(template_id);