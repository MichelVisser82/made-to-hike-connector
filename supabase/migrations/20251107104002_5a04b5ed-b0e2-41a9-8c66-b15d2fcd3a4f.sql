-- ============================================
-- PHASE 1: Clean Up RLS Policies for guide_profiles
-- ============================================

-- Drop all existing policies on guide_profiles
DROP POLICY IF EXISTS "Admins can manage all guide profiles" ON guide_profiles;
DROP POLICY IF EXISTS "Authenticated users can view all guide profiles" ON guide_profiles;
DROP POLICY IF EXISTS "Authenticated users view verified guides (public fields)" ON guide_profiles;
DROP POLICY IF EXISTS "Guides can insert their own profile" ON guide_profiles;
DROP POLICY IF EXISTS "Guides can update their own profile" ON guide_profiles;
DROP POLICY IF EXISTS "Guides can view their own profile" ON guide_profiles;
DROP POLICY IF EXISTS "Public can view profiles for guides with active tours (limited" ON guide_profiles;
DROP POLICY IF EXISTS "Public can view verified guide profiles (limited fields)" ON guide_profiles;

-- ============================================
-- Create Clean, Non-Redundant RLS Policies
-- ============================================

-- 1. Owner Access: Guides can CRUD their own profile (HIGHEST PRIORITY)
CREATE POLICY "guide_profiles_owner_select"
  ON guide_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "guide_profiles_owner_insert"
  ON guide_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND has_role(auth.uid(), 'guide'));

CREATE POLICY "guide_profiles_owner_update"
  ON guide_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Admin Access: Admins can manage all profiles
CREATE POLICY "guide_profiles_admin_all"
  ON guide_profiles
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- 3. Authenticated Users: Can view verified profiles only
CREATE POLICY "guide_profiles_authenticated_select"
  ON guide_profiles
  FOR SELECT
  TO authenticated
  USING (verified = true);

-- 4. Public Access: Can view verified profiles
CREATE POLICY "guide_profiles_public_select"
  ON guide_profiles
  FOR SELECT
  TO anon
  USING (verified = true);

-- Add comments explaining the policy hierarchy
COMMENT ON POLICY "guide_profiles_owner_select" ON guide_profiles IS 
  'PRIORITY 1: Guides always have full access to their own profile regardless of verification status';

COMMENT ON POLICY "guide_profiles_admin_all" ON guide_profiles IS 
  'PRIORITY 2: Admins have full access to all profiles for management and verification';

COMMENT ON POLICY "guide_profiles_authenticated_select" ON guide_profiles IS 
  'PRIORITY 3: Authenticated users can view verified profiles for booking and discovery';

COMMENT ON POLICY "guide_profiles_public_select" ON guide_profiles IS 
  'PRIORITY 4: Anonymous users can view verified profiles via public pages';