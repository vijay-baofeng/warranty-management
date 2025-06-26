
-- Ensure RLS is enabled on the claim_requests table
ALTER TABLE public.claim_requests ENABLE ROW LEVEL SECURITY;

-- Define RLS policies for the claim_requests table
DROP POLICY IF EXISTS "Authenticated users can create claim requests" ON public.claim_requests;
CREATE POLICY "Authenticated users can create claim requests"
  ON public.claim_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their associated claim requests" ON public.claim_requests;
CREATE POLICY "Users can view their associated claim requests"
  ON public.claim_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.serial_numbers sn
      WHERE sn.id = claim_requests.serial_number_id
      AND sn.customer_email = auth.email()
    )
  );

DROP POLICY IF EXISTS "Users can update their associated claim requests" ON public.claim_requests;
CREATE POLICY "Users can update their associated claim requests"
  ON public.claim_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.serial_numbers sn
      WHERE sn.id = claim_requests.serial_number_id
      AND sn.customer_email = auth.email()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.serial_numbers sn
      WHERE sn.id = claim_requests.serial_number_id
      AND sn.customer_email = auth.email()
    )
  );

-- Create storage bucket for claim evidence images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('claim_evidence', 'claim_evidence', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Define RLS Policies for storage.objects in 'claim_evidence' bucket
DROP POLICY IF EXISTS "Authenticated users can upload claim evidence" ON storage.objects;
CREATE POLICY "Authenticated users can upload claim evidence"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'claim_evidence');

DROP POLICY IF EXISTS "Public can read claim evidence" ON storage.objects;
CREATE POLICY "Public can read claim evidence"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'claim_evidence');
