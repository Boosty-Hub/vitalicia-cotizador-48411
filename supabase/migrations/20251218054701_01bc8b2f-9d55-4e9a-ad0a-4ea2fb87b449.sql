-- Allow public insert access for bd_bera (factories don't have login)
CREATE POLICY "Anyone can insert bd_bera"
ON public.bd_bera
FOR INSERT
WITH CHECK (true);

-- Drop the admin-only insert policy
DROP POLICY IF EXISTS "Admins can insert bd_bera" ON public.bd_bera;