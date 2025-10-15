-- Create storage bucket for policy documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'poliza-documentos',
  'poliza-documentos',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
);

-- Allow public read access to documents
CREATE POLICY "Allow public read access on poliza-documentos"
ON storage.objects FOR SELECT
USING (bucket_id = 'poliza-documentos');

-- Allow authenticated users to upload documents
CREATE POLICY "Allow authenticated uploads to poliza-documentos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'poliza-documentos');