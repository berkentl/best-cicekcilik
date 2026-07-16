-- =====================================================
-- Fatura (Kolaysoft) ve ödeme durumu alanları
-- Supabase SQL Editor'e yapıştırıp çalıştırın.
-- =====================================================

ALTER TABLE orders
  -- Sipariş anında zaten toplanıyor (form.city / form.district) ama tek bir
  -- birleşik address string'ine gömülüyordu. Fatura artık teslimat anında
  -- (sonradan) kesildiği için il/ilçe'nin ayrı ayrı saklanması gerekiyor.
  ADD COLUMN IF NOT EXISTS city            text,
  ADD COLUMN IF NOT EXISTS district        text,
  ADD COLUMN IF NOT EXISTS invoice_type    text,
  ADD COLUMN IF NOT EXISTS tc_kimlik_no    text,
  ADD COLUMN IF NOT EXISTS vergi_dairesi   text,
  ADD COLUMN IF NOT EXISTS vergi_no        text,
  ADD COLUMN IF NOT EXISTS firma_adi       text,
  ADD COLUMN IF NOT EXISTS payment_status  text NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS invoice_status  text NOT NULL DEFAULT 'NOT_ISSUED',
  ADD COLUMN IF NOT EXISTS invoice_number  text,
  ADD COLUMN IF NOT EXISTS invoice_ettn    text,
  ADD COLUMN IF NOT EXISTS invoice_pdf_url text,
  ADD COLUMN IF NOT EXISTS invoice_error   text;

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_invoice_type_check;
ALTER TABLE orders ADD CONSTRAINT orders_invoice_type_check
  CHECK (invoice_type IS NULL OR invoice_type IN ('bireysel', 'kurumsal'));

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status IN ('PENDING', 'PAID'));

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_invoice_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_invoice_status_check
  CHECK (invoice_status IN ('NOT_ISSUED', 'ISSUED', 'FAILED'));
