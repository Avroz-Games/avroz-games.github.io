-- Avroz Games — Storage (bucket de imagens)
-- Execute após criar o projeto Supabase

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Leitura pública das imagens
CREATE POLICY "Imagens públicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Upload apenas para admin autenticado
CREATE POLICY "Admin faz upload de imagens"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Admin pode remover imagens
CREATE POLICY "Admin remove imagens"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

-- Admin pode atualizar imagens
CREATE POLICY "Admin atualiza imagens"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');
