-- =====================================================================
-- KONTROL SORGULARI
--
-- Günlük işletim ve devir sonrası doğrulama için hazır sorgular.
-- Hiçbiri veri DEĞİŞTİRMEZ; tamamı okuma amaçlıdır.
--
-- Supabase SQL Editor'de kayıtlı sorgular KULLANICI hesabına bağlıdır,
-- projeye değil. Bu yüzden editörde kayıtlı olan sorgular hesap değişince
-- görünmez. Kalıcı kaynak bu dosyadır — kaybolmaz, depoyla birlikte gelir.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) GÜVENLİK: RLS durumu
--
-- Beklenen: her tabloda rls_acik = true VE politika = 0.
-- Politika sayısı 0 olması "anon anahtarıyla erişim tamamen kapalı"
-- demektir; sunucu service role kullandığı için uygulama etkilenmez.
--
-- "ACIK" veya "POLITIKA VAR" görürseniz o tablo internete açıktır.
-- ---------------------------------------------------------------------
SELECT
  c.relname                                                   AS tablo,
  c.relrowsecurity                                            AS rls_acik,
  (SELECT count(*) FROM pg_policies p
    WHERE p.schemaname = 'public' AND p.tablename = c.relname) AS politika,
  CASE
    WHEN NOT c.relrowsecurity THEN 'ACIK — anon anahtariyla erisilebilir'
    WHEN (SELECT count(*) FROM pg_policies p
           WHERE p.schemaname = 'public' AND p.tablename = c.relname) > 0
      THEN 'POLITIKA VAR — icerigini kontrol edin'
    ELSE 'kapali — dogru'
  END                                                          AS durum
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY c.relrowsecurity, c.relname;


-- ---------------------------------------------------------------------
-- 2) GÜVENLİK: politika varsa içeriği
--
-- `using_kosulu` veya `with_check` sütununda `true` görürseniz o tablo
-- koşulsuz açıktır. orders ve users için bu, müşteri adı, telefon,
-- adres, TC kimlik no ve şifre hash'inin okunabilmesi anlamına gelir.
-- ---------------------------------------------------------------------
SELECT tablename, policyname, cmd, qual AS using_kosulu, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;


-- ---------------------------------------------------------------------
-- 3) GÜVENLİK: kalıcı silme koruması
--
-- Beklenen: üç tetikleyici ve tgenabled = 'O' (açık).
-- 'D' görürseniz koruma kapalıdır; kazara silmeye açıksınız.
-- ---------------------------------------------------------------------
SELECT
  c.relname   AS tablo,
  t.tgname    AS tetikleyici,
  t.tgenabled AS durum,
  CASE t.tgenabled WHEN 'O' THEN 'ACIK — dogru' ELSE 'KAPALI — HEMEN ACIN' END AS yorum
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
WHERE t.tgname LIKE 'trg_prevent_delete%'
ORDER BY c.relname;

-- Gerekirse elle açma:
--   ALTER TABLE orders       ENABLE TRIGGER trg_prevent_delete_orders;
--   ALTER TABLE users        ENABLE TRIGGER trg_prevent_delete_users;
--   ALTER TABLE consent_logs ENABLE TRIGGER trg_prevent_delete_consent_logs;


-- ---------------------------------------------------------------------
-- 4) İŞLETİM: tablo satır sayıları
-- ---------------------------------------------------------------------
SELECT 'orders'         AS tablo, count(*) AS kayit FROM orders
UNION ALL SELECT 'users',         count(*) FROM users
UNION ALL SELECT 'addresses',     count(*) FROM addresses
UNION ALL SELECT 'consent_logs',  count(*) FROM consent_logs
UNION ALL SELECT 'notifications', count(*) FROM notifications
UNION ALL SELECT 'products',      count(*) FROM products
UNION ALL SELECT 'categories',    count(*) FROM categories
ORDER BY tablo;


