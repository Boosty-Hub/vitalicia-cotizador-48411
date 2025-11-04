-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view their own policies" ON public.polizas_activas;

-- Create a new SELECT policy that allows both authenticated and anonymous users
CREATE POLICY "Users can view their own policies"
ON public.polizas_activas
FOR SELECT
USING (
  (auth.role() = 'authenticated' AND auth.uid() = user_id)
  OR 
  (auth.role() = 'anon' AND user_id IS NULL)
);