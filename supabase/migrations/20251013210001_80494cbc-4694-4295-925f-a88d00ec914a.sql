-- Create Precios Empire table
CREATE TABLE public.precios_empire (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  name text,
  precio_venta text,
  estado text,
  marca text,
  modelo text,
  monday_id_elemento text
);

-- Enable Row Level Security
ALTER TABLE public.precios_empire ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access on precios_empire"
ON public.precios_empire
FOR SELECT
USING (true);