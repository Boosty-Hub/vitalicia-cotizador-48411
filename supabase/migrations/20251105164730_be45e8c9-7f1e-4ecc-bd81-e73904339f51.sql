-- Add formulario column to polizas_activas table
ALTER TABLE public.polizas_activas 
ADD COLUMN formulario text;

-- Add comment to describe the column
COMMENT ON COLUMN public.polizas_activas.formulario IS 'Tipo de formulario usado: "juridico" o "natural"';