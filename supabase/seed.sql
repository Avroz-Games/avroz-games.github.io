-- Avroz Games — Dados iniciais (produtos demo + configurações)
-- Execute após schema.sql

UPDATE store_settings SET
  store_name = 'Avroz Games',
  store_description = 'Os melhores jogos, consoles e acessórios com entrega rápida e pagamento PIX com desconto.',
  margin_percent = 45,
  pix_discount_percent = 10,
  origin_cep = '01310100',
  pix_key = 'contato@avrozgames.com.br',
  pix_key_type = 'email',
  whatsapp = '5511999999999',
  email = 'contato@avrozgames.com.br',
  updated_at = now()
WHERE id = 'main';

INSERT INTO products (name, description, category, cost_price, sale_price, images, characteristics, weight, length, height, width, stock, featured, active)
VALUES
(
  'God of War Ragnarök - PS5',
  'Embarque numa jornada épica com Kratos e Atreus. Ação cinematográfica, combates intensos e uma história emocionante.',
  'PlayStation', 179.90, 260.86,
  ARRAY['https://images.unsplash.com/photo-1612287230202-1ff1d85c1ef7?w=600&h=600&fit=crop'],
  '[{"label":"Plataforma","value":"PlayStation 5"},{"label":"Gênero","value":"Ação/Aventura"},{"label":"Classificação","value":"18 anos"}]'::jsonb,
  0.15, 17, 1.5, 13.5, 25, true, true
),
(
  'Controle DualSense - Midnight Black',
  'Controle oficial PlayStation 5 com feedback háptico, gatilhos adaptativos e microfone integrado.',
  'Acessórios', 289.90, 420.36,
  ARRAY['https://images.unsplash.com/photo-1606148013644-e571c4d5b5c5?w=600&h=600&fit=crop'],
  '[{"label":"Compatibilidade","value":"PS5 / PC"},{"label":"Conexão","value":"USB-C / Bluetooth"},{"label":"Cor","value":"Midnight Black"}]'::jsonb,
  0.28, 16, 6.5, 10.6, 40, true, true
),
(
  'The Legend of Zelda: Tears of the Kingdom',
  'Explore Hyrule como nunca antes. Mundo aberto vasto cheio de mistérios e aventuras inesquecíveis.',
  'Nintendo', 249.90, 362.36,
  ARRAY['https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&h=600&fit=crop'],
  '[{"label":"Plataforma","value":"Nintendo Switch"},{"label":"Gênero","value":"Ação/Aventura"},{"label":"Classificação","value":"12 anos"}]'::jsonb,
  0.05, 10.4, 0.7, 17, 18, true, true
),
(
  'Headset Gamer RGB Pro',
  'Som surround 7.1, microfone com cancelamento de ruído e almofadas memory foam.',
  'Headsets', 149.90, 217.36,
  ARRAY['https://images.unsplash.com/photo-1599669454699-248893623440?w=600&h=600&fit=crop'],
  '[{"label":"Conexão","value":"USB / P2"},{"label":"Drivers","value":"50mm"},{"label":"Iluminação","value":"RGB"}]'::jsonb,
  0.35, 20, 10, 18, 30, false, true
),
(
  'Elden Ring - Edição de Colecionador',
  'Obra-prima de FromSoftware. Mundo aberto imersivo com combates desafiadores.',
  'Colecionáveis', 399.90, 579.86,
  ARRAY['https://images.unsplash.com/photo-1538488886555-98f798d929bf?w=600&h=600&fit=crop'],
  '[{"label":"Plataforma","value":"PS5 / Xbox / PC"},{"label":"Edição","value":"Colecionador"},{"label":"Conteúdo Extra","value":"Steelbook + Artbook"}]'::jsonb,
  0.8, 25, 5, 20, 8, true, true
),
(
  'Mouse Gamer Wireless 16000 DPI',
  'Precisão extrema com sensor óptico de 16000 DPI, 8 botões programáveis e bateria longa.',
  'Teclados & Mouses', 89.90, 130.36,
  ARRAY['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop'],
  '[{"label":"DPI","value":"16000"},{"label":"Conexão","value":"2.4GHz Wireless"},{"label":"Peso","value":"75g"}]'::jsonb,
  0.12, 12.5, 4, 6.5, 55, false, true
);
