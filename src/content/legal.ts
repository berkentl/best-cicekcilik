// BU DOSYA OTOMATİK ÜRETİLMİŞTİR — ELLE DÜZENLEMEYİN.
//
// Kaynak: docs/legal/*.md
// Yeniden üretmek için: node scripts/sync-legal-content.mjs
//
// Yasal metinlerin tek kaynağı docs/legal/ altındaki markdown dosyalarıdır.
// Bir metni güncellemek için ilgili .md dosyasını düzenleyip betiği yeniden
// çalıştırın. Metin içeriği değiştiğinde "Sürüm" satırını da yükseltin —
// onay kayıtları (consent_logs.text_version) bu sürüme atıf yapar.

export interface LegalDocument {
  /** URL yolu — src/app altındaki route klasörüyle aynı */
  slug: string;
  title: string;
  description: string;
  /** Sayfa altında gösterilen son güncelleme tarihi */
  updatedAt: string | null;
  /** Onay kayıtlarında saklanan metin sürümü */
  version: string;
  /** Markdown içerik */
  content: string;
}

export const mesafeliSatisSozlesmesi: LegalDocument = {
  slug: "mesafeli-satis-sozlesmesi",
  title: "Mesafeli Satış Sözleşmesi",
  description: "Dünyanın Çiçeği üzerinden verilen siparişlere ilişkin mesafeli satış sözleşmesi.",
  updatedAt: "25.07.2026",
  version: "1.0",
  content: `# MESAFELİ SATIŞ SÖZLEŞMESİ

---

## MADDE 1 — TARAFLAR

**1.1. SATICI**

| | |
|---|---|
| Ticaret Unvanı | DURU DAVET ORGANİZASYON VE ÇİÇEKÇİLİK TİCARET LİMİTED ŞİRKETİ |
| Adres | 19 Mayıs Mah. Aytekin Kotil Cad. Yıldırım Apt. No: 18H Şişli / İstanbul |
| MERSİS Numarası | 0319035740400001 |
| Ticaret Sicil Numarası | 149213-5 (İstanbul Ticaret Sicili Müdürlüğü) |
| Vergi Kimlik Numarası | 3190357404 (Mecidiyeköy Vergi Dairesi Müdürlüğü) |
| ETBİS Site Kayıt Numarası | 1197646530 |
| Telefon | 0532 295 93 09 |
| E-posta | durucicekorganizasyon@gmail.com |
| KEP Adresi | duru.davet@hs01.kep.tr |
| İnternet Sitesi | https://dunyanincicegi.com |
| Temsile Yetkili | Deniz Akın (Müdür — münferiden temsile yetkilidir) |

İşbu sözleşmede kısaca **"SATICI"** olarak anılacaktır.

**1.2. ALICI**

Ad-soyadı, teslimat ve fatura adresi, telefon numarası ile e-posta adresi, sipariş formunda ALICI tarafından bildirilen ve sipariş özetinde yer alan bilgilerden ibarettir. İşbu sözleşmede kısaca **"ALICI"** olarak anılacaktır.

**1.3.** ALICI, işbu sözleşmeyi kabul etmekle, sipariş konusu bedeli ödeme yükümlülüğü altına girdiğini ve siparişe ilişkin ön bilgilendirmenin sözleşmenin kurulmasından önce kendisine yapıldığını kabul, beyan ve taahhüt eder.

---

## MADDE 2 — TANIMLAR

İşbu sözleşmenin uygulanmasında ve yorumlanmasında aşağıdaki tanımlar esas alınır:

**Kanun:** 6502 sayılı Tüketicinin Korunması Hakkında Kanun.

**Yönetmelik:** Mesafeli Sözleşmeler Yönetmeliği (RG: 27.11.2014 / 29188).

**Site:** SATICI'ya ait https://dunyanincicegi.com adresli internet sitesi.

**Ürün:** Site üzerinden satışa sunulan kesme çiçek, aranjman, buket, çelenk, saksı bitkisi, teraryum, çikolata ve benzeri mallar.

**Bozulabilir Ürün:** Kesme çiçek, canlı bitki, aranjman, buket, çelenk ile son kullanma tarihi bulunan gıda ürünleri dâhil olmak üzere; niteliği itibarıyla çabuk bozulabilen veya son kullanma tarihi geçebilecek ürünler.

**Özel Üretim Ürün:** ALICI'nın istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan, kişiye özel tasarım veya baskı içeren ürünler.

**Gönderilen:** ALICI'nın siparişinde alıcı olarak gösterdiği ve ürünün teslim edileceği üçüncü kişi.

**Görsel Onay:** Hazırlanan ürünün fotoğrafının ALICI'ya SMS ile iletilerek onayına sunulduğu süreç.

---

## MADDE 3 — SÖZLEŞMENİN KONUSU VE KAPSAMI

**3.1.** İşbu sözleşmenin konusu; ALICI'nın Site üzerinden elektronik ortamda siparişini verdiği, nitelikleri ve satış bedeli işbu sözleşmenin 4. maddesinde belirtilen ürünün satışı ve teslimi ile ilgili olarak tarafların hak ve yükümlülüklerinin belirlenmesidir.

**3.2.** İşbu sözleşme, Kanun ve Yönetmelik hükümlerine tabidir. Tarafların Kanun ve Yönetmelikten doğan hak ve yükümlülükleri saklıdır.

**3.3.** ALICI, satışa konu ürünün temel nitelikleri, vergiler dâhil satış fiyatı, ödeme ve teslimata ilişkin tüm ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli teyidi verdiğini kabul eder.

**3.4.** İşbu sözleşme hükümleri, ALICI'nın tüketici sıfatını haiz olduğu satışlarda uygulanır. ALICI'nın ticari veya mesleki amaçlarla hareket ettiği hâllerde Kanun'un tüketici lehine öngördüğü hükümler uygulanmaz; bu hâlde 6098 sayılı Türk Borçlar Kanunu ve 6102 sayılı Türk Ticaret Kanunu hükümleri geçerlidir.

---

## MADDE 4 — ÜRÜNÜN TEMEL NİTELİKLERİ VE SATIŞ BEDELİ

**4.1.** Ürünün türü, cinsi, miktarı, marka/modeli, rengi ve adedi ile satış bedeline ilişkin tüm bilgiler Site'de yer alan ürün tanıtım sayfasında ve ALICI'ya iletilen sipariş özetinde belirtilmiştir.

**4.2.** Site'de ilan edilen fiyatlar satış fiyatı olup, kampanya ve indirimler ilan edildiği süre boyunca geçerlidir. Süreye bağlı olarak ilan edilen fiyatlar, sürenin sona ermesiyle Site'den kaldırılır.

**4.3.** Sipariş konusu ürünün tüm vergiler dâhil satış bedeli, teslimat ücreti ve varsa uygulanan indirim tutarı ile ALICI'nın ödemekle yükümlü olduğu toplam bedel, sipariş onayından önce sipariş özetinde ayrı ayrı gösterilir.

**4.4.** Teslimat ücreti, hizmet verilen bölgenin tamamında sabit tutar olarak uygulanır ve sipariş onayından önce sipariş özetinde açıkça gösterilir. SATICI, teslimat ücretinin tutarını belirlemekte ve değiştirmekte serbest olup, belirlediği tutarın üzerindeki siparişlerde teslimat ücreti almama hakkını saklı tutar. Belirli ürünler bakımından ürüne özel teslimat ücreti uygulanabilir.

**4.5.** SATICI, teslimat ücretini ileride mesafeye veya bölgeye göre farklılaştırma hakkını saklı tutar. Bu hâlde de ALICI'ya uygulanacak teslimat ücreti, sipariş onayından önce sipariş özetinde açıkça gösterilir; ALICI'nın onaylamadığı hiçbir tutar kendisine yansıtılamaz.

**4.6.** Teslimat ücretine ilişkin değişiklikler, yayımlandıkları tarihte yürürlüğe girer ve daha önce kurulmuş sözleşmelere uygulanmaz.

**4.7.** Ürün görsellerinde kullanılan fotoğraflar tanıtım amaçlıdır. Çiçek ve canlı bitkilerin doğal yapısı gereği renk tonu, açılım durumu ve boyut bakımından teslim edilen ürün ile görsel arasında makul farklılıklar bulunabilir. Bu farklılıklar ayıp teşkil etmez.

---

## MADDE 5 — GENEL HÜKÜMLER

**5.1.** ALICI, 18 yaşını doldurmuş olduğunu ve fiil ehliyetini haiz bulunduğunu beyan eder.

**5.2.** ALICI, sipariş formunda bildirdiği tüm bilgilerin doğru, eksiksiz ve güncel olduğunu kabul eder. Bildirilen bilgilerin yanlış veya eksik olmasından doğan zararlardan ALICI sorumludur.

**5.3.** ALICI, Gönderilen'e ait ad-soyadı, telefon numarası ve adres bilgilerini SATICI'ya aktarmaya yetkili olduğunu ve söz konusu kişisel verilerin teslimat amacıyla işlenmesi hususunda Gönderilen'i bilgilendirdiğini beyan eder. SATICI, Gönderilen'e teslimat bildirimi ile birlikte aydınlatma metnine erişim bağlantısı iletir.

**5.4.** ALICI'nın siparişini vermesi ve işbu sözleşmeyi onaylaması ile sözleşme kurulmuş sayılır. SATICI, siparişin kurulduğunu ALICI'ya elektronik posta yoluyla bildirir.

**5.5.** SATICI, sipariş konusu ürünün stokta bulunmaması veya tedarik edilememesi hâlinde bu durumu ALICI'ya derhâl bildirir. Bu hâlde ALICI, siparişin iptal edilmesini veya eş değer bir ürünle değiştirilmesini talep edebilir. Siparişin iptali hâlinde tahsil edilen bedel, iptal tarihinden itibaren en geç on dört gün içinde ALICI'ya iade edilir.

**5.6.** ALICI'nın SATICI'ya iletebileceği her türlü talep, şikâyet ve bildirim, 1. maddede belirtilen telefon numarası veya e-posta adresi üzerinden yapılır. SATICI, kendisine ulaşan talep ve şikâyetleri **en geç 3 (üç) iş günü** içinde yanıtlar.

---

## MADDE 6 — ÖDEME KOŞULLARI

**6.1.** ALICI, sipariş bedelini Site'de sunulan ödeme yöntemlerinden birini seçerek ödeyebilir.

**6.2. Banka Havalesi / EFT:** Bu yöntemin seçilmesi hâlinde ALICI, sipariş bedelini Site'de bildirilen banka hesaplarından birine, siparişin oluşturulduğu andan itibaren **1 (bir) saat** içinde aktarmakla yükümlüdür. Bu süre içinde ödemenin SATICI hesabına geçmemesi hâlinde SATICI, siparişi tek taraflı olarak iptal etme hakkını haizdir. Havale/EFT ile yapılan ödemelerde taksit imkânı bulunmamaktadır.

**6.3. Kredi Kartı ile Ödeme:** Kredi kartı ile ödeme, SATICI'nın anlaşmalı olduğu ödeme kuruluşunun altyapısı üzerinden gerçekleştirilir. Kart bilgileri hiçbir surette SATICI tarafından görüntülenmez, kaydedilmez veya saklanmaz. Ödeme kuruluşunun taksit imkânı sunması hâlinde uygulanabilir taksit seçenekleri ve varsa vade farkı, ödeme adımında ALICI'ya açıkça gösterilir. Vade farkı doğuran taksitli ödemelerde toplam bedel ile vade farkı tutarı sipariş özetinde ayrıca belirtilir.

**6.4.** Ödemenin ALICI'nın kusuru veya bankasından kaynaklanan bir nedenle gerçekleşmemesi hâlinde SATICI'nın teslim yükümlülüğü doğmaz.

**6.5.** Kredi kartı ile yapılan ödemelerde bedelin iadesi, ilgili tutarın SATICI tarafından bankaya iadesinden sonra ALICI'nın kart hesabına yansıtılması bankanın işlem süresine bağlıdır. SATICI, bedeli bankaya iade ettikten sonra ALICI'nın hesabına yansıma süresinden sorumlu tutulamaz.

**6.6.** Sipariş konusu ürünün faturası, mevzuat gereği e-Arşiv Fatura olarak düzenlenir ve ALICI'nın bildirdiği e-posta adresine elektronik ortamda iletilir. ALICI, geçerli bir e-posta adresi bildirmekle yükümlüdür.

---

## MADDE 7 — TESLİMAT

**7.1.** Teslimat, ALICI'nın sipariş formunda belirttiği adrese, seçtiği teslimat tarihi ve saat aralığında yapılır. Site üzerinden seçilebilen teslimat saat aralıkları **09:00–12:00** ve **12:00–17:00** olarak belirlenmiştir.

**7.2.** SATICI, hâlihazırda yalnızca **İstanbul ili** sınırları içinde ve Site'de aktif olarak listelenen ilçelere teslimat yapmaktadır. Bu kapsam dışındaki adreslere teslimat taahhüdünde bulunulmaz.

**7.3. Aynı gün teslimat:** Saat **12:00'a kadar** verilen ve bedeli tahsil edilen siparişler için aynı gün teslimat taahhüt edilir. Saat 12:00'dan sonra verilen siparişlerde SATICI, teslimat adresinin konumu, trafik yoğunluğu ve günlük operasyon kapasitesi gibi nedenlerle aynı gün teslimat garantisi vermez. SATICI, resmî tatil ve dinî bayram günleri ile yılbaşı, Sevgililer Günü, Anneler Günü gibi yoğun talep dönemlerinde teslimat saat aralıklarında ve aynı gün teslimat taahhüdünde değişiklik yapma hakkını haizdir; bu hâlde ALICI siparişten önce bilgilendirilir.

**7.4.** Teslimat, SATICI'nın kendi araç ve personeli ile yapılır. SATICI, günlük iş yoğunluğuna bağlı olarak teslimatı anlaşmalı bir kurye veya kargo firması aracılığıyla gerçekleştirme hakkını saklı tutar. Bu hâlde ALICI'nın ve Gönderilen'in teslimat için zorunlu kişisel verileri, yalnızca teslimatın ifası amacıyla ilgili firmaya aktarılır.

**7.5.** Teslimat süresi, Kanun'un 48. maddesi uyarınca hiçbir hâlde siparişin kurulmasından itibaren **30 (otuz) günü** aşamaz. Bu süre içinde teslimin gerçekleşmemesi hâlinde ALICI sözleşmeyi feshedebilir; fesih hâlinde ödenen tüm bedel, fesih bildiriminin SATICI'ya ulaştığı tarihten itibaren **14 (on dört) gün** içinde ALICI'ya iade edilir.

**7.6.** Ürünün Gönderilen'e teslim edilmesi, ALICI'ya teslim hükmündedir.

**7.7.** Teslim anında ürünün ilgili kişiye ulaştırıldığı; teslim alan kişinin adı, teslim tarihi ve saati kaydedilerek belgelenir. SATICI, ispat amacıyla teslim fotoğrafı alma ve teslim bildirimini ALICI'ya SMS ile iletme hakkını haizdir.

**7.8.** Gönderilen'in adreste bulunduğu hâlde teslimi kabul etmesine rağmen ürünü kontrol etmeksizin teslim alması, ürünün ayıpsız teslim edildiği karinesini doğurmaz; ALICI'nın 13. madde kapsamındaki bildirim hakkı saklıdır.

---

## MADDE 8 — GÖRSEL ONAY SÜRECİ

**8.1.** SATICI, hazırlanan ürünün fotoğrafını, teslimata çıkılmadan önce ALICI'nın bildirdiği telefon numarasına SMS ile iletir.

**8.2.** ALICI, görselin iletilmesinden itibaren **15 (on beş) dakika** içinde onay verebilir veya geçerli bir gerekçe göstermek suretiyle ürünün yeniden hazırlanmasını talep edebilir. Bu süre içinde ALICI'dan herhangi bir bildirim gelmemesi hâlinde ürün onaylanmış sayılır ve teslimat sürecine alınır.

**8.3.** Görsel onay süreci, yalnızca ürünün **tasarımına, kompozisyonuna ve görsel sunumuna** ilişkindir. Görsel onay verilmiş olması veya 8.2. maddesi uyarınca onaylanmış sayılması; ALICI'nın ürünün solmuş, hasarlı veya ayıplı teslim edilmesi hâlinde Kanun'un 8 ilâ 11. maddelerinden doğan haklarını hiçbir surette ortadan kaldırmaz, sınırlamaz veya bu haklardan feragat sonucunu doğurmaz.

**8.4.** Görsel onay sürecinin işletilmesi SATICI'nın takdirindedir. Bu sürecin işletilmemiş olması, ALICI'ya sözleşmeden dönme hakkı vermez.

---

## MADDE 9 — TESLİMATIN GERÇEKLEŞTİRİLEMEMESİ

**9.1.** Aşağıdaki hâllerde teslimat gerçekleştirilemediği takdirde, teslim yükümlülüğü SATICI bakımından ifa edilmiş sayılır:

a) ALICI tarafından bildirilen adresin hatalı, eksik veya bulunamaz olması,

b) Gönderilen'in bildirilen teslimat saat aralığında adreste bulunmaması,

c) Gönderilen'in ürünü teslim almayı reddetmesi,

d) Gönderilen'e ait telefon numarasının hatalı bildirilmesi veya bu numaradan iletişim kurulamaması nedeniyle teslimatın tamamlanamaması.

**9.2.** 9.1. maddesinde sayılan hâllerde, ürünün **Bozulabilir Ürün** niteliğinde olması kaydıyla, ürün bedeli ve teslimat ücreti ALICI'ya iade edilmez. Bu düzenleme, Yönetmeliğin 15/1-ç maddesinde öngörülen ve çabuk bozulabilen ya da son kullanma tarihi geçebilecek mallara ilişkin istisnaya dayanmaktadır; söz konusu ürünlerin ikinci kez teslime elverişli biçimde muhafazası niteliği gereği mümkün değildir.

**9.3.** 9.2. maddesindeki düzenleme;

a) Bozulabilir Ürün niteliğinde **olmayan** ürünler bakımından,

b) Teslimatın gerçekleştirilememesinin **SATICI'nın kusurundan** kaynaklandığı hâllerde (ürünün hazırlanmaması, teslimat aracının yola çıkmaması, adresin SATICI tarafından yanlış işlenmesi ve benzeri),

c) Teslimatın mücbir sebep nedeniyle yapılamadığı hâllerde,

**uygulanmaz.** Bu hâllerde tahsil edilen bedel, iade talebinin SATICI'ya ulaşmasından itibaren 14 (on dört) gün içinde ALICI'ya iade edilir.

**9.4.** SATICI, 9.1. maddesindeki hâllerde ürünü aynı gün içinde ikinci kez teslime elverişli bulması kaydıyla, ALICI ile mutabakat sağlayarak ikinci teslimat denemesi yapabilir. İkinci teslimatın teslimat ücreti ALICI'ya ayrıca yansıtılır.

**9.5.** SATICI, ALICI'nın açık talimatı bulunmaksızın ürünü apartman görevlisine, komşuya veya adreste bulunan üçüncü kişilere teslim etmekle yükümlü değildir. ALICI'nın bu yönde açık talimat vermesi hâlinde teslim gerçekleşmiş sayılır ve bu teslimden doğacak sonuçlardan ALICI sorumludur.

---

## MADDE 10 — EŞ DEĞER ÜRÜN İKAMESİ

**10.1.** Kesme çiçek ve canlı bitki tedariki mevsimsel koşullara ve günlük hâl piyasasına bağlıdır. Sipariş konusu çiçek türünün veya renginin tedarik edilememesi hâlinde SATICI, ürünün genel kompozisyonunu, boyutunu ve **satış bedelini koruyacak** şekilde eş değer nitelikte başka bir çiçek türü veya rengi ile ikame etme hakkını haizdir.

**10.2.** İkame edilen ürünün satış bedeli, sipariş edilen ürünün bedelinden düşük olamaz. İkame hiçbir hâlde ürünün toplam değerini azaltacak şekilde uygulanamaz.

**10.3.** İkame yapılması hâlinde ALICI, 8. maddede düzenlenen görsel onay süreci aracılığıyla bilgilendirilir ve onayına sunulur. ALICI'nın ikame ürünü kabul etmemesi hâlinde sipariş iptal edilir ve tahsil edilen bedelin tamamı 14 (on dört) gün içinde iade edilir.

**10.4.** 10.1. maddesi uyarınca yapılan ve ALICI tarafından onaylanan ikame, ayıplı ifa teşkil etmez.

---

## MADDE 11 — CAYMA HAKKI

**11.1.** ALICI, 12. maddede sayılan istisnalar dışında kalan ürünler bakımından, ürünün kendisine veya Gönderilen'e teslim edildiği tarihten itibaren **14 (on dört) gün** içinde hiçbir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir.

**11.2.** Cayma hakkının kullanıldığına dair bildirimin, 14 günlük süre içinde 1. maddede belirtilen e-posta adresine veya KEP adresine yazılı olarak ya da kalıcı veri saklayıcısı ile iletilmesi yeterlidir. SATICI, cayma bildiriminin kendisine ulaştığını ALICI'ya derhâl teyit eder.

**11.3.** Cayma hakkının kullanılması hâlinde ALICI, ürünü bildirim tarihinden itibaren **10 (on) gün** içinde SATICI'ya iade etmekle yükümlüdür. Ürünün, kutusu ve ambalajı ile birlikte, ticari değerini yitirmemiş ve yeniden satılabilir durumda olması gerekir.

**11.4.** Cayma hakkının usulüne uygun kullanılması hâlinde ürün bedeli ve teslimat masrafları, cayma bildiriminin SATICI'ya ulaştığı tarihten itibaren **14 (on dört) gün** içinde ALICI'ya, siparişte kullandığı ödeme aracına uygun biçimde ve tek seferde iade edilir.

**11.5.** İade masrafları SATICI'ya aittir.

**11.6.** ALICI'nın kusurundan kaynaklanan bir nedenle ürünün değerinde azalma meydana gelmesi hâlinde, ALICI bu değer kaybından sorumludur.

---

## MADDE 12 — CAYMA HAKKININ KULLANILAMAYACAĞI HÂLLER

**12.1.** Yönetmeliğin 15. maddesi uyarınca, aşağıda sayılan ürünler bakımından ALICI'nın cayma hakkı bulunmamaktadır:

**a) Bozulabilir Ürünler (Yönetmelik m.15/1-ç):** Kesme çiçek, buket, aranjman, çelenk, canlı bitki ve saksı bitkileri ile son kullanma tarihi bulunan çikolata ve benzeri gıda ürünleri. Bu ürünler, niteliği itibarıyla çabuk bozulabilen veya son kullanma tarihi geçebilecek mallar olduğundan, teslimden sonra yeniden satılabilir hâlde muhafazası mümkün değildir.

**b) Özel Üretim Ürünler (Yönetmelik m.15/1-b):** ALICI'nın istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan, kişiye özel tasarım, isim baskısı veya özel mesaj içeren ürünler.

**c) Ambalajı Açılmış Ürünler (Yönetmelik m.15/1-ğ):** Tesliminden sonra ambalaj, bant, mühür veya paket gibi koruyucu unsurları açılmış olan ve iadesi sağlık ile hijyen açısından uygun olmayan ürünler.

**12.2.** ALICI, işbu sözleşmeyi onaylamakla, 12.1. maddesinde sayılan ürünler bakımından cayma hakkının bulunmadığı hususunda ön bilgilendirmenin kendisine yapıldığını kabul eder.

**12.3.** **Bu maddede düzenlenen cayma hakkı istisnaları, hiçbir surette SATICI'nın ayıplı ifadan doğan sorumluluğunu ortadan kaldırmaz.** Cayma hakkının bulunmaması, ürünün ayıplı teslim edilmesi hâlinde ALICI'nın 13. madde ve Kanun'un 11. maddesinden doğan seçimlik haklarını kullanmasına engel değildir.

---

## MADDE 13 — AYIPLI İFA VE SOLMA / BOZULMA BİLDİRİMİ

**13.1.** Ürünün solmuş, kırılmış, hasarlı veya sipariş içeriğine aykırı teslim edilmesi hâlinde ALICI, teslim saatinden itibaren **en geç 1 (bir) saat** içinde SATICI'ya bildirimde bulunur. Bildirimin, ayıbı gösteren fotoğraflarla birlikte 1. maddede belirtilen iletişim kanallarından yapılması gerekir.

**13.2.** 13.1. maddesinde öngörülen bir saatlik bildirim süresi, ürünün canlı bitki niteliği taşıması ve zamanla doğal olarak solmaya başlaması nedeniyle, ayıbın teslim anında var olup olmadığının tespitine yöneliktir. **Bu süre, Kanun'un 12. maddesinde öngörülen ve ayıbın gizli olduğu hâllerde işlemeye devam eden iki yıllık zamanaşımı süresini ortadan kaldırmaz.**

**13.3.** Bildirimin SATICI tarafından yerinde bulunması hâlinde ALICI, Kanun'un 11. maddesi uyarınca aşağıdaki seçimlik haklardan **birini** kullanmakta serbesttir:

a) Sözleşmeden dönerek ödediği bedelin iadesini talep etmek,

b) Ürünün ayıpsız misli ile değiştirilmesini (yenilenmesini) talep etmek,

c) Ayıp oranında bedel indirimi talep etmek.

**13.4.** SATICI, günlük operasyon kapasitesi ve ürünün durumunu dikkate alarak ALICI'ya öncelikle ürünün ayıpsız misli ile değiştirilmesini önerebilir. Ancak seçimlik hakkın kullanılmasına ilişkin nihai tercih **ALICI'ya** aittir. ALICI'nın bedel iadesini seçmesi hâlinde tahsil edilen bedel, talebin SATICI'ya ulaşmasından itibaren 14 (on dört) gün içinde iade edilir.

**13.5.** ALICI'nın seçtiği hakkın yerine getirilmesi SATICI için orantısız güçlük doğuruyorsa, ALICI bedel indirimi veya sözleşmeden dönme haklarından birini kullanabilir.

**13.6.** Ürünün teslimden sonra ALICI veya Gönderilen'in muhafaza koşullarından (su verilmemesi, doğrudan güneş ışığı, aşırı sıcak veya soğuk ortamda bırakılması ve benzeri) kaynaklanan solma ve bozulmalar ayıp teşkil etmez.

---

## MADDE 14 — MÜCBİR SEBEP

**14.1.** Tarafların iradesi dışında meydana gelen ve ifayı imkânsız kılan veya makul olmayan derecede güçleştiren; deprem, sel, yangın, salgın hastalık, olağanüstü hâl, genel grev, savaş, terör olayları, resmî mercilerin kararları, elektrik ve iletişim altyapısında ülke çapında yaşanan kesintiler ile ulaşımı fiilen imkânsız kılan hava koşulları mücbir sebep sayılır.

**14.2.** Mücbir sebebin ortaya çıkması hâlinde SATICI, durumu ALICI'ya derhâl bildirir. Bu hâlde teslim süresi mücbir sebep süresince durur. Mücbir sebebin 30 (otuz) günden fazla sürmesi hâlinde taraflardan her biri sözleşmeyi feshedebilir; fesih hâlinde tahsil edilen bedelin tamamı 14 (on dört) gün içinde ALICI'ya iade edilir.

---

## MADDE 15 — KİŞİSEL VERİLERİN KORUNMASI

**15.1.** SATICI, ALICI'ya ve Gönderilen'e ait kişisel verileri, 6698 sayılı Kişisel Verilerin Korunması Kanunu ile ilgili mevzuata uygun olarak işler.

**15.2.** İşlenen kişisel veri kategorileri, işleme amaçları ve hukuki sebepleri, aktarım yapılan taraflar, saklama süreleri ile ALICI'nın Kanun'un 11. maddesinden doğan hakları, Site'de yayımlanan **KVKK Aydınlatma Metni** ile **Gizlilik ve Çerez Politikası**'nda ayrıntılı biçimde düzenlenmiştir. Söz konusu metinler işbu sözleşmenin eki ve ayrılmaz parçası niteliğindedir.

**15.3.** ALICI, kişisel verilerine ilişkin başvurularını \`durucicekorganizasyon@gmail.com\` adresine veya 1. maddede belirtilen KEP adresine iletebilir.

---

## MADDE 16 — DELİL SÖZLEŞMESİ VE UYUŞMAZLIKLARIN ÇÖZÜMÜ

**16.1.** İşbu sözleşmeden doğabilecek uyuşmazlıklarda SATICI'nın veri tabanında, sunucularında ve elektronik sistemlerinde tuttuğu elektronik kayıtlar, sipariş kayıtları, SMS ve e-posta yazışmaları ile log kayıtları 6100 sayılı Hukuk Muhakemeleri Kanunu'nun 193. maddesi uyarınca geçerli delil teşkil eder. ALICI, bu hükmü bir delil sözleşmesi olarak kabul eder. **Bu hüküm, ALICI'nın kendi delillerini sunma hakkını kısıtlamaz.**

**16.2.** ALICI, işbu sözleşmeden doğan uyuşmazlıklarda; her yıl Ticaret Bakanlığı tarafından ilan edilen parasal sınırlar dâhilinde **kendi yerleşim yerinin** veya tüketici işleminin yapıldığı yerin bulunduğu **İlçe/İl Tüketici Hakem Heyetine**, bu sınırların üzerindeki uyuşmazlıklarda ise **Tüketici Mahkemesine** başvurabilir. Tüketici Mahkemesi bulunmayan yerlerde Asliye Hukuk Mahkemeleri bu davalara bakmakla görevlidir.

**16.3.** Kanun'un tüketiciye tanıdığı, kendi yerleşim yerindeki hakem heyetine veya mahkemeye başvurma hakkı hiçbir surette sınırlandırılmamıştır. 16.4. maddesindeki yetki düzenlemesi, ALICI'nın bu hakkını ortadan kaldıracak biçimde yorumlanamaz.

**16.4.** ALICI'nın tüketici sıfatını haiz olmadığı, ticari veya mesleki amaçlarla hareket ettiği hâllerde doğacak uyuşmazlıklarda **İstanbul (Şişli) Mahkemeleri ve İcra Daireleri** yetkilidir.

**16.5.** İşbu sözleşmeye Türk hukuku uygulanır.

---

## MADDE 17 — YÜRÜRLÜK

**17.1.** İşbu sözleşme 17 (on yedi) maddeden ibarettir.

**17.2.** ALICI, Site üzerinden siparişini onaylamak suretiyle işbu sözleşmenin tüm hükümlerini ve Ön Bilgilendirme Formu'nun içeriğini okuduğunu, anladığını ve kabul ettiğini beyan eder. Sözleşme, ALICI'nın elektronik ortamda onayı ile kurulur ve yürürlüğe girer.

**17.3.** İşbu sözleşmenin bir nüshası, sipariş onayı ile birlikte ALICI'nın bildirdiği e-posta adresine gönderilir ve ALICI'nın üyelik hesabı bulunması hâlinde hesabında saklanır.

**17.4.** Sözleşmenin herhangi bir hükmünün mevzuat değişikliği veya yargı kararı ile geçersiz sayılması, diğer hükümlerin geçerliliğini etkilemez.

---

**SATICI:** DURU DAVET ORGANİZASYON VE ÇİÇEKÇİLİK TİCARET LİMİTED ŞİRKETİ

**ALICI:** Sipariş formunda bilgileri beyan edilen kişi

**SÖZLEŞME TARİHİ:** Siparişin elektronik ortamda onaylandığı tarih

---

*Son güncelleme: 25.07.2026 — Sürüm: 1.0*`,
};

