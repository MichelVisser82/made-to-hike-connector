-- Create guide_profiles table with comprehensive fields
CREATE TABLE public.guide_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Hero Section
  display_name text NOT NULL,
  profile_image_url text,
  hero_background_url text,
  bio text,
  location text,
  active_since date DEFAULT CURRENT_DATE,
  verified boolean DEFAULT false,
  
  -- Professional Info (JSONB for flexible structure)
  certifications jsonb DEFAULT '[]'::jsonb,
  specialties text[] DEFAULT '{}',
  guiding_areas text[] DEFAULT '{}',
  terrain_capabilities text[] DEFAULT '{}',
  
  -- Portfolio & Media
  portfolio_images text[] DEFAULT '{}',
  
  -- Availability & Pricing
  seasonal_availability text,
  upcoming_availability_start date,
  upcoming_availability_end date,
  daily_rate numeric,
  daily_rate_currency currency DEFAULT 'EUR',
  
  -- Contact & Social
  contact_email text,
  phone text,
  instagram_url text,
  facebook_url text,
  website_url text,
  
  -- Preferences from signup flow
  max_group_size integer,
  min_group_size integer DEFAULT 1,
  languages_spoken text[] DEFAULT '{}',
  
  -- Profile completion tracking
  profile_completed boolean DEFAULT false,
  onboarding_step integer DEFAULT 0,
  
  -- Meta
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.guide_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view verified guide profiles"
  ON public.guide_profiles FOR SELECT
  USING (verified = true);

CREATE POLICY "Guides can view their own profile"
  ON public.guide_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Guides can insert their own profile"
  ON public.guide_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id AND has_role(auth.uid(), 'guide'));

CREATE POLICY "Guides can update their own profile"
  ON public.guide_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all guide profiles"
  ON public.guide_profiles FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_guide_profiles_updated_at
  BEFORE UPDATE ON public.guide_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_guide_profiles_user_id ON public.guide_profiles(user_id);
CREATE INDEX idx_guide_profiles_verified ON public.guide_profiles(verified) WHERE verified = true;
CREATE INDEX idx_guide_profiles_location ON public.guide_profiles(location);

-- Add guide display info to tours table for performance (cached data)
ALTER TABLE public.tours
  ADD COLUMN IF NOT EXISTS guide_display_name text,
  ADD COLUMN IF NOT EXISTS guide_avatar_url text;

-- Function to sync guide info to tours
CREATE OR REPLACE FUNCTION public.sync_guide_info_to_tour()
RETURNS TRIGGER AS $$
BEGIN
  -- Only sync if guide_id is set
  IF NEW.guide_id IS NOT NULL THEN
    SELECT display_name, profile_image_url
    INTO NEW.guide_display_name, NEW.guide_avatar_url
    FROM public.guide_profiles
    WHERE user_id = NEW.guide_id
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-populate guide info in tours
CREATE TRIGGER sync_tour_guide_info
  BEFORE INSERT OR UPDATE OF guide_id ON public.tours
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_guide_info_to_tour();