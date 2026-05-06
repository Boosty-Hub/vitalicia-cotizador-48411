-- 1) Insertar código telefónico 0422 (Digitel) si no existe
INSERT INTO public.board_cod_tlf (cd_valdet, s_descripcion)
SELECT '0422', 'Digitel'
WHERE NOT EXISTS (
  SELECT 1 FROM public.board_cod_tlf WHERE cd_valdet = '0422'
);

-- 2) Nueva columna para el Título de Propiedad del vehículo
ALTER TABLE public.polizas_activas
ADD COLUMN IF NOT EXISTS titulo_propiedad_url text;