-- Add 7 missing document URL columns to polizas_activas
ALTER TABLE public.polizas_activas
  ADD COLUMN IF NOT EXISTS acta_asamblea_url text,
  ADD COLUMN IF NOT EXISTS acta_constitutiva_url text,
  ADD COLUMN IF NOT EXISTS declaracion_islr_url text,
  ADD COLUMN IF NOT EXISTS referencia_bancaria_url text,
  ADD COLUMN IF NOT EXISTS cedula_accionistas_url text,
  ADD COLUMN IF NOT EXISTS rif_accionistas_url text,
  ADD COLUMN IF NOT EXISTS rif_empresa_url text;

-- Create tracking table for admin downloads
CREATE TABLE IF NOT EXISTS public.admin_document_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  poliza_id uuid NOT NULL,
  document_type text NOT NULL,
  downloaded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_doc_downloads_admin_poliza
  ON public.admin_document_downloads(admin_user_id, poliza_id);

CREATE INDEX IF NOT EXISTS idx_admin_doc_downloads_admin_date
  ON public.admin_document_downloads(admin_user_id, downloaded_at DESC);

ALTER TABLE public.admin_document_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view their own download history"
  ON public.admin_document_downloads
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND admin_user_id = auth.uid()
  );

CREATE POLICY "Admins can insert their own download records"
  ON public.admin_document_downloads
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND admin_user_id = auth.uid()
  );

CREATE POLICY "Admins can delete their own download records"
  ON public.admin_document_downloads
  FOR DELETE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND admin_user_id = auth.uid()
  );