
-- Add new columns to serial_numbers table for purchase details
ALTER TABLE public.serial_numbers
ADD COLUMN purchase_source TEXT,
ADD COLUMN purchase_receipt_url TEXT;

-- Create storage bucket for warranty receipts if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('warranty-receipts', 'warranty-receipts', true, 5242880, ARRAY['image/jpeg', 'image/png', 'application/pdf'])
ON CONFLICT (id) DO NOTHING; -- If bucket already exists, do nothing

-- RLS Policies for warranty_receipts bucket

-- Allow public read access to all files in warranty_receipts
-- This ensures that receipt URLs can be accessed publicly if needed.
CREATE POLICY "Public_read_access_for_warranty_receipts"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'warranty-receipts');

-- Allow anyone (anonymous or authenticated users) to upload to warranty_receipts
-- This is suitable for a public registration page where users might not be logged in.
CREATE POLICY "Allow_uploads_for_warranty_receipts"
ON storage.objects FOR INSERT
TO public -- 'public' role covers both anon and authenticated
WITH CHECK (bucket_id = 'warranty-receipts');

-- Note: Delete and Update policies for storage objects are not added here for simplicity.
-- These operations would typically require more specific ownership checks or admin privileges.
