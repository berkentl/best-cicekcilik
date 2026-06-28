-- =====================================================
-- Best Çiçekçilik — Supabase Veritabanı Kurulumu
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

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS Policies (public read, service-role write)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read products"   ON products   FOR SELECT USING (is_active = true);
CREATE POLICY "Service write categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service write products"   ON products   FOR ALL USING (true) WITH CHECK (true);

-- Storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read images"
  ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Auth upload images"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Auth delete images"
  ON storage.objects FOR DELETE USING (bucket_id = 'product-images');

-- =====================================================
-- Ek Sütunlar (mevcut products tablosuna)
-- =====================================================
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS sub_category_name    text    DEFAULT '',
  ADD COLUMN IF NOT EXISTS sub_category_slug    text    DEFAULT '',
  ADD COLUMN IF NOT EXISTS seo_title            text    DEFAULT '',
  ADD COLUMN IF NOT EXISTS seo_description      text    DEFAULT '',
  ADD COLUMN IF NOT EXISTS sales_count          int     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_pinned_to_vitrin  boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS care_instructions    text    DEFAULT '';

-- =====================================================
-- Site Settings (global site configuration)
-- =====================================================
CREATE TABLE IF NOT EXISTS site_settings (
  key   text PRIMARY KEY,
  value text NOT NULL DEFAULT ''
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Public read settings"   ON site_settings FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Service write settings" ON site_settings FOR ALL   USING (true) WITH CHECK (true);

-- Default shipping info
INSERT INTO site_settings (key, value) VALUES
  ('shipping_info', E'Saat 14:00''a kadar verilen siparişler aynı gün teslim edilir.\nTüm İstanbul ilçelerine teslimat yapılmaktadır.\n₺500 üzeri siparişlerde kargo ücretsizdir.\nTeslimat saati sipariş notunuza ekleyebilirsiniz.')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- Coupons (kupon kodları)
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
CREATE POLICY "Service manage coupons" ON coupons FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- Product Variants (renk, beden, boyut vb.)
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

CREATE POLICY IF NOT EXISTS "Public read variants"  ON product_variants FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Service write variants" ON product_variants FOR ALL   USING (true) WITH CHECK (true);

-- =====================================================
-- Örnek Veri (isteğe bağlı — mevcut ürünleri ekler)
-- =====================================================
INSERT INTO categories (name, slug, display_order) VALUES
  ('En Sevilen', 'en-sevilen', 1),
  ('Çiçek', 'cicek', 2),
  ('Çikolata', 'cikolata', 3),
  ('Hediye Kutusu', 'hediye-kutusu', 4),
  ('Orkide', 'orkide', 5),
  ('Bitki', 'bitki', 6),
  ('Gönderim Sebebi', 'gonderim-sebebi', 7),
  ('Koleksiyon', 'koleksiyonlar', 8),
  ('Tüm Ürünler', 'tum-urunler', 9)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- Orders (siparişler + sipariş takip)
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number      text UNIQUE NOT NULL,          -- BST-2024-XXXX
  email             text NOT NULL,
  customer_name     text DEFAULT '',
  product_name      text DEFAULT '',
  total_amount      numeric(10,2) DEFAULT 0,
  estimated_delivery text DEFAULT '',
  tracking_step     int NOT NULL DEFAULT 0          -- 0:Alındı 1:Hazırlanıyor 2:Yolda 3:Teslim
                    CHECK (tracking_step BETWEEN 0 AND 3),
  courier_name      text,
  courier_phone     text,
  notes             text,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_email        ON orders(email);

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- Müşteri kendi siparişini okuyabilir (order_number + email eşleşmesi API'de yapılır)
CREATE POLICY IF NOT EXISTS "Service manage orders" ON orders FOR ALL USING (true) WITH CHECK (true);
