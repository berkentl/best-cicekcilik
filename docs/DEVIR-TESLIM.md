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

### ⚠️ Önce: organizasyonda başka proje var mı?

**Supabase'de üyelik organizasyon seviyesindedir, proje seviyesinde değil.**
Proje ayarlarında bunu açıkça yazar: *"Organization-wide access — All N
organization members can access this project."*

Yani bir organizasyona üye eklediğinizde o kişi **o organizasyondaki tüm
projelere** erişir. Geliştiricinin organizasyonunda başka müşteri veya kendi
projeleri varsa, işletmeyi doğrudan Owner yapmak onlara da erişim verir.

Bu projede fiilen yaşandı: `berkentl's Org` içinde `Dunyanincicegi.com` ile
birlikte geliştiricinin kendi `Vice Yazılım` projesi de bulunuyordu.

**Çözüm: iki projeyi ayrı organizasyonlara bölün.** Hangi projenin
taşınacağını seçerken **canlı projeyi değil, diğerini taşıyın** — duraklatılmış
veya müşterisi olmayan bir projede taşıma sırasında sorun çıksa kimse
etkilenmez, oysa sipariş alan bir sistemin veri tabanını oynatmak gereksiz
risktir.

### Adımlar

1. **Organizasyonda tek proje kalana kadar diğerlerini taşıyın.**
   Geliştirici kendi hesabında yeni bir organizasyon açar, kendi projelerini
   *Project Settings → General → Transfer project* ile oraya taşır.
   Geriye yalnızca müşterinin projesi kalır.
2. Geliştirici hesabından: **Organization Settings → Team → Invite member**
   → işletmenin e-postası, rol **Owner**
3. İşletme daveti kabul eder
4. Organizasyon adını şirket adıyla güncelleyin
   (*Settings → General → Organization name*)
5. Ücretli plan varsa **faturalandırmayı işletmenin kartına geçirin**
   (*Settings → Billing*). Bu adım atlanırsa ödeme geliştiricinin kartından
   çekilmeye devam eder.
6. Devir tamamlandığını teyit ettikten sonra geliştirici kendini
   organizasyondan çıkarır

**Alternatif:** projeyi işletmenin kendi açtığı organizasyona taşımak da
mümkündür (işletme yeni organizasyon açar, geliştiriciyi geçici olarak Owner
davet eder, geliştirici *Transfer project* ile taşır, sonra ayrılır). Bu yol
canlı projeye dokunduğu için ikinci tercihtir.

### Taşıma sonrası

Proje kimliği (`Project ID`) taşımada **değişmemelidir** — bu kimlik
`NEXT_PUBLIC_SUPABASE_URL` içindeki alt alan adının aynısıdır, dolayısıyla
URL ve API anahtarları sabit kalır ve hiçbir ortam değişkeni güncellenmez.

Yine de *Project Settings → API* sayfasını açıp URL ile anon key'in aynı
olduğunu **teyit edin**. Değişmişse Vercel'deki üç Supabase değişkeni
güncellenmeli ve site kontrol edilmeden bırakılmamalıdır.

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

### Devirden sonra: depoyu private yapın

Depo `Public` ise **private'a çevirin**: *Settings → General → Danger Zone →
Change repository visibility → Private*.

Depoda sır yok (`.env*` .gitignore'da ve git geçmişinde hiç sır commit
edilmemiştir — doğrulandı). Ancak içerik bir saldırgan için keşif değeri
taşır: yönetici kimlik doğrulamasının tam mekaniği, çerez adı, hız sınırı
eşikleri, tüm API uç noktaları, RLS modeli ve yanlış yapılandırılırsa ne
olacağı, ayrıca bu belgedeki altyapı bilgileri.

Public olmasının bu proje için faydası yoktur: katkı alan bir açık kaynak
projesi değil, CI kullanılmıyor ve GitHub ücretsiz planda sınırsız private
depo veriyor. MIT lisansı türev çalışmanın kapatılmasına engel değildir.
Vercel private depolara sorunsuz bağlanır.

### Devrin sonunda: geliştiriciyi ortaklıktan çıkarın

GitHub, depoyu devreden kullanıcıyı **otomatik olarak ortak (collaborator)
olarak bırakır** — yani geliştirici devirden sonra da push yetkisine sahip
olur. Devir sürecinde bu faydalıdır (bir düzeltme gerekirse gönderilebilir),
fakat süreç bittiğinde kaldırılmalıdır:

*Settings → Collaborators* → geliştiriciyi çıkarın.

Bu, sırların döndürülmesiyle aynı mantıktır: erişim, işi bittiğinde
sürmemeli.

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

> **Bu devir 5 Ağustos 2026'da tamamlandı.** Aşağıdaki adımlar, yeniden bir
> devir gerekirse tekrar kullanılmak üzere, *fiilen işleyen* yolu anlatıyor.
> Vercel arayüzünün önerdiği yol iki noktada tıkandı; ikisi de aşağıda.

