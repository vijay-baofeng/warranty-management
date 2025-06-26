
-- Add user_id to serial_numbers to link warranties to users
ALTER TABLE public.serial_numbers
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Drop old email-based RLS policies from serial_numbers
DROP POLICY IF EXISTS "End users can see their own serial numbers" ON public.serial_numbers;
DROP POLICY IF EXISTS "End users can update serial numbers to register or claim" ON public.serial_numbers;

-- Create new user_id-based RLS policies for serial_numbers
CREATE POLICY "End users can see their own serial numbers"
ON public.serial_numbers
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "End users can update their own serial numbers"
ON public.serial_numbers
FOR UPDATE
USING ( (status = 'available'::text) OR (user_id = auth.uid()) )
WITH CHECK ( user_id = auth.uid() );


-- Drop old email-based RLS policies from claim_requests
DROP POLICY IF EXISTS "Authenticated users can create claim requests" ON public.claim_requests;
DROP POLICY IF EXISTS "Users can view their associated claim requests" ON public.claim_requests;
DROP POLICY IF EXISTS "Users can update their associated claim requests" ON public.claim_requests;

-- Create new user_id-based RLS policies for claim_requests
CREATE POLICY "Users can view their own claim requests"
ON public.claim_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.serial_numbers sn
    WHERE sn.id = claim_requests.serial_number_id AND sn.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create claim requests for their own warranties"
ON public.claim_requests
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.serial_numbers sn
    WHERE sn.id = claim_requests.serial_number_id AND sn.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own claim requests"
ON public.claim_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.serial_numbers sn
    WHERE sn.id = claim_requests.serial_number_id AND sn.user_id = auth.uid()
  )
);
