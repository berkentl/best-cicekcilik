-- =====================================================
-- Müşteri Üyelik Sistemi (Auth) — users / addresses
-- Supabase SQL Editor'e yapıştırıp çalıştırın.
-- update_updated_at() fonksiyonu setup-db.sql'de tanımlıdır,
-- burada yeniden oluşturuluyor (idempotent — zaten varsa sorun olmaz).
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── users ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email               text UNIQUE NOT NULL,
  password_hash       text NOT NULL,
  name                text NOT NULL DEFAULT '',
  phone               text DEFAULT '',
  kvkk_consent        boolean DEFAULT false,
  marketing_consent   boolean DEFAULT false,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service manage users" ON users;
CREATE POLICY "Service manage users"
  ON users FOR ALL USING (true) WITH CHECK (true);

-- ── addresses ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS addresses (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title            text NOT NULL DEFAULT 'Adresim',
  recipient_name   text NOT NULL DEFAULT '',
  recipient_phone  text NOT NULL DEFAULT '',
  city             text NOT NULL DEFAULT '',
  district         text NOT NULL DEFAULT '',
  full_address     text NOT NULL DEFAULT '',
  is_default       boolean DEFAULT false,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses (user_id);

DROP TRIGGER IF EXISTS addresses_updated_at ON addresses;
CREATE TRIGGER addresses_updated_at
  BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service manage addresses" ON addresses;
CREATE POLICY "Service manage addresses"
  ON addresses FOR ALL USING (true) WITH CHECK (true);

-- ── orders: hesaba bağlama ───────────────────────────
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES users(id);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);
