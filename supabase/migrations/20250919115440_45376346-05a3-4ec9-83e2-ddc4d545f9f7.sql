-- Drop existing functions
DROP FUNCTION IF EXISTS public.get_current_user_role();
DROP FUNCTION IF EXISTS public.has_role(UUID, TEXT);

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
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
      AND role::TEXT = _role
  )
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
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();