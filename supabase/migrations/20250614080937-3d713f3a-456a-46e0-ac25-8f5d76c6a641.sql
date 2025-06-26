
-- Add purchase_date column to serial_numbers table
ALTER TABLE public.serial_numbers
ADD COLUMN purchase_date DATE;
