
-- Drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Users can create own b2b profile" ON public.b2b_profiles;
DROP POLICY IF EXISTS "Users can view own b2b profile" ON public.b2b_profiles;
DROP POLICY IF EXISTS "Users can update own b2b profile" ON public.b2b_profiles;
DROP POLICY IF EXISTS "Admins can view all b2b profiles" ON public.b2b_profiles;
DROP POLICY IF EXISTS "Admins can update any b2b profile" ON public.b2b_profiles;
DROP POLICY IF EXISTS "Admins can view roles" ON public.user_roles;

-- Recreate as PERMISSIVE (default)
CREATE POLICY "Users can create own b2b profile"
  ON public.b2b_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own b2b profile"
  ON public.b2b_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own b2b profile"
  ON public.b2b_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all b2b profiles"
  ON public.b2b_profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update any b2b profile"
  ON public.b2b_profiles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