-- ---------------------------------------------------------------------
-- 5) İŞLETİM: ödemesi alınmamış kart siparişleri
--
-- Bu siparişler yönetici panelinde "Ödeme Bekleyen" sekmesinde durur ve
-- ana listede GÖRÜNMEZ. Müşteri PayTR ekranında veya 3D Secure adımında
-- vazgeçmiştir. Hazırlanmamalıdır.
--
-- Mesafeli Satış Sözleşmesi m.6.2: ödemesi 1 saat içinde gelmeyen
-- siparişi iptal etme hakkı işletmededir.
-- ---------------------------------------------------------------------
SELECT
  order_number,
  customer_name,
  total_amount,
  created_at,
  round(extract(epoch FROM (now() - created_at)) / 60) AS gecen_dakika
FROM orders
WHERE payment_method = 'kart'
  AND payment_status <> 'PAID'
  AND status NOT IN ('İptal', 'İade')
ORDER BY created_at DESC;


-- ---------------------------------------------------------------------
-- 6) MUHASEBE: kesilmiş ve iptal edilmiş e-Arşiv faturaları
--
-- Kesilmiş fatura GİB kayıtlarında durur. Bu listedeki fatura numaraları
-- mali müşavire bildirilmelidir; buradan silmek GİB kaydını kaldırmaz.
-- ---------------------------------------------------------------------
SELECT
  order_number,
  created_at::date            AS siparis_tarihi,
  total_amount                AS tutar,
  invoice_status              AS fatura_durumu,
  invoice_number              AS fatura_no,
  invoice_issued_at::date     AS kesim_tarihi,
  invoice_cancelled_at::date  AS iptal_tarihi,
  invoice_cancel_reason       AS iptal_gerekcesi
FROM orders
WHERE invoice_status IS NOT NULL
  AND invoice_status NOT IN ('PENDING', 'NOT_ISSUED')
ORDER BY invoice_issued_at NULLS LAST;


-- ---------------------------------------------------------------------
-- 7) MUHASEBE: tahsilat mutabakatı
--
-- PayTR ödeme raporuyla karşılaştırmak için. paytr_test_mode = true olan
-- satırlarda GERÇEK PARA HAREKETİ YOKTUR; bunlara fatura kesilmemelidir.
--
-- paytr_total_amount ile total_amount farklıysa faturaya yazılacak tutar
-- kontrol edilmelidir.
-- ---------------------------------------------------------------------
SELECT
  order_number,
  paid_at,
  payment_method,
  payment_provider,
  paytr_payment_type,
  paytr_test_mode,
  total_amount        AS siparis_tutari,
  paytr_total_amount  AS tahsil_edilen,
  CASE
    WHEN paytr_total_amount IS NULL THEN NULL
    WHEN paytr_total_amount <> total_amount THEN 'FARK VAR — kontrol edin'
    ELSE 'uyumlu'
  END AS mutabakat
FROM orders
WHERE payment_status = 'PAID'
ORDER BY paid_at DESC NULLS LAST;


-- ---------------------------------------------------------------------
-- 8) KVKK: pazarlama izni olan müşteriler
--
-- Kampanya SMS'i veya e-postası göndermeden ÖNCE bu listeye bakılmalı.
-- Onayı olmayan kişiye ticari ileti göndermek 6563 sayılı Kanun ihlalidir.
--
-- iys_status 'beklemede' veya 'hata' olan kayıtlar İYS'ye yüklenmemiştir;
-- İYS'ye yüklenmemiş onaya dayanarak gönderim YAPILAMAZ.
-- ---------------------------------------------------------------------
SELECT
  email,
  consent_type,
  granted,
  iys_status,
  created_at
FROM consent_logs
WHERE consent_type IN ('pazarlama_eposta', 'pazarlama_sms')
ORDER BY email, consent_type, created_at DESC;


-- ---------------------------------------------------------------------
-- 9) İŞLETİM: stoğu tükenen ürünler
--
-- Bu ürünler sitede "Stok Yok" rozetiyle görünmeye devam eder ve stok
-- eklenince otomatik satışa döner (bilinçli tercih — bkz. ProductCard).
-- ---------------------------------------------------------------------
SELECT name, slug, stock, is_active, price, sale_price
FROM products
WHERE coalesce(stock, 0) = 0
ORDER BY name;
