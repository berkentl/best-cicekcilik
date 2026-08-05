# DNS kayıtları — dunyanincicegi.com

> Bu belge, alan adı taşınırken veya nameserver değişirken yeniden
> oluşturulması gereken kayıtların anlık görüntüsüdür.
> **Alındığı tarih:** 5 Ağustos 2026 — kaynak: 1.1.1.1 üzerinden canlı sorgu.
>
> Kayıtlar Vercel DNS'te tutuluyor. Alan adı Vercel üzerinden alındığı için
> ayrı bir registrar paneli yok; bölge yönetimi Vercel → Domains altında.

## Nameserver

```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

Bunlar değişirse aşağıdaki kayıtların **tamamı** yeni bölgede elle yeniden
oluşturulmalıdır.

## Site yönlendirmesi

| Ad | Tür | Değer |
|---|---|---|
| `@` (kök) | A | `64.29.17.1`, `216.198.79.65` |
| `www` | A | `64.29.17.1`, `216.198.79.65` |

Bu iki kaydı **elle oluşturmayın**. Alan adını Vercel'de bir projeye
eklediğinizde Vercel kendisi yazar. IP'ler Vercel'in altyapısına ait ve
zamanla değişebilir; buradaki değerler yalnızca teyit içindir.

## E-posta gönderimi (Resend) — KRİTİK

Sipariş e-postaları `siparis@dunyanincicegi.com` adresinden çıkıyor
(`src/lib/email.ts`). Bu üç kayıt olmadan Resend gönderimi reddeder.

Sipariş onay e-postası, Mesafeli Sözleşmeler Yönetmeliği uyarınca Ön
Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi nüshalarını taşıyor —
yani bu kayıtların çalışması **yasal bir yükümlülük**, kolaylık değil.

| Ad | Tür | Değer |
|---|---|---|
| `resend._domainkey` | TXT | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCpjvaO3cq5VTGuZCyFPkC6vKrGnPUIsI0ACRoVB7PaaefwHZQoWTrCl5oijYpcmX0X0dxklmUIANy/JoNj83imaa3v7pxdzcnqnFIDXBSQ5tgBluuuB8OtSp4UVPXh4AIxHgZ2BEpYLM7QGSdWe42tY+CSvifSLzmuLOgCsb110QIDAQAB` |
| `send` | TXT | `v=spf1 include:amazonses.com ~all` |
| `send` | MX | `feedback-smtp.eu-west-1.amazonses.com` — öncelik `10` |

DKIM anahtarı (`resend._domainkey`) **açık** anahtardır; gizli değildir,
zaten DNS üzerinden herkese açık yayınlanır. Bu yüzden burada durması
güvenlik sorunu değil.

Kaybolursa: Resend → Domains → `dunyanincicegi.com` → Verify DNS Records.
Resend **yeni** bir DKIM anahtarı üretir; eskisi geçersizdir. Yani kaybı
telafi edilebilir ama Resend paneline erişim gerekir.

**Taşıma sonrası doğrulama:** Resend → Domains ekranında alan adı
`Verified` (yeşil) olmalı. Sonra sitede gerçek bir sipariş oluşturup
onay e-postasının geldiğini görün. Bu kontrolü atlamayın — kayıt eksikse
sistem hata vermez, e-posta sessizce gitmez.

## Arama motoru doğrulaması

| Ad | Tür | Değer |
|---|---|---|
| `@` (kök) | TXT | `google-site-verification=xo04V1GN8LEDbMJVHL0Qck0ZV6UTrjeoHt2_qqevILM` |

Bu kayıt Google Search Console mülkiyetini kanıtlıyor. Silinirse Search
Console erişimi düşer; site aramada kaybolmaz ama sitemap gönderimi ve
tarama raporları kesilir. Yeniden doğrulamak için Search Console'dan yeni
bir doğrulama kaydı alınır.

## Tanımlı OLMAYAN kayıtlar

- **MX (kök)** — yok. Alan adına gelen e-posta **alınmıyor**; sistem
  yalnızca gönderim yapıyor. `siparis@dunyanincicegi.com` adresine
  müşteri yanıt yazarsa hiçbir yere düşmez. İletişim sayfasında yayınlanan
  adres bilinçli olarak Gmail hesabıdır.
- **DMARC (`_dmarc`)** — yok. Zorunlu değil ama e-posta teslim oranını
  artırır ve alan adı adına sahte gönderimi engeller. Eklenecekse
  gözlem modunda başlanmalı: `v=DMARC1; p=none; rua=mailto:…`
  Doğrudan `p=reject` ile başlamak, DKIM/SPF'te gözden kaçan bir sorun
  varsa sipariş e-postalarının tamamının reddedilmesine yol açar.
- **`_vercel` TXT** — yok. Alan adı ile proje aynı Vercel hesabında
  olduğu sürece gerekmiyor. Farklı hesaptaki bir projeye eklenmek
  istenirse Vercel bu kaydı ister.
