-- =====================================================
-- Görsel Onay Sistemi — Faz 1: Veritabanı Şeması
-- Supabase SQL Editor'e yapıştırıp çalıştırın.
-- =====================================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS approval_image_url  text,
  ADD COLUMN IF NOT EXISTS approval_token      text UNIQUE,
  ADD COLUMN IF NOT EXISTS approval_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS approval_status     text NOT NULL DEFAULT 'NOT_REQUIRED',
  ADD COLUMN IF NOT EXISTS rejection_reason    text;

-- approval_status yalnızca bu dört değerden birini alabilir
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_approval_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_approval_status_check
  CHECK (approval_status IN ('NOT_REQUIRED', 'PENDING', 'APPROVED', 'REJECTED'));

-- Onay linkindeki token ile hızlı sipariş araması için
CREATE INDEX IF NOT EXISTS idx_orders_approval_token ON orders(approval_token);