export const onBilgilendirmeFormu: LegalDocument = {
  slug: "on-bilgilendirme-formu",
  title: "Ön Bilgilendirme Formu",
  description: "Mesafeli Sözleşmeler Yönetmeliği uyarınca sipariş öncesi bilgilendirme formu.",
  updatedAt: "25.07.2026",
  version: "1.0",
  content: `# ÖN BİLGİLENDİRME FORMU

İşbu form, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ile Mesafeli Sözleşmeler Yönetmeliği'nin 5. maddesi uyarınca, siparişinizi onaylamadan **önce** tarafınıza sunulan bilgileri içerir. Siparişinizi onaylamanız hâlinde işbu formun içeriğini okuduğunuzu ve bilgilendirildiğinizi kabul etmiş olursunuz.

---

## 1. SATICIYA İLİŞKİN BİLGİLER

| | |
|---|---|
| Ticaret Unvanı | DURU DAVET ORGANİZASYON VE ÇİÇEKÇİLİK TİCARET LİMİTED ŞİRKETİ |
| MERSİS Numarası | 0319035740400001 |
| Ticaret Sicil Numarası | 149213-5 (İstanbul Ticaret Sicili Müdürlüğü) |
| Vergi Kimlik Numarası / Vergi Dairesi | 3190357404 / Mecidiyeköy Vergi Dairesi Müdürlüğü |
| ETBİS Site Kayıt Numarası | 1197646530 |
| Açık Adres | 19 Mayıs Mah. Aytekin Kotil Cad. Yıldırım Apt. No: 18H Şişli / İstanbul |
| Telefon | 0532 295 93 09 |
| E-posta | durucicekorganizasyon@gmail.com |
| KEP Adresi | duru.davet@hs01.kep.tr |
| İnternet Sitesi | https://dunyanincicegi.com |
| Temsile Yetkili | Deniz Akın (Müdür) |

**Şikâyet ve talepleriniz için:** Yukarıdaki telefon numarası veya \`durucicekorganizasyon@gmail.com\` adresi. Şikâyetleriniz **en geç 3 (üç) iş günü** içinde yanıtlanır.

**Kişisel verilerinize ilişkin başvurularınız için:** \`durucicekorganizasyon@gmail.com\` veya yukarıda belirtilen KEP adresi.

Satıcı, siparişlerinizi kendi adına ve hesabına kabul eder; adına ya da hesabına hareket eden üçüncü bir aracı bulunmamaktadır.

---

## 2. SÖZLEŞME KONUSU ÜRÜNÜN TEMEL NİTELİKLERİ

**2.1.** Sipariş konusu ürünün türü, cinsi, içeriği, adedi, rengi ve boyutu ile birim ve toplam satış bedeli; ürün tanıtım sayfasında ve sipariş onayından önce görüntülenen sipariş özetinde yer almaktadır. Bu bilgiler işbu formun ayrılmaz parçasıdır.

**2.2.** Satışa sunulan ürünler; kesme çiçek, buket, aranjman, çelenk, saksı bitkisi, teraryum ile çikolata ve benzeri hediye ürünlerinden oluşur.

**2.3.** Çiçek ve canlı bitkiler doğal ürünlerdir. Bu nedenle ürün tanıtım fotoğrafları ile teslim edilen ürün arasında renk tonu, çiçeğin açılım durumu ve boyut bakımından makul farklılıklar bulunabilir. Bu farklılıklar ayıp niteliğinde değildir.

**2.4. Eş değer ürün ikamesi:** Çiçek tedariki mevsimsel koşullara ve günlük hâl piyasasına bağlıdır. Sipariş ettiğiniz çiçek türü veya rengi tedarik edilemezse, ürünün kompozisyonunu, boyutunu ve **satış bedelini koruyacak** şekilde eş değer nitelikte başka bir çiçekle ikame edilebilir. İkame edilen ürünün değeri hiçbir hâlde sipariş ettiğiniz ürünün değerinden düşük olamaz. İkame hâlinde 5. maddede açıklanan görsel onay süreci ile bilgilendirilir ve onayınıza sunulursunuz; ikameyi kabul etmemeniz hâlinde siparişiniz iptal edilerek bedelin tamamı iade edilir.

---

## 3. TOPLAM BEDEL VE EK MASRAFLAR

**3.1.** Ürünün tüm vergiler dâhil satış bedeli, uygulanan indirim tutarı, teslimat ücreti ve ödemeniz gereken toplam bedel; sipariş onayından önce sipariş özetinde ayrı ayrı ve açıkça gösterilir.

**3.2. Teslimat ücreti:** Teslimat ücreti, hizmet verilen bölgenin tamamında **sabit tutar** olarak uygulanır ve sipariş onayından önce sipariş özetinde açıkça gösterilir. Satıcı, teslimat ücretinin tutarını belirlemekte ve değiştirmekte serbesttir; değişiklikler yayımlandıkları tarihte yürürlüğe girer ve daha önce verilmiş siparişlere uygulanmaz.

Satıcı, belirlediği tutarın üzerindeki siparişlerde teslimat ücreti almama hakkını saklı tutar. Ücretsiz teslimat eşiği uygulanıyorsa bu husus Site'de ve sipariş özetinde gösterilir.

Belirli ürünler için ürüne özel teslimat ücreti uygulanabilir; bu hâlde ilgili tutar sipariş özetinde ayrıca belirtilir.

Satıcı, ileride teslimat ücretini **mesafeye veya bölgeye göre farklılaştırma** hakkını saklı tutar. Böyle bir uygulamaya geçilmesi hâlinde, siparişinize uygulanacak teslimat ücreti sipariş onayından önce sipariş özetinde her hâlde açıkça gösterilir; onaylamadığınız hiçbir tutar tarafınıza yansıtılmaz.

**3.3.** Yukarıda belirtilenler dışında tarafınıza yansıtılacak herhangi bir ek masraf, komisyon veya hizmet bedeli bulunmamaktadır.

**3.4.** Siparişinizi vermek için kullandığınız uzak iletişim aracının (internet bağlantısı, telefon) kullanım bedeli olağan tarife üzerinden hesaplanır; bu nedenle tarafınıza herhangi bir ilave maliyet yüklenmez.

**3.5.** Satıcı tarafından tarafınızdan depozito veya başka bir mali teminat talep edilmemektedir.

---

## 4. ÖDEME BİLGİLERİ

**4.1. Banka Havalesi / EFT:** Sipariş bedelini, Site'de bildirilen banka hesaplarından birine, siparişin oluşturulduğu andan itibaren **1 (bir) saat** içinde aktarmanız gerekir. Bu süre içinde ödeme Satıcı hesabına geçmezse siparişiniz iptal edilebilir. Bu yöntemde taksit imkânı bulunmamaktadır.

**4.2. Kredi Kartı ile Ödeme:** Ödeme, Satıcı'nın anlaşmalı olduğu ödeme kuruluşunun güvenli altyapısı üzerinden gerçekleştirilir. Kart bilgileriniz Satıcı tarafından görüntülenmez, kaydedilmez ve saklanmaz. Ödeme kuruluşunun taksit imkânı sunması hâlinde uygulanabilir taksit seçenekleri ile varsa vade farkı tutarı, ödeme adımında toplam bedelle birlikte açıkça gösterilir.

**4.3. Fatura:** Siparişinize ilişkin fatura, mevzuat gereği **e-Arşiv Fatura** olarak düzenlenir ve bildirdiğiniz e-posta adresine elektronik ortamda iletilir. Bu nedenle geçerli bir e-posta adresi bildirmeniz zorunludur.

**4.4. İade ödemeleri:** Bedel iadesi gerektiren hâllerde ödeme, siparişte kullandığınız ödeme aracına uygun biçimde ve tek seferde yapılır. Kredi kartı ile yapılan ödemelerde tutarın kart hesabınıza yansıma süresi bankanızın işlem süresine bağlıdır; Satıcı bedeli bankaya iade ettikten sonraki bu süreden sorumlu değildir.

---

## 5. TESLİMAT VE İFAYA İLİŞKİN BİLGİLER

**5.1. Teslimat bölgesi:** Satıcı hâlihazırda yalnızca **İstanbul ili** sınırları içinde ve Site'de aktif olarak listelenen ilçelere teslimat yapmaktadır.

**5.2. Teslimat saat aralıkları:** **09:00–12:00** ve **12:00–17:00**. Siparişinizi verirken teslimat tarihini ve bu aralıklardan birini seçebilirsiniz.

**5.3. Aynı gün teslimat:** Saat **12:00'a kadar** verilen ve bedeli tahsil edilen siparişler aynı gün teslim edilir. Saat 12:00'dan sonra verilen siparişlerde, teslimat adresinin konumu, trafik yoğunluğu ve günlük operasyon kapasitesi nedeniyle aynı gün teslimat garanti edilmez. Resmî tatiller, dinî bayramlar ile yılbaşı, Sevgililer Günü ve Anneler Günü gibi yoğun talep dönemlerinde teslimat saat aralıklarında ve aynı gün teslimat taahhüdünde değişiklik yapılabilir; böyle bir durumda siparişinizden önce bilgilendirilirsiniz.

**5.4. Teslimatı yapan:** Teslimat, Satıcı'nın kendi araç ve personeli ile gerçekleştirilir. Günlük iş yoğunluğuna bağlı olarak teslimat anlaşmalı bir kurye veya kargo firması aracılığıyla da yapılabilir; bu hâlde teslimat için zorunlu bilgiler yalnızca teslimatın ifası amacıyla ilgili firmaya aktarılır.

**5.5. Azami teslim süresi:** Teslimat, siparişin kurulmasından itibaren hiçbir hâlde **30 (otuz) günü** aşamaz. Bu süre içinde teslimin gerçekleşmemesi hâlinde sözleşmeyi feshedebilirsiniz; fesih hâlinde ödediğiniz bedelin tamamı, fesih bildiriminizin Satıcı'ya ulaşmasından itibaren **14 (on dört) gün** içinde iade edilir.

**5.6. Üçüncü kişiye teslimat:** Siparişinizi başka bir kişiye gönderiyorsanız, ürünün o kişiye teslim edilmesi tarafınıza teslim hükmündedir. Alıcı kişinin ad-soyadı, telefon numarası ve adres bilgilerini bildirmekle, bu bilgileri paylaşmaya yetkili olduğunuzu ve söz konusu kişiyi bilgilendirdiğinizi beyan etmiş olursunuz. Satıcı, teslimat bildirimi ile birlikte alıcı kişiye aydınlatma metnine erişim bağlantısı iletir.

**5.7. Görsel onay süreci:** Hazırlanan ürünün fotoğrafı, teslimata çıkılmadan önce bildirdiğiniz telefon numarasına SMS ile iletilir. Görselin iletilmesinden itibaren **15 (on beş) dakika** içinde onay verebilir veya geçerli bir gerekçe göstererek ürünün yeniden hazırlanmasını talep edebilirsiniz. Bu süre içinde bildirim yapmamanız hâlinde ürün onaylanmış sayılır ve teslimat sürecine alınır.

Görsel onay yalnızca ürünün **tasarımına, kompozisyonuna ve görsel sunumuna** ilişkindir. Görsel onay vermeniz veya süre geçtiği için onaylanmış sayılması; ürünün solmuş, hasarlı veya ayıplı teslim edilmesi hâlinde 6502 sayılı Kanun'un 8 ilâ 11. maddelerinden doğan haklarınızı ortadan kaldırmaz.

**5.8. Teslimatın gerçekleştirilememesi:** Bildirdiğiniz adresin hatalı veya bulunamaz olması, alıcı kişinin belirtilen saat aralığında adreste bulunmaması, ürünü teslim almayı reddetmesi ya da bildirilen telefon numarasından iletişim kurulamaması hâllerinde, ürünün çabuk bozulabilen nitelikte olması kaydıyla ürün bedeli ve teslimat ücreti iade edilmez. Bu düzenleme, Mesafeli Sözleşmeler Yönetmeliği'nin 15/1-ç maddesindeki istisnaya dayanır; bu ürünlerin ikinci kez teslime elverişli biçimde muhafazası niteliği gereği mümkün değildir.

Bu kural; çabuk bozulabilen nitelikte **olmayan** ürünler ile teslimatın gerçekleştirilememesinin **Satıcı'nın kusurundan** veya mücbir sebepten kaynaklandığı hâllerde **uygulanmaz**. Bu hâllerde tahsil edilen bedel 14 (on dört) gün içinde iade edilir.

**5.9. Solma ve bozulma bildirimi:** Ürünün solmuş, kırılmış, hasarlı veya sipariş içeriğine aykırı teslim edilmesi hâlinde, teslim saatinden itibaren **en geç 1 (bir) saat** içinde, ayıbı gösteren fotoğraflarla birlikte Satıcı'ya bildirimde bulunmanız gerekir. Bu süre, ürünün canlı bitki niteliği taşıması ve zamanla doğal olarak solmaya başlaması nedeniyle ayıbın teslim anında var olup olmadığının tespitine yöneliktir; **gizli ayıp hâlinde Kanun'un 12. maddesindeki iki yıllık zamanaşımı süresi işlemeye devam eder.**

Bildiriminizin yerinde bulunması hâlinde; sözleşmeden dönerek bedel iadesi, ürünün ayıpsız misli ile değiştirilmesi veya ayıp oranında bedel indirimi haklarından **birini seçmekte serbestsiniz.** Satıcı, günlük operasyon kapasitesi ve ürünün durumunu dikkate alarak öncelikle ürünün yenilenmesini önerebilir; ancak nihai tercih **tarafınıza** aittir.

---

## 6. CAYMA HAKKI

**6.1.** İşbu formun 7. maddesinde sayılan istisnalar dışında kalan ürünler bakımından; ürünün tarafınıza veya gönderdiğiniz kişiye teslim edildiği tarihten itibaren **14 (on dört) gün** içinde hiçbir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahipsiniz.

**6.2. Cayma bildiriminin yapılacağı adresler:**

- **E-posta:** durucicekorganizasyon@gmail.com
- **KEP:** duru.davet@hs01.kep.tr
- **Posta:** 19 Mayıs Mah. Aytekin Kotil Cad. Yıldırım Apt. No: 18H Şişli / İstanbul

Bildirimin 14 günlük süre içinde yukarıdaki kanallardan birine yazılı olarak veya kalıcı veri saklayıcısı ile iletilmesi yeterlidir. İşbu formun ekinde yer alan örnek cayma formunu kullanabilirsiniz; ancak bu formun kullanılması zorunlu değildir. Satıcı, cayma bildiriminizin kendisine ulaştığını derhâl teyit eder.

**6.3. İade yükümlülüğü:** Cayma hakkını kullanmanız hâlinde ürünü, bildirim tarihinden itibaren **10 (on) gün** içinde Satıcı'ya iade etmeniz gerekir. Ürünün kutusu ve ambalajı ile birlikte, ticari değerini yitirmemiş ve yeniden satılabilir durumda olması gerekir.

**6.4. Bedel iadesi:** Cayma hakkının usulüne uygun kullanılması hâlinde ürün bedeli ve teslimat masrafları, cayma bildiriminizin Satıcı'ya ulaştığı tarihten itibaren **14 (on dört) gün** içinde, ödemede kullandığınız araca uygun biçimde ve tek seferde iade edilir.

**6.5. İade masrafı:** Ürünün Satıcı'ya geri gönderilmesine ilişkin masraflar **Satıcı'ya** aittir.

**6.6. Değer kaybı:** Kusurunuzdan kaynaklanan bir nedenle ürünün değerinde azalma meydana gelirse, bu değer kaybından sorumlu olursunuz.

**6.7. Sürenin geçmesi:** Cayma hakkını 14 günlük süre içinde kullanmamanız hâlinde **bu hakkınızı kaybedersiniz.**

---

## 7. CAYMA HAKKININ KULLANILAMAYACAĞI ÜRÜNLER

Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesi uyarınca, aşağıdaki ürünlerde cayma hakkı **bulunmamaktadır**:

**a) Çabuk bozulabilen veya son kullanma tarihi geçebilecek ürünler** *(Yönetmelik m.15/1-ç)*
Kesme çiçek, buket, aranjman, çelenk, canlı bitki, saksı bitkileri ile son kullanma tarihi bulunan çikolata ve benzeri gıda ürünleri. Bu ürünler nitelikleri itibarıyla teslimden sonra yeniden satılabilir hâlde muhafaza edilemez.

**b) Kişiye özel hazırlanan ürünler** *(Yönetmelik m.15/1-b)*
İstekleriniz veya kişisel ihtiyaçlarınız doğrultusunda hazırlanan; kişiye özel tasarım, isim baskısı veya özel mesaj içeren ürünler.

**c) Ambalajı açılmış hijyenik ürünler** *(Yönetmelik m.15/1-ğ)*
Tesliminden sonra ambalaj, bant, mühür veya paket gibi koruyucu unsurları açılmış olan ve iadesi sağlık ile hijyen açısından uygun olmayan ürünler.

> **Önemli:** Cayma hakkının bulunmaması, Satıcı'nın ayıplı ifadan doğan sorumluluğunu ortadan kaldırmaz. Ürün solmuş, hasarlı veya ayıplı teslim edilmişse, cayma hakkınız bulunmasa da 5.9. maddede açıklanan bildirim ve seçimlik haklarınızı kullanabilirsiniz.

Bozulabilir nitelikte olmayan ürünlerde (vazo, saksı kabı, teraryum kabı, dekoratif hediye ürünleri gibi) **14 günlük cayma hakkınız saklıdır.**

---

## 8. UYUŞMAZLIK HÂLİNDE BAŞVURU YOLLARI

**8.1.** Siparişinize ilişkin şikâyet ve talepleriniz için öncelikle 1. maddede belirtilen iletişim kanallarından Satıcı'ya başvurabilirsiniz. Başvurularınız en geç 3 (üç) iş günü içinde yanıtlanır.

**8.2.** Uyuşmazlığın çözümlenememesi hâlinde; her yıl Ticaret Bakanlığı tarafından ilan edilen parasal sınırlar dâhilinde **kendi yerleşim yerinizin** veya tüketici işleminin yapıldığı yerin bulunduğu **İlçe/İl Tüketici Hakem Heyetine**, bu sınırların üzerindeki uyuşmazlıklarda ise **Tüketici Mahkemesine** başvurabilirsiniz. Tüketici Mahkemesi bulunmayan yerlerde bu davalara Asliye Hukuk Mahkemeleri bakmakla görevlidir.

**8.3.** Başvurunuzu, Ticaret Bakanlığı'nın **Tüketici Bilgi Sistemi (TÜBİS)** üzerinden elektronik ortamda da yapabilirsiniz.

**8.4.** Tüketici Hakem Heyetlerine başvuru harca tabi değildir.

---

## 9. KİŞİSEL VERİLERİN KORUNMASI

**9.1.** Kişisel verileriniz, 6698 sayılı Kişisel Verilerin Korunması Kanunu'na uygun olarak işlenir. İşlenen veri kategorileri, işleme amaçları ve hukuki sebepleri, aktarım yapılan taraflar ile saklama süreleri Site'de yayımlanan **KVKK Aydınlatma Metni**'nde ayrıntılı olarak açıklanmıştır.

**9.2.** Çerez kullanımına ilişkin bilgiler **Gizlilik ve Çerez Politikası**'nda yer almaktadır.

**9.3.** Kişisel verilerinize ilişkin başvurularınızı \`durucicekorganizasyon@gmail.com\` adresine veya \`duru.davet@hs01.kep.tr\` KEP adresine iletebilirsiniz.

---

## 10. ÖDEME YÜKÜMLÜLÜĞÜ VE FORMUN SAKLANMASI

**10.1.** Sipariş özetindeki **"Siparişi Onayla"** işlemini tamamlamanız, sipariş bedelini ödeme yükümlülüğü altına girdiğiniz anlamına gelir.

**10.2.** Siparişinizi onaylamakla; işbu Ön Bilgilendirme Formu'nun tamamını okuduğunuzu, sözleşme kurulmadan önce bilgilendirildiğinizi ve Mesafeli Satış Sözleşmesi'ni kabul ettiğinizi beyan etmiş olursunuz.

**10.3.** İşbu form ile Mesafeli Satış Sözleşmesi'nin bir nüshası, sipariş onayı ile birlikte bildirdiğiniz e-posta adresine kalıcı veri saklayıcısı niteliğinde gönderilir. Üyelik hesabınız bulunması hâlinde bu belgeler hesabınızda da saklanır.

**10.4.** Satıcı, işbu formun tarafınıza sunulduğuna ve onayladığınıza ilişkin elektronik kayıtları, ispat amacıyla saklar.

---

## EK — ÖRNEK CAYMA FORMU

> *Bu formu doldurmak yalnızca kolaylık sağlamak amacıyla sunulmuştur; cayma hakkınızı kullanmak için bu formu kullanmanız zorunlu değildir. Cayma iradenizi açıkça ortaya koyan her türlü yazılı bildirim geçerlidir.*

---

**Kime:**

DURU DAVET ORGANİZASYON VE ÇİÇEKÇİLİK TİCARET LİMİTED ŞİRKETİ
19 Mayıs Mah. Aytekin Kotil Cad. Yıldırım Apt. No: 18H Şişli / İstanbul
E-posta: durucicekorganizasyon@gmail.com — KEP: duru.davet@hs01.kep.tr

---

Aşağıda belirtilen ürüne ilişkin olarak kurulan mesafeli satış sözleşmesinden **cayma hakkımı kullanıyorum.**

| | |
|---|---|
| Sipariş numarası | ................................................ |
| Sipariş tarihi | ....... / ....... / ................ |
| Teslim tarihi | ....... / ....... / ................ |
| Cayma hakkı kullanılan ürün(ler) | ................................................ |
| Ürün bedeli | ................................................ TL |
| Ad-soyadı | ................................................ |
| Adres | ................................................ |
| Telefon | ................................................ |
| E-posta | ................................................ |
| İade edilecek IBAN *(havale/EFT ile ödeme yapıldıysa)* | ................................................ |

**Tarih:** ....... / ....... / ................

**İmza:** ................................................

*(Bu form elektronik ortamda gönderiliyorsa imza aranmaz.)*

---

*Son güncelleme: 25.07.2026 — Sürüm: 1.0*`,
};

