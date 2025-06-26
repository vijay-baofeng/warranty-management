
-- Fix RLS policies to ensure users only see their own data
-- Drop the overly permissive policies created earlier
DROP POLICY IF EXISTS "Enable read access for all users on serial_numbers" ON public.serial_numbers;
DROP POLICY IF EXISTS "Enable update for users on their own serial_numbers" ON public.serial_numbers;
DROP POLICY IF EXISTS "Enable insert for admins on serial_numbers" ON public.serial_numbers;
DROP POLICY IF EXISTS "Enable delete for admins on serial_numbers" ON public.serial_numbers;

DROP POLICY IF EXISTS "Enable read access for all users on claim_requests" ON public.claim_requests;
DROP POLICY IF EXISTS "Enable insert for authenticated users on claim_requests" ON public.claim_requests;
DROP POLICY IF EXISTS "Enable update for all users on claim_requests" ON public.claim_requests;
DROP POLICY IF EXISTS "Enable delete for admins on claim_requests" ON public.claim_requests;

-- Create proper user-specific policies for serial_numbers
CREATE POLICY "Users can view their own serial numbers"
ON public.serial_numbers
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all serial numbers"
ON public.serial_numbers
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Users can update their own serial numbers"
ON public.serial_numbers
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update all serial numbers"
ON public.serial_numbers
FOR UPDATE
TO authenticated
USING (public.is_admin());

CREATE POLICY "Users can claim available serial numbers"
ON public.serial_numbers
FOR UPDATE
TO authenticated
USING (user_id IS NULL AND status = 'available')
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can insert serial numbers"
ON public.serial_numbers
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete serial numbers"
ON public.serial_numbers
FOR DELETE
TO authenticated
USING (public.is_admin());

-- Create proper user-specific policies for claim_requests
CREATE POLICY "Users can view their own claim requests"
ON public.claim_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.serial_numbers sn 
    WHERE sn.id = claim_requests.serial_number_id 
    AND sn.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all claim requests"
ON public.claim_requests
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Users can create claim requests for their own serial numbers"
ON public.claim_requests
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.serial_numbers sn 
    WHERE sn.id = claim_requests.serial_number_id 
    AND sn.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own claim requests"
ON public.claim_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.serial_numbers sn 
    WHERE sn.id = claim_requests.serial_number_id 
    AND sn.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can update all claim requests"
ON public.claim_requests
FOR UPDATE
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can delete all claim requests"
ON public.claim_requests
FOR DELETE
TO authenticated
USING (public.is_admin());
