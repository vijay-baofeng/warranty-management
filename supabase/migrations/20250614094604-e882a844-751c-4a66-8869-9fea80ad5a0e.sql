
-- Add a new column for claim request ID to the serial_numbers table
ALTER TABLE public.serial_numbers
ADD COLUMN claim_request_id TEXT;

-- Optional: Add an index if you plan to query by claim_request_id frequently
-- CREATE INDEX IF NOT EXISTS idx_claim_request_id ON public.serial_numbers(claim_request_id);
