
-- FASE 1: Corregir datos corruptos en base de datos

-- Corregir "Zuliaq" a "Zulia" en board_cod_estado
UPDATE public.board_cod_estado 
SET descripcion = 'Zulia' 
WHERE descripcion = 'Zuliaq';

-- Limpiar prefijo "C_" de las ciudades en board_cod_ciudad
UPDATE public.board_cod_ciudad 
SET descripcion = SUBSTRING(descripcion FROM 3) 
WHERE descripcion LIKE 'C\_%';
