-- Avroz Games — Schema Supabase
-- Execute no SQL Editor do projeto Supabase

-- Produtos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Jogos',
  cost_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  sale_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  images TEXT[] NOT NULL DEFAULT '{}',
  characteristics JSONB NOT NULL DEFAULT '[]',
  weight NUMERIC(8,3) NOT NULL DEFAULT 0.3,
  length NUMERIC(8,2) NOT NULL DEFAULT 20,
  height NUMERIC(8,2) NOT NULL DEFAULT 10,
  width NUMERIC(8,2) NOT NULL DEFAULT 15,
  stock INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Configurações da loja (linha única)
CREATE TABLE IF NOT EXISTS store_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  store_name TEXT NOT NULL DEFAULT 'Avroz Games',
  store_description TEXT NOT NULL DEFAULT '',
  margin_percent NUMERIC(5,2) NOT NULL DEFAULT 45,
  pix_discount_percent NUMERIC(5,2) NOT NULL DEFAULT 10,
  origin_cep TEXT NOT NULL DEFAULT '01310100',
  pix_key TEXT NOT NULL DEFAULT '',
  pix_key_type TEXT NOT NULL DEFAULT 'email',
  whatsapp TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO store_settings (id) VALUES ('main') ON CONFLICT (id) DO NOTHING;

-- Pedidos
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  items JSONB NOT NULL,
  customer JSONB NOT NULL,
  shipping JSONB NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  shipping_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'pix',
  status TEXT NOT NULL DEFAULT 'pending',
  pix_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Leitura pública de produtos ativos e configurações
CREATE POLICY "Produtos ativos são públicos" ON products
  FOR SELECT USING (active = true);

CREATE POLICY "Configurações públicas" ON store_settings
  FOR SELECT USING (true);

-- Pedidos: inserção pública (checkout), leitura autenticada
CREATE POLICY "Qualquer um pode criar pedido" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin lê pedidos" ON orders
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin atualiza pedidos" ON orders
  FOR UPDATE TO authenticated USING (true);

-- Admin autenticado gerencia produtos e configurações
CREATE POLICY "Admin gerencia produtos" ON products
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin gerencia configurações" ON store_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Storage bucket para imagens (criar via Dashboard: product-images, público)
-- Política sugerida: leitura pública, upload autenticado