export const iptalVeIadeKosullari: LegalDocument = {
  slug: "iade",
  title: "İptal ve İade Koşulları",
  description: "Sipariş iptali, cayma hakkı, ürün iadesi ve ayıplı ürün başvurularına ilişkin koşullar.",
  updatedAt: "25.07.2026",
  version: "1.0",
  content: `# İPTAL VE İADE KOŞULLARI

Bu metin, dunyanincicegi.com üzerinden verdiğiniz siparişlerin iptali, ürün iadesi ve bedel iadesine ilişkin koşulları düzenler. 6502 sayılı Tüketicinin Korunması Hakkında Kanun ile Mesafeli Sözleşmeler Yönetmeliği hükümleri esas alınmıştır.

Metinde geçen **Satıcı** ifadesi, DURU DAVET ORGANİZASYON VE ÇİÇEKÇİLİK TİCARET LİMİTED ŞİRKETİ'ni ifade eder.

---

## 1. SİPARİŞ İPTALİ

### 1.1. Hangi aşamada iptal edebilirsiniz

Çiçek ve canlı bitki siparişleri, verildiği anda hazırlık sürecine alınır. Bu nedenle iptal talebinizin sonucu, siparişin hangi aşamada olduğuna bağlıdır:

| Siparişin durumu | İptal sonucu |
|---|---|
| **Ödeme henüz yapılmadı** | Sipariş kendiliğinden iptal edilir, herhangi bir bedel tahsil edilmez. |
| **Ödeme yapıldı, hazırlığa başlanmadı** | Sipariş iptal edilir, tahsil edilen bedelin **tamamı** iade edilir. |
| **Ürün hazırlandı, teslimata çıkmadı** | Çiçek kesilmiş ve aranjman yapılmış olduğundan ürün yeniden satışa elverişli değildir. Bu aşamada bedel iadesi Satıcı'nın takdirindedir. |
| **Ürün teslimata çıktı veya teslim edildi** | Çabuk bozulabilen ürün niteliği nedeniyle iptal ve bedel iadesi mümkün değildir *(bkz. Madde 3)*. |

**1.2.** İptal talebinizi, aşağıda 7. maddede belirtilen iletişim kanallarından **derhâl** iletmeniz, talebinizin olumlu sonuçlanma ihtimalini belirleyen en önemli unsurdur.

**1.3.** Bozulabilir nitelikte olmayan ürünlerde (vazo, saksı kabı, teraryum kabı, dekoratif hediye ürünleri gibi) teslim öncesindeki her aşamada iptal hakkınız bulunur ve tahsil edilen bedelin tamamı iade edilir.

### 1.4. Satıcı tarafından iptal

Satıcı aşağıdaki hâllerde siparişi iptal edebilir:

a) **Havale/EFT ile ödemede**, siparişin oluşturulmasından itibaren **1 (bir) saat** içinde bedelin Satıcı hesabına geçmemesi,

b) Sipariş konusu ürünün stokta bulunmaması veya tedarik edilememesi ve tarafınıza sunulan eş değer ürün önerisinin kabul edilmemesi,

c) Teslimat adresinin Satıcı'nın hizmet verdiği bölge dışında kalması,

d) Ödemenin bankanız veya ödeme kuruluşu tarafından onaylanmaması.

Bu hâllerde tahsil edilmiş bir bedel varsa, iptal tarihinden itibaren **en geç 14 (on dört) gün** içinde tarafınıza iade edilir.

---

## 2. CAYMA HAKKI

**2.1.** 3. maddede sayılan ürünler dışında kalan siparişlerde; ürünün size veya gönderdiğiniz kişiye teslim edildiği tarihten itibaren **14 (on dört) gün** içinde, hiçbir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahipsiniz.

**2.2. Cayma bildirimini nasıl yaparsınız**

Bildirimin 14 günlük süre içinde aşağıdaki kanallardan birine ulaşması yeterlidir:

- **E-posta:** durucicekorganizasyon@gmail.com
- **KEP:** duru.davet@hs01.kep.tr
- **Posta:** 19 Mayıs Mah. Aytekin Kotil Cad. Yıldırım Apt. No: 18H Şişli / İstanbul

Ön Bilgilendirme Formu'nun ekinde yer alan örnek cayma formunu kullanabilirsiniz; kullanmanız zorunlu değildir. Cayma iradenizi açıkça ortaya koyan her türlü yazılı bildirim geçerlidir. Bildiriminizin ulaştığı tarafınıza derhâl teyit edilir.

**2.3. Ürünü ne zamana kadar göndermeniz gerekir**

Cayma bildiriminizin tarihinden itibaren **10 (on) gün** içinde ürünü Satıcı'ya iade etmeniz gerekir. Ürünün kutusu ve ambalajı ile birlikte, ticari değerini yitirmemiş ve yeniden satılabilir durumda olması gerekir.

**2.4. İade gönderim masrafı**

Ürünün Satıcı'ya geri gönderilmesine ilişkin masraflar **Satıcı'ya** aittir. İade gönderimi için 7. maddedeki kanallardan Satıcı ile irtibata geçmeniz yeterlidir.

**2.5. Bedel iadesi**

Ürün bedeli ve ödediğiniz teslimat masrafları, cayma bildiriminizin Satıcı'ya ulaştığı tarihten itibaren **en geç 14 (on dört) gün** içinde, ödemede kullandığınız araca uygun biçimde ve tek seferde iade edilir.

**2.6. Değer kaybı**

Kusurunuzdan kaynaklanan bir nedenle ürünün değerinde azalma meydana gelmesi hâlinde bu değer kaybından sorumlu olursunuz.

**2.7. Sürenin geçmesi**

Cayma hakkını 14 günlük süre içinde kullanmazsanız **bu hakkınızı kaybedersiniz.**

---

## 3. CAYMA HAKKININ BULUNMADIĞI ÜRÜNLER

Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesi uyarınca aşağıdaki ürünlerde cayma hakkı **bulunmamaktadır**:

**a) Çabuk bozulabilen veya son kullanma tarihi geçebilecek ürünler** — *Yönetmelik m.15/1-ç*

Kesme çiçek, buket, aranjman, çelenk, canlı bitki, saksı bitkileri ile son kullanma tarihi bulunan çikolata ve benzeri gıda ürünleri.

Bu ürünler nitelikleri gereği teslimden sonra yeniden satılabilir hâlde muhafaza edilemez. Kesilmiş çiçek, hazırlandığı andan itibaren doğal ömrünü tüketmeye başlar; bu nedenle mevzuat bu ürün grubunu cayma hakkı kapsamı dışında bırakmıştır.

**b) Kişiye özel hazırlanan ürünler** — *Yönetmelik m.15/1-b*

İstekleriniz veya kişisel ihtiyaçlarınız doğrultusunda hazırlanan; kişiye özel tasarım, isim baskısı veya özel mesaj içeren ürünler.

**c) Ambalajı açılmış hijyenik ürünler** — *Yönetmelik m.15/1-ğ*

Tesliminden sonra ambalaj, bant, mühür veya paket gibi koruyucu unsurları açılmış olan ve iadesi sağlık ile hijyen açısından uygun olmayan ürünler.

> **Bu düzenleme, ayıplı ürünlere ilişkin haklarınızı kapsamaz.**
> Cayma hakkınızın bulunmaması, ürünün solmuş, hasarlı veya siparişinize aykırı teslim edilmesi hâlinde başvuru hakkınızı ortadan kaldırmaz. Bu durumda 4. maddedeki haklarınızı kullanabilirsiniz.

---

## 4. SOLMUŞ, HASARLI VEYA AYIPLI ÜRÜN

### 4.1. Bildirim süresi ve usulü

Ürün solmuş, kırılmış, hasarlı veya sipariş içeriğine aykırı teslim edilmişse; **teslim saatinden itibaren en geç 1 (bir) saat içinde**, ayıbı gösteren fotoğraflarla birlikte Satıcı'ya bildirimde bulunmanız gerekir.

Bu kısa süre, ürünün canlı bitki niteliği taşımasından kaynaklanır: kesme çiçek zamanla doğal olarak solmaya başladığından, ayıbın teslim anında var olup olmadığının tespiti ancak teslimin hemen ardından mümkündür.

**Gizli ayıp hâlinde** — ayıbın niteliği gereği teslim anında fark edilemediği durumlarda — 6502 sayılı Kanun'un 12. maddesinde öngörülen **iki yıllık zamanaşımı süresi işlemeye devam eder.** Bir saatlik bildirim süresi bu hakkı ortadan kaldırmaz.

### 4.2. Fotoğraf şartı

Bildiriminizin değerlendirilebilmesi için ayıbı gösteren fotoğrafların iletilmesi gerekir. Fotoğrafların ürünün genel görünümünü ve şikâyete konu kısmı açıkça göstermesi beklenir.

### 4.3. Haklarınız

Bildiriminizin yerinde bulunması hâlinde, 6502 sayılı Kanun'un 11. maddesi uyarınca aşağıdaki haklardan **birini seçmekte serbestsiniz**:

- **Sözleşmeden dönerek** ödediğiniz bedelin iadesini talep etmek,
- Ürünün **ayıpsız misli ile değiştirilmesini** (yenilenmesini) talep etmek,
- **Ayıp oranında bedel indirimi** talep etmek.

Satıcı, günlük operasyon kapasitesini ve ürünün durumunu dikkate alarak öncelikle ürünün yenilenmesini önerebilir. **Ancak hangi hakkı kullanacağınıza ilişkin nihai tercih size aittir.** Bedel iadesini seçmeniz hâlinde tahsil edilen bedel, talebinizin Satıcı'ya ulaşmasından itibaren en geç 14 (on dört) gün içinde iade edilir.

Seçtiğiniz hakkın yerine getirilmesi Satıcı için orantısız güçlük doğuruyorsa, bedel indirimi veya sözleşmeden dönme haklarından birini kullanabilirsiniz.

### 4.4. Ayıp sayılmayan hâller

Aşağıdaki durumlar ayıp teşkil etmez:

a) Çiçek ve canlı bitkilerin doğal yapısı gereği, tanıtım fotoğrafı ile teslim edilen ürün arasındaki renk tonu, çiçeğin açılım durumu ve boyuta ilişkin **makul farklılıklar**,

b) Teslimden sonra ürünün muhafaza koşullarından kaynaklanan solma ve bozulmalar — suyunun değiştirilmemesi, doğrudan güneş ışığında, klima veya kalorifer önünde ya da aşırı sıcak veya soğuk ortamda bırakılması gibi,

c) Kesme çiçeğin doğal ömrünü tamamlaması,

d) 5. madde uyarınca yapılan ve tarafınızca onaylanan eş değer ürün ikamesi.

### 4.5. Görsel onayın etkisi

Hazırlanan ürünün fotoğrafı, teslimata çıkılmadan önce telefonunuza SMS ile iletilir ve **15 (on beş) dakika** içinde onayınıza sunulur. Bu süre içinde bildirim yapmazsanız ürün onaylanmış sayılır.

Görsel onay yalnızca ürünün **tasarımına, kompozisyonuna ve görsel sunumuna** ilişkindir. Görsel onay vermeniz veya süre geçtiği için onaylanmış sayılması, ürünün solmuş, hasarlı veya ayıplı teslim edilmesi hâlinde bu maddedeki haklarınızı **ortadan kaldırmaz.**

---

## 5. EŞ DEĞER ÜRÜN İKAMESİ

**5.1.** Çiçek tedariki mevsimsel koşullara ve günlük hâl piyasasına bağlıdır. Sipariş ettiğiniz çiçek türü veya rengi tedarik edilemezse, ürünün kompozisyonunu, boyutunu ve **satış bedelini koruyacak** şekilde eş değer nitelikte başka bir çiçekle ikame edilebilir.

**5.2.** İkame edilen ürünün değeri hiçbir hâlde sipariş ettiğiniz ürünün değerinden düşük olamaz.

**5.3.** İkame hâlinde 4.5. maddede açıklanan görsel onay süreci ile bilgilendirilir ve onayınıza sunulursunuz.

**5.4.** İkame ürünü kabul etmemeniz hâlinde siparişiniz iptal edilir ve tahsil edilen bedelin **tamamı** en geç 14 (on dört) gün içinde iade edilir.

---

## 6. TESLİM EDİLEMEYEN SİPARİŞLER

### 6.1. Bedel iadesi yapılmayan hâller

Aşağıdaki hâllerde teslim yükümlülüğü Satıcı bakımından ifa edilmiş sayılır ve ürünün **çabuk bozulabilen nitelikte olması kaydıyla** ürün bedeli ile teslimat ücreti iade edilmez:

a) Bildirdiğiniz adresin hatalı, eksik veya bulunamaz olması,

b) Alıcı kişinin bildirilen teslimat saat aralığında adreste bulunmaması,

c) Alıcı kişinin ürünü teslim almayı reddetmesi,

d) Bildirilen telefon numarasının hatalı olması veya bu numaradan iletişim kurulamaması nedeniyle teslimatın tamamlanamaması.

Bu düzenleme, Mesafeli Sözleşmeler Yönetmeliği'nin 15/1-ç maddesindeki istisnaya dayanır. Hazırlanmış ve teslimata çıkarılmış bir çiçek aranjmanının ikinci kez teslime elverişli biçimde muhafazası niteliği gereği mümkün değildir.

### 6.2. Bu kuralın uygulanmadığı hâller

6.1. maddesindeki düzenleme aşağıdaki durumlarda **uygulanmaz** ve tahsil edilen bedel en geç 14 (on dört) gün içinde iade edilir:

a) Ürünün çabuk bozulabilen nitelikte **olmaması**,

b) Teslimatın gerçekleştirilememesinin **Satıcı'nın kusurundan** kaynaklanması — ürünün hazırlanmaması, teslimat aracının yola çıkmaması, adresin Satıcı tarafından hatalı işlenmesi ve benzeri hâller,

c) Teslimatın mücbir sebep nedeniyle yapılamaması.

### 6.3. İkinci teslimat denemesi

Satıcı, 6.1. maddesindeki hâllerde ürünü aynı gün içinde ikinci kez teslime elverişli bulması kaydıyla, sizinle mutabakat sağlayarak ikinci teslimat denemesi yapabilir. İkinci teslimatın ücreti tarafınıza ayrıca yansıtılır.

### 6.4. Üçüncü kişilere teslim

Satıcı, açık talimatınız bulunmaksızın ürünü apartman görevlisine, komşuya veya adreste bulunan üçüncü kişilere teslim etmekle yükümlü değildir. Bu yönde açık talimat vermeniz hâlinde teslim gerçekleşmiş sayılır ve bu teslimden doğacak sonuçlardan sorumlu olursunuz.

---

## 7. BAŞVURU KANALLARI VE İADE SÜRELERİ

### 7.1. İletişim

| Kanal | Adres |
|---|---|
| Telefon | 0532 295 93 09 |
| E-posta | durucicekorganizasyon@gmail.com |
| KEP | duru.davet@hs01.kep.tr |
| Posta | 19 Mayıs Mah. Aytekin Kotil Cad. Yıldırım Apt. No: 18H Şişli / İstanbul |

Talep ve şikâyetleriniz **en geç 3 (üç) iş günü** içinde yanıtlanır.

### 7.2. Başvurunuzda bulunması gerekenler

- Sipariş numarası
- Ad-soyadı ve iletişim bilgileri
- Talebin konusu (iptal / cayma / ayıplı ürün bildirimi)
- Ayıplı ürün bildirimlerinde ayıbı gösteren fotoğraflar
- Havale/EFT ile ödeme yapıldıysa iade edilecek IBAN

### 7.3. Bedel iadesi süreleri ve usulü

| Ödeme yöntemi | İade usulü | Süre |
|---|---|---|
| **Kredi kartı** | Ödemede kullanılan karta tek seferde iade edilir | Satıcı **14 gün** içinde bankaya iade eder |
| **Havale / EFT** | Bildirdiğiniz IBAN'a havale edilir | **14 gün** içinde |

**7.4.** Bedel iadeleri, siparişte kullandığınız ödeme aracına uygun biçimde ve **tek seferde** yapılır. Kısmi veya taksitli iade uygulanmaz.

**7.5.** Kredi kartı ile yapılan ödemelerde, Satıcı bedeli bankaya iade ettikten sonra tutarın kart hesabınıza yansıma süresi bankanızın işlem süresine bağlıdır. Satıcı bu süreden sorumlu tutulamaz. İade işleminin bankaya iletildiğine dair belge talebiniz hâlinde tarafınıza sunulur.

**7.6.** İade edilecek tutar; ürün bedeli ile — cayma hakkı kullanımında — ödediğiniz teslimat masraflarından oluşur. Kampanya kapsamında indirim veya kupon kullanılmışsa iade, fiilen ödediğiniz tutar üzerinden yapılır.

**7.7.** Siparişin iptal veya iadesi hâlinde, düzenlenmiş e-Arşiv fatura için mevzuata uygun olarak iade/iptal işlemi yapılır ve tarafınıza bildirilir.

---

## 8. UYUŞMAZLIK HÂLİNDE BAŞVURU YOLLARI

**8.1.** Talebinizin Satıcı ile çözümlenememesi hâlinde; her yıl Ticaret Bakanlığı tarafından ilan edilen parasal sınırlar dâhilinde **kendi yerleşim yerinizin** veya tüketici işleminin yapıldığı yerin bulunduğu **İlçe/İl Tüketici Hakem Heyetine**, bu sınırların üzerindeki uyuşmazlıklarda **Tüketici Mahkemesine** başvurabilirsiniz. Tüketici Mahkemesi bulunmayan yerlerde bu davalara Asliye Hukuk Mahkemeleri bakar.

**8.2.** Başvurunuzu Ticaret Bakanlığı'nın **Tüketici Bilgi Sistemi (TÜBİS)** üzerinden elektronik ortamda da yapabilirsiniz.

**8.3.** Tüketici Hakem Heyetlerine başvuru harca tabi değildir.

---

## 9. YÜRÜRLÜK

**9.1.** İşbu koşullar, Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme Formu'nun ayrılmaz parçası niteliğindedir. Aralarında çelişki bulunması hâlinde tüketici lehine olan hüküm uygulanır.

**9.2.** Satıcı, mevzuat değişikliklerine uyum sağlamak amacıyla işbu koşullarda değişiklik yapabilir. Değişiklikler Site'de yayımlandığı tarihte yürürlüğe girer ve yayımlanmasından önce verilmiş siparişlere uygulanmaz.

**9.3.** Bu metinde yer alan hiçbir hüküm, 6502 sayılı Tüketicinin Korunması Hakkında Kanun'un tüketici lehine öngördüğü hakları sınırlandıracak biçimde yorumlanamaz.

---

*Son güncelleme: 25.07.2026*`,
};

