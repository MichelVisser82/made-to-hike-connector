-- Create saved_tours table
CREATE TABLE IF NOT EXISTS public.saved_tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tour_id UUID NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, tour_id)
);

-- Create followed_guides table
CREATE TABLE IF NOT EXISTS public.followed_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guide_id UUID NOT NULL REFERENCES public.guide_profiles(user_id) ON DELETE CASCADE,
  followed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, guide_id)
);

-- Enable RLS
ALTER TABLE public.saved_tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followed_guides ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_tours
CREATE POLICY "Users can view their own saved tours"
  ON public.saved_tours FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save tours"
  ON public.saved_tours FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved tours"
  ON public.saved_tours FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for followed_guides
CREATE POLICY "Users can view their own followed guides"
  ON public.followed_guides FOR SELECT
  USING (auth.uid() = follower_id);

CREATE POLICY "Users can follow guides"
  ON public.followed_guides FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow guides"
  ON public.followed_guides FOR DELETE
  USING (auth.uid() = follower_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_tours_user_id ON public.saved_tours(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_tours_tour_id ON public.saved_tours(tour_id);
CREATE INDEX IF NOT EXISTS idx_followed_guides_follower_id ON public.followed_guides(follower_id);
CREATE INDEX IF NOT EXISTS idx_followed_guides_guide_id ON public.followed_guides(guide_id);