
-- First, let's drop the existing problematic RLS policies and create proper ones

-- Drop existing policies on serial_numbers
DROP POLICY IF EXISTS "Users can view serial numbers" ON public.serial_numbers;
DROP POLICY IF EXISTS "Users can update serial numbers" ON public.serial_numbers;
DROP POLICY IF EXISTS "Admins can insert serial numbers" ON public.serial_numbers;
DROP POLICY IF EXISTS "Admins can delete serial numbers" ON public.serial_numbers;
DROP POLICY IF EXISTS "End users can see their own serial numbers" ON public.serial_numbers;
DROP POLICY IF EXISTS "End users can update their own serial numbers" ON public.serial_numbers;

-- Drop existing policies on claim_requests
DROP POLICY IF EXISTS "Users can view their own claim requests" ON public.claim_requests;
DROP POLICY IF EXISTS "Users can create claim requests for their own warranties" ON public.claim_requests;
DROP POLICY IF EXISTS "Users can update their own claim requests" ON public.claim_requests;

-- Create a helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create proper RLS policies for serial_numbers table
-- Admins can see all serial numbers
CREATE POLICY "Admins can view all serial numbers"
ON public.serial_numbers
FOR SELECT
TO authenticated
USING (public.is_admin());

-- End users can only see serial numbers they own (where user_id matches their auth.uid())
CREATE POLICY "Users can view their own serial numbers"
ON public.serial_numbers
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins can update any serial number
CREATE POLICY "Admins can update all serial numbers"
ON public.serial_numbers
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- End users can update available serial numbers (for registration) or their own serial numbers
CREATE POLICY "Users can update available or own serial numbers"
ON public.serial_numbers
FOR UPDATE
TO authenticated
USING (
  (status = 'available' AND user_id IS NULL) OR 
  (user_id = auth.uid())
)
WITH CHECK (user_id = auth.uid());

-- Only admins can insert new serial numbers
CREATE POLICY "Admins can insert serial numbers"
ON public.serial_numbers
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Only admins can delete serial numbers
CREATE POLICY "Admins can delete serial numbers"
ON public.serial_numbers
FOR DELETE
TO authenticated
USING (public.is_admin());

-- Create proper RLS policies for claim_requests table
-- Admins can see all claim requests
CREATE POLICY "Admins can view all claim requests"
ON public.claim_requests
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Users can only see claim requests for their own serial numbers
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

-- Users can only create claim requests for their own serial numbers
CREATE POLICY "Users can create claim requests for own serial numbers"
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

-- Users can only update their own claim requests
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

-- Admins can update any claim request
CREATE POLICY "Admins can update all claim requests"
ON public.claim_requests
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Admins can delete any claim request
CREATE POLICY "Admins can delete all claim requests"
ON public.claim_requests
FOR DELETE
TO authenticated
USING (public.is_admin());