export const uyelikSozlesmesi: LegalDocument = {
  slug: "kullanim-kosullari",
  title: "Üyelik Sözleşmesi ve Kullanım Koşulları",
  description: "Site kullanımı ve üyelik hesabına ilişkin hak ve yükümlülükler.",
  updatedAt: "25.07.2026",
  version: "1.0",
  content: `# ÜYELİK SÖZLEŞMESİ VE KULLANIM KOŞULLARI

---

## MADDE 1 — TARAFLAR VE KAPSAM

**1.1.** İşbu sözleşme; bir tarafta

| | |
|---|---|
| Ticaret Unvanı | DURU DAVET ORGANİZASYON VE ÇİÇEKÇİLİK TİCARET LİMİTED ŞİRKETİ |
| Adres | 19 Mayıs Mah. Aytekin Kotil Cad. Yıldırım Apt. No: 18H Şişli / İstanbul |
| MERSİS Numarası | 0319035740400001 |
| Ticaret Sicil Numarası | 149213-5 (İstanbul Ticaret Sicili Müdürlüğü) |
| Vergi Kimlik Numarası | 3190357404 (Mecidiyeköy Vergi Dairesi Müdürlüğü) |
| ETBİS Site Kayıt Numarası | 1197646530 |
| Telefon | 0532 295 93 09 |
| E-posta | durucicekorganizasyon@gmail.com |
| KEP Adresi | duru.davet@hs01.kep.tr |

(bundan sonra **"ŞİRKET"** olarak anılacaktır) ile diğer tarafta https://dunyanincicegi.com adresli internet sitesini kullanan veya bu site üzerinde üyelik hesabı oluşturan gerçek ya da tüzel kişi (bundan sonra **"KULLANICI"** veya üyelik hesabı bulunması hâlinde **"ÜYE"**) arasında akdedilmiştir.

**1.2.** İşbu sözleşmenin 3, 6, 8, 9, 12 ve 18. maddeleri, üyelik hesabı bulunmayan ziyaretçiler dâhil olmak üzere **Site'yi kullanan herkes** hakkında uygulanır. Diğer maddeler yalnızca ÜYE'ler bakımından hüküm doğurur.

**1.3.** Site'yi kullanmakla, işbu sözleşmenin ilgili hükümlerini okuduğunuzu ve kabul ettiğinizi beyan etmiş olursunuz. Üyelik hesabı oluşturulması hâlinde sözleşmenin tamamı, kayıt işleminin elektronik ortamda tamamlanması ile kurulur.

---

## MADDE 2 — TANIMLAR

**Site:** ŞİRKET'e ait https://dunyanincicegi.com adresli internet sitesi ve buna bağlı alt alan adları.

**Hesap:** ÜYE'nin Site üzerinde oluşturduğu, e-posta adresi ve şifre ile ya da Google hesabı aracılığıyla erişilen kişisel alan.

**Ürün:** Site üzerinden satışa sunulan kesme çiçek, aranjman, buket, çelenk, saksı bitkisi, teraryum, çikolata ve benzeri mallar.

**İçerik:** Site'de yer alan her türlü metin, görsel, fotoğraf, video, tasarım, arayüz, logo, yazılım kodu ve veri tabanı.

**Mesafeli Satış Sözleşmesi:** Sipariş anında kurulan ve satış ilişkisinin esaslarını düzenleyen ayrı sözleşme.

---

## MADDE 3 — SİTENİN KULLANIMINA İLİŞKİN GENEL KOŞULLAR

**3.1.** Site'nin kullanımı ücretsizdir. Site üzerinden verilen siparişlerin bedeli, sipariş anında gösterilen tutarlardan oluşur.

**3.2.** ŞİRKET, Site'de sunulan ürün çeşidini, fiyatları, kampanyaları, teslimat bölgelerini ve teslimat ücretlerini önceden bildirimde bulunmaksızın değiştirme hakkını haizdir. Değişiklikler, yayımlandıkları tarihte yürürlüğe girer ve daha önce kurulmuş sözleşmeleri etkilemez.

**3.3.** Site'de yer alan ürün görselleri tanıtım amaçlıdır. Çiçek ve canlı bitkilerin doğal yapısı gereği teslim edilen ürün ile görsel arasında renk tonu, çiçeğin açılım durumu ve boyut bakımından makul farklılıklar bulunabilir.

**3.4.** KULLANICI, Site'yi yalnızca hukuka uygun amaçlarla ve işbu sözleşmede öngörülen sınırlar içinde kullanmayı kabul eder.

---

## MADDE 4 — ÜYELİK

**4.1. Üyelik zorunlu değildir.** Site üzerinden üyelik oluşturmaksızın (misafir olarak) sipariş verilebilir. Üyelik, yalnızca 4.4. maddesinde sayılan kolaylıklardan yararlanmak isteyen kullanıcılar için sunulmaktadır.

**4.2. Üyelik şartları:** Üyelik oluşturabilmek için **18 yaşını doldurmuş** ve fiil ehliyetini haiz olmak gerekir. Tüzel kişiler adına üyelik oluşturan kişi, tüzel kişiyi temsile yetkili olduğunu beyan eder.

**4.3. Üyeliğin kurulması:** Üyelik, aşağıdaki iki yoldan biriyle oluşturulur:

a) Ad-soyadı, e-posta adresi, telefon numarası ve şifre bilgileri girilerek,

b) **Google hesabı** ile giriş yapılarak. Bu yöntemde Google tarafından ŞİRKET'e iletilen ad-soyadı ve e-posta adresi bilgileri kullanılır.

Üyelik başvurusunun ŞİRKET tarafından elektronik ortamda onaylanmasıyla üyelik kurulmuş sayılır.

**4.4. Üyeliğin sağladığı imkânlar:**

- **Siparişlerim:** Geçmiş siparişlerin görüntülenmesi ve durum takibi
- **Adreslerim:** Teslimat adreslerinin kaydedilmesi ve sonraki siparişlerde seçilebilmesi
- **Favorilerim:** Beğenilen ürünlerin listelenmesi
- **Hesap Bilgilerim:** Kişisel bilgilerin ve iletişim tercihlerinin güncellenmesi

**4.5.** ŞİRKET, üyeliğin sağladığı imkânları geliştirme, değiştirme veya sona erdirme hakkını haizdir. Ücretli hâle getirilmesi hâlinde ÜYE'ler önceden bilgilendirilir ve onay vermeyen ÜYE'ler bakımından ilgili imkân sunulmaz.

---

## MADDE 5 — HESAP GÜVENLİĞİ VE ÜYENİN YÜKÜMLÜLÜKLERİ

**5.1.** ÜYE, kayıt sırasında ve sonrasında bildirdiği tüm bilgilerin doğru, eksiksiz ve güncel olduğunu kabul eder. Bilgilerin yanlış veya eksik olmasından doğan zararlardan ÜYE sorumludur.

**5.2.** ÜYE, şifresinin gizliliğini korumakla yükümlüdür. Şifrenin üçüncü kişilerle paylaşılması veya ÜYE'nin gerekli özeni göstermemesi sonucu Hesap üzerinden gerçekleştirilen işlemlerden ÜYE sorumludur.

**5.3.** ÜYE, Hesabına yetkisiz erişim sağlandığını öğrendiği anda ŞİRKET'i derhâl bilgilendirmekle yükümlüdür.

**5.4.** ÜYE, tek bir gerçek veya tüzel kişi adına yalnızca bir Hesap oluşturabilir. ŞİRKET, aynı kişiye ait mükerrer hesapları birleştirme veya kapatma hakkını haizdir.

**5.5.** ÜYE, Hesabını üçüncü kişilere devredemez, kiralayamaz veya kullanımına açamaz.

**5.6.** ÜYE, başka bir kişiye teslim edilmek üzere sipariş verdiği hâllerde, teslim alacak kişinin ad-soyadı, telefon numarası ve adres bilgilerini ŞİRKET'e aktarmaya yetkili olduğunu ve söz konusu kişiyi bu paylaşım hakkında bilgilendirdiğini beyan eder.

---

## MADDE 6 — YASAKLI KULLANIMLAR

**6.1.** KULLANICI, Site'yi kullanırken aşağıdaki fiillerden kaçınmakla yükümlüdür:

a) Yürürlükteki mevzuata, kamu düzenine veya genel ahlaka aykırı davranmak,

b) Başka bir kişinin kimlik, iletişim veya ödeme bilgilerini yetkisiz olarak kullanmak,

c) Site'nin altyapısına, sunucularına veya veri tabanına yetkisiz erişim sağlamaya çalışmak; güvenlik önlemlerini aşmaya yönelik girişimde bulunmak,

d) Site'nin işleyişini engelleyecek veya aşırı yük bindirecek nitelikte otomatik yazılım, bot, örümcek veya veri kazıma (scraping) aracı kullanmak,

e) Site'de yer alan İçeriği izinsiz kopyalamak, çoğaltmak, yayımlamak veya ticari amaçla kullanmak,

f) Virüs, zararlı kod veya sistemlere zarar verebilecek nitelikte veri iletmek,

g) Gerçek dışı, yanıltıcı veya kötü niyetli sipariş vermek; teslim alma niyeti bulunmaksızın sipariş oluşturmak,

h) ŞİRKET'in veya üçüncü kişilerin haklarını ihlal edecek biçimde hareket etmek.

**6.2.** ŞİRKET, 6.1. maddesine aykırılık tespit ettiği hâllerde ilgili Hesabı askıya alma veya kapatma ve doğan zararlarını talep etme hakkını haizdir.

---

## MADDE 7 — SİPARİŞ VE SATIŞ İLİŞKİSİ

**7.1.** Site üzerinden verilen siparişlere ilişkin hak ve yükümlülükler, sipariş anında kurulan **Mesafeli Satış Sözleşmesi** ile **Ön Bilgilendirme Formu** hükümlerine tabidir. Bu belgeler işbu sözleşmenin eki niteliğindedir.

**7.2.** İptal, cayma hakkı, iade ve ayıplı ürün başvurularına ilişkin usul ve süreler, Site'de yayımlanan **İptal ve İade Koşulları** metninde düzenlenmiştir.

**7.3.** İşbu sözleşme ile Mesafeli Satış Sözleşmesi arasında çelişki bulunması hâlinde, satış ilişkisine ilişkin hususlarda Mesafeli Satış Sözleşmesi hükümleri uygulanır.

**7.4.** ŞİRKET, stok durumu, tedarik koşulları veya teslimat bölgesi dışında kalma gibi haklı nedenlerle siparişi kabul etmeme hakkını haizdir. Bu hâlde tahsil edilmiş bir bedel varsa iade edilir.

---

## MADDE 8 — FİKRİ VE SINAİ MÜLKİYET HAKLARI

**8.1.** Site'de yer alan metinler, ürün fotoğrafları, grafik tasarımlar, arayüz düzenlemeleri, yazılım kodu ve veri tabanı üzerindeki mali ve manevi haklar 5846 sayılı Fikir ve Sanat Eserleri Kanunu kapsamında korunmakta olup ŞİRKET'e aittir.

**8.2.** "DURU DAVET ORGANİZASYON VE ÇİÇEKÇİLİK TİCARET LİMİTED ŞİRKETİ" ticaret unvanı İstanbul Ticaret Sicili'nde tescilli olup 6102 sayılı Türk Ticaret Kanunu'nun 39 ilâ 53. maddeleri uyarınca korunmaktadır.

**8.3.** "Dünyanın Çiçeği" ibaresi ile Site'ye ait alan adı, ŞİRKET'in ticari faaliyetinde kullandığı ayırt edici işaretlerdir. Bu işaretlerin, ŞİRKET ile karıştırılmaya yol açacak biçimde veya ŞİRKET'in ticari itibarından haksız yararlanmak amacıyla kullanılması, 6102 sayılı Türk Ticaret Kanunu'nun 54 ilâ 63. maddelerinde düzenlenen **haksız rekabet** hükümlerine aykırılık teşkil eder.

**8.4.** KULLANICI, İçeriği yalnızca Site'yi görüntüleme amacıyla ve kişisel kullanımı kapsamında görüntüleyebilir. İçeriğin tamamının veya bir kısmının ŞİRKET'in yazılı izni olmaksızın kopyalanması, çoğaltılması, işlenmesi, dağıtılması, satılması veya başka bir mecrada yayımlanması yasaktır.

**8.5.** ÜYE'nin Site'ye ilettiği yorum, öneri veya benzeri içerikler bakımından ÜYE, bu içeriğin Site'de yayımlanması ve tanıtım amacıyla kullanılması hususunda ŞİRKET'e bedelsiz kullanım hakkı tanır. ÜYE, ilettiği içerik üzerinde tasarruf yetkisini haiz olduğunu ve içeriğin üçüncü kişi haklarını ihlal etmediğini beyan eder.

---

## MADDE 9 — ÜÇÜNCÜ KİŞİ HİZMETLERİ VE BAĞLANTILAR

**9.1.** Site'nin işletilmesinde barındırma, veri tabanı, e-posta gönderimi, SMS gönderimi, ödeme ve elektronik fatura hizmetleri bakımından üçüncü kişi hizmet sağlayıcılardan yararlanılmaktadır. Bu sağlayıcıların kimlikleri ve veri işleme faaliyetleri **KVKK Aydınlatma Metni**'nde açıklanmıştır.

**9.2.** Ödeme işlemleri, ŞİRKET'in anlaşmalı olduğu ödeme kuruluşunun altyapısı üzerinden gerçekleştirilir. Kart bilgileri hiçbir surette ŞİRKET tarafından görüntülenmez, kaydedilmez veya saklanmaz.

**9.3.** Site'de üçüncü kişilere ait internet sitelerine bağlantı verilmesi hâlinde, bu sitelerin içeriğinden, gizlilik uygulamalarından ve hizmetlerinden ŞİRKET sorumlu değildir.

**9.4.** Site, KULLANICI'nın tarayıcı üzerinden onay vermesi hâlinde bildirim gönderebilir. Bu onay, tarayıcı ayarlarından her zaman geri alınabilir.

---

## MADDE 10 — KİŞİSEL VERİLERİN KORUNMASI

**10.1.** ŞİRKET, KULLANICI ve ÜYE'ye ait kişisel verileri 6698 sayılı Kişisel Verilerin Korunması Kanunu ile ilgili mevzuata uygun olarak işler.

**10.2.** İşlenen veri kategorileri, işleme amaçları ve hukuki sebepleri, aktarım yapılan taraflar, yurt dışına aktarım hâlleri, saklama süreleri ile ilgili kişinin Kanun'un 11. maddesinden doğan hakları; Site'de yayımlanan **KVKK Aydınlatma Metni** ile **Gizlilik ve Çerez Politikası**'nda ayrıntılı olarak düzenlenmiştir. Bu metinler işbu sözleşmenin ayrılmaz parçasıdır.

**10.3.** Kişisel verilere ilişkin başvurular \`durucicekorganizasyon@gmail.com\` adresine veya \`duru.davet@hs01.kep.tr\` KEP adresine iletilir.

---

## MADDE 11 — TİCARİ ELEKTRONİK İLETİLER

**11.1.** ŞİRKET; kampanya, indirim, yeni ürün ve özel gün duyurularını içeren ticari elektronik iletileri, yalnızca ÜYE'nin **önceden açık onayı** bulunması hâlinde 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun'a uygun olarak gönderir.

**11.2.** Sipariş onayı, teslimat bildirimi, fatura iletimi ve şifre sıfırlama gibi işlemin ifasına yönelik bildirimler ticari elektronik ileti niteliğinde olmadığından, bunlar için ayrıca onay aranmaz ve bu bildirimler onay geri alınsa dahi gönderilmeye devam eder.

**11.3.** ÜYE, ticari elektronik ileti onayını hiçbir gerekçe göstermeksizin ve bedel ödemeksizin her zaman geri alabilir. Geri alma; Hesap ayarlarından, iletilerde yer alan ret bağlantısı üzerinden veya İleti Yönetim Sistemi (İYS) aracılığıyla yapılabilir.

**11.4.** Onayın geri alınması talebi, ŞİRKET'e ulaşmasından itibaren **3 (üç) iş günü** içinde yerine getirilir.

---

## MADDE 12 — HİZMETİN SÜREKLİLİĞİ VE SORUMLULUĞUN SINIRLARI

**12.1.** ŞİRKET, Site'nin kesintisiz ve hatasız çalışması için makul özeni gösterir. Bakım, güncelleme, altyapı arızası veya mücbir sebep hâllerinde Site'ye erişim geçici olarak kesilebilir. ŞİRKET, planlı bakım çalışmalarını mümkün olduğu ölçüde önceden duyurur.

**12.2.** ŞİRKET, Site'nin kullanımından doğan **dolaylı zararlardan** — kâr kaybı, veri kaybı, ticari itibar zararı ve benzeri — sorumlu tutulamaz.

**12.3.** ŞİRKET'in ağır kusuru veya kastından doğan sorumluluğu ile 6502 sayılı Tüketicinin Korunması Hakkında Kanun'un tüketici lehine öngördüğü sorumluluk hâlleri işbu maddedeki sınırlamaların **kapsamı dışındadır.** İşbu madde, hiçbir surette ŞİRKET'in ayıplı ifadan veya teslimat yükümlülüğünü ihlalden doğan sorumluluğunu ortadan kaldıracak biçimde yorumlanamaz.

**12.4.** Site'de yer alan bilgilerde ŞİRKET'in iradesi dışında oluşan maddi hata bulunması hâlinde (fiyat, stok veya ürün bilgisi gibi), ŞİRKET durumu KULLANICI'ya derhâl bildirir. Bu hâlde KULLANICI siparişi iptal edebilir veya doğru bilgi üzerinden devam ettirebilir; tahsil edilmiş fazla bedel iade edilir.

---

## MADDE 13 — ÜYELİĞİN ASKIYA ALINMASI VE SONA ERMESİ

**13.1. ÜYE tarafından fesih:** ÜYE, üyeliğini hiçbir gerekçe göstermeksizin her zaman sona erdirebilir. Talep, 17. maddede belirtilen iletişim kanallarından iletilir ve **3 (üç) iş günü** içinde yerine getirilir.

**13.2. ŞİRKET tarafından fesih:** ŞİRKET, ÜYE'nin işbu sözleşmeye veya mevzuata aykırı davrandığını tespit etmesi hâlinde Hesabı askıya alabilir veya üyeliği feshedebilir. Fesih, gerekçesi ile birlikte ÜYE'ye bildirilir.

**13.3. Devam eden siparişler:** Üyeliğin hangi sebeple sona erdiğine bakılmaksızın, fesih tarihinde ifası tamamlanmamış siparişler bakımından tarafların hak ve yükümlülükleri **devam eder.** ŞİRKET, bedeli tahsil edilmiş bir siparişi üyeliğin sona ermesi gerekçesiyle ifa etmekten kaçınamaz.

**13.4. Verilerin durumu:** Üyeliğin sona ermesi hâlinde kişisel veriler derhâl silinmez; mevzuatta öngörülen saklama süreleri boyunca — özellikle 6102 sayılı Türk Ticaret Kanunu, 213 sayılı Vergi Usul Kanunu ve 6098 sayılı Türk Borçlar Kanunu'nda öngörülen süreler kapsamında — muhafaza edilir. Saklama süreleri **KVKK Aydınlatma Metni**'nde kategori bazında gösterilmiştir. Süre sonunda veriler silinir, yok edilir veya anonim hâle getirilir.

---

## MADDE 14 — SÖZLEŞME DEĞİŞİKLİKLERİ

**14.1.** ŞİRKET, işbu sözleşmede mevzuat değişikliklerine uyum veya hizmetin geliştirilmesi amacıyla değişiklik yapabilir.

**14.2.** Değişiklikler Site'de yayımlandığı tarihte yürürlüğe girer. ÜYE'nin yükümlülüklerini esaslı biçimde artıran değişiklikler, ÜYE'ye e-posta yoluyla ayrıca bildirilir.

**14.3.** Değişikliğe onay vermeyen ÜYE, üyeliğini 13.1. maddesi uyarınca sona erdirebilir. Değişiklikler, yayımlanmasından önce kurulmuş satış sözleşmelerine uygulanmaz.

---

## MADDE 15 — DEVİR

**15.1.** ÜYE, işbu sözleşmeden doğan hak ve yükümlülüklerini ŞİRKET'in yazılı izni olmaksızın üçüncü kişilere devredemez.

**15.2.** ŞİRKET, işbu sözleşmeden doğan hak ve yükümlülüklerini, ticari işletmesinin devri veya birleşme hâllerinde devralana devredebilir. Bu hâlde ÜYE'ler bilgilendirilir ve ÜYE'nin 13.1. maddesi uyarınca üyeliği sona erdirme hakkı saklıdır.

---

## MADDE 16 — MÜCBİR SEBEP

**16.1.** Deprem, sel, yangın, salgın hastalık, olağanüstü hâl, genel grev, savaş, terör olayları, resmî mercilerin kararları ile elektrik ve iletişim altyapısında ülke çapında yaşanan kesintiler mücbir sebep sayılır.

**16.2.** Mücbir sebep hâlinde tarafların yükümlülükleri, sebebin devamı süresince askıya alınır. Mücbir sebebin 30 (otuz) günden fazla sürmesi hâlinde taraflardan her biri sözleşmeyi feshedebilir.

---

## MADDE 17 — BİLDİRİMLER

**17.1.** ŞİRKET'e yapılacak bildirimler aşağıdaki kanallardan iletilir:

| Kanal | Adres |
|---|---|
| E-posta | durucicekorganizasyon@gmail.com |
| Telefon | 0532 295 93 09 |
| KEP | duru.davet@hs01.kep.tr |
| Posta | 19 Mayıs Mah. Aytekin Kotil Cad. Yıldırım Apt. No: 18H Şişli / İstanbul |

**17.2.** ŞİRKET tarafından ÜYE'ye yapılacak bildirimler, ÜYE'nin Hesabında kayıtlı e-posta adresine veya telefon numarasına gönderilir. ÜYE, bu bilgilerin güncel tutulmasından sorumludur.

**17.3.** ŞİRKET'e ulaşan talep ve şikâyetler **en geç 3 (üç) iş günü** içinde yanıtlanır.

---

## MADDE 18 — DELİL SÖZLEŞMESİ VE UYUŞMAZLIKLARIN ÇÖZÜMÜ

**18.1.** İşbu sözleşmeden doğabilecek uyuşmazlıklarda ŞİRKET'in veri tabanında, sunucularında ve elektronik sistemlerinde tuttuğu kayıtlar — üyelik kayıtları, sipariş kayıtları, onay kayıtları, e-posta ve SMS yazışmaları ile log kayıtları — 6100 sayılı Hukuk Muhakemeleri Kanunu'nun 193. maddesi uyarınca geçerli delil teşkil eder. KULLANICI bu hükmü delil sözleşmesi olarak kabul eder. **Bu hüküm, KULLANICI'nın kendi delillerini sunma hakkını kısıtlamaz.**

**18.2.** KULLANICI'nın tüketici sıfatını haiz olduğu hâllerde; her yıl Ticaret Bakanlığı tarafından ilan edilen parasal sınırlar dâhilinde **kendi yerleşim yerinin** veya tüketici işleminin yapıldığı yerin bulunduğu **İlçe/İl Tüketici Hakem Heyetine**, bu sınırların üzerindeki uyuşmazlıklarda **Tüketici Mahkemesine** başvurulabilir. Tüketici Mahkemesi bulunmayan yerlerde bu davalara Asliye Hukuk Mahkemeleri bakar. Başvuru, Ticaret Bakanlığı'nın **Tüketici Bilgi Sistemi (TÜBİS)** üzerinden elektronik ortamda da yapılabilir.

**18.3.** Tüketicinin kendi yerleşim yerindeki hakem heyetine veya mahkemeye başvurma hakkı hiçbir surette sınırlandırılmamıştır. 18.4. maddesindeki yetki düzenlemesi bu hakkı ortadan kaldıracak biçimde yorumlanamaz.

**18.4.** KULLANICI'nın tüketici sıfatını haiz olmadığı, ticari veya mesleki amaçlarla hareket ettiği hâllerde doğacak uyuşmazlıklarda **İstanbul (Şişli) Mahkemeleri ve İcra Daireleri** yetkilidir.

**18.5.** İşbu sözleşmeye Türk hukuku uygulanır.

---

## MADDE 19 — YÜRÜRLÜK

**19.1.** İşbu sözleşme 19 (on dokuz) maddeden ibarettir.

**19.2.** Sözleşme, KULLANICI'nın Site'yi kullanmaya başlamasıyla — üyelik hesabı oluşturulması hâlinde ise kayıt işleminin elektronik ortamda tamamlanmasıyla — yürürlüğe girer ve üyelik devam ettiği sürece hüküm doğurur.

**19.3.** Sözleşmenin bir nüshası, üyelik onayı ile birlikte ÜYE'nin bildirdiği e-posta adresine gönderilir ve Hesabında erişilebilir tutulur.

**19.4.** Sözleşmenin herhangi bir hükmünün mevzuat değişikliği veya yargı kararı ile geçersiz sayılması, diğer hükümlerin geçerliliğini etkilemez.

**19.5.** İşbu sözleşmede yer alan hiçbir hüküm, 6502 sayılı Tüketicinin Korunması Hakkında Kanun'un tüketici lehine öngördüğü hakları sınırlandıracak biçimde yorumlanamaz.

---

*Son güncelleme: 25.07.2026*`,
};

