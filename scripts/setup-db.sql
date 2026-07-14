-- =====================================================
-- Dünyanın Çiçeği — Supabase Veritabanı Kurulumu
-- Supabase SQL Editor'e yapıştırıp çalıştırın.
-- =====================================================

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text NOT NULL,
  slug        text UNIQUE NOT NULL,
  display_order int DEFAULT 0,
  mega_menu   jsonb DEFAULT '[]'::jsonb,
  created_at  timestamptz DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name          text NOT NULL,
  slug          text UNIQUE NOT NULL,
  description   text DEFAULT '',
  price         numeric(10,2) NOT NULL DEFAULT 0,
  sale_price    numeric(10,2),
  category_id   uuid REFERENCES categories(id) ON DELETE SET NULL,
  category_name text DEFAULT '',
  category_slug text DEFAULT '',
  images        text[] DEFAULT ARRAY[]::text[],
  stock         int DEFAULT 0,
  is_active     boolean DEFAULT true,
  is_new        boolean DEFAULT false,
  is_bestseller boolean DEFAULT false,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- Ek sütunlar
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS sub_category_name    text    DEFAULT '',
  ADD COLUMN IF NOT EXISTS sub_category_slug    text    DEFAULT '',
  ADD COLUMN IF NOT EXISTS seo_title            text    DEFAULT '',
  ADD COLUMN IF NOT EXISTS seo_description      text    DEFAULT '',
  ADD COLUMN IF NOT EXISTS sales_count          int     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_pinned_to_vitrin  boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS care_instructions    text    DEFAULT '';

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products    ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read categories"    ON categories;
DROP POLICY IF EXISTS "Service write categories"  ON categories;
CREATE POLICY "Public read categories"   ON categories FOR SELECT USING (true);
CREATE POLICY "Service write categories" ON categories FOR ALL    USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read products"   ON products;
DROP POLICY IF EXISTS "Service write products" ON products;
CREATE POLICY "Public read products"   ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Service write products" ON products FOR ALL    USING (true) WITH CHECK (true);

-- Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read images"  ON storage.objects;
DROP POLICY IF EXISTS "Auth upload images"  ON storage.objects;
DROP POLICY IF EXISTS "Auth delete images"  ON storage.objects;
CREATE POLICY "Public read images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Auth upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Auth delete images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');

-- =====================================================
-- Site Settings
-- =====================================================
CREATE TABLE IF NOT EXISTS site_settings (
  key   text PRIMARY KEY,
  value text NOT NULL DEFAULT ''
);
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read settings"   ON site_settings;
DROP POLICY IF EXISTS "Service write settings" ON site_settings;
CREATE POLICY "Public read settings"   ON site_settings FOR SELECT USING (true);
CREATE POLICY "Service write settings" ON site_settings FOR ALL    USING (true) WITH CHECK (true);

INSERT INTO site_settings (key, value) VALUES
  ('shipping_info', E'Saat 14:00''a kadar verilen siparişler aynı gün teslim edilir.\nTüm İstanbul ilçelerine teslimat yapılmaktadır.\nTeslimat saati sipariş notunuza ekleyebilirsiniz.')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- Coupons
-- =====================================================
CREATE TABLE IF NOT EXISTS coupons (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code        text UNIQUE NOT NULL,
  type        text NOT NULL CHECK (type IN ('percent', 'fixed')),
  value       numeric(10,2) NOT NULL,
  min_order   numeric(10,2) DEFAULT 0,
  expiry      date,
  used_count  int DEFAULT 0,
  is_active   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service manage coupons" ON coupons;
CREATE POLICY "Service manage coupons" ON coupons FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- Product Variants
-- =====================================================
CREATE TABLE IF NOT EXISTS product_variants (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label       text NOT NULL,
  price       numeric(10,2) NOT NULL,
  stock       int DEFAULT 0,
  is_active   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
DROP TRIGGER IF EXISTS variants_updated_at ON product_variants;
CREATE TRIGGER variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read variants"   ON product_variants;
DROP POLICY IF EXISTS "Service write variants" ON product_variants;
CREATE POLICY "Public read variants"   ON product_variants FOR SELECT USING (true);
CREATE POLICY "Service write variants" ON product_variants FOR ALL    USING (true) WITH CHECK (true);

-- =====================================================
-- Categories örnek veri
-- =====================================================
INSERT INTO categories (name, slug, display_order) VALUES
  ('En Sevilen',    'en-sevilen',    1),
  ('Çiçek',         'cicek',         2),
  ('Çikolata',      'cikolata',      3),
  ('Hediye Kutusu', 'hediye-kutusu', 4),
  ('Orkide',        'orkide',        5),
  ('Bitki',         'bitki',         6),
  ('Gönderim Sebebi','gonderim-sebebi',7),
  ('Koleksiyon',    'koleksiyonlar', 8),
  ('Tüm Ürünler',   'tum-urunler',   9)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- Orders
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number      text UNIQUE NOT NULL,
  email             text NOT NULL,
  customer_name     text DEFAULT '',
  customer_phone    text DEFAULT '',
  product_name      text DEFAULT '',
  items             jsonb DEFAULT '[]'::jsonb,
  subtotal          numeric(10,2) DEFAULT 0,
  total_amount      numeric(10,2) DEFAULT 0,
  address           text DEFAULT '',
  recipient_name    text DEFAULT '',
  recipient_phone   text DEFAULT '',
  card_message      text,
  delivery_date     text DEFAULT '',
  delivery_time     text DEFAULT '',
  payment_method    text DEFAULT 'kapida',
  notes             text,
  status            text NOT NULL DEFAULT 'Yeni',
  tracking_step     int  NOT NULL DEFAULT 0 CHECK (tracking_step BETWEEN 0 AND 3),
  tracking_number   text,
  courier_name      text,
  courier_phone     text,
  estimated_delivery text DEFAULT '',
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_email        ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_status       ON orders(status);

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service manage orders" ON orders;
CREATE POLICY "Service manage orders" ON orders FOR ALL USING (true) WITH CHECK (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- =====================================================
-- Push Subscriptions
-- =====================================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
  endpoint     text PRIMARY KEY,
  subscription jsonb NOT NULL,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service manage push" ON push_subscriptions;
CREATE POLICY "Service manage push" ON push_subscriptions FOR ALL USING (true) WITH CHECK (true);
