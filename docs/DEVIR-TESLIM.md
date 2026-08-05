# Devir–Teslim Rehberi

Projenin geliştirici hesaplarından **DURU DAVET ORGANİZASYON VE ÇİÇEKÇİLİK
TİCARET LİMİTED ŞİRKETİ**'ne ait hesaplara devredilmesi.

> **Temel yaklaşım:** GitHub, Vercel ve Supabase'in üçünde de yerleşik devir
> mekanizması var. Hiçbir şeyi sıfırdan kurmuyoruz. Yeni proje açıp taşımak
> yerine mevcut projelerin sahipliğini devretmek; veriyi, anahtarları,
> güvenlik ayarlarını ve alan adını olduğu gibi korur ve kesinti yaşatmaz.

---

## 0. Sıra önemli

Bu sırayı bozmayın. Her adımın sonraki adım için gerekli bir çıktısı var.

1. İşletme adına hesapları aç (GitHub, Vercel, Supabase)
2. **Supabase** organizasyon sahipliğini devret
3. **GitHub** deposunu devret
4. **Vercel** projesini devret ve Git bağlantısını yenile
5. Üçüncü taraf hesapları (PayTR, Kolaysoft, NetGSM, Resend, Search Console)
6. Alan adı ve DNS
7. Sırları döndür (rotasyon)
8. Devir sonrası doğrulama

**Vercel'i en sona bırakmayın ama Supabase'den önce de yapmayın.** Vercel
devri sırasında Git bağlantısı kopar; deponun yeni sahibi belli olmadan
yeniden bağlanamaz.

---

## 1. Supabase — organizasyon sahipliğini devret

Supabase projeleri bir **organizasyon** altında durur. Projeyi yeni bir
hesaba taşımak yerine organizasyonun sahibini değiştiriyoruz.

**Neden yeni proje açmıyoruz:** yeni projede `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY` ve `SUPABASE_SERVICE_ROLE_KEY` değişir; veri
tabanını dışa aktarıp içe almak gerekir; ayrıca aşağıdakileri elle yeniden
kurmak gerekir ve birini atlamak sessiz bir güvenlik açığı bırakır:

- `orders` ve `users` üzerinde RLS açık + **politika sayısı 0**
- `consent_logs`, `notifications`, `push_subscriptions` üzerinde RLS açık
- `prevent_hard_delete()` fonksiyonu ve üç tetikleyici
  (`trg_prevent_delete_orders`, `trg_prevent_delete_users`,
  `trg_prevent_delete_consent_logs`)
- `payment_settings` satırı (IBAN, kart/havale anahtarları)
- `site_settings` satırları (duyurular, kargo ücreti, ücretsiz kargo eşiği)

Sahiplik devrinde bunların hiçbirine dokunulmaz.

### Adımlar

1. Geliştirici hesabından: **Organization Settings → Team → Invite member**
   → işletmenin e-postası, rol **Owner**
2. İşletme daveti kabul eder
3. Organizasyon adını şirket adıyla güncelleyin
   (*Settings → General → Organization name*)
4. Ücretli plan varsa **faturalandırmayı işletmenin kartına geçirin**
   (*Settings → Billing*). Bu adım atlanırsa ödeme geliştiricinin kartından
   çekilmeye devam eder.
5. Devir tamamlandığını teyit ettikten sonra geliştirici kendini
   organizasyondan çıkarır

### Doğrulama

Supabase SQL Editor'de çalıştırın — `orders` ve `users` satırlarında
`rls_acik = true` ve `politika = 0` görmelisiniz:

```sql
SELECT c.relname AS tablo, c.relrowsecurity AS rls_acik,
  (SELECT count(*) FROM pg_policies p
    WHERE p.schemaname='public' AND p.tablename=c.relname) AS politika
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND c.relkind='r'
ORDER BY c.relrowsecurity, c.relname;
```

Silme korumalarının açık olduğunu da teyit edin — `tgenabled` değeri `O`
olmalı:

