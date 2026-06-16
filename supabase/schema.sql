-- =============================================================================
-- Avroz Games Marketplace — Schema Multi-Vendedor v2
-- Execute no SQL Editor do Supabase (substitui schema anterior)
-- =============================================================================

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Perfis (vinculado ao auth.users)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  cpf TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'seller', 'admin')),
  avatar_url TEXT,
  terms_accepted_at TIMESTAMPTZ,
  privacy_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Vendedores
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  store_slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  document_type TEXT NOT NULL DEFAULT 'cpf' CHECK (document_type IN ('cpf', 'cnpj')),
  document_number TEXT NOT NULL,
  pix_key TEXT NOT NULL,
  pix_key_type TEXT NOT NULL DEFAULT 'email',
  address JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  rejection_reason TEXT,
  seller_contract_accepted_at TIMESTAMPTZ,
  rating NUMERIC(3,2) DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Configurações da plataforma
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS platform_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  platform_name TEXT NOT NULL DEFAULT 'Avroz Games Marketplace',
  platform_description TEXT DEFAULT '',
  platform_fee_percent NUMERIC(5,2) NOT NULL DEFAULT 25,
  pix_discount_percent NUMERIC(5,2) NOT NULL DEFAULT 10,
  escrow_days_auto_release INTEGER DEFAULT 7,
  origin_cep TEXT DEFAULT '01310100',
  platform_pix_key TEXT DEFAULT '',
  platform_pix_key_type TEXT DEFAULT 'email',
  support_email TEXT DEFAULT '',
  support_whatsapp TEXT DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO platform_settings (id) VALUES ('main') ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Produtos (por vendedor)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Jogos',
  seller_price NUMERIC(10,2) NOT NULL,
  sale_price NUMERIC(10,2) NOT NULL,
  platform_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
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

-- ---------------------------------------------------------------------------
-- Pedidos (comprador)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES profiles(id),
  subtotal NUMERIC(10,2) NOT NULL,
  shipping_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'pix',
  pix_code TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'paid', 'cancelled', 'refunded'
  )),
  shipping_address JSONB NOT NULL,
  buyer_contract_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Sub-pedidos (por vendedor — escrow)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sub_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES sellers(id),
  subtotal NUMERIC(10,2) NOT NULL,
  seller_payout NUMERIC(10,2) NOT NULL,
  platform_fee NUMERIC(10,2) NOT NULL,
  shipping_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_option JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'paid', 'processing', 'shipped', 'delivered',
    'buyer_confirmed', 'payout_released', 'cancelled', 'disputed', 'refunded'
  )),
  escrow_status TEXT NOT NULL DEFAULT 'pending' CHECK (escrow_status IN (
    'pending', 'held', 'released', 'refunded', 'disputed'
  )),
  tracking_code TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  buyer_confirmed_at TIMESTAMPTZ,
  payout_released_at TIMESTAMPTZ,
  auto_release_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Itens do sub-pedido
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_order_id UUID NOT NULL REFERENCES sub_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_sale_price NUMERIC(10,2) NOT NULL,
  unit_seller_payout NUMERIC(10,2) NOT NULL,
  unit_platform_fee NUMERIC(10,2) NOT NULL
);

-- ---------------------------------------------------------------------------
-- Repasses (auditoria financeira)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_order_id UUID NOT NULL REFERENCES sub_orders(id),
  seller_id UUID NOT NULL REFERENCES sellers(id),
  amount NUMERIC(10,2) NOT NULL,
  platform_fee NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  pix_reference TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Índices
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_sellers_status ON sellers(status);
CREATE INDEX IF NOT EXISTS idx_sub_orders_seller ON sub_orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_sub_orders_buyer ON sub_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);

