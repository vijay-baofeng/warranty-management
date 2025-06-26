
-- First, get all existing policies on serial_numbers table and drop them
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'serial_numbers' AND schemaname = 'public'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.serial_numbers';
  END LOOP;
END
$$;

-- Create a security definer function to check if user is admin (to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Create comprehensive RLS policies for serial_numbers
-- 1. SELECT policies - Admins can see all, users can see their own
CREATE POLICY "Admins can view all serial numbers"
ON public.serial_numbers
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Users can view their own serial numbers"
ON public.serial_numbers
FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND NOT public.is_admin());

-- 2. INSERT policies - Only admins can insert
CREATE POLICY "Admins can insert serial numbers"
ON public.serial_numbers
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- 3. UPDATE policies
CREATE POLICY "Admins can update all serial numbers"
ON public.serial_numbers
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Users can update their own serial numbers"
ON public.serial_numbers
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND NOT public.is_admin())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can claim available serial numbers"
ON public.serial_numbers
FOR UPDATE
TO authenticated
USING (status = 'available' AND user_id IS NULL AND NOT public.is_admin())
WITH CHECK (user_id = auth.uid());

-- 4. DELETE policies - Only admins can delete
CREATE POLICY "Admins can delete serial numbers"
ON public.serial_numbers
FOR DELETE
TO authenticated
USING (public.is_admin());

-- Ensure RLS is enabled
ALTER TABLE public.serial_numbers ENABLE ROW LEVEL SECURITY;