```sql
SELECT c.relname AS tablo, t.tgname, t.tgenabled
FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid
WHERE t.tgname LIKE 'trg_prevent_delete%';
```

---

## 2. GitHub — depoyu devret

**Settings → General → Danger Zone → Transfer ownership**

Devir; commit geçmişini, dalları, etiketleri ve issue'ları korur ve eski
adresten yeni adrese yönlendirme kurar.

- Kaynak: `berkentl/best-cicekcilik`
- Hedef: işletmenin GitHub hesabı

**Yeni depo oluşturup kod göndermeyin.** Geçmiş kaybolur, Vercel bağlantısı
kopar ve bu belgedeki commit referansları anlamsız hâle gelir.

Devirden sonra geliştiricinin yerel kopyasında uzak adresi güncellemesi
gerekir:

```bash
git remote set-url origin https://github.com/<yeni-hesap>/best-cicekcilik.git
```

> `upstream` uzak adresi (`JCodesMore/ai-website-cloner-template`) şablon
> deposudur, **oraya asla push edilmemelidir**. Devirle ilgisi yoktur.

---

## 3. Vercel — projeyi ve alan adını devret

> **Önce ortam değişkeni değerlerini bir kenara yazın.** Vercel, "Sensitive"
> işaretli değişkenlerin değerini bir daha göstermez. Devirden sonra eksik
> çıkarsa geliştiricinin `.env.local` dosyası dışında kaynak kalmaz.

`dunyanincicegi.com` **Vercel üzerinden** satın alındığı için ayrı bir
registrar paneli yok. Alan adı, projeden bağımsız olarak Vercel hesabına
bağlıdır ve ayrıca taşınması gerekir.

Vercel'de alan adları hesap/ekip kapsamındadır: A hesabındaki bir alan adı,
B hesabındaki bir projeye atanamaz. Bu yüzden proje ile alan adının **aynı
bakım penceresinde** taşınması gerekir. Devir sırasında özel alan adı kısa
süre boşta kalabilir; site bu sürede `*.vercel.app` adresinden erişilebilir
olmaya devam eder.

**Yoğun olmayan bir saatte yapın.**

**Project Settings → Advanced → Transfer Project**

Hedef hesabın devri kabul etmesi gerekir. Vercel arayüzü bu seçeneği
sunmuyorsa (plan kısıtlaması olabilir) alternatif yol:

1. İşletmenin hesabında yeni proje oluştur, devredilmiş GitHub deposuna bağla
2. **Tüm ortam değişkenlerini** gir (bölüm 5)
3. Dağıtımın başarılı olduğunu doğrula
4. Alan adını eski projeden **kaldır**, yeni projeye **ekle**
5. Eski projeyi sil

### Alan adının taşınması

Geliştirici hesabında: **Vercel → (hesap seviyesi) Domains →
`dunyanincicegi.com` → Transfer / Move** → hedef işletmenin hesabı.

Vercel içi hesap taşıması bir registrar transferi değildir; ICANN'in 60 günlük
kilidi ve yetkilendirme kodu (auth code) süreci **uygulanmaz**, dakikalar
içinde tamamlanır.

Vercel bu seçeneği sunmuyorsa alternatif, alan adını normal bir registrar'a
dışa transfer etmektir — ancak bu 5–7 gün sürer, tescil tarihinden itibaren
60 gün geçmiş olmasını gerektirir ve bu süre boyunca DNS'i elle yönetmeniz
gerekir. **Öncelikle Vercel içi taşımayı deneyin.**

Taşıma sonrası işletmenin hesabında: **Project → Settings → Domains →
Add** ile `dunyanincicegi.com` ve `www.dunyanincicegi.com` projeye eklenir,
SSL sertifikasının verilmesi beklenir.

### Devirden sonra mutlaka

- **Git bağlantısını yenileyin.** Depo sahibi değiştiği için bağlantı kopar.
  *Settings → Git → Connect Git Repository*
