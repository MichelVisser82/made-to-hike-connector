-- Create platform_settings table for global platform fee configuration
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Insert default platform fee settings
INSERT INTO public.platform_settings (setting_key, setting_value)
VALUES (
  'platform_fees',
  jsonb_build_object(
    'guide_fee_percentage', 5,
    'hiker_fee_percentage', 10,
    'enabled', true
  )
)
ON CONFLICT (setting_key) DO NOTHING;

-- Add custom fee columns to guide_profiles
ALTER TABLE public.guide_profiles
ADD COLUMN IF NOT EXISTS custom_guide_fee_percentage numeric,
ADD COLUMN IF NOT EXISTS custom_hiker_fee_percentage numeric,
ADD COLUMN IF NOT EXISTS uses_custom_fees boolean DEFAULT false;

-- Enable RLS on platform_settings
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Admins can manage all platform settings
CREATE POLICY "Admins can manage platform settings"
ON public.platform_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Anyone can view platform settings (needed for calculations)
CREATE POLICY "Anyone can view platform settings"
ON public.platform_settings
FOR SELECT
USING (true);

-- Add trigger to update updated_at
CREATE TRIGGER update_platform_settings_updated_at
BEFORE UPDATE ON public.platform_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();