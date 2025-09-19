-- Create user role enum
CREATE TYPE public.app_role AS ENUM ('hiker', 'guide', 'admin');

-- Create verification status enum
CREATE TYPE public.verification_status AS ENUM ('pending', 'approved', 'rejected', 'not_requested');

-- Create region enum
CREATE TYPE public.region AS ENUM ('dolomites', 'pyrenees', 'scotland');

-- Create difficulty enum
CREATE TYPE public.difficulty AS ENUM ('easy', 'moderate', 'challenging', 'expert');

-- Create currency enum
CREATE TYPE public.currency AS ENUM ('EUR', 'GBP');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create user_verifications table
CREATE TABLE public.user_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  verification_status verification_status NOT NULL DEFAULT 'not_requested',
  verification_documents TEXT[],
  company_name TEXT,
  license_number TEXT,
  insurance_info TEXT,
  experience_years INTEGER,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tours table
CREATE TABLE public.tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  guide_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  region region NOT NULL,
  difficulty difficulty NOT NULL,
  duration TEXT NOT NULL,
  group_size INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency currency NOT NULL DEFAULT 'EUR',
  description TEXT NOT NULL,
  highlights TEXT[] NOT NULL DEFAULT '{}',
  includes TEXT[] NOT NULL DEFAULT '{}',
  meeting_point TEXT NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  available_dates DATE[] NOT NULL DEFAULT '{}',
  rating DECIMAL(2,1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE NOT NULL,
  hiker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  booking_date DATE NOT NULL,
  participants INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL,
  currency currency NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'pending',
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL UNIQUE,
  tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE NOT NULL,
  hiker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  guide_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1
$$;

-- Profiles RLS policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles RLS policies
CREATE POLICY "Users can view all roles" ON public.user_roles
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage user roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- User verifications RLS policies
CREATE POLICY "Users can view their own verification" ON public.user_verifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all verifications" ON public.user_verifications
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own verification" ON public.user_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own verification" ON public.user_verifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all verifications" ON public.user_verifications
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Tours RLS policies
CREATE POLICY "Anyone can view active tours" ON public.tours
  FOR SELECT USING (is_active = true);

CREATE POLICY "Guides can view their own tours" ON public.tours
  FOR SELECT USING (auth.uid() = guide_id);

CREATE POLICY "Admins can view all tours" ON public.tours
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Guides can create tours" ON public.tours
  FOR INSERT WITH CHECK (
    auth.uid() = guide_id AND 
    public.has_role(auth.uid(), 'guide')
  );

CREATE POLICY "Guides can update their own tours" ON public.tours
  FOR UPDATE USING (auth.uid() = guide_id);

CREATE POLICY "Admins can update all tours" ON public.tours
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Guides can delete their own tours" ON public.tours
  FOR DELETE USING (auth.uid() = guide_id);

CREATE POLICY "Admins can delete all tours" ON public.tours
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Bookings RLS policies
CREATE POLICY "Users can view their own bookings as hiker" ON public.bookings
  FOR SELECT USING (auth.uid() = hiker_id);

CREATE POLICY "Guides can view bookings for their tours" ON public.bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tours 
      WHERE tours.id = bookings.tour_id 
      AND tours.guide_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all bookings" ON public.bookings
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Hikers can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (
    auth.uid() = hiker_id AND 
    public.has_role(auth.uid(), 'hiker')
  );

CREATE POLICY "Hikers can update their own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = hiker_id);

CREATE POLICY "Guides can update bookings for their tours" ON public.bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.tours 
      WHERE tours.id = bookings.tour_id 
      AND tours.guide_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update all bookings" ON public.bookings
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Reviews RLS policies
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Hikers can create reviews for their bookings" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() = hiker_id AND
    EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE bookings.id = booking_id 
      AND bookings.hiker_id = auth.uid()
      AND bookings.status = 'completed'
    )
  );

CREATE POLICY "Hikers can update their own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = hiker_id);

CREATE POLICY "Admins can manage all reviews" ON public.reviews
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  
  -- Assign default role as hiker
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'hiker');
  
  -- Create verification record
  INSERT INTO public.user_verifications (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_verifications_updated_at
  BEFORE UPDATE ON public.user_verifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tours_updated_at
  BEFORE UPDATE ON public.tours
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_tours_guide_id ON public.tours(guide_id);
CREATE INDEX idx_tours_region ON public.tours(region);
CREATE INDEX idx_tours_difficulty ON public.tours(difficulty);
CREATE INDEX idx_tours_is_active ON public.tours(is_active);
CREATE INDEX idx_bookings_tour_id ON public.bookings(tour_id);
CREATE INDEX idx_bookings_hiker_id ON public.bookings(hiker_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_reviews_tour_id ON public.reviews(tour_id);
CREATE INDEX idx_reviews_hiker_id ON public.reviews(hiker_id);