export const kvkkAydinlatmaMetni: LegalDocument = {
  slug: "kvkk",
  title: "KVKK Aydınlatma Metni",
  description: "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni.",
  updatedAt: "25.07.2026",
  version: "1.0",
  content: `# KİŞİSEL VERİLERİN KORUNMASI VE İŞLENMESİ HAKKINDA AYDINLATMA METNİ

İşbu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu'nun ("KVKK") 10. maddesi ile Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ uyarınca hazırlanmıştır.

---

## 1. VERİ SORUMLUSUNUN KİMLİĞİ

KVKK uyarınca veri sorumlusu:

| | |
|---|---|
| Ticaret Unvanı | DURU DAVET ORGANİZASYON VE ÇİÇEKÇİLİK TİCARET LİMİTED ŞİRKETİ |
| Adres | 19 Mayıs Mah. Aytekin Kotil Cad. Yıldırım Apt. No: 18H Şişli / İstanbul |
| MERSİS Numarası | 0319035740400001 |
| Ticaret Sicil Numarası | 149213-5 (İstanbul Ticaret Sicili Müdürlüğü) |
| Vergi Kimlik Numarası | 3190357404 (Mecidiyeköy Vergi Dairesi Müdürlüğü) |
| ETBİS Site Kayıt Numarası | 1197646530 |
| İnternet Sitesi | https://dunyanincicegi.com |
| Telefon | 0532 295 93 09 |
| **KVKK Başvuru E-postası** | **durucicekorganizasyon@gmail.com** |
| KEP Adresi | duru.davet@hs01.kep.tr |

Metinde geçen **"Şirket"** ifadesi yukarıda bilgileri yer alan veri sorumlusunu, **"Site"** ifadesi https://dunyanincicegi.com adresli internet sitesini ifade eder.

---

## 2. İŞLENEN KİŞİSEL VERİLER

Şirket, aşağıda kategori bazında gösterilen kişisel verileri işlemektedir. Liste, Site'nin fiilen topladığı verilerle sınırlıdır.

### 2.1. Üyelik Verileri *(yalnızca üyelik oluşturan kişiler)*

| Veri | Açıklama |
|---|---|
| Ad-soyadı | Üyelik kaydında veya Google hesabından alınır |
| E-posta adresi | Giriş bilgisi ve bildirim adresi |
| Telefon numarası | İletişim ve sipariş bildirimleri |
| Şifre | **Geri döndürülemez biçimde şifrelenerek (hash)** saklanır; Şirket şifrenizi açık hâlde görüntüleyemez |
| Onay kayıtları | KVKK aydınlatma onayı ve ticari elektronik ileti onayı bilgisi |
| Kayıt tarihi | Üyeliğin oluşturulduğu an |

### 2.2. Sipariş ve Müşteri İşlem Verileri

| Veri | Açıklama |
|---|---|
| Sipariş numarası, tarihi ve durumu | Sipariş takibi |
| Sipariş içeriği | Ürün adı, adedi, birim ve toplam tutar |
| Ödeme bilgileri | Ödeme yöntemi ve ödeme durumu |
| Tutar bilgileri | Ara toplam, indirim, kupon kodu, teslimat ücreti, genel toplam |
| Ad-soyadı, telefon, e-posta | Sipariş veren kişinin iletişim bilgileri |
| Teslimat adresi | Açık adres, il, ilçe |
| Teslimat tarihi ve saat aralığı | Seçilen teslimat zamanı |
| Sipariş notu | Serbest metin alanı *(bkz. Madde 6)* |
| Kart mesajı | Ürünle birlikte iletilen mesaj — serbest metin alanı *(bkz. Madde 6)* |
| Kurye ve takip bilgileri | Teslimatı yapan kişi ve takip numarası |

**Şirket kredi kartı bilgilerinizi hiçbir surette görüntülemez, kaydetmez veya saklamaz.** Kart bilgileri doğrudan anlaşmalı ödeme kuruluşunun altyapısında işlenir.

### 2.3. Fatura ve Mali Veriler

| Veri | Açıklama |
|---|---|
| Fatura tipi | Bireysel veya kurumsal |
| T.C. Kimlik Numarası | Yalnızca bireysel fatura talep edilmesi hâlinde ve **isteğe bağlı** olarak |
| Vergi Kimlik Numarası, vergi dairesi, firma unvanı | Yalnızca kurumsal fatura talep edilmesi hâlinde |
| Fatura numarası, ETTN, fatura durumu | e-Arşiv fatura kayıtları |

### 2.4. Kayıtlı Adres Verileri *(yalnızca üyeler)*

Adres başlığı, teslim alacak kişinin ad-soyadı ve telefon numarası, il, ilçe, açık adres ve varsayılan adres bilgisi.

### 2.5. Teknik ve İşlem Güvenliği Verileri

IP adresi, tarayıcı ve cihaz bilgisi, oturum bilgileri, Site içi gezinme kayıtları, işlem log kayıtları ve çerezler aracılığıyla toplanan veriler. Çerezlere ilişkin ayrıntılı bilgi **Gizlilik ve Çerez Politikası**'nda yer almaktadır.

### 2.6. Tarayıcı Bildirim Verileri *(yalnızca onay verilmesi hâlinde)*

Tarayıcı bildirim aboneliği için gerekli teknik uç nokta (endpoint) ve şifreleme anahtarları. Bu veri kişiyi doğrudan tanımlamaz fakat cihazla ilişkilendirilebilir niteliktedir.

### 2.7. Talep ve Şikâyet Verileri

Şirket'e iletilen talep, şikâyet ve başvuruların içeriği ile bunlara ilişkin yazışma kayıtları; ayıplı ürün bildirimlerinde gönderilen fotoğraflar.

---

## 3. KİŞİSEL VERİLERİN İŞLENME AMAÇLARI VE HUKUKİ SEBEPLERİ

Kişisel verileriniz, aşağıda amaç bazında gösterilen hukuki sebeplere dayanılarak işlenmektedir.

### 3.1. Sözleşmenin kurulması ve ifası

*Hukuki sebep: KVKK m.5/2-c — Sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması*

- Siparişin alınması, hazırlanması ve teslim edilmesi
- Teslimat tarih ve saatinin planlanması
- Görsel onay sürecinin yürütülmesi ve sipariş durumunun bildirilmesi
- Ödemenin tahsili ve doğrulanması
- İptal, iade ve cayma taleplerinin yerine getirilmesi
- Üyelik hesabının oluşturulması ve yönetilmesi
- Kayıtlı adreslerin ve favori listesinin tutulması

### 3.2. Hukuki yükümlülüklerin yerine getirilmesi

*Hukuki sebep: KVKK m.5/2-ç — Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi için zorunlu olması*

- e-Arşiv faturanın düzenlenmesi, iletilmesi ve gerektiğinde iptali
- 213 sayılı Vergi Usul Kanunu ve 6102 sayılı Türk Ticaret Kanunu uyarınca defter ve belgelerin saklanması
- 6502 sayılı Tüketicinin Korunması Hakkında Kanun kapsamındaki bilgilendirme ve kayıt tutma yükümlülükleri
- Yetkili kamu kurum ve kuruluşlarının mevzuata dayalı taleplerinin karşılanması

### 3.3. Kanunlarda açıkça öngörülmesi

*Hukuki sebep: KVKK m.5/2-a*

- 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun kapsamındaki kayıt ve bilgilendirme yükümlülükleri
- ETBİS bildirim yükümlülükleri

### 3.4. Meşru menfaat

*Hukuki sebep: KVKK m.5/2-f — İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla veri sorumlusunun meşru menfaatleri*

- Site ve sistem güvenliğinin sağlanması, yetkisiz erişimin önlenmesi
- Dolandırıcılık ve kötüye kullanımın tespiti ve önlenmesi
- Hizmet kalitesinin ölçülmesi ve operasyonun iyileştirilmesi
- Talep ve şikâyetlerin yönetilmesi

### 3.5. Hakkın tesisi ve korunması

*Hukuki sebep: KVKK m.5/2-e — Bir hakkın tesisi, kullanılması veya korunması için veri işlemenin zorunlu olması*

- Uyuşmazlık hâlinde delil teşkil edecek sipariş, onay ve yazışma kayıtlarının muhafazası
- Tüketici hakem heyeti ve mahkeme süreçlerinin yürütülmesi

### 3.6. Açık rıza

*Hukuki sebep: KVKK m.5/1 — İlgili kişinin açık rızası*

- **Ticari elektronik ileti gönderimi:** Kampanya, indirim, yeni ürün ve özel gün duyurularının SMS veya e-posta ile iletilmesi
- **Pazarlama amaçlı profilleme ve reklam:** Yeniden pazarlama (retargeting) ve benzer hedef kitle (lookalike) çalışmaları
- **Zorunlu olmayan çerezler:** Analitik ve pazarlama çerezleri
- **Tarayıcı bildirimleri**
- **Bu amaçlarla yurt dışına veri aktarımı** *(bkz. Madde 5)*

Bu amaçlara ilişkin rızanız, hizmetin sunulması için şart değildir. Rızanızı vermemeniz veya sonradan geri almanız hâlinde alışveriş yapmaya devam edebilirsiniz; yalnızca yukarıda sayılan faaliyetler gerçekleştirilmez.

---

## 4. KİŞİSEL VERİLERİN TOPLANMA YÖNTEMİ

Kişisel verileriniz;

a) Site üzerindeki üyelik, sipariş, adres ve iletişim formlarını doldurmanız suretiyle **doğrudan sizden**,

b) **Google hesabınızla** giriş yapmayı seçmeniz hâlinde Google tarafından iletilen ad-soyadı ve e-posta bilgisi aracılığıyla,

c) Telefon, e-posta veya WhatsApp yoluyla Şirket ile iletişime geçmeniz hâlinde bu kanallardan,

d) Site'yi kullanımınız sırasında **çerezler ve benzeri teknolojiler** aracılığıyla otomatik olarak,

e) Bir başkası tarafından size gönderilmek üzere sipariş verilmesi hâlinde **siparişi veren kişiden** *(bkz. Madde 7)*

toplanmaktadır.

---

## 5. KİŞİSEL VERİLERİN AKTARILDIĞI TARAFLAR VE AKTARIM AMAÇLARI

Şirket, hizmetin sunulabilmesi için aşağıda açıkça belirtilen taraflarla çalışmaktadır. Bu taraflar, verilerinizi yalnızca Şirket'in talimatları doğrultusunda ve belirtilen amaçlarla işler.

### 5.1. Yurt içindeki alıcılar

| Alıcı | Aktarım amacı | Hukuki sebep |
|---|---|---|
| **Kolayentegrasyon Teknoloji A.Ş.** (Kolaysoft) | e-Arşiv faturanın düzenlenmesi ve tarafınıza iletilmesi | KVKK m.5/2-ç |
| **NetGSM İletişim ve Bilgi Teknolojileri A.Ş.** | Sipariş, teslimat ve görsel onay SMS'lerinin gönderilmesi | KVKK m.5/2-c |
| **Anlaşmalı ödeme kuruluşu** | Ödemenin tahsili ve doğrulanması | KVKK m.5/2-c |
| Anlaşmalı kurye/kargo firmaları | Teslimatın yapılması *(yalnızca Şirket kendi teslimatını yapmadığı hâllerde)* | KVKK m.5/2-c |
| Mali müşavir / muhasebe hizmeti sağlayıcısı | Mali kayıtların tutulması ve beyanların hazırlanması | KVKK m.5/2-ç |
| Yetkili kamu kurum ve kuruluşları | Mevzuata dayalı taleplerin karşılanması | KVKK m.5/2-a, m.5/2-ç |
| Hukuk ve danışmanlık hizmeti sağlayıcıları | Uyuşmazlık hâlinde hakkın korunması | KVKK m.5/2-e |

### 5.2. Yurt dışındaki alıcılar

Site'nin teknik altyapısı, yurt dışında yerleşik hizmet sağlayıcılar üzerinde çalışmaktadır. Bu nedenle aşağıdaki aktarımlar **yurt dışına aktarım** niteliğindedir:

| Alıcı | Aktarım amacı | Aktarılan veriler |
|---|---|---|
| **Supabase Inc.** | Veri tabanı ve kimlik doğrulama altyapısı | Üyelik, sipariş, adres ve fatura verileri |
| **Vercel Inc.** | Site'nin barındırılması ve sunulması | Teknik ve işlem güvenliği verileri |
| **Resend (Plus Five Five, Inc.)** | Sipariş onayı, fatura ve bildirim e-postalarının gönderilmesi | Ad-soyadı, e-posta adresi, sipariş bilgileri |
| **Google LLC** | Google hesabı ile giriş imkânı | Ad-soyadı, e-posta adresi |
| **Google LLC** *(onay verilmesi hâlinde)* | Analitik ölçüm (Google Analytics, Google Tag Manager) ve reklam faaliyetleri | Teknik veriler, çerez tanımlayıcıları, gezinme kayıtları |
| **Meta Platforms, Inc.** *(onay verilmesi hâlinde)* | Reklam ve yeniden pazarlama faaliyetleri (Meta Pixel) | Teknik veriler, çerez tanımlayıcıları, gezinme kayıtları |
| Tarayıcı bildirim servisleri *(onay verilmesi hâlinde)* | Tarayıcı bildirimlerinin iletilmesi | Bildirim aboneliği teknik verileri |

### 5.3. Yurt dışına aktarımın hukuki dayanağı

Yurt dışına aktarımlar, KVKK'nın 9. maddesinde öngörülen şartlar çerçevesinde gerçekleştirilir:

**a) Zorunlu altyapı aktarımları** (Supabase, Vercel, Resend, Google ile giriş): Bu aktarımlar hizmetin teknik olarak sunulabilmesi için zorunludur. Şirket, bu aktarımlar bakımından KVKK m.9'da öngörülen uygun güvenceleri — Kişisel Verileri Koruma Kurulu tarafından ilan edilen **standart sözleşme** dâhil olmak üzere — tesis etmek üzere gerekli adımları atmaktadır. Kurul tarafından ilgili ülke veya sektör hakkında yeterlilik kararı bulunması hâlinde aktarım bu karara dayanılarak yapılır.

**b) Pazarlama ve analitik amaçlı aktarımlar** (Google Analytics, Google Tag Manager, Meta Pixel, tarayıcı bildirimleri): Bu aktarımlar **yalnızca açık rızanız bulunması hâlinde** gerçekleştirilir. Rıza vermemeniz veya rızanızı geri almanız hâlinde bu aktarımlar yapılmaz ve alışveriş imkânınız etkilenmez.

Yurt dışına aktarıma ilişkin açık rızanız, ayrı bir **Açık Rıza Metni** ile ve diğer onaylardan bağımsız biçimde alınmaktadır.

---

## 6. SERBEST METİN ALANLARI VE ÖZEL NİTELİKLİ VERİLER

**6.1.** Şirket, faaliyetinin niteliği gereği KVKK'nın 6. maddesinde sayılan **özel nitelikli kişisel verileri toplamayı amaçlamaz** ve bu amaçla herhangi bir alan bulundurmaz.

**6.2.** Bununla birlikte **kart mesajı** ve **sipariş notu** alanları serbest metin alanlarıdır. Bu alanlara girilen bilgiler, siparişi veren kişinin kendi iradesiyle yazdığı içeriklerden oluşur ve niteliği gereği sağlık durumu, dinî inanç veya benzeri özel nitelikli bilgilere dolaylı olarak işaret edebilir.

**6.3.** Bu alanlara **özel nitelikli kişisel veri girilmemesi** önerilir. Girilmesi hâlinde söz konusu bilgiler yalnızca siparişin ifası amacıyla — kart mesajının ürünle birlikte iletilmesi ve teslimatın gerçekleştirilmesi amacıyla — işlenir; başka hiçbir amaçla kullanılmaz, analiz edilmez ve pazarlama faaliyetlerine konu edilmez.

**6.4.** T.C. Kimlik Numarası özel nitelikli kişisel veri değildir; yalnızca bireysel fatura düzenlenebilmesi amacıyla ve isteğe bağlı olarak talep edilir. Bildirilmemesi hâlinde fatura, mevzuata uygun biçimde kimlik numarası olmaksızın düzenlenir.

---

## 7. BAŞKA BİR KİŞİYE GÖNDERİLEN SİPARİŞLER

**7.1.** Site üzerinden, başka bir kişiye teslim edilmek üzere sipariş verilebilir. Bu hâlde siparişi veren kişi, teslim alacak kişinin ad-soyadı, telefon numarası ve adres bilgilerini Şirket'e bildirir.

**7.2.** Siparişi veren kişi, bu bilgileri paylaşmaya yetkili olduğunu ve teslim alacak kişiyi bu paylaşım hakkında bilgilendirdiğini beyan etmiş sayılır.

**7.3.** Şirket, teslim alacak kişiye gönderdiği teslimat bildirimi ile birlikte **işbu aydınlatma metnine erişim bağlantısını** iletir.

**7.4.** Teslim alacak kişinin verileri **yalnızca teslimatın gerçekleştirilmesi amacıyla** işlenir. Bu kişinin verileri, kendisinin ayrıca açık rızası bulunmaksızın pazarlama faaliyetlerinde, profillemede veya reklam çalışmalarında kullanılmaz.

**7.5.** Teslim alacak kişi de 9. maddede sayılan hakların tamamına sahiptir ve 10. maddedeki usulle başvuruda bulunabilir.

---

## 8. KİŞİSEL VERİLERİN SAKLANMA SÜRELERİ

Kişisel verileriniz, işleme amacının gerektirdiği süre ile mevzuatta öngörülen asgari süreler dikkate alınarak aşağıdaki süreler boyunca saklanır:

| Veri kategorisi | Saklama süresi | Dayanak |
|---|---|---|
| Fatura ve mali kayıtlar | **10 yıl** | TTK m.82, VUK m.253 |
| Sipariş ve sözleşme kayıtları | İfadan itibaren **10 yıl** | TBK m.146 (genel zamanaşımı) |
| Üyelik hesabı verileri | Üyelik süresince ve feshinden itibaren **10 yıl** | TBK m.146 |
| Teslimat ve kurye kayıtları | **10 yıl** | TBK m.146 |
| Talep ve şikâyet kayıtları | Talebin sonuçlanmasından itibaren **10 yıl** | TBK m.146 |
| Ticari elektronik ileti onay kayıtları | Onayın geri alınmasından itibaren **1 yıl** | Ticari İletişim ve Ticari Elektronik İletiler Hakkında Yönetmelik m.13 |
| Pazarlama ve profilleme verileri | **Açık rıza geri alınana kadar** | KVKK m.5/1 |
| Tarayıcı bildirim abonelikleri | Onay geri alınana veya abonelik geçersizleşene kadar | KVKK m.5/1 |
| Teknik log ve işlem güvenliği kayıtları | **2 yıl** | KVKK m.5/2-f, m.12 |
| Çerez verileri | Çerez türüne göre değişir | Bkz. Gizlilik ve Çerez Politikası |

Saklama süresi sona eren kişisel veriler; Şirket'in periyodik imha süreci kapsamında silinir, yok edilir veya geri döndürülemez biçimde anonim hâle getirilir.

Bir uyuşmazlık, denetim veya soruşturma bulunması hâlinde ilgili veriler, süreç sonuçlanıncaya ve kanun yolları tükeninceye kadar saklanmaya devam eder.

---

## 9. İLGİLİ KİŞİ OLARAK HAKLARINIZ

KVKK'nın 11. maddesi uyarınca Şirket'e başvurarak:

**a)** Kişisel verilerinizin işlenip işlenmediğini öğrenme,

**b)** İşlenmişse buna ilişkin bilgi talep etme,

**c)** İşlenme amacını ve verilerin amaca uygun kullanılıp kullanılmadığını öğrenme,

**ç)** Yurt içinde veya yurt dışında verilerin aktarıldığı üçüncü kişileri bilme,

**d)** Verilerin eksik veya yanlış işlenmiş olması hâlinde düzeltilmesini isteme,

**e)** KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde verilerin silinmesini veya yok edilmesini isteme,

**f)** (d) ve (e) bentleri uyarınca yapılan işlemlerin, verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,

**g)** İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme,

**h)** Kişisel verilerinizin kanuna aykırı işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme

haklarına sahipsiniz.

Ayrıca ticari elektronik ileti ve pazarlama faaliyetlerine ilişkin **açık rızanızı hiçbir gerekçe göstermeksizin ve bedel ödemeksizin her zaman geri alabilirsiniz.**

---

## 10. BAŞVURU USULÜ

**10.1.** Haklarınızı kullanmak için Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ'e uygun olarak aşağıdaki kanallardan başvurabilirsiniz:

| Kanal | Adres |
|---|---|
| E-posta | **durucicekorganizasyon@gmail.com** |
| KEP | duru.davet@hs01.kep.tr |
| Yazılı başvuru (posta veya elden) | 19 Mayıs Mah. Aytekin Kotil Cad. Yıldırım Apt. No: 18H Şişli / İstanbul |

**10.2.** Başvurunuzda aşağıdaki bilgilerin bulunması zorunludur:

- Ad-soyadınız ve yazılı başvuruda imzanız
- Türkiye Cumhuriyeti vatandaşı iseniz T.C. Kimlik Numaranız; değilseniz uyruğunuz, pasaport numaranız veya varsa kimlik numaranız
- Tebligata esas yerleşim yeri veya iş yeri adresiniz
- Varsa bildirime esas elektronik posta adresiniz, telefon ve faks numaranız
- Talep konunuz

**10.3.** Konuya ilişkin bilgi ve belgelerin başvuruya eklenmesi, talebin daha hızlı sonuçlandırılmasını sağlar.

**10.4.** Şirket, başvurunuzu talebin niteliğine göre **en kısa sürede ve her hâlde en geç 30 (otuz) gün** içinde ücretsiz olarak sonuçlandırır. İşlemin ayrıca bir maliyet gerektirmesi hâlinde, Kurul tarafından belirlenen tarifedeki ücret alınabilir.

**10.5.** Başvurunuz, kimliğinizin tespit edilememesi hâlinde sonuçlandırılamaz. Bu nedenle Şirket, gerekli olması hâlinde kimlik doğrulaması amacıyla ek bilgi talep edebilir. Bu kapsamda talep edilen bilgiler, yalnızca başvurunun değerlendirilmesi amacıyla kullanılır.

**10.6.** Başvurunuzun reddedilmesi, verilen cevabı yetersiz bulmanız veya süresinde cevap verilmemesi hâllerinde; cevabı öğrendiğiniz tarihten itibaren **30 gün** ve her hâlde başvuru tarihinden itibaren **60 gün** içinde **Kişisel Verileri Koruma Kurulu'na** şikâyette bulunabilirsiniz.

---

## 11. VERİ GÜVENLİĞİ TEDBİRLERİ

Şirket, KVKK'nın 12. maddesi uyarınca kişisel verilerin hukuka aykırı işlenmesini ve verilere hukuka aykırı erişilmesini önlemek ile verilerin muhafazasını sağlamak amacıyla uygun güvenlik düzeyini temin etmeye yönelik tedbirleri almaktadır. Bu kapsamda:

- Site ve tüm veri iletişimi **SSL/TLS şifreleme** ile korunur
- Üyelik şifreleri **geri döndürülemez biçimde şifrelenerek (hash)** saklanır; Şirket şifreleri açık hâlde görüntüleyemez
- Veri tabanı erişimi **satır düzeyinde güvenlik politikaları** ile kısıtlanmıştır
- Yönetim paneline erişim kimlik doğrulaması ile sınırlandırılmıştır ve yetkisiz erişim denemeleri kayıt altına alınır
- Müşteri kayıtları üzerinde **kalıcı silmeyi engelleyen veri tabanı koruması** uygulanır; böylece kazara veya yetkisiz veri kaybı önlenir
- Kredi kartı bilgileri Şirket sistemlerinde hiçbir aşamada tutulmaz
- Veri işleyenlerle yapılan sözleşmelerde gizlilik ve veri güvenliği yükümlülükleri düzenlenir

---

## 12. OTOMATİK SİSTEMLERLE ANALİZ

**12.1.** Şirket, siparişlerin kabulü, iptali veya fiyatlandırılması gibi hukuki sonuç doğuran kararları **münhasıran otomatik sistemlere dayanarak** almaz. Bu nitelikteki kararlar insan değerlendirmesiyle verilir.

**12.2.** Açık rızanız bulunması hâlinde, ilgi alanlarınıza uygun reklam gösterilmesi amacıyla gezinme ve alışveriş verileriniz otomatik olarak analiz edilebilir (profilleme). Bu analiz yalnızca reklam gösterimine ilişkindir; fiyat, hizmet koşulları veya siparişinizin kabulü üzerinde hiçbir etkisi yoktur.

**12.3.** Profillemeye ilişkin rızanızı her zaman geri alabilirsiniz.

---

## 13. AYDINLATMA METNİNDE YAPILACAK DEĞİŞİKLİKLER

**13.1.** Şirket, mevzuat değişiklikleri, veri işleme faaliyetlerinde meydana gelen değişiklikler veya kullanılan hizmet sağlayıcıların güncellenmesi hâlinde işbu metni güncelleyebilir.

**13.2.** Güncel metin her zaman Site üzerinde yayımlanır. Esaslı değişiklikler, üyelere e-posta yoluyla ayrıca bildirilir.

**13.3.** Yeni bir işleme amacı eklenmesi ve bunun açık rıza gerektirmesi hâlinde, rızanız ayrıca ve açıkça talep edilir; mevcut rızalar yeni amaçlar için kullanılmaz.

---

*Son güncelleme: 25.07.2026*`,
};

