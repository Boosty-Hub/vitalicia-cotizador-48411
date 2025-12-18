-- Agregar campos para almacenar la respuesta de la API RMS
ALTER TABLE public.polizas_activas
ADD COLUMN IF NOT EXISTS n_serialcontrato text,
ADD COLUMN IF NOT EXISTS n_serialcertif text,
ADD COLUMN IF NOT EXISTS api_recibos jsonb,
ADD COLUMN IF NOT EXISTS api_coberturas jsonb,
ADD COLUMN IF NOT EXISTS api_status text,
ADD COLUMN IF NOT EXISTS api_message text;