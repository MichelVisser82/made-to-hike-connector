-- Create tour_step_templates table for managing standard items across tour creation steps
CREATE TABLE public.tour_step_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  step_name TEXT NOT NULL,
  category TEXT NOT NULL,
  item_text TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tour_step_templates ENABLE ROW LEVEL SECURITY;

-- Anyone can view active templates
CREATE POLICY "Anyone can view active templates"
ON public.tour_step_templates
FOR SELECT
USING (is_active = true);

-- Admins can manage all templates
CREATE POLICY "Admins can manage all templates"
ON public.tour_step_templates
FOR ALL
USING (has_role(auth.uid(), 'admin'::text));

-- Create index for faster queries
CREATE INDEX idx_tour_step_templates_step_category ON public.tour_step_templates(step_name, category, sort_order);

-- Create trigger for updated_at
CREATE TRIGGER update_tour_step_templates_updated_at
BEFORE UPDATE ON public.tour_step_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial data for Step 10 (Inclusions & Exclusions)
INSERT INTO public.tour_step_templates (step_name, category, item_text, sort_order) VALUES
  ('step10', 'included', 'Expert certified guide', 1),
  ('step10', 'included', 'Safety equipment', 2),
  ('step10', 'included', 'Transportation during tour', 3),
  ('step10', 'included', 'Comprehensive insurance coverage', 4),
  ('step10', 'excluded', 'Transportation to/from starting point', 1),
  ('step10', 'excluded', 'Personal hiking equipment', 2),
  ('step10', 'excluded', 'Travel insurance', 3),
  ('step10', 'excluded', 'Meals not specified', 4);