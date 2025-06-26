
-- Drop all existing relevant policies on serial_numbers to avoid conflicts and start fresh
DROP POLICY IF EXISTS "Admins have full access to serial numbers" ON public.serial_numbers;
DROP POLICY IF EXISTS "End users can see their own serial numbers" ON public.serial_numbers;
DROP POLICY IF EXISTS "End users can update their own serial numbers" ON public.serial_numbers;
DROP POLICY IF EXISTS "End users can update serial numbers to register or claim" ON public.serial_numbers;

-- New Consolidated RLS Policies for serial_numbers

-- 1. SELECT Policy: Allows admins to see all serial numbers, and end-users to see only their own.
CREATE POLICY "Users can view serial numbers"
ON public.serial_numbers
FOR SELECT
USING (
  public.has_role('admin') OR (user_id = auth.uid())
);

-- 2. UPDATE Policy: Allows admins to update any serial, and end-users to update available ones or ones they own.
-- The WITH CHECK clause ensures an end-user can only associate a warranty with their own user ID.
CREATE POLICY "Users can update serial numbers"
ON public.serial_numbers
FOR UPDATE
USING (
  public.has_role('admin') OR (status = 'available'::text) OR (user_id = auth.uid())
)
WITH CHECK (
  public.has_role('admin') OR (user_id = auth.uid())
);

-- 3. INSERT Policy: Only admins can create new serial numbers directly.
CREATE POLICY "Admins can insert serial numbers"
ON public.serial_numbers
FOR INSERT
WITH CHECK (
  public.has_role('admin')
);

-- 4. DELETE Policy: Only admins can delete serial numbers.
CREATE POLICY "Admins can delete serial numbers"
ON public.serial_numbers
FOR DELETE
USING (
  public.has_role('admin')
);