export const acikRizaMetni: LegalDocument = {
  slug: "acik-riza-metni",
  title: "Açık Rıza Metni",
  description: "Yurt dışına veri aktarımı ve pazarlama amaçlı veri işlemeye ilişkin açık rıza metni.",
  updatedAt: "25.07.2026",
  version: "1.0",
  content: `# AÇIK RIZA METNİ

*Yurt Dışına Veri Aktarımı ve Pazarlama Amaçlı Veri İşleme*

---

## 1. AMAÇ VE KAPSAM

**1.1.** İşbu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu'nun ("KVKK") 5. maddesinin birinci fıkrası ile 9. maddesi uyarınca, aşağıda ayrı ayrı belirtilen işleme faaliyetleri bakımından **açık rızanızın** alınması amacıyla düzenlenmiştir.

**1.2.** Veri sorumlusu, **DURU DAVET ORGANİZASYON VE ÇİÇEKÇİLİK TİCARET LİMİTED ŞİRKETİ**'dir (MERSİS: 0319035740400001, 19 Mayıs Mah. Aytekin Kotil Cad. Yıldırım Apt. No: 18H Şişli / İstanbul). Metinde kısaca **"Şirket"** olarak anılacaktır.

**1.3.** İşlenen kişisel veriler, işleme amaçları, hukuki sebepleri, aktarım yapılan taraflar ve saklama süreleri hakkında ayrıntılı bilgi **KVKK Aydınlatma Metni**'nde yer almaktadır. İşbu rıza beyanı, söz konusu aydınlatmanın okunduğu varsayımına dayanır.

**1.4.** İşbu metinde yer alan rızalar **birbirinden bağımsızdır.** Herhangi birini vermeniz diğerini vermek zorunda olduğunuz anlamına gelmez; her biri ayrı ayrı verilebilir ve ayrı ayrı geri alınabilir.

---

## 2. RIZANIZIN KONUSU

### 2.1. Pazarlama ve Analitik Amaçlı Yurt Dışına Veri Aktarımı

Şirket, reklam ve ölçümleme faaliyetlerini yurt dışında yerleşik hizmet sağlayıcılar aracılığıyla yürütmektedir. Bu faaliyetler kapsamında aşağıdaki aktarımlar gerçekleştirilir:

| Aktarım yapılan taraf | Amaç | Aktarılan veriler |
|---|---|---|
| **Google LLC** *(Google Analytics, Google Tag Manager)* | Site kullanımının ölçümlenmesi, ziyaretçi davranışının analiz edilmesi, reklam performansının değerlendirilmesi | Çerez tanımlayıcıları, IP adresi, tarayıcı ve cihaz bilgisi, Site içi gezinme kayıtları |
| **Google LLC** *(Google Ads)* | Yeniden pazarlama (retargeting) ve benzer hedef kitle (lookalike) reklamlarının gösterilmesi | Çerez tanımlayıcıları, gezinme ve alışveriş davranışı verileri |
| **Meta Platforms, Inc.** *(Meta Pixel — Facebook, Instagram)* | Yeniden pazarlama ve benzer hedef kitle reklamlarının gösterilmesi, reklam performansının ölçümlenmesi | Çerez tanımlayıcıları, gezinme ve alışveriş davranışı verileri |
| **Plus Five Five, Inc.** *(Resend)* | Kampanya ve duyuru içerikli **pazarlama** e-postalarının iletilmesi | Ad-soyadı, e-posta adresi |

Bu şirketler **Amerika Birleşik Devletleri'nde** yerleşiktir. Kişisel Verileri Koruma Kurulu tarafından bu ülke hakkında verilmiş bir **yeterlilik kararı bulunmamaktadır.** Bu nedenle söz konusu aktarımlar, KVKK'nın 9. maddesi çerçevesinde **açık rızanıza** dayanılarak gerçekleştirilir.

Verilerinizin yurt dışına aktarılması hâlinde, aktarım yapılan ülkenin veri koruma mevzuatının Türkiye'deki korumadan farklı olabileceğini ve verilerinize ilgili ülke mevzuatı uyarınca yetkili mercilerce erişilebilmesinin mümkün olduğunu bilerek rıza verdiğinizi kabul edersiniz.

### 2.2. Pazarlama Amaçlı Profilleme

Şirket, ilgi alanlarınıza uygun ürün ve kampanya önerileri sunabilmek amacıyla; Site'de görüntülediğiniz ürünler, sepete eklediğiniz ürünler, tamamladığınız siparişler ve gezinme davranışınızı otomatik sistemler aracılığıyla analiz edebilir.

Bu analizin kapsamı ve sınırları:

- Analiz **yalnızca hangi reklamın gösterileceğinin belirlenmesine** ilişkindir.
- Ürün fiyatları, teslimat ücretleri, kampanya koşulları veya siparişinizin kabul edilip edilmemesi üzerinde **hiçbir etkisi yoktur.**
- Hakkınızda hukuki sonuç doğuran hiçbir karar münhasıran otomatik sistemlere dayanılarak alınmaz.

---

## 3. RIZA VERMEMENİN SONUÇLARI

**3.1.** İşbu metinde yer alan rızaların hiçbiri, Site'yi kullanmanız veya sipariş vermeniz için **şart değildir.**

**3.2.** Rıza vermemeniz veya sonradan geri almanız hâlinde:

- Site'yi kullanmaya ve sipariş vermeye aynı koşullarla devam edersiniz,
- Ürün fiyatlarınız, teslimat ücretiniz ve hizmet koşullarınız hiçbir şekilde değişmez,
- Üyeliğiniz ve kayıtlı bilgileriniz etkilenmez,
- Sipariş onayı, teslimat bildirimi, görsel onay, fatura iletimi ve şifre sıfırlama gibi **işlemin ifasına yönelik bildirimler almaya devam edersiniz.** Bu bildirimler pazarlama niteliğinde olmadığından rızaya bağlı değildir.

**3.3.** Şirket, rıza vermemeniz sebebiyle size farklı bir muamele uygulamaz.

---

## 4. RIZANIN GERİ ALINMASI

**4.1.** Verdiğiniz rızayı, **hiçbir gerekçe göstermeksizin ve bedel ödemeksizin her zaman** geri alabilirsiniz.

**4.2.** Geri alma işlemini aşağıdaki kanallardan gerçekleştirebilirsiniz:

| Kanal | Adres / Yöntem |
|---|---|
| Üyelik hesabı | *Hesabım → Hesap Bilgilerim* bölümündeki iletişim tercihleri |
| E-posta | durucicekorganizasyon@gmail.com |
| KEP | duru.davet@hs01.kep.tr |
| Çerez rızası | Site'deki çerez tercihleri panelinden |

**4.3.** Geri alma talebiniz, Şirket'e ulaşmasından itibaren **en geç 3 (üç) iş günü** içinde yerine getirilir.

**4.4.** Rızanın geri alınması **ileriye etkilidir.** Geri alma tarihinden önce hukuka uygun biçimde gerçekleştirilmiş işleme faaliyetleri bu tarih itibarıyla sona erdirilir; ancak geçmişte yapılmış aktarımlar geriye dönük olarak geçersiz hâle gelmez. Şirket, geri alma talebiniz üzerine ilgili verilerin pazarlama amacıyla işlenmesine son verir.

---

## 5. RIZA KAYITLARININ SAKLANMASI

**5.1.** Şirket, açık rızanızın ne zaman, hangi kanaldan ve hangi kapsamda verildiğine ilişkin kayıtları, ispat yükümlülüğünü yerine getirebilmek amacıyla saklar.

**5.2.** Bu kayıtlar; rızanın verildiği tarih ve saat, işlem yapılan IP adresi, onaylanan metnin sürümü ve onay kapsamı bilgilerini içerir.

**5.3.** Rıza kayıtları, rızanın geri alınmasından itibaren **1 (bir) yıl** süreyle saklandıktan sonra silinir, yok edilir veya anonim hâle getirilir.

---

## 6. BEYAN

İşbu metni ve **KVKK Aydınlatma Metni**'ni okudum. Kişisel verilerimin, yukarıda 2. maddede ayrı ayrı belirtilen amaçlarla işlenmesine ve bu kapsamda yurt dışında yerleşik hizmet sağlayıcılara aktarılmasına, **özgür iradem ve bilgim dâhilinde**, aşağıda işaretlediğim kapsamla sınırlı olmak üzere **açık rıza veriyorum.**

---`,
};

