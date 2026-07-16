-- =====================================================
-- Güvenlik: anon key ile herkese açık RLS politikalarını kapat
-- =====================================================
-- Supabase Security Advisor'ın işaretlediği "RLS Policy Always True"
-- uyarılarının hepsi `USING (true)` politikalarından geliyor — yani bu
-- tablolar anon key'e (sitenin JS kodunda herkese açık) sahip HERKES
-- tarafından doğrudan REST API üzerinden okunup/yazılıp/silinebiliyordu.
--
-- Kod tarafında incelendi: bu tabloların hiçbirine tarayıcıdan (anon key
-- ile) doğrudan erişilmiyor — tüm gerçek okuma/yazma işlemleri Next.js
-- sunucu tarafında SUPABASE_SERVICE_ROLE_KEY ile yapılıyor (RLS'i zaten
-- by-pass eder). Yani bu politikaları kapatmanın uygulamada SIFIR
-- fonksiyonel etkisi var — sadece gereksiz bir güvenlik açığını kapatıyor.
--
-- Supabase SQL Editor'e yapıştırıp çalıştırın.
-- =====================================================

-- Her tablo için mevcut TÜM politikaları dinamik olarak kaldırır
-- (isim bilmeden de çalışır — örn. payment_settings repo'da script'i
-- olmayan bir tablo olduğu için isim bilinmiyor).
DO $$
DECLARE
  pol RECORD;
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'users', 'addresses', 'site_settings', 'categories', 'products',
    'product_variants', 'coupons', 'orders', 'push_subscriptions',
    'payment_settings'
  ]
  LOOP
    FOR pol IN
      SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = tbl
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, tbl);
    END LOOP;
  END LOOP;
END $$;

-- RLS'in gerçekten açık olduğundan emin ol (politika olmadan = deny-all,
-- service role her zaman by-pass eder).
ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses         ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons           ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_settings  ENABLE ROW LEVEL SECURITY;

-- "Function Search Path Mutable" uyarısı — arama yolunu sabitleyerek
-- search_path hijack riskini kapatır (zararsız, davranışı değiştirmez).
ALTER FUNCTION public.update_updated_at() SET search_path = public, pg_temp;
