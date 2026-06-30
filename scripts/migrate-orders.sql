-- =====================================================
-- Orders Tablosu Güncellemesi
-- Supabase SQL Editor'e yapıştırıp çalıştırın.
-- Eğer orders tablosu hiç yoksa setup-db.sql'i çalıştırın.
-- =====================================================

-- Eksik sütunları ekle (mevcutsa hata vermez)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_phone    text DEFAULT '',
  ADD COLUMN IF NOT EXISTS items             jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS subtotal          numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS address           text DEFAULT '',
  ADD COLUMN IF NOT EXISTS recipient_name    text DEFAULT '',
  ADD COLUMN IF NOT EXISTS recipient_phone   text DEFAULT '',
  ADD COLUMN IF NOT EXISTS card_message      text,
  ADD COLUMN IF NOT EXISTS delivery_date     text DEFAULT '',
  ADD COLUMN IF NOT EXISTS delivery_time     text DEFAULT '',
  ADD COLUMN IF NOT EXISTS payment_method    text DEFAULT 'kapida',
  ADD COLUMN IF NOT EXISTS status            text NOT NULL DEFAULT 'Yeni',
  ADD COLUMN IF NOT EXISTS tracking_number   text;

-- Push Subscriptions tablosu (Web Push için)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  endpoint     text PRIMARY KEY,
  subscription jsonb NOT NULL,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Service manage push"
  ON push_subscriptions FOR ALL USING (true) WITH CHECK (true);

-- Realtime aktifleştirme (orders tablosu için)
-- Bu komut Supabase'de Realtime'ı tablo seviyesinde açar
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE push_subscriptions;
