-- Add duplicate flag columns to bd_bera and bd_empire

ALTER TABLE public.bd_bera 
ADD COLUMN IF NOT EXISTS es_duplicado boolean DEFAULT false;

ALTER TABLE public.bd_empire 
ADD COLUMN IF NOT EXISTS es_duplicado boolean DEFAULT false;

-- Add indexes for better query performance on duplicate checks
CREATE INDEX IF NOT EXISTS idx_bd_bera_serial_chasis ON public.bd_bera(serial_chasis);
CREATE INDEX IF NOT EXISTS idx_bd_bera_serial_motor ON public.bd_bera(serial_motor);
CREATE INDEX IF NOT EXISTS idx_bd_bera_placa ON public.bd_bera(placa);

CREATE INDEX IF NOT EXISTS idx_bd_empire_serial_carroceria ON public.bd_empire(serial_carroceria);
CREATE INDEX IF NOT EXISTS idx_bd_empire_serial_motor ON public.bd_empire(serial_motor);
CREATE INDEX IF NOT EXISTS idx_bd_empire_placa ON public.bd_empire(placa);