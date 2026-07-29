-- =====================================================================
-- TEST VERİLERİNİ TEMİZLEME — canlıya geçiş öncesi
--
-- Bu script iki bölümden oluşur. BÖLÜM A'yı çalıştırıp çıktıyı okuyun,
-- silinecekleri onayladıktan sonra BÖLÜM B'yi çalıştırın.
--
-- DİKKAT: orders, users ve consent_logs tablolarında kalıcı silme
-- koruması (trg_prevent_delete_*) vardır. Bu koruma kasıtlıdır:
-- sözleşme onayı ve ticari ileti onayı kayıtları ispat aracıdır ve
-- kazara silinmemeleri gerekir. BÖLÜM B korumayı geçici olarak kapatır
-- ve işlem sonunda MUTLAKA geri açar.
-- =====================================================================


-- =====================================================================
-- BÖLÜM A — ÖNCE BUNU ÇALIŞTIRIN, ÇIKTIYI OKUYUN
-- =====================================================================

-- A.1 — Neyi sileceğiz?
SELECT 'orders'        AS tablo, count(*) AS kayit FROM orders
UNION ALL SELECT 'users',        count(*) FROM users
UNION ALL SELECT 'consent_logs', count(*) FROM consent_logs
UNION ALL SELECT 'addresses',    count(*) FROM addresses
UNION ALL SELECT 'notifications',count(*) FROM notifications
ORDER BY tablo;

-- A.2 — KRİTİK: gerçekten fatura kesilmiş sipariş var mı?
--
-- Kesilmiş bir e-Arşiv faturası GİB kayıtlarında durur; buradan silmek
-- onu ortadan kaldırmaz, yalnızca BİZİM kaydımızı yok eder. Aşağıdaki
-- listede çıkan fatura numaralarını mali müşavirinize bildirin.
SELECT
  order_number,
  created_at::date          AS tarih,
  total_amount              AS tutar,
  invoice_status            AS fatura_durumu,
  invoice_number            AS fatura_no,
  invoice_issued_at::date   AS kesim_tarihi,
  invoice_cancelled_at::date AS iptal_tarihi
FROM orders
WHERE invoice_status IS NOT NULL
  AND invoice_status <> 'PENDING'
ORDER BY created_at;

-- A.3 — Tahsilatı gerçekleşmiş sipariş var mı?
--
-- PAID görünüp paytr_test_mode = false olan bir sipariş varsa GERÇEK para
-- hareketi olmuş olabilir; silmeden önce PayTR panelinden teyit edin.
SELECT
  order_number,
  created_at::date AS tarih,
  payment_method,
  payment_status,
  paytr_test_mode,
  paytr_total_amount
FROM orders
WHERE payment_status = 'PAID'
ORDER BY created_at;


-- =====================================================================
-- BÖLÜM B — SİLME (A'yı okuduktan sonra çalıştırın)
--
-- Tamamı tek işlem (transaction) içinde. Herhangi bir adım hata verirse
-- her şey geri alınır ve silme korumaları kapalı KALMAZ. Bu yüzden
-- BEGIN/COMMIT bloğunu bölerek çalıştırmayın, tek seferde çalıştırın.
-- =====================================================================

/* Güvenlik sınırı: aşağıdaki DELETE'ler yalnızca '2026-07-30 00:00:00+03'
   tarihinden ÖNCEKİ kayıtları siler. Bugün 29.07.2026 olduğu için tüm test
   verileri kapsama girer; bu script'i yarın veya sonra yeniden
   çalıştırırsanız gerçek siparişlere dokunmaz. Sınırı gevşetmeyin.

   Sınır geçici tabloya değil doğrudan her DELETE'e yazıldı: geçici tablo
   oturumda kalıcı olduğu için script'i ikinci kez çalıştırmak
   "already exists" hatası veriyordu. */

BEGIN;

-- Korumaları geçici olarak kapat
ALTER TABLE orders       DISABLE TRIGGER trg_prevent_delete_orders;
ALTER TABLE users        DISABLE TRIGGER trg_prevent_delete_users;
ALTER TABLE consent_logs DISABLE TRIGGER trg_prevent_delete_consent_logs;

/* Silme sırası FK kısıtlarına göre zorunludur:

   - orders.user_id -> users(id) kısıtlaması ON DELETE içermiyor (NO ACTION).
     Kullanıcıyı siparişinden önce silmeye kalkışmak hata verir.
   - consent_logs.user_id -> users(id) ON DELETE SET NULL, sıra serbest
     ama önce siliyoruz ki geride yetim kayıt kalmasın.
   - addresses.user_id -> users(id) ON DELETE CASCADE, users silinince
     kendiliğinden gider; yine de açıkça siliyoruz ki sayım doğrulanabilsin.
*/

DELETE FROM orders        WHERE created_at < '2026-07-30 00:00:00+03';
DELETE FROM consent_logs  WHERE created_at < '2026-07-30 00:00:00+03';
DELETE FROM addresses     WHERE created_at < '2026-07-30 00:00:00+03';
DELETE FROM users         WHERE created_at < '2026-07-30 00:00:00+03';

-- Test siparişlerinden doğan yönetici bildirimleri
DELETE FROM notifications WHERE created_at < '2026-07-30 00:00:00+03';

-- Korumaları GERİ AÇ — bu satırlar atlanmamalı
ALTER TABLE orders       ENABLE TRIGGER trg_prevent_delete_orders;
ALTER TABLE users        ENABLE TRIGGER trg_prevent_delete_users;
ALTER TABLE consent_logs ENABLE TRIGGER trg_prevent_delete_consent_logs;

COMMIT;


-- =====================================================================
-- BÖLÜM C — DOĞRULAMA (B'den sonra çalıştırın)
-- =====================================================================

-- C.1 — Tablolar boşaldı mı?
SELECT 'orders'        AS tablo, count(*) AS kalan FROM orders
UNION ALL SELECT 'users',        count(*) FROM users
UNION ALL SELECT 'consent_logs', count(*) FROM consent_logs
UNION ALL SELECT 'addresses',    count(*) FROM addresses
UNION ALL SELECT 'notifications',count(*) FROM notifications
ORDER BY tablo;

-- C.2 — EN ÖNEMLİ KONTROL: silme korumaları tekrar açık mı?
-- tgenabled sütunu 'O' (origin) olmalı. 'D' (disabled) görürseniz koruma
-- kapalı kalmış demektir; aşağıdaki ENABLE komutlarını elle çalıştırın.
SELECT
  c.relname   AS tablo,
  t.tgname    AS tetikleyici,
  t.tgenabled AS durum,
  CASE t.tgenabled WHEN 'O' THEN 'AÇIK — doğru' ELSE 'KAPALI — HEMEN AÇIN' END AS yorum
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
WHERE t.tgname LIKE 'trg_prevent_delete%'
ORDER BY c.relname;

-- Gerekirse elle açma komutları:
--   ALTER TABLE orders       ENABLE TRIGGER trg_prevent_delete_orders;
--   ALTER TABLE users        ENABLE TRIGGER trg_prevent_delete_users;
--   ALTER TABLE consent_logs ENABLE TRIGGER trg_prevent_delete_consent_logs;
