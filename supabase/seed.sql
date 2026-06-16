-- Avroz Games Marketplace — Dados iniciais de produção
-- Execute APÓS schema.sql e storage.sql
-- Crie usuários em Authentication antes de promover admin/vendedores

UPDATE platform_settings SET
  platform_name = 'Avroz Games Marketplace',
  platform_description = 'Marketplace gamer com vendedores verificados, pagamento seguro em escrow e entrega via Correios.',
  platform_fee_percent = 25,
  pix_discount_percent = 10,
  escrow_days_auto_release = 7,
  origin_cep = '01310100',
  platform_pix_key = 'contato@avrozgames.com.br',
  platform_pix_key_type = 'email',
  support_email = 'contato@avrozgames.com.br',
  support_whatsapp = '5511999999999',
  updated_at = now()
WHERE id = 'main';

-- Promover admin (após criar usuário admin@avrozgames.com.br no Auth)
UPDATE profiles SET role = 'admin', updated_at = now()
WHERE email = 'admin@avrozgames.com.br';

-- Aprovar vendedores demo (após cadastro como seller no site)
-- UPDATE sellers SET status = 'approved', updated_at = now()
-- WHERE store_slug IN ('gamestore-bh', 'retro-games-sp');
