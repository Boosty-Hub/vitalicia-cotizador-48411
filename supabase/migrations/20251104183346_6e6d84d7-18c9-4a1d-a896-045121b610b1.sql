-- Allow public inserts for policy activation without authentication
CREATE POLICY "Allow public policy activation"
ON public.polizas_activas
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);