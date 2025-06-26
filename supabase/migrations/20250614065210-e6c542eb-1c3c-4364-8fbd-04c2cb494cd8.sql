
-- Create a table for promotional banners
CREATE TABLE public.promotional_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  link_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.promotional_banners ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to active banners
CREATE POLICY "Allow public read access to active banners"
  ON public.promotional_banners
  FOR SELECT
  USING (is_active = TRUE);

-- Policy: Allow admin users to manage all banners
-- For now, we'll assume an admin role or specific user IDs might manage this.
-- This policy allows all authenticated users to manage banners.
-- You might want to refine this based on your admin roles.
CREATE POLICY "Allow admin to manage banners"
  ON public.promotional_banners
  FOR ALL
  USING (auth.role() = 'authenticated') -- Or a more specific admin role check
  WITH CHECK (auth.role() = 'authenticated');

-- Add some sample data for testing
INSERT INTO public.promotional_banners (image_url, title, description, link_url, is_active) VALUES
  ('https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=800&auto=format&fit=crop', 'Latest Tech Gadgets', 'Discover the newest arrivals in tech.', '#', true),
  ('https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop', 'Extended Warranty Offer', 'Get extended warranty on selected products.', '#', true),
  ('https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=800&auto=format&fit=crop', 'Secure Your Devices', 'Learn more about our comprehensive protection plans.', '#', true);