### Projenin devri — "Transfer Project" ÇALIŞMAZ (kişisel hesaplar arasında)

*Settings → General → en alt → Transfer* seçeneği var, ama hedef olarak
**yalnızca bir ekip (Team)** kabul ediyor; ekip de Pro plan gerektiriyor.
Kişisel (Hobby) hesaptan kişisel hesaba proje devri **mümkün değil.**

İşleyen yol — ayrıca daha güvenli, çünkü alan adına dokunmadan önce yeni
dağıtımın çalıştığını kanıtlıyor:

1. İşletmenin hesabında **Add New → Project → Import Git Repository**,
   devredilmiş depoyu seç
2. Build ayarlarının üçünü de **kapalı** bırak (`next build` zaten Vercel
   varsayılanı); Application Preset `Next.js`, Root Directory `./`
3. **Import .env** ile tüm değişkenleri gir (bölüm 5), Production + Preview
4. Deploy → **`*.vercel.app` adresinde doğrula**: ürün listesi, bir ürün
   sayfası, `/admin` girişi, `/admin/odeme-ayarlari` yeşil mi
   *Bu adreste kartla ödeme ve Google girişi denenmez* — ikisi de
   `NEXT_PUBLIC_SITE_URL` üzerinden gerçek alan adına döner
5. Alan adını taşı (aşağıda), yeni projeye bağla
6. Eski projeyi sil

### Alan adının taşınması — panel DEĞİL, CLI

Panelde *Domains → alan adı → ⋯* menüsündeki **"Transfer Out"** yanlış
düğmedir: o, alan adını Vercel'den *başka bir registrar'a* çıkarır, kartı
bir yıllık yenileme ücretiyle borçlandırır ve tescilden 60 gün geçmemişse
ICANN kilidi yüzünden zaten reddedilir.

Doğru işlem **"Move Domain"** ama panelin arama kutusu yalnızca **üye
olduğunuz** kapsamları buluyor; başka birinin kişisel hesabını bulamaz.
CLI bu kısıtı taşımıyor:

```bash
npx vercel whoami                    # kaynak hesapta olduğunuzu doğrulayın
npx vercel domains ls                # alan adını görün
npx vercel domains move <alan-adi> <hedef-slug>
```

Hedef slug, işletmenin panel adresindeki isimdir (`vercel.com/<slug>`).
CLI, hedefe **24 saat içinde kabul edilmesi gereken bir taşıma talebi**
gönderir. Üyelik gerekmez.

**DNS kayıtları alan adıyla birlikte taşınır** — ALIAS, TXT ve MX kayıtları
tarihleriyle korunur. Bu, boşta duran bir alan adıyla prova edilerek
doğrulandı; canlı alan adını taşımadan önce aynı provayı yapmak iyi bir
alışkanlıktır. Kayıtların dökümü: [DNS-KAYITLARI.md](DNS-KAYITLARI.md)

### Taşıma sonrası projeye bağlama

Alan adının **kaydı** işletmeye geçse de **eski projeye bağlılığı** geride
kalır (Vercel bunu kesinti olmasın diye bilinçli yapıyor — site taşıma
boyunca kesintisiz yayında kalır). Bu yüzden yeni projeye eklerken Vercel
sahiplik kanıtı ister:

1. Proje → **Settings → Domains → Add Existing** → `dunyanincicegi.com`
2. ☐ **"Redirect apex domains to www"** kutusunun işaretini **KALDIR**
   Bu kutu açık kalırsa apex → www yönlenir ve **PayTR ödeme dönüşü bozulur:**
   bildirim adresleri `NEXT_PUBLIC_SITE_URL`'den apex olarak üretiliyor,
   yönlendirmeye çarpan POST isteği takip edilmez, para çekilir ama sipariş
   "Ödeme Bekleyen"de kalır. Sitemap ve canonical etiketleri de apex.
3. ◉ **Connect to an environment → Production**
4. "Verification Required" çıkarsa istenen `_vercel` TXT kaydını hesap
   seviyesindeki **Domains → alan adı → DNS Records** altına ekle, sonra
   **Refresh**. Doğrulanınca Vercel alan adını eski projeden kendisi alır.
5. İkinci bir **Add Existing** ile `www.dunyanincicegi.com`:
   ☐ "Include apex and www variants" işaretini **KALDIR** (aksi hâlde
   "A domain cannot redirect to itself" hatası verir),
   ◉ **Redirect to Another Domain → 307 → `dunyanincicegi.com`**

Kanonik adres apex'tir; yönlendirme yönünü ters kurmayın.

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
| **Alan adı** | ✔ İşletmenin Vercel hesabına taşındı (5 Ağustos 2026) | Aşağıdaki yenileme uyarısını okuyun |

