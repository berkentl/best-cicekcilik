-- =====================================================
-- Kalıcı silme (hard delete) koruması — orders / users
-- Supabase SQL Editor'e yapıştırıp çalıştırın.
-- =====================================================
--
-- ÖNEMLİ — neden sadece RLS yetmiyor:
-- Bu projede TÜM sunucu tarafı sorgular (admin panel, API route'lar)
-- SUPABASE_SERVICE_ROLE_KEY ile çalışıyor. Supabase'de service_role,
-- RLS politikalarını HER ZAMAN by-pass eder — Postgres'in kendi
-- tasarımı gereği (BYPASSRLS rolü). Yani "DELETE'i engelleyen bir RLS
-- politikası" yazsak bile, bu SADECE anon/authenticated rollerini
-- (tarayıcıdan anon key ile gelen istekleri) etkiler; kendi backend'imiz
-- veya Supabase SQL Editor'den atılan bir DELETE hâlâ çalışır.
--
-- Bu yüzden iki katmanlı bir çözüm uyguluyoruz:
--   1) RLS politikaları — anon/authenticated için INSERT/SELECT/UPDATE
--      serbest, DELETE için hiç politika yok (= tamamen kapalı).
--      (Şu an zaten bu tablolara anon key ile erişilmiyor, ama gelecekte
--      bir gün doğrudan client-side erişim eklenirse diye doğru kurulur.)
--   2) BEFORE DELETE TRIGGER — bu, service_role dahil HERKESİ (SQL
--      Editor'deki kazara bir tıklama dahil) engeller. Trigger'lar RLS
--      by-pass'ından etkilenmez, bu yüzden gerçek koruma burada.
--
-- Gerçekten silme ihtiyacı olursa (örn. KVKK "unutulma hakkı" talebi):
--   ALTER TABLE orders DISABLE TRIGGER trg_prevent_delete_orders;
--   DELETE FROM orders WHERE id = '...';
--   ALTER TABLE orders ENABLE TRIGGER trg_prevent_delete_orders;
-- =====================================================

-- ── 1) RLS politikaları (INSERT/SELECT/UPDATE serbest, DELETE yok) ──

DROP POLICY IF EXISTS "Service manage orders" ON orders;
DROP POLICY IF EXISTS "orders_select" ON orders;
DROP POLICY IF EXISTS "orders_insert" ON orders;
DROP POLICY IF EXISTS "orders_update" ON orders;
CREATE POLICY "orders_select" ON orders FOR SELECT USING (true);
CREATE POLICY "orders_insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update" ON orders FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service manage users" ON users;
DROP POLICY IF EXISTS "users_select" ON users;
DROP POLICY IF EXISTS "users_insert" ON users;
DROP POLICY IF EXISTS "users_update" ON users;
CREATE POLICY "users_select" ON users FOR SELECT USING (true);
CREATE POLICY "users_insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "users_update" ON users FOR UPDATE USING (true) WITH CHECK (true);

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
