-- Create chat message templates table for standardized quick replies
CREATE TABLE IF NOT EXISTS public.chat_message_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guide_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  message_content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_message_templates ENABLE ROW LEVEL SECURITY;

-- Guides can manage their own templates
CREATE POLICY "Guides can manage their own chat templates"
ON public.chat_message_templates
FOR ALL
USING (auth.uid() = guide_id);

-- Admins can manage all templates
CREATE POLICY "Admins can manage all chat templates"
ON public.chat_message_templates
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_chat_message_templates_updated_at
BEFORE UPDATE ON public.chat_message_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();