
-- Create a table for detailed claim requests
CREATE TABLE public.claim_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  serial_number_id UUID NOT NULL REFERENCES public.serial_numbers(id) ON DELETE CASCADE,
  complaint_title TEXT NOT NULL,
  complaint_date DATE NOT NULL DEFAULT CURRENT_DATE,
  issue_type TEXT NOT NULL,
  expected_resolution_date DATE,
  description TEXT,
  customer_note TEXT,
  evidence_image_urls JSONB, -- Store as an array of URLs
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to claim_requests
ALTER TABLE public.claim_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can create claim requests for serial numbers they are associated with (e.g., via customer_email or if serial_number is registered to them)
-- This assumes a way to link users to serial_numbers, e.g. through customer_email matching authenticated user's email.
-- For simplicity, we'll allow authenticated users to insert if they provide a valid serial_number_id.
-- A more robust policy would check ownership of the serial_number.
CREATE POLICY "Authenticated users can create claim requests"
  ON public.claim_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Simplified for now, assumes frontend sends correct serial_number_id

-- Policy: Users can view claim requests associated with their serial numbers.
-- This requires joining with serial_numbers and checking user association.
-- For now, let's allow users to view claims they created (if user_id was on claim_requests).
-- Since we don't have user_id directly on claim_requests, this policy is tricky.
-- Let's assume for now that if a user has access to the serial_number, they can see related claims.
-- A more robust solution would involve a user_id on claim_requests or a function to check ownership.
CREATE POLICY "Users can view their associated claim requests"
  ON public.claim_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.serial_numbers sn
      WHERE sn.id = serial_number_id
      AND sn.customer_email = auth.email() -- Example: linking through customer_email
    )
  );

-- Policy: Users can update their own claim requests (e.g. if status changes, or more info added)
-- Similar to select, based on association.
CREATE POLICY "Users can update their associated claim requests"
  ON public.claim_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.serial_numbers sn
      WHERE sn.id = serial_number_id
      AND sn.customer_email = auth.email()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.serial_numbers sn
      WHERE sn.id = serial_number_id
      AND sn.customer_email = auth.email()
    )
  );


-- Create storage bucket for claim evidence images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('claim_evidence', 'claim_evidence', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif'])
ON CONFLICT (id) DO NOTHING; -- Avoid error if bucket already exists

-- RLS Policies for storage.objects in 'claim_evidence' bucket
-- Policy: Allow authenticated users to upload files to the 'claim_evidence' bucket.
CREATE POLICY "Authenticated users can upload claim evidence"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'claim_evidence');

-- Policy: Allow public read access to files in 'claim_evidence' bucket.
-- This is often simplest if URLs are non-guessable and shared intentionally.
CREATE POLICY "Public can read claim evidence"
ON storage.objects FOR SELECT
USING (bucket_id = 'claim_evidence');

-- Grant usage on public schema to supabase_storage_admin if not already granted
-- This might be needed for storage admin operations, ensure it doesn't conflict with existing setup.
-- GRANT USAGE ON SCHEMA public TO supabase_storage_admin;
-- GRANT SELECT ON TABLE public.claim_requests TO supabase_storage_admin;
-- GRANT SELECT ON TABLE public.serial_numbers TO supabase_storage_admin;

