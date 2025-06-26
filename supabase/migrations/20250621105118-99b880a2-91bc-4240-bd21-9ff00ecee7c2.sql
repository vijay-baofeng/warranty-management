
-- Update the check constraint on serial_numbers table to allow new status values
ALTER TABLE public.serial_numbers 
DROP CONSTRAINT IF EXISTS serial_numbers_status_check;

ALTER TABLE public.serial_numbers 
ADD CONSTRAINT serial_numbers_status_check 
CHECK (status IN ('available', 'registered', 'claimed', 'approved', 'in-review', 'rejected', 'require-more-info'));
