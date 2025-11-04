-- Drop the restrictive policy that's blocking anonymous inserts
DROP POLICY IF EXISTS "Users can create their own policies" ON public.polizas_activas;

-- Create a new permissive policy that allows both authenticated and anonymous users
CREATE POLICY "Users can manage their own policies"
ON public.polizas_activas
FOR INSERT
TO authenticated, anon
WITH CHECK (
  (auth.uid() = user_id) OR  -- Authenticated users can insert their own policies
  (user_id IS NULL)           -- Anonymous users can insert policies without user_id
);