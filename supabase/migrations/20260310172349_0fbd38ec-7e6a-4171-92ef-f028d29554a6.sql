
-- Approval status enum
CREATE TYPE public.b2b_status AS ENUM ('pending', 'approved', 'rejected');

-- B2B profiles table
CREATE TABLE public.b2b_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  ico TEXT NOT NULL,
  dic TEXT,
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  zip TEXT NOT NULL,
  status b2b_status NOT NULL DEFAULT 'pending',
  discount_percent INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.b2b_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own b2b profile"
  ON public.b2b_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own profile (on registration)
CREATE POLICY "Users can create own b2b profile"
  ON public.b2b_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own b2b profile"
  ON public.b2b_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Role enum and user_roles table for admin access
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Admins can view all b2b profiles
CREATE POLICY "Admins can view all b2b profiles"
  ON public.b2b_profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update any b2b profile (approve/reject)
CREATE POLICY "Admins can update any b2b profile"
  ON public.b2b_profiles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can read user_roles
CREATE POLICY "Admins can view roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_b2b_profiles_updated_at
  BEFORE UPDATE ON public.b2b_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get b2b profile status (for use in client without RLS issues)
CREATE OR REPLACE FUNCTION public.get_b2b_status(_user_id UUID)
RETURNS b2b_status
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT status FROM public.b2b_profiles WHERE user_id = _user_id
$$;
