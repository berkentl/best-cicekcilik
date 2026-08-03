-- =====================================================
-- Kalıcı silme (hard delete) koruması — orders / users
-- Supabase SQL Editor'e yapıştırıp çalıştırın.
-- =====================================================
--
-- ÖNEMLİ — neden sadece RLS yetmiyor:
-- Bu projede TÜM sunucu tarafı sorgular (admin panel, API route'lar)
-- SUPABASE_SERVICE_ROLE_KEY ile çalışıyor. Supabase'de service_role,
-- RLS politikalarını HER ZAMAN by-pass eder — Postgres'in kendi
-- tasarımı gereği. Yani "DELETE'i engelleyen bir RLS politikası" yazsak
-- bile, bu SADECE anon/authenticated rollerini etkiler; kendi
-- backend'imiz veya SQL Editor'den atılan bir DELETE hâlâ çalışır.
--
-- Gerçek koruma bu yüzden BEFORE DELETE TRIGGER'dır: trigger'lar RLS
-- by-pass'ından etkilenmez ve service_role dahil herkesi kapsar.
--
-- Gerçekten silme ihtiyacı olursa (örn. KVKK "unutulma hakkı" talebi):
--   ALTER TABLE orders DISABLE TRIGGER trg_prevent_delete_orders;
--   DELETE FROM orders WHERE id = '...';
--   ALTER TABLE orders ENABLE TRIGGER trg_prevent_delete_orders;
--
-- =====================================================
-- DÜZELTME NOTU (bu script bir kez hatalı çalıştı)
--
-- Bu script'in ilk sürümü, DELETE'i RLS ile kapatabilmek için diğer
-- işlemlere izin veren politikalar oluşturuyordu:
--
--   CREATE POLICY "orders_select" ON orders FOR SELECT USING (true);
--   CREATE POLICY "orders_update" ON orders FOR UPDATE USING (true) ...
--   (aynısı users için)
--
-- Bu akıl yürütme hatalıydı. RLS açık ve HİÇ POLİTİKA YOKKEN
-- anon/authenticated için zaten her işlem reddedilir — DELETE dahil.
-- Diğer işlemlere politika yazmaya gerek yoktu.
--
-- Sonucu ciddiydi: `USING (true)` politikaları, sitenin JavaScript
-- paketinde herkese açık olan anon key ile
--   - orders tablosunun tamamının OKUNMASINA (müşteri adı, telefon,
--     e-posta, açık adres, TC kimlik numarası, kart mesajı),
--   - users tablosunun tamamının OKUNMASINA (e-posta, telefon, şifre
--     hash'i),
--   - her iki tablonun GÜNCELLENMESİNE (bir siparişin payment_status
--     alanını PAID yapmak, bir üyenin şifre hash'ini değiştirmek)
-- izin veriyordu.
--
-- Ayrıca migrate-rls-lockdown.sql bu politikaları temizlemek için
-- yazılmıştı; bu script ondan SONRA çalıştırıldığında politikaları geri
-- getiriyordu. Artık hiç politika oluşturmuyor, yalnızca kaldırıyor.
-- =====================================================

-- ── 1) Tüm politikaları kaldır, RLS'i açık bırak ────────────────────
--
-- Politika oluşturmuyoruz. RLS açık + politika yok = anon/authenticated
-- için tam kapalı. Uygulama bu tablolara yalnızca service role ile
-- eriştiği (bkz. lib/supabase-server.ts) ve tarayıcı tarafındaki Supabase
-- istemcisi yalnızca Google OAuth için kullanıldığı (supabase.auth.*,
-- hiçbir yerde supabase.from(...) yok) için işleyişe etkisi yoktur.
--
-- İsimle değil döngüyle kaldırılıyor: eski sürümlerden kalmış, adını
-- bilmediğimiz bir politika da temizlensin.

DO $$
DECLARE
  pol RECORD;
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['orders', 'users']
  LOOP
    FOR pol IN
      SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = tbl
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, tbl);
    END LOOP;
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
  END LOOP;
END $$;

-- ── 2) BEFORE DELETE trigger — asıl koruma, herkesi kapsar ──────────

CREATE OR REPLACE FUNCTION prevent_hard_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION
    'Kalıcı silme (DELETE) % tablosunda kapatılmıştır. Gerçekten gerekiyorsa önce: ALTER TABLE % DISABLE TRIGGER trg_prevent_delete_%;',
    TG_TABLE_NAME, TG_TABLE_NAME, TG_TABLE_NAME;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_prevent_delete_orders ON orders;
CREATE TRIGGER trg_prevent_delete_orders
  BEFORE DELETE ON orders
  FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete();

DROP TRIGGER IF EXISTS trg_prevent_delete_users ON users;
CREATE TRIGGER trg_prevent_delete_users
  BEFORE DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete();

-- ── 3) Doğrulama ────────────────────────────────────────────────────
-- Her satırda rls_acik = true VE politika = 0 olmalı.

SELECT
  c.relname        AS tablo,
  c.relrowsecurity AS rls_acik,
  (SELECT count(*) FROM pg_policies p
    WHERE p.schemaname = 'public' AND p.tablename = c.relname) AS politika,
  CASE
    WHEN NOT c.relrowsecurity THEN 'ACIK — anon key ile erisilebilir'
    WHEN (SELECT count(*) FROM pg_policies p
           WHERE p.schemaname = 'public' AND p.tablename = c.relname) > 0
      THEN 'POLITIKA VAR — kontrol edilmeli'
    ELSE 'kapali — dogru'
  END              AS durum
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relname IN ('orders', 'users')
ORDER BY c.relname;
