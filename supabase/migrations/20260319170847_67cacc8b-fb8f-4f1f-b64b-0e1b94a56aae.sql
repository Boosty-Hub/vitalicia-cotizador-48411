-- Allow public read access to bd_bera for plate validation
CREATE POLICY "Allow public read access on bd_bera"
ON public.bd_bera FOR SELECT
TO public
USING (true);

-- Allow public read access to bd_empire for plate validation
CREATE POLICY "Allow public read access on bd_empire"
ON public.bd_empire FOR SELECT
TO public
USING (true);
