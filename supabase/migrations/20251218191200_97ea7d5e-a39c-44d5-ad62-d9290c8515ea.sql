-- Allow admins to manage any policy records (required for admin reprocess/refresh)
ALTER TABLE public.polizas_activas ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'polizas_activas'
      AND policyname = 'Admins can update all policies'
  ) THEN
    CREATE POLICY "Admins can update all policies"
    ON public.polizas_activas
    FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'::app_role))
    WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'polizas_activas'
      AND policyname = 'Admins can delete all policies'
  ) THEN
    CREATE POLICY "Admins can delete all policies"
    ON public.polizas_activas
    FOR DELETE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'::app_role));
  END IF;
END$$;