- **Ortam değişkenlerinin taşındığını tek tek doğrulayın.** Vercel
  "Sensitive" işaretli değişkenlerin değerini göstermez; taşınmadıysa yeniden
  girmek gerekir. Eksik bir değişken sessiz arızaya yol açar — örneğin
  `PAYTR_TEST_MODE` kaybolursa sistem test moduna düşer ve **müşteriden para
  çekilmez**.
- **Alan adının bağlı olduğunu** ve SSL sertifikasının verildiğini doğrulayın

### Devir sonrası hızlı kontrol

`/admin/odeme-ayarlari` sayfasını açın. Kredi/Banka Kartı bölümündeki kutu
**yeşil** ve *"Canlı mod — kart ödemeleri gerçek olarak tahsil edilir"*
yazmalı. Amber görünüyorsa `PAYTR_TEST_MODE=0` eksiktir. Kırmızı görünüyorsa
PayTR anahtarları eksiktir.

---

## 4. Üçüncü taraf hesaplar

Bunlar zaten işletme adına açıldı; devredilecek bir şey yok ama
**erişimin işletmede olduğu** teyit edilmeli.

| Hizmet | Durum | Yapılacak |
|---|---|---|
| **PayTR** | Mağaza No 730636, unvan işletmede | Panel şifresini değiştirin — kurulumda gelen geçici şifre e-postada duruyor |
| **Kolaysoft** (e-Arşiv) | Hesap işletmeye ait | Şifreyi işletme değiştirsin |
| **NetGSM** | Abone 8503037584 | API alt kullanıcısının şifresi ortam değişkeninde; işletme bilsin |
| **Resend** (e-posta) | İşletme adına açık ✔ | Erişimin işletmede olduğunu teyit edin |
| **Google Search Console** | Doğrulanmış | İşletme e-postasını **Owner** olarak ekleyin |
| **Alan adı** | ⚠️ Geliştiricinin **Vercel** hesabından satın alınmış | Vercel içi hesap taşıması gerekir — bkz. bölüm 3 |

**Alan adı en kritik varlıktır.** `dunyanincicegi.com` Vercel üzerinden
alındığı için ayrı bir registrar paneli yok; devri Vercel içinden yapılır.
Geliştiricinin hesabında kalırsa site, e-posta ve marka tek bir kişiye
bağımlı kalır.

---

## 5. Ortam değişkenleri

Vercel'de **Production ve Preview** için tanımlı olmalı. Değerler bu belgede
**bilinçli olarak yazılmamıştır** — belge depoda durduğu için sır içermez.
Değerleri geliştiriciden ayrı ve güvenli bir kanalla alın (şifre yöneticisi),
WhatsApp veya e-posta ile düz metin göndermeyin.

| Değişken | Kaynak |
|---|---|
| `ADMIN_PASSWORD` | Yönetim paneli şifresi — devirde **değiştirilmeli** |
| `SESSION_SECRET` | Oturum imzalama anahtarı — devirde **değiştirilmeli** |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API *(gizli)* |
| `NEXT_PUBLIC_SITE_URL` | `https://dunyanincicegi.com` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Push bildirimi anahtar çifti |
| `VAPID_PRIVATE_KEY` | Push bildirimi anahtar çifti *(gizli)* |
| `RESEND_API_KEY` | Resend paneli *(gizli)* |
| `KOLAYSOFT_USERNAME` | Kolaysoft hesabı |
| `KOLAYSOFT_PASSWORD` | Kolaysoft hesabı *(gizli)* |
| `KOLAYSOFT_BASE_URL` | Kolaysoft REST adresi |
| `KOLAYSOFT_DOCUMENT_PREFIX` | `DCC` — fatura ön eki, **değiştirilmemeli** |
| `PAYTR_MERCHANT_ID` | `730636` |
| `PAYTR_MERCHANT_KEY` | PayTR paneli → Bilgi *(gizli)* |
| `PAYTR_MERCHANT_SALT` | PayTR paneli → Bilgi *(gizli)* |
| `PAYTR_TEST_MODE` | **`0`** — canlı mod. Silinirse sistem test moduna düşer |
| `NETGSM_USERCODE` | `8503037584` |
| `NETGSM_PASSWORD` | NetGSM API alt kullanıcı şifresi *(gizli)* |
| `NETGSM_HEADER` | Onaylanan Gönderici Adı ile **birebir aynı** olmalı |

