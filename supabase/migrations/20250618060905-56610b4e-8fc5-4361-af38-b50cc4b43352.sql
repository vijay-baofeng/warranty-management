
-- Fix RLS policies to ensure proper data access for users

-- First, let's drop the existing problematic policies
DROP POLICY IF EXISTS "Admins can view all serial numbers" ON public.serial_numbers;
DROP POLICY IF EXISTS "Users can view their own serial numbers" ON public.serial_numbers;
DROP POLICY IF EXISTS "Admins can update all serial numbers" ON public.serial_numbers;
DROP POLICY IF EXISTS "Users can update available or own serial numbers" ON public.serial_numbers;
DROP POLICY IF EXISTS "Admins can insert serial numbers" ON public.serial_numbers;
DROP POLICY IF EXISTS "Admins can delete serial numbers" ON public.serial_numbers;

DROP POLICY IF EXISTS "Admins can view all claim requests" ON public.claim_requests;
DROP POLICY IF EXISTS "Users can view their own claim requests" ON public.claim_requests;
DROP POLICY IF EXISTS "Users can create claim requests for own serial numbers" ON public.claim_requests;
DROP POLICY IF EXISTS "Users can update their own claim requests" ON public.claim_requests;
DROP POLICY IF EXISTS "Admins can update all claim requests" ON public.claim_requests;
DROP POLICY IF EXISTS "Admins can delete all claim requests" ON public.claim_requests;

-- Create simpler, more permissive policies for serial_numbers
CREATE POLICY "Enable read access for all users on serial_numbers"
ON public.serial_numbers
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable update for users on their own serial_numbers"
ON public.serial_numbers
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR user_id IS NULL)
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Enable insert for admins on serial_numbers"
ON public.serial_numbers
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Enable delete for admins on serial_numbers"
ON public.serial_numbers
FOR DELETE
TO authenticated
USING (public.is_admin());

-- Create simpler, more permissive policies for claim_requests
CREATE POLICY "Enable read access for all users on claim_requests"
ON public.claim_requests
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users on claim_requests"
ON public.claim_requests
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for all users on claim_requests"
ON public.claim_requests
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Enable delete for admins on claim_requests"
ON public.claim_requests
FOR DELETE
TO authenticated
USING (public.is_admin());
