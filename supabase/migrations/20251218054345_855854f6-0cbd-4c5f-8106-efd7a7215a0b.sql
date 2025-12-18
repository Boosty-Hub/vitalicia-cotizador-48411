-- Create BD_BERA table for factory motorcycle uploads
CREATE TABLE public.bd_bera (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_fila integer,
  fecha date,
  marca text,
  cod_modelo text,
  modelo text,
  anio_modelo integer,
  placa text,
  transmision text,
  serial_chasis text,
  serial_motor text,
  cod_color text,
  color text,
  precio_venta_tienda numeric,
  precio_base_venta_tienda numeric,
  precio_venta_sugerido numeric,
  precio_base_venta_sugerido numeric,
  lote_carga uuid,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.bd_bera ENABLE ROW LEVEL SECURITY;

-- Create policies for admins
CREATE POLICY "Admins can view all bd_bera"
ON public.bd_bera
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert bd_bera"
ON public.bd_bera
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update bd_bera"
ON public.bd_bera
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete bd_bera"
ON public.bd_bera
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index on placa for quick lookups
CREATE INDEX idx_bd_bera_placa ON public.bd_bera(placa);
CREATE INDEX idx_bd_bera_serial_chasis ON public.bd_bera(serial_chasis);
CREATE INDEX idx_bd_bera_lote_carga ON public.bd_bera(lote_carga);

-- Add trigger for updated_at
CREATE TRIGGER update_bd_bera_updated_at
BEFORE UPDATE ON public.bd_bera
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();