`VERCEL_OIDC_TOKEN` yalnızca yerel geliştirmede Vercel CLI tarafından
üretilir; elle tanımlanmaz.

---

## 6. Sırları döndürün (devirden sonra)

Geliştirici bu değerleri biliyor. Devir tamamlandıktan sonra işletme
aşağıdakileri değiştirmelidir. Bu, taraflar arasında bir güven sorunu değil,
**sorumluluğun fiilen devredilmesidir**: KVKK bakımından veri sorumlusu
şirkettir ve müşteri kişisel verilerine erişimin şirkette olması gerekir.

| Sır | Nasıl | Etkisi |
|---|---|---|
| `ADMIN_PASSWORD` | Vercel'de değeri değiştir + redeploy | Yönetici yeniden giriş yapar |
| `SESSION_SECRET` | Yeni rastgele değer üret, Vercel'de güncelle + redeploy | Tüm müşteri ve yönetici oturumları düşer, yeniden giriş gerekir |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → anahtarı yenile, sonra Vercel'de güncelle | Yenilemeden önce Vercel'i güncellemezseniz **site veri tabanına erişemez** — ikisini birlikte yapın |
| PayTR panel şifresi | PayTR panelinden | — |
| Kolaysoft şifresi | Kolaysoft panelinden, sonra Vercel'de `KOLAYSOFT_PASSWORD` | — |
| NetGSM API şifresi | NetGSM → API İşlemleri → Yeni Şifre, sonra Vercel | — |

`SESSION_SECRET` ve service role key'i **aynı bakım penceresinde** yapın,
sonra bir dağıtım alın.

---

## 7. Devretmeden önce kontrol listesi

- [ ] `main`/`master` dalı güncel ve dağıtımı başarılı
- [ ] Test siparişleri veri tabanından temizlendi
- [ ] Test ürünleri katalogdan kaldırıldı
- [ ] `payment_settings` içindeki IBAN doğru
- [ ] PayTR canlı modda, gerçek kartla en az bir sipariş doğrulandı
- [ ] e-Arşiv fatura kesimi doğrulandı
- [ ] Yasal metinlerdeki iletişim bilgileri doğru
- [ ] Search Console'da site doğrulanmış ve sitemap gönderilmiş
- [ ] Bu belgedeki iki soru işareti (Resend, alan adı) yanıtlanmış

## 8. Devir sonrası doğrulama

- [ ] Site açılıyor, ürün sayfaları çalışıyor
- [ ] `/admin` girişi yeni şifreyle çalışıyor
- [ ] `/admin/odeme-ayarlari` kart kutusu **yeşil**
- [ ] Küçük tutarlı gerçek bir kart ödemesi → sipariş **Ödendi** oluyor,
      bildirim geliyor, müşteriye e-posta gidiyor *(sonra PayTR panelinden
      iade edin)*
- [ ] Sipariş "Teslim Edildi" → e-Arşiv fatura kesiliyor
- [ ] Vercel'de dağıtım GitHub'a push ile tetikleniyor

---

## Notlar

- Veri tabanı göçleri `scripts/` klasöründe. Yeni bir ortam kurulursa
  `setup-db.sql` → `migrate-*.sql` sırasıyla çalıştırılmalı;
  `migrate-delete-protection.sql` ve `migrate-rls-lockdown.sql` **atlanmamalı**.
- Yasal metinler `docs/legal/*.md` içinde. Değiştirildikten sonra
  `node scripts/sync-legal-content.mjs` çalıştırılmalı, aksi hâlde sitedeki
  metin güncellenmez.
- `AGENTS.md` proje kurallarını içerir; düzenlendikten sonra
  `bash scripts/sync-agent-rules.sh` çalıştırılmalı.