export const ticariElektronikIleti: LegalDocument = {
  slug: "ticari-elektronik-ileti",
  title: "Ticari Elektronik İleti Onay Metni",
  description: "Kampanya ve duyuru içerikli ticari elektronik iletilere ilişkin onay metni.",
  updatedAt: "25.07.2026",
  version: "1.0",
  content: `# TİCARİ ELEKTRONİK İLETİ ONAY METNİ

İşbu metin, 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun ile Ticari İletişim ve Ticari Elektronik İletiler Hakkında Yönetmelik uyarınca hazırlanmıştır.

---

## 1. HİZMET SAĞLAYICI

| | |
|---|---|
| Ticaret Unvanı | DURU DAVET ORGANİZASYON VE ÇİÇEKÇİLİK TİCARET LİMİTED ŞİRKETİ |
| MERSİS Numarası | 0319035740400001 |
| Adres | 19 Mayıs Mah. Aytekin Kotil Cad. Yıldırım Apt. No: 18H Şişli / İstanbul |
| Telefon | 0532 295 93 09 |
| E-posta | durucicekorganizasyon@gmail.com |
| KEP Adresi | duru.davet@hs01.kep.tr |
| İnternet Sitesi | https://dunyanincicegi.com |

Metinde kısaca **"Şirket"** olarak anılacaktır.

---

## 2. ONAYIN KONUSU

**2.1.** Onayınız; Şirket tarafından aşağıdaki içeriklerin, aşağıdaki kanallar üzerinden tarafınıza iletilmesine ilişkindir.

**2.2. İleti içerikleri:**

- Kampanya, indirim ve promosyon duyuruları
- Yeni ürün ve koleksiyon tanıtımları
- Sevgililer Günü, Anneler Günü, Öğretmenler Günü ve benzeri özel gün hatırlatmaları
- Kişiye özel teklif ve fırsatlar
- Anket ve memnuniyet değerlendirme davetleri

**2.3. İletim kanalları:**

| Kanal | Kullanılan bilgi |
|---|---|
| **SMS** | Telefon numaranız |
| **E-posta** | E-posta adresiniz |

**2.4.** Onayınızı kanal bazında verebilirsiniz. Yalnızca e-posta almayı, yalnızca SMS almayı veya her ikisini birlikte seçmeniz mümkündür.

---

## 3. TİCARİ ELEKTRONİK İLETİ SAYILMAYAN BİLDİRİMLER

**3.1.** Aşağıdaki bildirimler, mevzuat uyarınca **ticari elektronik ileti niteliğinde değildir.** Bu bildirimler için onayınız aranmaz ve **onayınızı geri almanız hâlinde de gönderilmeye devam edilir**:

- Sipariş onayı ve sipariş özeti
- Ödeme bildirimi ve ödeme hatırlatması
- Görsel onay bildirimi *(hazırlanan ürünün fotoğrafının iletilmesi)*
- Sipariş durumu ve teslimat bildirimleri
- e-Arşiv faturanın iletilmesi
- İptal, iade ve cayma taleplerine ilişkin bildirimler
- Şifre sıfırlama ve hesap güvenliği bildirimleri
- Talep ve şikâyetlerinize verilen yanıtlar
- Mevzuattan doğan bilgilendirme yükümlülüklerinin yerine getirilmesine yönelik bildirimler

**3.2.** Bu bildirimler, kurulan sözleşmenin ifasına yönelik olduğundan pazarlama niteliği taşımaz.

---

## 4. ONAYIN ALINMASI VE İLETİ YÖNETİM SİSTEMİ (İYS)

**4.1.** Onayınız; Site üzerindeki üyelik formu, ödeme adımı veya hesap ayarları aracılığıyla, **olumlu irade beyanınızla** alınır. Onay, hiçbir surette önceden işaretli kutucuk yoluyla veya varsayılan kabul esasıyla alınmaz.

**4.2.** Onayınız, mevzuat gereği **İleti Yönetim Sistemi'ne (İYS)** kaydedilir. İYS, Ticaret Bakanlığı gözetiminde çalışan ve ticari elektronik ileti onaylarının merkezî olarak tutulduğu sistemdir.

**4.3.** Onaylarınızı ve ret kayıtlarınızı **https://iys.org.tr** adresi üzerinden veya İYS mobil uygulaması aracılığıyla doğrudan görüntüleyebilir, dilediğiniz zaman değiştirebilirsiniz. İYS üzerinden yaptığınız değişiklikler Şirket bakımından da bağlayıcıdır.

**4.4.** Onayınız, Şirket'ten mal veya hizmet alımının **şartı değildir.** Onay vermemeniz hâlinde alışveriş yapmaya aynı koşullarla devam edersiniz.

---

## 5. TACİR VE ESNAF BAKIMINDAN ONAY

**5.1.** 6563 sayılı Kanun'un 6. maddesinin ikinci fıkrası uyarınca, **tacir veya esnaf** olan alıcıların elektronik iletişim adreslerine önceden onay alınmaksızın ticari elektronik ileti gönderilebilir.

**5.2.** Bu hâlde de tacir veya esnafın **ret hakkı saklıdır.** Ret bildiriminde bulunulması hâlinde ileti gönderimi derhâl sona erdirilir ve ret kaydı İYS'ye işlenir.

**5.3.** Kurumsal fatura bilgileriyle işlem yapan alıcılar bakımından bu istisna uygulanabilir; buna rağmen Şirket, tacir ve esnaf alıcılardan da mümkün olduğu ölçüde açık onay almayı tercih eder.

---

## 6. RET HAKKI

**6.1.** Ticari elektronik ileti almayı **hiçbir gerekçe göstermeksizin ve bedel ödemeksizin her zaman** reddedebilirsiniz.

**6.2.** Ret bildiriminizi aşağıdaki kanallardan iletebilirsiniz:

| Kanal | Yöntem |
|---|---|
| **İYS** | https://iys.org.tr veya İYS mobil uygulaması |
| **SMS** | Gelen iletide belirtilen ret yöntemi *(kısa mesajla ret kodu gönderimi)* |
| **E-posta** | İletide yer alan abonelikten çık bağlantısı |
| **Üyelik hesabı** | *Hesabım → Hesap Bilgilerim* bölümündeki iletişim tercihleri |
| **Doğrudan başvuru** | durucicekorganizasyon@gmail.com — 0532 295 93 09 |

**6.3.** Ret talebiniz, Şirket'e ulaşmasından itibaren **en geç 3 (üç) iş günü** içinde yerine getirilir ve ret kaydı aynı süre içinde İYS'ye işlenir.

**6.4.** Ret bildirimi için tarafınızdan hiçbir ücret talep edilmez ve ret imkânı, iletinin gönderildiği kanalın ücret tarifesini aşan bir maliyet doğurmaz.

**6.5.** Ret hakkınızı kullanmanız, 3. maddede sayılan işlem bildirimlerini almanızı **engellemez.**

---

## 7. İLETİLERİN İÇERİĞİNE İLİŞKİN TAAHHÜTLER

Şirket tarafından gönderilen her ticari elektronik iletide mevzuat gereği aşağıdaki bilgiler yer alır:

- Şirket'in ticaret unvanı ve MERSİS numarası
- İletinin **ticari elektronik ileti** olduğuna dair açık ifade
- İletişim bilgileri (telefon ve e-posta)
- İndirim ve hediye içeren iletilerde bunların geçerlilik süresi ve yararlanma koşulları
- **Ret hakkının nasıl kullanılacağına ilişkin açık ve anlaşılır bilgi**

Şirket, ticari elektronik iletileri yalnızca **08:00 ilâ 23:00** saatleri arasında gönderir.

---

## 8. ONAY KAYITLARININ SAKLANMASI

**8.1.** Şirket, onayınızın alındığına ilişkin kayıtları; onayın alınma tarihi ve saati, alınma kanalı, onay kapsamı ve İYS'ye yüklenme bilgisi ile birlikte saklar.

**8.2.** Onay kayıtları, **onayın geçerliliğinin sona erdiği tarihten itibaren 1 (bir) yıl** süreyle muhafaza edilir. Bu süre, Ticari İletişim ve Ticari Elektronik İletiler Hakkında Yönetmelik'in 13. maddesinden kaynaklanmaktadır.

**8.3.** Uyuşmazlık hâlinde ilgili kayıtlar, süreç sonuçlanıncaya kadar saklanmaya devam eder.

**8.4.** Kişisel verilerinizin işlenmesine ilişkin ayrıntılı bilgi **KVKK Aydınlatma Metni**'nde yer almaktadır.

---

## 9. ŞİKÂYET HAKKI

**9.1.** Onayınız bulunmaksızın ticari elektronik ileti aldığınızı düşünüyorsanız veya ret talebiniz süresinde yerine getirilmediyse, öncelikle 1. maddedeki iletişim kanallarından Şirket'e başvurabilirsiniz.

**9.2.** Şikâyetinizi ayrıca **Ticaret Bakanlığı**'na — ilgili İl Ticaret Müdürlüğü aracılığıyla veya e-Devlet üzerinden — iletebilirsiniz.

---

## 10. BEYAN

Yukarıda 2. maddede belirtilen içeriklerin, seçtiğim kanallar üzerinden tarafıma iletilmesine; bu amaçla ad-soyadı, telefon numarası ve e-posta adresimin işlenmesine ve onayımın İleti Yönetim Sistemi'ne kaydedilmesine **özgür iradem ve bilgim dâhilinde onay veriyorum.**

Bu onayın mal veya hizmet alımının şartı olmadığını, dilediğim zaman ücretsiz olarak reddedebileceğimi biliyorum.

---`,
};

