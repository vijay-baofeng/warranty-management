
-- Drop the existing policy for creating claim requests
DROP POLICY IF EXISTS "Authenticated users can create claim requests" ON public.claim_requests;

-- Recreate the policy with an explicit check for the 'authenticated' role
CREATE POLICY "Authenticated users can create claim requests"
  ON public.claim_requests
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Additionally, let's ensure the RLS policies for the storage bucket are robust.
-- These were in the last migration but re-stating for clarity and to ensure they are definitely applied.

-- For claim evidence uploads (storage.objects table)
DROP POLICY IF EXISTS "Authenticated users can upload claim evidence" ON storage.objects;
CREATE POLICY "Authenticated users can upload claim evidence"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'claim_evidence' AND
    auth.role() = 'authenticated' -- Explicit role check here too
  );

-- Public read access for claim evidence (no change, but good to keep consistent)
DROP POLICY IF EXISTS "Public can read claim evidence" ON storage.objects;
CREATE POLICY "Public can read claim evidence"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'claim_evidence');
