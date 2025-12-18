-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view their own policies" ON public.polizas_activas;

-- Create a new policy that allows public read access for admin purposes
CREATE POLICY "Allow public read access for admin"
ON public.polizas_activas
FOR SELECT
USING (true);