-- ---------------------------------------------------------------------------
-- Funções auxiliares
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calc_sale_price(seller_price NUMERIC, fee_percent NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
  RETURN ROUND(seller_price / (1 - fee_percent / 100), 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all" ON profiles FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Sellers (público: lojas aprovadas)
CREATE POLICY "sellers_public_approved" ON sellers FOR SELECT
  USING (status = 'approved');
CREATE POLICY "sellers_own" ON sellers FOR ALL
  USING (user_id = auth.uid());
CREATE POLICY "sellers_admin" ON sellers FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Platform settings (leitura pública)
CREATE POLICY "settings_public_read" ON platform_settings FOR SELECT USING (true);
CREATE POLICY "settings_admin_write" ON platform_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Products (ativos de vendedores aprovados — público)
CREATE POLICY "products_public_active" ON products FOR SELECT
  USING (
    active = true AND EXISTS (
      SELECT 1 FROM sellers s WHERE s.id = products.seller_id AND s.status = 'approved'
    )
  );
CREATE POLICY "products_seller_manage" ON products FOR ALL
  USING (EXISTS (
    SELECT 1 FROM sellers s WHERE s.id = products.seller_id AND s.user_id = auth.uid()
  ));
CREATE POLICY "products_admin" ON products FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Orders (comprador vê os seus)
CREATE POLICY "orders_buyer" ON orders FOR SELECT USING (buyer_id = auth.uid());
CREATE POLICY "orders_buyer_insert" ON orders FOR INSERT WITH CHECK (buyer_id = auth.uid());
CREATE POLICY "orders_admin" ON orders FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Sub-orders
CREATE POLICY "sub_orders_buyer" ON sub_orders FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = sub_orders.order_id AND o.buyer_id = auth.uid()));
CREATE POLICY "sub_orders_seller" ON sub_orders FOR ALL
  USING (EXISTS (SELECT 1 FROM sellers s WHERE s.id = sub_orders.seller_id AND s.user_id = auth.uid()));
CREATE POLICY "sub_orders_admin" ON sub_orders FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Order items
CREATE POLICY "order_items_via_sub_order" ON order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM sub_orders so
    JOIN orders o ON o.id = so.order_id
    WHERE so.id = order_items.sub_order_id
    AND (o.buyer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM sellers s WHERE s.id = so.seller_id AND s.user_id = auth.uid()
    ))
  ));

-- Payouts
CREATE POLICY "payouts_seller" ON payouts FOR SELECT
  USING (EXISTS (SELECT 1 FROM sellers s WHERE s.id = payouts.seller_id AND s.user_id = auth.uid()));
CREATE POLICY "payouts_admin" ON payouts FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Checkout: comprador cria sub-pedidos e itens
DROP POLICY IF EXISTS "sub_orders_buyer_insert" ON sub_orders;
CREATE POLICY "sub_orders_buyer_insert" ON sub_orders FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM orders o WHERE o.id = sub_orders.order_id AND o.buyer_id = auth.uid()
  ));

DROP POLICY IF EXISTS "sub_orders_buyer_confirm" ON sub_orders;
CREATE POLICY "sub_orders_buyer_confirm" ON sub_orders FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM orders o WHERE o.id = sub_orders.order_id AND o.buyer_id = auth.uid()
  ));

DROP POLICY IF EXISTS "order_items_insert_checkout" ON order_items;
CREATE POLICY "order_items_insert_checkout" ON order_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM sub_orders so
    JOIN orders o ON o.id = so.order_id
    WHERE so.id = order_items.sub_order_id AND o.buyer_id = auth.uid()
  ));

DROP POLICY IF EXISTS "order_items_select_checkout" ON order_items;
CREATE POLICY "order_items_select_checkout" ON order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM sub_orders so
    JOIN orders o ON o.id = so.order_id
    WHERE so.id = order_items.sub_order_id
    AND (o.buyer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM sellers s WHERE s.id = so.seller_id AND s.user_id = auth.uid()
    ) OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  ));

-- Confirmação de recebimento (escrow) via RPC segura
CREATE OR REPLACE FUNCTION confirm_sub_order_receipt(p_sub_order_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sub sub_orders%ROWTYPE;
BEGIN
  SELECT * INTO v_sub FROM sub_orders WHERE id = p_sub_order_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Sub-pedido não encontrado'; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM orders o WHERE o.id = v_sub.order_id AND o.buyer_id = auth.uid()
  ) THEN RAISE EXCEPTION 'Não autorizado'; END IF;
  IF v_sub.escrow_status <> 'held' THEN RAISE EXCEPTION 'Escrow já processado'; END IF;

  UPDATE sub_orders SET
    status = 'buyer_confirmed',
    escrow_status = 'released',
    buyer_confirmed_at = now(),
    payout_released_at = now(),
    updated_at = now()
  WHERE id = p_sub_order_id;

  INSERT INTO payouts (sub_order_id, seller_id, amount, platform_fee, status, processed_at)
  VALUES (p_sub_order_id, v_sub.seller_id, v_sub.seller_payout, v_sub.platform_fee, 'completed', now());
END;
$$;

GRANT EXECUTE ON FUNCTION confirm_sub_order_receipt(UUID) TO authenticated;

-- Storage (imagens) — execute storage.sql separadamente
