-- Add RLS policies for admins to manage board_cod_modelo
CREATE POLICY "Admins can insert board_cod_modelo"
ON public.board_cod_modelo
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update board_cod_modelo"
ON public.board_cod_modelo
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete board_cod_modelo"
ON public.board_cod_modelo
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));