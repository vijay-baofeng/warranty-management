
-- Assign 'admin' role to the specified user
INSERT INTO public.user_roles (user_id, role)
VALUES ('1ac68eb0-c17e-4299-81df-7264dfe52633', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Update RLS policy to empower admins to manage all user roles
-- Drop the restrictive placeholder policy first
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Create the new policy that allows users with the 'admin' role to manage all roles
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles
  FOR ALL
  USING (public.has_role('admin'))
  WITH CHECK (public.has_role('admin'));