export const gizlilikVeCerezPolitikasi: LegalDocument = {
  slug: "gizlilik",
  title: "Gizlilik ve Çerez Politikası",
  description: "Sitede kullanılan çerezler ve benzeri teknolojiler hakkında bilgi.",
  updatedAt: "25.07.2026",
  version: "1.0",
  content: `# GİZLİLİK VE ÇEREZ POLİTİKASI

---

## 1. GİRİŞ

**1.1.** İşbu politika, **DURU DAVET ORGANİZASYON VE ÇİÇEKÇİLİK TİCARET LİMİTED ŞİRKETİ**'ne (MERSİS: 0319035740400001) ait https://dunyanincicegi.com adresli internet sitesinde çerezler ve benzeri teknolojilerin nasıl kullanıldığını açıklar.

**1.2.** Kişisel verilerinizin işlenmesine ilişkin kapsamlı bilgi — işleme amaçları, hukuki sebepler, aktarım yapılan taraflar, saklama süreleri ve haklarınız — **KVKK Aydınlatma Metni**'nde yer almaktadır. İşbu politika onun tamamlayıcısıdır.

**1.3.** Metinde kısaca **"Şirket"** ve **"Site"** ifadeleri kullanılacaktır.

---

## 2. ÇEREZ NEDİR

**2.1.** Çerez (cookie), bir internet sitesini ziyaret ettiğinizde tarayıcınız aracılığıyla cihazınıza kaydedilen küçük metin dosyasıdır. Çerezler, sitenin sizi tanımasını, tercihlerinizi hatırlamasını ve bazı işlevlerin çalışmasını sağlar.

**2.2.** Site ayrıca tarayıcınızın **yerel depolama (localStorage)** alanını kullanır. Yerel depolama teknik olarak çerezden farklıdır — sunucuya otomatik olarak gönderilmez — ancak verinin cihazınızda saklanması bakımından benzer sonuç doğurduğu için işbu politikada birlikte ele alınmıştır.

**2.3.** Çerezler; **oturum çerezi** (tarayıcı kapatıldığında silinir) veya **kalıcı çerez** (belirlenen süre boyunca cihazda kalır) olabilir. Ayrıca Site'nin kendisi tarafından yerleştirilen **birinci taraf** ve üçüncü kişiler tarafından yerleştirilen **üçüncü taraf** çerezler olarak ayrılır.

---

## 3. SİTEDE KULLANILAN ÇEREZLER

### 3.1. Zorunlu Çerezler — *rıza aranmaz*

Bu çerezler Site'nin çalışması için teknik olarak gereklidir. Devre dışı bırakılmaları hâlinde üyelik girişi ve sipariş işlemleri gerçekleştirilemez. Bu çerezler pazarlama amacıyla kullanılmaz ve üçüncü kişilerle paylaşılmaz.

| Ad | Tür | Amaç | Süre |
|---|---|---|---|
| \`customer_session\` | Birinci taraf, kalıcı, \`httpOnly\` | Üyelik oturumunun sürdürülmesi. \`httpOnly\` işaretli olduğundan JavaScript ile okunamaz; üretim ortamında yalnızca HTTPS üzerinden iletilir | 30 gün |
| \`admin_session\` | Birinci taraf, kalıcı, \`httpOnly\` | Yönetim paneli oturumu *(yalnızca Şirket personeli)* | 30 gün |

*Hukuki sebep: KVKK m.5/2-c (sözleşmenin ifası) ve m.5/2-f (meşru menfaat). 5809 sayılı Elektronik Haberleşme Kanunu m.51 uyarınca hizmetin sunulması için zorunlu çerezler bakımından açık rıza aranmaz.*

### 3.2. İşlevsel Yerel Depolama — *rıza aranmaz*

| Anahtar | Amaç | Süre |
|---|---|---|
| \`dunyanin-cicegi-cart\` | Sepetinizdeki ürünlerin, siteden ayrılsanız bile korunması | Siz silene kadar |
| \`dunyanin-cicegi-wishlist\` | Favori listenizin korunması | Siz silene kadar |

Bu veriler yalnızca **cihazınızda** tutulur, sunucuya otomatik olarak gönderilmez ve pazarlama amacıyla kullanılmaz. Tarayıcınızın site verilerini temizleyerek her zaman silebilirsiniz.

*Hukuki sebep: KVKK m.5/2-c — talep ettiğiniz işlevin sağlanması.*

### 3.3. Analitik Çerezler — *yalnızca onayınızla*

Site'nin nasıl kullanıldığını anlamak, hataları tespit etmek ve kullanıcı deneyimini iyileştirmek amacıyla kullanılır. Toplanan veriler toplu (istatistiksel) olarak değerlendirilir.

| Sağlayıcı | Çerez adları | Amaç | Süre |
|---|---|---|---|
| **Google Analytics** (Google LLC) | \`_ga\`, \`_ga_*\` | Ziyaretçi ve oturum sayısının ölçümlenmesi, sayfa görüntüleme istatistikleri | 2 yıla kadar |
| **Google Analytics** | \`_gid\` | Ziyaretçi ayrımı | 24 saat |
| **Google Tag Manager** (Google LLC) | — *(etiket yönetimi; kendisi çerez yerleştirmez, diğer araçları yükler)* | Ölçümleme etiketlerinin yönetilmesi | — |

*Hukuki sebep: KVKK m.5/1 — açık rıza. Bu çerezler onay verilmedikçe çalıştırılmaz.*

### 3.4. Pazarlama ve Reklam Çerezleri — *yalnızca onayınızla*

İlgi alanlarınıza uygun reklam gösterilmesi, yeniden pazarlama (retargeting) ve reklam performansının ölçülmesi amacıyla kullanılır.

| Sağlayıcı | Çerez adları | Amaç | Süre |
|---|---|---|---|
| **Meta Platforms, Inc.** (Facebook, Instagram) | \`_fbp\` | Ziyaretçinin tanınması, yeniden pazarlama, dönüşüm ölçümü | 3 aya kadar |
| **Meta Platforms, Inc.** | \`_fbc\` | Reklam tıklamasının ilişkilendirilmesi | 3 aya kadar |
| **Google LLC** (Google Ads) | \`_gcl_*\`, \`IDE\`, \`test_cookie\` | Reklam dönüşümlerinin ölçümü, yeniden pazarlama, benzer hedef kitle oluşturma | 13 aya kadar |

*Hukuki sebep: KVKK m.5/1 — açık rıza. Bu çerezler onay verilmedikçe çalıştırılmaz.*

**Bu çerezler aracılığıyla toplanan veriler, Amerika Birleşik Devletleri'nde yerleşik sağlayıcılara aktarılır.** Yurt dışına aktarım, açık rızanıza dayanılarak yapılır; ayrıntılı bilgi ve rızanın kapsamı **Açık Rıza Metni**'nde yer almaktadır.

### 3.5. Tarayıcı Bildirimleri — *yalnızca onayınızla*

Sipariş durumu ve kampanya bildirimlerinin tarayıcınız üzerinden iletilebilmesi için, tarayıcınızın bildirim servisi tarafından üretilen teknik bir abonelik kaydı (uç nokta adresi ve şifreleme anahtarları) saklanır. Bu kayıt kimliğinizi doğrudan içermez fakat cihazınızla ilişkilendirilebilir.

Bildirim iznini tarayıcı ayarlarınızdan her zaman geri alabilirsiniz.

---

## 4. ONAY VE TERCİH YÖNETİMİ

**4.1.** Site'yi ilk ziyaretinizde karşınıza gelen çerez bildirimi aracılığıyla; tüm çerezleri kabul edebilir, yalnızca zorunlu çerezlerle devam edebilir veya kategori bazında tercih belirleyebilirsiniz.

**4.2. Zorunlu çerezler dışındaki hiçbir çerez, onayınız alınmadan çalıştırılmaz.** Onay vermemeniz hâlinde Site'yi kullanmaya ve sipariş vermeye aynı koşullarla devam edersiniz; yalnızca ölçümleme ve reklam faaliyetleri gerçekleştirilmez.

**4.3.** Verdiğiniz onayı, Site'deki **çerez tercihleri** panelinden her zaman değiştirebilir veya geri alabilirsiniz. Geri alma, verme kadar kolaydır.

**4.4.** Onayınızı geri almanız hâlinde ilgili çerezler yeni oturumlarda çalıştırılmaz. Daha önce cihazınıza yerleştirilmiş çerezleri tarayıcı ayarlarınızdan silebilirsiniz.

---

## 5. TARAYICI AYARLARINDAN ÇEREZ YÖNETİMİ

Çerezleri tarayıcınızın ayarlarından da yönetebilir, silebilir veya engelleyebilirsiniz:

| Tarayıcı | Yol |
|---|---|
| **Google Chrome** | Ayarlar → Gizlilik ve güvenlik → Üçüncü taraf çerezler |
| **Mozilla Firefox** | Ayarlar → Gizlilik ve Güvenlik → Çerezler ve Site Verileri |
| **Safari (macOS)** | Safari → Tercihler → Gizlilik |
| **Safari (iOS)** | Ayarlar → Safari → Gizlilik ve Güvenlik |
| **Microsoft Edge** | Ayarlar → Çerezler ve site izinleri |

**Zorunlu çerezleri engellemeniz hâlinde üyelik girişi yapamayacağınızı ve sipariş tamamlayamayacağınızı** hatırlatmak isteriz.

Tarayıcınızda **"Do Not Track"** özelliğini etkinleştirmeniz hâlinde, bu sinyal kullanılan üçüncü taraf araçlar tarafından farklı biçimlerde yorumlanabilir. Bu nedenle Site'nin kendi çerez tercihleri panelini kullanmanız daha güvenilir bir yöntemdir.

---

## 6. ÇEREZLERLE TOPLANAN VERİLERİN AKTARILMASI

**6.1.** Zorunlu çerezler ve işlevsel yerel depolama verileri **üçüncü kişilerle paylaşılmaz.**

**6.2.** Analitik ve pazarlama çerezleri aracılığıyla toplanan veriler; onayınız bulunması hâlinde **Google LLC** ve **Meta Platforms, Inc.**'e aktarılır. Bu şirketler Amerika Birleşik Devletleri'nde yerleşiktir ve Kişisel Verileri Koruma Kurulu tarafından bu ülke hakkında verilmiş bir yeterlilik kararı bulunmamaktadır. Aktarım, KVKK m.9 çerçevesinde açık rızanıza dayanır.

**6.3.** Site'nin barındırılması ve veri tabanı hizmetleri bakımından yurt dışına yapılan aktarımlar, çerezlerden bağımsız bir konu olup **KVKK Aydınlatma Metni**'nin 5. maddesinde açıklanmıştır.

---

## 7. VERİ GÜVENLİĞİ

Site ve tüm veri iletişimi SSL/TLS ile şifrelenir. Oturum çerezleri \`httpOnly\` ve \`sameSite\` koruması ile yerleştirilir; üretim ortamında yalnızca HTTPS üzerinden iletilir. Alınan diğer teknik ve idari tedbirler **KVKK Aydınlatma Metni**'nin 11. maddesinde sayılmıştır.

---

## 8. HAKLARINIZ

Çerezler aracılığıyla işlenen kişisel verileriniz bakımından KVKK'nın 11. maddesinden doğan haklarınızın tamamına sahipsiniz. Bu haklar ve başvuru usulü **KVKK Aydınlatma Metni**'nin 9 ve 10. maddelerinde ayrıntılı olarak açıklanmıştır.

Başvurularınızı \`durucicekorganizasyon@gmail.com\` adresine veya \`duru.davet@hs01.kep.tr\` KEP adresine iletebilirsiniz.

---

## 9. POLİTİKADA YAPILACAK DEĞİŞİKLİKLER

**9.1.** Şirket, kullanılan çerezlerde veya hizmet sağlayıcılarda değişiklik olması hâlinde işbu politikayı güncelleyebilir.

**9.2.** Güncel metin her zaman Site üzerinde yayımlanır.

**9.3.** Yeni bir analitik veya pazarlama aracı eklenmesi hâlinde, bu araca ilişkin onayınız **ayrıca ve açıkça** talep edilir; mevcut onaylar yeni araçlar için geçerli sayılmaz.

---

*Son güncelleme: 25.07.2026 — Sürüm: 1.0*`,
};

export const teslimatBilgileri: LegalDocument = {
  slug: "teslimat",
  title: "Teslimat Bilgileri",
  description: "Teslimat bölgeleri, saatleri, aynı gün teslimat koşulları ve teslimat ücreti.",
  updatedAt: "25.07.2026",
  version: "1.0",
  content: `# TESLİMAT BİLGİLERİ

---

## 1. TESLİMAT BÖLGESİ

Hâlihazırda yalnızca **İstanbul ili** sınırları içinde ve Site'de aktif olarak listelenen ilçelere teslimat yapılmaktadır. Sipariş adımında teslimat adresinizin bulunduğu ilçeyi seçemiyorsanız, o bölgeye henüz hizmet verilmiyor demektir.

Şehir dışına teslimat çalışmalarımız sürmektedir. Hizmet verilen bölgeler genişledikçe Site üzerinden duyurulacaktır.

---

## 2. TESLİMAT SAATLERİ

Siparişinizi verirken teslimat tarihini ve aşağıdaki saat aralıklarından birini seçebilirsiniz:

| Saat aralığı |
|---|
| **09:00 – 12:00** |
| **12:00 – 17:00** |

Teslimat, seçtiğiniz aralık içinde gerçekleştirilir. Kurye teslimattan önce alıcıyı telefonla arayabilir.

---

## 3. AYNI GÜN TESLİMAT

**Saat 12:00'a kadar** verilen ve ödemesi tamamlanan siparişler **aynı gün** teslim edilir.

Saat 12:00'dan sonra verilen siparişlerde; teslimat adresinin konumu, trafik yoğunluğu ve günlük operasyon kapasitesi nedeniyle aynı gün teslimat **garanti edilmez.** Bu durumda siparişiniz en kısa sürede, mümkün olan ilk teslimat aralığında ulaştırılır.

### Yoğun dönemler

Resmî tatiller, dinî bayramlar ile **yılbaşı, Sevgililer Günü, Anneler Günü** gibi yoğun talep dönemlerinde teslimat saat aralıklarında ve aynı gün teslimat taahhüdünde değişiklik yapılabilir. Böyle bir durumda siparişinizi vermeden önce bilgilendirilirsiniz.

Bu dönemlerde siparişinizi mümkün olan en erken tarihte oluşturmanızı öneririz.

---

## 4. TESLİMAT ÜCRETİ

**4.1.** Teslimat ücreti, hizmet verilen bölgenin tamamında **sabit tutar** olarak uygulanır. Güncel tutar sipariş özetinde, ödemeden önce açıkça gösterilir.

**4.2.** Belirlenen tutarın üzerindeki siparişlerde **teslimat ücreti alınmayabilir.** Ücretsiz teslimat eşiği uygulanıyorsa, sepet sayfasında bu eşiğe ne kadar kaldığı gösterilir.

**4.3.** Bazı ürünler için — boyut, kırılganlık veya özel taşıma gereksinimi nedeniyle — ürüne özel teslimat ücreti uygulanabilir. Bu tutar sipariş özetinde ayrıca belirtilir.

**4.4.** Teslimat ücreti tutarı değişebilir. Değişiklikler yayımlandıkları tarihte geçerli olur ve **daha önce verilmiş siparişlere uygulanmaz.**

**4.5.** İleride teslimat ücreti mesafeye veya bölgeye göre farklılaştırılabilir. Böyle bir uygulamaya geçilmesi hâlinde de siparişinize uygulanacak tutar, **onayınızdan önce** sipariş özetinde açıkça gösterilir; onaylamadığınız hiçbir tutar tarafınıza yansıtılmaz.

---

## 5. GÖRSEL ONAY

Siparişiniz hazırlandıktan sonra, teslimata çıkılmadan önce **ürünün fotoğrafı telefonunuza SMS ile gönderilir.**

- Fotoğrafı beğenirseniz onaylayabilir,
- Geçerli bir gerekçe göstererek ürünün yeniden hazırlanmasını talep edebilirsiniz.

Görselin iletilmesinden itibaren **15 dakika** içinde bildirimde bulunmazsanız ürün onaylanmış sayılır ve teslimata çıkarılır. Bu süre, çiçeğin tazeliğini koruyarak zamanında teslim edilebilmesi için gereklidir.

Görsel onay yalnızca ürünün **tasarımına ve görünümüne** ilişkindir. Onay vermeniz, ürün solmuş veya hasarlı teslim edilirse başvuru hakkınızı ortadan kaldırmaz *(bkz. Madde 8)*.

---

## 6. BAŞKA BİR KİŞİYE GÖNDERİM

Siparişinizi başka bir kişiye gönderebilirsiniz. Bu durumda:

- Alıcının **ad-soyadı, telefon numarası ve açık adresi** doğru ve eksiksiz girilmelidir,
- Dilerseniz ürünle birlikte iletilecek bir **kart mesajı** ekleyebilirsiniz,
- Ürünün alıcıya teslim edilmesi, size teslim edilmiş sayılır.

Alıcının telefon numarası, teslimat sırasında iletişim kurulabilmesi için zorunludur. Numaranın hatalı olması teslimatı engelleyebilir.

---

## 7. TESLİMATIN GERÇEKLEŞTİRİLEMEMESİ

Aşağıdaki hâllerde teslimat tamamlanamaz:

- Bildirilen adresin **hatalı, eksik veya bulunamaz** olması
- Alıcının belirtilen saat aralığında **adreste bulunmaması**
- Alıcının ürünü **teslim almayı reddetmesi**
- Bildirilen telefon numarasından **iletişim kurulamaması**

Bu durumlarda, ürünün çabuk bozulabilen nitelikte olması kaydıyla ürün bedeli ve teslimat ücreti iade edilmez. Hazırlanmış bir çiçek aranjmanının ikinci kez teslime elverişli biçimde saklanması niteliği gereği mümkün olmadığından, mevzuat bu ürün grubunu istisna kapsamına almıştır.

**Bu kural şu hâllerde uygulanmaz** — bedel iade edilir:

- Ürünün çabuk bozulabilen nitelikte **olmaması**
- Teslimatın gerçekleştirilememesinin **bizim kusurumuzdan** kaynaklanması
- Mücbir sebep

Ürünü aynı gün ikinci kez teslime elverişli bulmamız hâlinde, sizinle görüşerek ikinci bir teslimat denemesi yapabiliriz. İkinci teslimatın ücreti ayrıca yansıtılır.

**Açık talimatınız olmaksızın** ürün apartman görevlisine, komşuya veya adreste bulunan üçüncü kişilere teslim edilmez. Bu yönde talimat vermeniz hâlinde teslim gerçekleşmiş sayılır.

Ayrıntılı bilgi için **İptal ve İade Koşulları** metnini inceleyebilirsiniz.

---

## 8. ÜRÜN SOLMUŞ VEYA HASARLI GELDİYSE

Ürün solmuş, kırılmış, hasarlı veya siparişinize aykırı teslim edildiyse:

**Teslim saatinden itibaren en geç 1 saat içinde**, ayıbı gösteren **fotoğraflarla birlikte** bize bildirimde bulunun.

Bu kısa süre, çiçeğin canlı bir ürün olması ve zamanla doğal olarak solmaya başlamasından kaynaklanır; sorunun teslim anında var olup olmadığı ancak bu şekilde tespit edilebilir.

Bildiriminiz yerinde bulunursa; **bedel iadesi**, **ürünün yenilenmesi** veya **bedel indirimi** haklarından **birini seçmekte serbestsiniz.** Operasyon durumumuza göre öncelikle ürünü yenilemeyi önerebiliriz, ancak **tercih size aittir.**

### Ayıp sayılmayan durumlar

- Çiçeklerin doğal yapısı gereği fotoğrafla teslim edilen ürün arasındaki **renk tonu, açılım ve boyut farkları**
- Teslimden sonra **muhafaza koşullarından** kaynaklanan solmalar — suyunun değiştirilmemesi, doğrudan güneş ışığında ya da kalorifer/klima önünde bırakılması gibi
- Kesme çiçeğin **doğal ömrünü tamamlaması**
- Tarafınızca onaylanmış eş değer ürün ikamesi

---

## 9. EŞ DEĞER ÜRÜN İKAMESİ

Çiçek tedariki mevsim koşullarına ve günlük hâl piyasasına bağlıdır. Sipariş ettiğiniz çiçek türü veya rengi bulunamazsa, ürünün kompozisyonunu, boyutunu ve **fiyatını koruyacak** şekilde eş değer başka bir çiçekle ikame edebiliriz.

- İkame edilen ürünün değeri, sipariş ettiğiniz üründen **hiçbir zaman düşük olamaz.**
- İkame yapılması hâlinde **görsel onay süreciyle bilgilendirilir** ve onayınıza sunulursunuz.
- Kabul etmezseniz siparişiniz iptal edilir ve **bedelin tamamı iade edilir.**

---

## 10. ÇİÇEĞİNİZİN ÖMRÜNÜ UZATMAK İÇİN

| | |
|---|---|
| **Su** | Vazo suyunu her gün veya en geç iki günde bir değiştirin |
| **Kesim** | Sap uçlarını 1–2 cm çapraz kesin; su emilimi artar |
| **Konum** | Doğrudan güneş ışığından, kalorifer ve klima önünden uzak tutun |
| **Meyve** | Çiçekleri olgunlaşan meyvelerin yanına koymayın; salınan etilen gazı solmayı hızlandırır |
| **Temizlik** | Suya değen yaprakları temizleyin; bakteri oluşumunu geciktirir |
| **Saksı bitkileri** | Toprağın üst kısmı kuruduğunda sulayın, sürekli nemli tutmayın |

---

## 11. İLETİŞİM

| Kanal | Adres |
|---|---|
| Telefon | 0532 295 93 09 |
| WhatsApp | 0532 295 93 09 |
| E-posta | durucicekorganizasyon@gmail.com |
| Adres | 19 Mayıs Mah. Aytekin Kotil Cad. Yıldırım Apt. No: 18H Şişli / İstanbul |

Talep ve şikâyetleriniz **en geç 3 iş günü** içinde yanıtlanır.

---

*Son güncelleme: 25.07.2026*`,
};

/** Tüm yasal metinler — slug ile erişim için */
export const LEGAL_DOCUMENTS: Record<string, LegalDocument> = {
  "mesafeli-satis-sozlesmesi": mesafeliSatisSozlesmesi,
  "on-bilgilendirme-formu": onBilgilendirmeFormu,
  "iade": iptalVeIadeKosullari,
  "kullanim-kosullari": uyelikSozlesmesi,
  "kvkk": kvkkAydinlatmaMetni,
  "acik-riza-metni": acikRizaMetni,
  "ticari-elektronik-ileti": ticariElektronikIleti,
  "gizlilik": gizlilikVeCerezPolitikasi,
  "teslimat": teslimatBilgileri,
};

/** Onay kayıtlarında kullanılan güncel metin sürümleri */
export const LEGAL_VERSIONS = {
  mesafeliSatisSozlesmesi: "1.0",
  onBilgilendirmeFormu: "1.0",
  iptalVeIadeKosullari: "1.0",
  uyelikSozlesmesi: "1.0",
  kvkkAydinlatmaMetni: "1.0",
  acikRizaMetni: "1.0",
  ticariElektronikIleti: "1.0",
  gizlilikVeCerezPolitikasi: "1.0",
  teslimatBilgileri: "1.0",
} as const;
