-- =====================================================
-- Onay kayıtları (KVKK açık rıza + 6563 ticari elektronik ileti)
-- Supabase SQL Editor'e yapıştırıp çalıştırın.
--
-- İki ayrı hukuki rejim tek tabloda tutuluyor çünkü ispat gereksinimleri
-- ortak: kim, ne zaman, hangi kanaldan, hangi metin sürümüne onay verdi.
-- İYS'ye özgü alanlar yalnızca ticari ileti onaylarında dolar.
--
-- KRİTİK: metin sürümü (text_version) mutlaka kaydedilir. Metin
-- güncellendiğinde kullanıcının HANGİ sürüme onay verdiği ispat
-- edilemezse, güncelleme sonrası tüm eski onaylar tartışmaya açılır.
-- =====================================================

CREATE TABLE IF NOT EXISTS consent_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Üye ise bağlanır; misafir onaylarında NULL kalır.
  -- Üyelik silinse bile onay kaydı ispat amacıyla korunur (SET NULL).
  user_id       uuid REFERENCES users(id) ON DELETE SET NULL,

  -- Misafir onaylarında ve İYS eşleştirmesinde kimlik dayanağı
  email         text,
  phone         text,

  -- 'pazarlama_eposta' | 'pazarlama_sms' | 'profilleme'
  -- | 'cerez_analitik' | 'cerez_pazarlama' | 'yurtdisi_aktarim'
  consent_type  text NOT NULL,

  -- true = onay verildi, false = geri alındı / reddedildi
  granted       boolean NOT NULL,

  -- 'uyelik_formu' | 'odeme_adimi' | 'hesap_ayarlari' | 'cerez_bandi' | 'iys'
  channel       text NOT NULL,

  -- Onaylanan metnin sürümü (örn. '1.0')
  text_version  text NOT NULL,

  ip_address    text,
  user_agent    text,

  -- ── İYS alanları (yalnızca ticari ileti onaylarında kullanılır) ──
  -- Onay alınmış fakat İYS'ye yüklenmemiş kayıtlar, denetimde onaysız
  -- gönderim sayılır; bu nedenle yükleme durumu ayrı takip edilir.
  iys_status      text,          -- 'beklemede' | 'yuklendi' | 'hata'
  iys_uploaded_at timestamptz,
  iys_error       text,

  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE consent_logs DROP CONSTRAINT IF EXISTS consent_logs_type_check;
ALTER TABLE consent_logs ADD CONSTRAINT consent_logs_type_check
  CHECK (consent_type IN (
    'pazarlama_eposta',
    'pazarlama_sms',
    'profilleme',
    'cerez_analitik',
    'cerez_pazarlama',
    'yurtdisi_aktarim'
  ));

ALTER TABLE consent_logs DROP CONSTRAINT IF EXISTS consent_logs_channel_check;
ALTER TABLE consent_logs ADD CONSTRAINT consent_logs_channel_check
  CHECK (channel IN (
    'uyelik_formu',
    'odeme_adimi',
    'hesap_ayarlari',
    'cerez_bandi',
    'iys'
  ));

ALTER TABLE consent_logs DROP CONSTRAINT IF EXISTS consent_logs_iys_status_check;
ALTER TABLE consent_logs ADD CONSTRAINT consent_logs_iys_status_check
  CHECK (iys_status IS NULL OR iys_status IN ('beklemede', 'yuklendi', 'hata'));

-- Bir kişinin belirli bir onay türündeki son durumunu hızlı bulmak için
CREATE INDEX IF NOT EXISTS idx_consent_logs_user_type
  ON consent_logs (user_id, consent_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_consent_logs_email_type
  ON consent_logs (email, consent_type, created_at DESC);

-- İYS'ye yüklenmeyi bekleyen veya hata almış kayıtlar — gönderime
-- başlamadan önce bu listenin boşaltılması gerekir.
CREATE INDEX IF NOT EXISTS idx_consent_logs_iys_pending
  ON consent_logs (iys_status, created_at)
  WHERE iys_status IN ('beklemede', 'hata');

-- Onay kayıtları ispat aracıdır; kalıcı silme kapatılıyor.
-- (prevent_hard_delete fonksiyonu migrate-delete-protection.sql ile kurulur)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'prevent_hard_delete') THEN
    DROP TRIGGER IF EXISTS trg_prevent_delete_consent_logs ON consent_logs;
    CREATE TRIGGER trg_prevent_delete_consent_logs
      BEFORE DELETE ON consent_logs
      FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete();
  END IF;
END $$;

-- =====================================================
-- Sözleşme onayı — siparişe bağlı olduğu için orders üzerinde tutulur.
-- Mesafeli Sözleşmeler Yönetmeliği uyarınca tüketicinin Ön Bilgilendirme
-- Formu'nu ve Mesafeli Satış Sözleşmesi'ni onayladığının ispatı satıcıya
-- aittir; onay anı, IP ve onaylanan metin sürümleri saklanır.
-- =====================================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS terms_ip          text,
  ADD COLUMN IF NOT EXISTS terms_versions    jsonb;
