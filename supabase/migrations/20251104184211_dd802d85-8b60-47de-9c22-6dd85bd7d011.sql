-- Drop ALL existing INSERT policies to start clean
DROP POLICY IF EXISTS "Users can create their own policies" ON public.polizas_activas;
DROP POLICY IF EXISTS "Allow public policy activation" ON public.polizas_activas;
DROP POLICY IF EXISTS "Users can manage their own policies" ON public.polizas_activas;

-- Create a single PERMISSIVE policy (default) for INSERT that handles both cases
CREATE POLICY "Allow policy creation for authenticated and anonymous users"
ON public.polizas_activas
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND auth.uid() = user_id  -- Authenticated users must match user_id
  OR 
  auth.role() = 'anon' AND user_id IS NULL                 -- Anonymous users must have NULL user_id
);