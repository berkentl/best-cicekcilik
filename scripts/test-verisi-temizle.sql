-- =====================================================================
-- TEST VERİSİ TEMİZLİĞİ
--
-- Devir öncesi, deneme amaçlı oluşturulmuş sipariş ve müşteri kayıtlarını
-- siler. Supabase SQL Editor'de çalıştırılır.
--
-- ⚠️ BU DOSYA GENEL KULLANIM İÇİN DEĞİLDİR.
-- Gerçek müşteri verisi oluştuktan sonra ÇALIŞTIRILMAMALIDIR. Özellikle:
--
--   * `consent_logs` KVKK ve 6563 sayılı Kanun bakımından ONAY KANITIDIR.
--     Bir müşterinin pazarlama onayı verdiğinin tek ispatı bu kayıttır;
--     silinirse denetimde onayın varlığı gösterilemez.
--   * Faturası kesilmiş bir siparişi silmek GİB kaydını KALDIRMAZ. Fatura
--     GİB'de durmaya devam eder, sipariş kaydı ise kaybolur; muhasebe
--     mutabakatı imkânsız hâle gelir. Silmeden önce mutlaka kontrol edin:
--
--       SELECT order_number, invoice_number, invoice_status
--       FROM orders WHERE invoice_number IS NOT NULL;
--
--     Bu sorgu satır döndürüyorsa DURUN.
--
-- 5 Ağustos 2026'da çalıştırıldığında silinenler: 1 test siparişi
-- (ORDMSGL682LXAAYV, faturasız), 1 kullanıcı (Google giriş testinde
-- oluşan hesap), 4 çerez onayı, 2 bildirim. Gerçek veri yoktu.
-- =====================================================================


-- ---------------------------------------------------------------------
-- ÖN KONTROL — önce bunu çalıştırın, çıktıyı okuyun
--
-- `faturali_siparis` 0 DEĞİLSE silme işlemine geçmeyin.
-- ---------------------------------------------------------------------
SELECT
  (SELECT count(*) FROM orders)                                    AS siparis,
  (SELECT count(*) FROM orders WHERE invoice_number IS NOT NULL)   AS faturali_siparis,
  (SELECT count(*) FROM users)                                     AS kullanici,
  (SELECT count(*) FROM addresses)                                 AS adres,
  (SELECT count(*) FROM consent_logs)                              AS onay_kaydi,
  (SELECT count(*) FROM notifications)                             AS bildirim;


-- ---------------------------------------------------------------------
-- SİLME
--
-- Tek işlem içinde: `prevent_hard_delete` tetikleyicileri kapatılıyor,
-- silme yapılıyor, tetikleyiciler geri açılıyor.
--
-- Tek işlem olması KRİTİK: adımlar ayrı ayrı çalıştırılırsa, aradaki bir
-- hata tetikleyicileri KAPALI bırakır ve kalıcı silme koruması sessizce
-- devre dışı kalır. BEGIN/COMMIT bunu imkânsız kılar — hata hâlinde
-- tetikleyiciler de silme de geri alınır.
--
-- Silme sırası yabancı anahtarlara göre: bağımlı kayıtlar önce.
-- ---------------------------------------------------------------------
BEGIN;

ALTER TABLE orders       DISABLE TRIGGER trg_prevent_delete_orders;
ALTER TABLE users        DISABLE TRIGGER trg_prevent_delete_users;
ALTER TABLE consent_logs DISABLE TRIGGER trg_prevent_delete_consent_logs;

DELETE FROM notifications;
DELETE FROM consent_logs;
DELETE FROM addresses;
DELETE FROM orders;
DELETE FROM users;

ALTER TABLE orders       ENABLE TRIGGER trg_prevent_delete_orders;
ALTER TABLE users        ENABLE TRIGGER trg_prevent_delete_users;
ALTER TABLE consent_logs ENABLE TRIGGER trg_prevent_delete_consent_logs;

COMMIT;


-- ---------------------------------------------------------------------
-- SON KONTROL — beş sayı da 0, üç tetikleyici de 'O' (açık) olmalı
--
-- Tetikleyici 'D' görünüyorsa koruma kapalı kalmış demektir; bu durumda
-- scripts/kontrol-sorgulari.sql (3. sorgu) altındaki ENABLE komutlarını
-- çalıştırın.
-- ---------------------------------------------------------------------
SELECT
  (SELECT count(*) FROM orders)        AS siparis,
  (SELECT count(*) FROM users)         AS kullanici,
  (SELECT count(*) FROM addresses)     AS adres,
  (SELECT count(*) FROM consent_logs)  AS onay_kaydi,
  (SELECT count(*) FROM notifications) AS bildirim;

SELECT c.relname AS tablo, t.tgname AS tetikleyici, t.tgenabled AS durum,
       CASE t.tgenabled WHEN 'O' THEN 'ACIK — dogru' ELSE 'KAPALI — HEMEN ACIN' END AS yorum
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
WHERE t.tgname LIKE 'trg_prevent_delete%'
ORDER BY c.relname;
