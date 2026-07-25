-- =====================================================
-- Fatura iptal/iade alanları (Kolaysoft cancelDocument)
-- Supabase SQL Editor'e yapıştırıp çalıştırın.
--
-- Sipariş "İptal" veya "İade" durumuna alındığında, daha önce kesilmiş
-- e-Arşiv faturasının GİB nezdinde de iptal edilmesi gerekir. İptal
-- işleminin sonucu ve gerekçesi, mali denetimde ispat aracı olduğundan
-- ayrı alanlarda saklanır.
-- =====================================================

ALTER TABLE orders
  -- Faturanın kesildiği an. İptal talebi geldiğinde faturanın hangi vergi
  -- dönemine ait olduğunu belirlemek için gerekli: geçmiş aya ait bir
  -- faturanın iptali, o döneme ilişkin KDV beyannamesi verilmiş olabileceği
  -- için muhasebe tarafında geriye dönük düzeltme gerektirir.
  ADD COLUMN IF NOT EXISTS invoice_issued_at      timestamptz,
  ADD COLUMN IF NOT EXISTS invoice_cancelled_at   timestamptz,
  ADD COLUMN IF NOT EXISTS invoice_cancel_reason  text,
  ADD COLUMN IF NOT EXISTS invoice_cancel_error   text;

-- invoice_status'e iki yeni değer ekleniyor:
--   CANCELLED     : fatura Kolaysoft/GİB nezdinde başarıyla iptal edildi
--   CANCEL_FAILED : iptal denendi fakat başarısız oldu — manuel müdahale gerekir
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_invoice_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_invoice_status_check
  CHECK (invoice_status IN (
    'NOT_ISSUED',
    'ISSUED',
    'FAILED',
    'CANCELLED',
    'CANCEL_FAILED'
  ));

-- İptali başarısız olan faturaların hızlıca listelenebilmesi için —
-- bu kayıtlar mali açıdan takip edilmesi zorunlu istisnalardır.
CREATE INDEX IF NOT EXISTS idx_orders_invoice_cancel_failed
  ON orders (invoice_status)
  WHERE invoice_status = 'CANCEL_FAILED';
