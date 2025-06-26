
-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  mobile TEXT,
  serial_no_prefix TEXT NOT NULL,
  manufacturer_name TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  image_url TEXT,
  warranty_duration INTEGER DEFAULT 12,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create serial_numbers table
CREATE TABLE public.serial_numbers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  serial_number TEXT NOT NULL UNIQUE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'registered', 'claimed')),
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  registration_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.serial_numbers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for products (allowing all operations for now)
CREATE POLICY "Enable all operations for products" ON public.products
  FOR ALL USING (true) WITH CHECK (true);

-- Create RLS policies for serial_numbers (allowing all operations for now)
CREATE POLICY "Enable all operations for serial_numbers" ON public.serial_numbers
  FOR ALL USING (true) WITH CHECK (true);

-- Insert some sample data
INSERT INTO public.products (name, mobile, serial_no_prefix, manufacturer_name, category_id, warranty_duration, description) VALUES
  ('iPhone 15 Pro', '+1234567890', 'IPH', 'Apple Inc.', (SELECT id FROM public.categories WHERE name = 'Smartphones' LIMIT 1), 12, 'Latest iPhone model with advanced features'),
  ('MacBook Air M3', '+1234567891', 'MBA', 'Apple Inc.', (SELECT id FROM public.categories WHERE name = 'Laptops' LIMIT 1), 12, 'Lightweight laptop with M3 chip'),
  ('Galaxy S24 Ultra', '+1234567892', 'GSU', 'Samsung', (SELECT id FROM public.categories WHERE name = 'Smartphones' LIMIT 1), 24, 'Premium Android smartphone'),
  ('iPad Pro', '+1234567893', 'IPD', 'Apple Inc.', (SELECT id FROM public.categories WHERE name = 'Tablets' LIMIT 1), 12, 'Professional tablet for creative work');

-- Insert some sample serial numbers
INSERT INTO public.serial_numbers (serial_number, product_id, status, customer_name, customer_email, registration_date) VALUES
  ('ABC123456', (SELECT id FROM public.products WHERE name = 'iPhone 15 Pro' LIMIT 1), 'registered', 'John Doe', 'john@example.com', '2024-01-15'),
  ('DEF789012', (SELECT id FROM public.products WHERE name = 'MacBook Air M3' LIMIT 1), 'available', NULL, NULL, NULL),
  ('GHI345678', (SELECT id FROM public.products WHERE name = 'Galaxy S24 Ultra' LIMIT 1), 'registered', 'Jane Smith', 'jane@example.com', '2024-01-14'),
  ('JKL901234', (SELECT id FROM public.products WHERE name = 'iPad Pro' LIMIT 1), 'claimed', 'Bob Johnson', 'bob@example.com', '2024-01-13');
