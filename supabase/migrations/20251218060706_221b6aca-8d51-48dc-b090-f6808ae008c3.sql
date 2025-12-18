-- Create a function to check for duplicate BERA motorcycles by placa
-- This function uses SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION public.check_bera_duplicates(placas text[])
RETURNS TABLE(placa text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT LOWER(bd.placa) as placa
  FROM public.bd_bera bd
  WHERE LOWER(bd.placa) = ANY(
    SELECT LOWER(unnest(placas))
  )
  AND bd.placa IS NOT NULL
$$;

-- Create a function to check for duplicate EMPIRE motorcycles by placa
CREATE OR REPLACE FUNCTION public.check_empire_duplicates(placas text[])
RETURNS TABLE(placa text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT LOWER(bd.placa) as placa
  FROM public.bd_empire bd
  WHERE LOWER(bd.placa) = ANY(
    SELECT LOWER(unnest(placas))
  )
  AND bd.placa IS NOT NULL
$$;