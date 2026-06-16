-- Avroz Games — Storage (bucket de imagens)
-- Execute após schema.sql

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Imagens públicas" ON storage.objects;
CREATE POLICY "Imagens públicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Vendedores fazem upload" ON storage.objects;
CREATE POLICY "Vendedores fazem upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('seller', 'admin'))
  )
);

DROP POLICY IF EXISTS "Vendedores removem imagens" ON storage.objects;
CREATE POLICY "Vendedores removem imagens"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('seller', 'admin'))
);

DROP POLICY IF EXISTS "Vendedores atualizam imagens" ON storage.objects;
CREATE POLICY "Vendedores atualizam imagens"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('seller', 'admin'))
);
