
-- 1. Create an Enum for application roles
CREATE TYPE public.app_role AS ENUM ('admin', 'end_user');

-- 2. Create a table to store user roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role) -- Ensures a user doesn't have the same role twice
);

-- 3. Enable Row-Level Security on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: Allow users to see their own roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- 5. RLS Policy: Allow admins to manage all roles (placeholder - refine as needed)
-- For now, let's assume admins will manage roles. This policy will be refined.
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles
  FOR ALL
  USING (
    -- This is a placeholder. We'll need a way to identify admins.
    -- For now, let's use a check against auth.uid() for a specific admin UID
    -- OR implement the has_role function check once an admin is designated.
    -- Example: auth.uid() = 'your_admin_user_id_here'
    -- For a more robust solution, we'll use the has_role function later.
    false -- Initially restrictive; will be updated once admin assignment is clear.
  );

-- 6. Create a function to check if a user has a specific role
-- This function can be used in RLS policies on other tables
CREATE OR REPLACE FUNCTION public.has_role(_role app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public -- Ensures the function can see public.user_roles
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE; -- Not authenticated
  END IF;
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid() AND role = _role
  );
END;
$$;

-- 7. Create a function to assign a default role to new users
CREATE OR REPLACE FUNCTION public.handle_new_user_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'end_user'); -- Default new users to 'end_user'
  RETURN new;
END;
$$;

-- 8. Create a trigger to assign default role on new user creation
CREATE TRIGGER on_auth_user_created_assign_default_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_default_role();

