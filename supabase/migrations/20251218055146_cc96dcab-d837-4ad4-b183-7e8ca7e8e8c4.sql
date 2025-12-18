-- Create BD_EMPIRE table for EMPIRE factory motorcycle uploads
CREATE TABLE public.bd_empire (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha date,
  marca text,
  modelo text,
  version text,
  anio integer,
  transmision text,
  placa text,
  serial_motor text,
  serial_carroceria text,
  color text,
  lote_carga uuid,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.bd_empire ENABLE ROW LEVEL SECURITY;

-- Create policies - public insert for factories
CREATE POLICY "Anyone can insert bd_empire"
ON public.bd_empire
FOR INSERT
WITH CHECK (true);

-- Admins can view all
CREATE POLICY "Admins can view all bd_empire"
ON public.bd_empire
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update
CREATE POLICY "Admins can update bd_empire"
ON public.bd_empire
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete
CREATE POLICY "Admins can delete bd_empire"
ON public.bd_empire
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes
CREATE INDEX idx_bd_empire_placa ON public.bd_empire(placa);
CREATE INDEX idx_bd_empire_serial_carroceria ON public.bd_empire(serial_carroceria);
CREATE INDEX idx_bd_empire_lote_carga ON public.bd_empire(lote_carga);

-- Add trigger for updated_at
CREATE TRIGGER update_bd_empire_updated_at
BEFORE UPDATE ON public.bd_empire
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();