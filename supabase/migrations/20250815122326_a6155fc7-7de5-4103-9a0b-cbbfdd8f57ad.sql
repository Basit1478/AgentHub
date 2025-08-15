-- Drop existing policy and recreate correctly
DROP POLICY IF EXISTS "Admin users can manage admin_users" ON public.admin_users;

-- Create correct policy for admin users  
CREATE POLICY "Admin access only" ON public.admin_users
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);