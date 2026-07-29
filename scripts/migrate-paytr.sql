-- PayTR kartla ödeme entegrasyonu için gereken alanlar.
-- Supabase SQL Editor'de bir kez çalıştırılır. Tekrar çalıştırılması güvenlidir.

/* ---------------------------------------------------------------------------
   1) orders — ödeme tahsilat kaydı

   Bu alanlar mutabakat için gereklidir: PayTR'nin ödeme raporuyla kendi
   kayıtlarımızı karşılaştırırken hangi siparişin ne zaman, hangi yöntemle ve
   ne kadar tahsil edildiğini bilmemiz gerekir. paytr_total_amount ayrıca
   tutulur çünkü PayTR'nin bildirdiği tahsilat ile siparişin tutarı ayrışırsa
   (bkz. payment_amount_mismatch bildirimi) faturaya hangi tutarın yazılacağı
   ancak iki değer birlikte görülerek çözülebilir.
--------------------------------------------------------------------------- */

ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at            timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_provider   text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paytr_payment_type text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paytr_test_mode    boolean;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paytr_total_amount numeric(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paytr_failed_reason text;

COMMENT ON COLUMN orders.paid_at IS
  'Ödemenin tahsil edildiği an. Kartta PayTR bildirimiyle, havalede işletmenin onayıyla yazılır.';
COMMENT ON COLUMN orders.paytr_test_mode IS
  'true ise bu tahsilat PayTR test modunda yapılmıştır; gerçek para hareketi yoktur ve fatura kesilmemelidir.';
COMMENT ON COLUMN orders.paytr_total_amount IS
  'PayTR bildiriminde gelen, fiilen tahsil edilen tutar (TL). orders.total_amount ile ayrışabilir.';

-- Mutabakat sorguları tarih aralığı + tahsil durumu üzerinden çalışıyor.
CREATE INDEX IF NOT EXISTS idx_orders_paid_at ON orders (paid_at DESC)
  WHERE paid_at IS NOT NULL;

/* ---------------------------------------------------------------------------
   2) payment_settings — kartla ödeme anahtarı

   Varsayılan olarak KAPALI. PayTR mağazası canlı moda geçmeden kart seçeneği
   müşteriye gösterilirse, ödeme adımına gelen müşteri test ortamına düşer ve
   siparişi tamamlayamaz. Anahtar panelden açılır; böylece canlı moda geçiş
   için kod dağıtımı gerekmez.
--------------------------------------------------------------------------- */

ALTER TABLE payment_settings
  ADD COLUMN IF NOT EXISTS kart_enabled boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN payment_settings.kart_enabled IS
  'Kredi/banka kartı ile ödeme müşteriye gösterilsin mi. PayTR canlı moda geçtikten sonra açılır.';

/* ---------------------------------------------------------------------------
   Kontrol
--------------------------------------------------------------------------- */

SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE (table_name = 'orders' AND column_name IN
        ('paid_at','payment_provider','paytr_payment_type','paytr_test_mode',
         'paytr_total_amount','paytr_failed_reason'))
   OR (table_name = 'payment_settings' AND column_name = 'kart_enabled')
ORDER BY table_name, column_name;
