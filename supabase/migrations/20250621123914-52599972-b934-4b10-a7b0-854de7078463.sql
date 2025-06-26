
-- Drop existing policies on serial_numbers table
DROP POLICY IF EXISTS "Users can view their own serial numbers" ON public.serial_numbers;
DROP POLICY IF EXISTS "Users can view available serial numbers" ON public.serial_numbers;
DROP POLICY IF EXISTS "Admins can view all serial numbers" ON public.serial_numbers;
DROP POLICY IF EXISTS "Users can register available serial numbers" ON public.serial_numbers;

-- Drop any other existing policies (from previous migrations)
DROP POLICY IF EXISTS "Admins can view all serial numbers" ON public.serial_numbers;
DROP POLICY IF EXISTS "Users can view their own serial numbers" ON public.serial_numbers;
DROP POLICY IF EXISTS "Admins can update all serial numbers" ON public.serial_numbers;
DROP POLICY IF EXISTS "Users can update their own serial numbers" ON public.serial_numbers;
DROP POLICY IF EXISTS "Users can claim available serial numbers" ON public.serial_numbers;
DROP POLICY IF EXISTS "Admins can insert serial numbers" ON public.serial_numbers;
DROP POLICY IF EXISTS "Admins can delete serial numbers" ON public.serial_numbers;

-- Create comprehensive RLS policies for serial_numbers
-- 1. SELECT policies - Allow users to see available serials and their own serials, admins see all
CREATE POLICY "Users can view available serial numbers" 
ON public.serial_numbers 
FOR SELECT 
USING (status = 'available' AND user_id IS NULL);

CREATE POLICY "Users can view their own serial numbers" 
ON public.serial_numbers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all serial numbers" 
ON public.serial_numbers 
FOR SELECT 
USING (public.is_admin());

-- 2. INSERT policies - Only admins can insert
CREATE POLICY "Admins can insert serial numbers" 
ON public.serial_numbers 
FOR INSERT 
WITH CHECK (public.is_admin());

-- 3. UPDATE policies - Users can register available serials, admins can update all
CREATE POLICY "Users can register available serial numbers" 
ON public.serial_numbers 
FOR UPDATE 
USING (status = 'available' AND user_id IS NULL) 
WITH CHECK (auth.uid() = user_id AND status = 'registered');

CREATE POLICY "Users can update their own serial numbers" 
ON public.serial_numbers 
FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update all serial numbers" 
ON public.serial_numbers 
FOR UPDATE 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

-- 4. DELETE policies - Only admins can delete
CREATE POLICY "Admins can delete serial numbers" 
ON public.serial_numbers 
FOR DELETE 
USING (public.is_admin());

-- Ensure RLS is enabled
ALTER TABLE public.serial_numbers ENABLE ROW LEVEL SECURITY;
