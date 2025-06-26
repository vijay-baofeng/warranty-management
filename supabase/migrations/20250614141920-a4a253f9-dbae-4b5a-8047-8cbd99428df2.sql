
-- 1. Create a function to validate serial numbers, bypassing RLS for this specific action.
-- This allows any user to check if a serial number exists and is available for registration.
CREATE OR REPLACE FUNCTION public.validate_serial_number(p_serial_number TEXT)
RETURNS TABLE (
    id uuid,
    serial_number text,
    product_id uuid,
    status text,
    customer_name text,
    customer_email text,
    customer_phone text,
    registration_date date,
    created_at timestamptz,
    updated_at timestamptz,
    purchase_source text,
    purchase_date date,
    purchase_receipt_url text,
    claim_request_id text,
    products jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        sn.id,
        sn.serial_number,
        sn.product_id,
        sn.status,
        sn.customer_name,
        sn.customer_email,
        sn.customer_phone,
        sn.registration_date,
        sn.created_at,
        sn.updated_at,
        sn.purchase_source,
        sn.purchase_date,
        sn.purchase_receipt_url,
        sn.claim_request_id,
        jsonb_build_object(
            'id', p.id,
            'name', p.name,
            'manufacturer_name', p.manufacturer_name,
            'description', p.description,
            'serial_no_prefix', p.serial_no_prefix,
            'warranty_duration', p.warranty_duration
        ) as products
    FROM public.serial_numbers sn
    LEFT JOIN public.products p ON sn.product_id = p.id
    WHERE sn.serial_number = p_serial_number;
END;
$$;

-- 2. Enable Row-Level Security on the serial_numbers table.
ALTER TABLE public.serial_numbers ENABLE ROW LEVEL SECURITY;

-- 3. Add RLS policies to control data access.
-- Policy for Admins: Full access to all serial numbers.
CREATE POLICY "Admins have full access to serial numbers"
ON public.serial_numbers
FOR ALL
USING (public.has_role('admin'))
WITH CHECK (public.has_role('admin'));

-- Policy for End Users: Can only view their own registered serial numbers.
CREATE POLICY "End users can see their own serial numbers"
ON public.serial_numbers
FOR SELECT
USING (customer_email = auth.email());

-- Policy for End Users: Can update an 'available' serial number to register it,
-- or update their own existing serial number (e.g., for a claim).
CREATE POLICY "End users can update serial numbers to register or claim"
ON public.serial_numbers
FOR UPDATE
USING (
  (status = 'available'::text) OR (customer_email = auth.email())
)
WITH CHECK (
  customer_email = auth.email()
);
