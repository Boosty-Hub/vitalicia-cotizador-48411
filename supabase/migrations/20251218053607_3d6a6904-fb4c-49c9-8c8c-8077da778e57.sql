-- Add INSERT policy for admins on precios_empire table
CREATE POLICY "Admins can insert precios_empire"
ON public.precios_empire
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add UPDATE policy for admins on precios_empire table (in case needed)
CREATE POLICY "Admins can update precios_empire"
ON public.precios_empire
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add DELETE policy for admins on precios_empire table (in case needed)
CREATE POLICY "Admins can delete precios_empire"
ON public.precios_empire
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));