**Alan adı en kritik varlıktır.** `dunyanincicegi.com` Vercel üzerinden
alındığı için ayrı bir registrar paneli yok; yönetimi Vercel içinden yapılır.

### ⚠️ Otomatik yenileme KAPALI — elle yenilenmeli

Her iki alan adında **Auto Renewal kapalı** ve bu bilinçli bir tercih olarak
böyle bırakıldı. Vercel hesabına bir ödeme yöntemi tanımlanana ve otomatik
yenileme açılana kadar alan adları **kendiliğinden yenilenmez.**

| Alan adı | Son geçerlilik | Yenileme ücreti |
|---|---|---|
| `bestcicekcilik.com` | **7 Temmuz 2027** | ~$11,25 / yıl |
| `dunyanincicegi.com` | **16 Temmuz 2027** | ~$11,25 / yıl |

`dunyanincicegi.com` yenilenmezse site erişilemez hâle gelir, e-posta
gönderimi durur ve alan adı bir süre sonra serbest kalarak üçüncü kişiler
tarafından alınabilir. Bunun uyarısı yalnızca Vercel hesabının e-posta
adresine düşer.

**Yapılacak:** bu iki tarihi şirket takvimine, en az bir ay öncesinden
hatırlatmalı olarak işleyin. Ya da *Domains → alan adı → Auto Renewal → On*
ile işletmenin kartını tanımlayıp riski tamamen ortadan kaldırın.

### Kayıt sahibi bilgileri

*Domains → alan adı → Registrant Information* ICANN nezdinde **yasal alan adı
sahibini** belirler. Devirde bu bilgiler şirket bilgileriyle güncellendi
(5 Ağustos 2026). Bu alanların şirket adına kalmaya devam etmesi önemlidir:
alan adı Vercel hesabında görünse bile, kayıt sahibi başka bir kişiyse
hukuken o kişinin varlığı sayılır.
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
| Supabase anahtarları | Yeni anahtar sistemine geçin — aşağıdaki bölüme bakın | Doğru sırayla yapılırsa **kesinti olmaz** |
| PayTR panel şifresi | PayTR panelinden | — |
| Kolaysoft şifresi | Kolaysoft panelinden, sonra Vercel'de `KOLAYSOFT_PASSWORD` | — |
| NetGSM API şifresi | NetGSM → API İşlemleri → Yeni Şifre, sonra Vercel | — |

### Supabase anahtarlarının devredilmesi (kesintisiz)

Supabase iki nesil anahtar sunuyor:

- **Legacy (JWT):** `anon public` ve `service_role` — projede şu an **bunlar
  kullanılıyor** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
- **Yeni:** `sb_publishable_…` ve `sb_secret_…` — tek tek oluşturulup tek tek
  iptal edilebiliyor

Legacy anahtarlar **ikisi birlikte** yenilenir; JWT secret'ı döndürmek anon ve
service_role'ü aynı anda geçersiz kılar, bu da kaçınılmaz bir kesinti penceresi
yaratır. Yeni anahtarlara geçmek bu sorunu ortadan kaldırır.

**Sıra önemlidir — legacy'yi EN SON kapatın, böylece her adım geri
alınabilir kalır:**

1. *Project Settings → API Keys → Publishable and secret API keys*
   sekmesinde **`+ New secret key`** ile yeni bir gizli anahtar oluşturun.
   Publishable anahtar (`default`) hâlihazırda var.
2. Vercel'de iki değişkeni güncelleyin:
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → `sb_publishable_…`
   - `SUPABASE_SERVICE_ROLE_KEY` → yeni `sb_secret_…`
3. **Redeploy** alın.
4. **Doğrulayın** — bu adımı atlamayın:
   - Ürün sayfaları açılıyor mu *(anon/publishable anahtar çalışıyor)*
   - `/admin` sipariş listesi yükleniyor mu *(secret anahtar çalışıyor)*
   - **Google ile giriş çalışıyor mu** — tarayıcı istemcisi yalnızca
     `supabase.auth.*` için kullanılıyor ve publishable anahtarla test
     edilmemiştir; bozulursa 5. adıma geçmeden legacy anon anahtarını geri
     yazıp tekrar deneyin
5. Her şey çalışıyorsa *Legacy anon, service_role API keys* sekmesinde
   **"Disable JWT-based API keys"** düğmesine basın.

5. adım, geliştiricinin elindeki eski `service_role` JWT'sini **geçersiz
   kılar** — devir bu noktada fiilen tamamlanmış olur. Bu adım atılmadıkça
   eski anahtarı bilen herkes veri tabanını okumaya devam eder; panel
   üyeliğinden çıkmak bunu engellemez.

`ADMIN_PASSWORD` ve `SESSION_SECRET`'i de aynı bakım penceresinde değiştirip
tek bir dağıtım alın.

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
