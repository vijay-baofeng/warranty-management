
-- Fix RLS policies to ensure users only see their own serial numbers
-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Users can view their own serial numbers" ON public.serial_numbers;
DROP POLICY IF EXISTS "Admins can view all serial numbers" ON public.serial_numbers;
DROP POLICY IF EXISTS "Users can update their own serial numbers" ON public.serial_numbers;
DROP POLICY IF EXISTS "Admins can update all serial numbers" ON public.serial_numbers;
DROP POLICY IF EXISTS "Users can claim available serial numbers" ON public.serial_numbers;
DROP POLICY IF EXISTS "Admins can insert serial numbers" ON public.serial_numbers;
DROP POLICY IF EXISTS "Admins can delete serial numbers" ON public.serial_numbers;

-- Create new, cleaner RLS policies for serial_numbers
-- 1. Users can only view their own serial numbers (where user_id matches)
CREATE POLICY "Users can view own serial numbers"
ON public.serial_numbers
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 2. Admins can view all serial numbers
CREATE POLICY "Admins can view all serial numbers"
ON public.serial_numbers
FOR SELECT
TO authenticated
USING (public.is_admin());

-- 3. Users can update their own registered serial numbers
CREATE POLICY "Users can update own serial numbers"
ON public.serial_numbers
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 4. Users can register available serial numbers (claim them)
CREATE POLICY "Users can register available serial numbers"
ON public.serial_numbers
FOR UPDATE
TO authenticated
USING (status = 'available' AND user_id IS NULL)
WITH CHECK (user_id = auth.uid());

-- 5. Admins can perform all operations
CREATE POLICY "Admins can manage all serial numbers"
ON public.serial_numbers
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
