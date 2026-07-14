import type { HeroSlide, Category, SiteConfig } from "@/types";


export const siteConfig: SiteConfig = {
  name: "Dünyanın Çiçeği",
  phone: "0532 295 93 09",
  email: "info@dunyanincicegi.com",
  address: "Fulya, 19 Mayıs, Aytekin Kotil Cd. No:18",
  city: "İstanbul",
  district: "Şişli",
  whatsapp: "905322959309",
  announcementText:
    "Saat 14'e kadar verilen siparişlerde; Tüm İstanbul'a Aynı Gün Çiçek Teslimat yapıyoruz.",
};

export const heroSlides: HeroSlide[] = [
  {
    id: "slide-aycicegi",
    image: "/Hero/bestcicekcilik-hero-1-aycicegi-desktop.png",
    mobileImage: "/Hero/bestcicekcilik-mobile-1-aycicegi.png",
    alt: "Yazın Neşesi ile Dünyanın Çiçeği — ayçiçeği buketi",
    buttonHref: "/cicek/mevsim",
  },
  {
    id: "slide-sakayik",
    image: "/Hero/bestcicekcilik-hero-2-sakayik-desktop.png",
    mobileImage: "/Hero/bestcicekcilik-mobile-2-sakayik.png",
    alt: "Taptaze Şakayık Sezonu — Dünyanın Çiçeği",
    buttonHref: "/cicek/sakayik",
  },
  {
    id: "slide-gelin",
    image: "/Hero/bestcicekcilik-hero-3-gelin-desktop.png",
    mobileImage: "/Hero/bestcicekcilik-mobile-3-gelin.png",
    alt: "Gelin Buketleri — Dünyanın Çiçeği",
    buttonHref: "/cicek/gelin-buketi",
  },
  {
    id: "slide-soz-nisan",
    image: "/Hero/bestcicekcilik-hero-4-soz-nisan-desktop.png",
    mobileImage: "/Hero/bestcicekcilik-mobile-4-soz-nisan.png",
    alt: "Söz & Nişan Çiçekleri ve Çikolataları — Dünyanın Çiçeği",
    buttonHref: "/gonderim-sebebi/soz-nisan",
  },
];

export const navCategories: Category[] = [
  {
    id: "en-sevilen",
    name: "EN SEVİLENLER",
    slug: "en-sevilen",
    displayOrder: 1,
    megaMenu: [
      {
        heading: "TASARIM TÜRLERİ",
        items: [
          { name: "Tüm En Sevilen Ürünler", slug: "en-sevilen" },
          { name: "Güller", slug: "guller" },
          { name: "Lale Buketi", slug: "lale-buketi" },
          { name: "Şakayık Buketi", slug: "sakayik-buketi" },
          { name: "Çiçek Aranjmanı", slug: "cicek-aranjmani" },
          { name: "Kutu Gül", slug: "kutu-gul" },
          { name: "Çelenk", slug: "celenk" },
        ],
      },
      {
        heading: "ÖNE ÇIKANLAR",
        items: [
          { name: "Doğum Günü Çiçekleri", slug: "dogum-gunu" },
          { name: "Sevgiliye Çiçek", slug: "sevgiliye" },
          { name: "Gelin Buketi", slug: "gelin-buketi" },
          { name: "Tebrik Çiçekleri", slug: "tebrik" },
          { name: "Geçmiş Olsun", slug: "gecmis-olsun" },
        ],
      },
    ],
  },
  {
    id: "cicek",
    name: "ÇİÇEK",
    slug: "cicek",
    displayOrder: 2,
    megaMenu: [
      {
        heading: "TASARIM TÜRLERİ",
        items: [
          { name: "Tüm Çiçek Tasarımları", slug: "cicek" },
          { name: "Buket", slug: "buket" },
          { name: "Vazo Aranjman", slug: "vazo-aranjman" },
          { name: "Çiçek Kutusu", slug: "cicek-kutusu" },
          { name: "Gelin Buketi", slug: "gelin-buketi" },
          { name: "Çelenk & Sepet", slug: "celenk-sepet" },
        ],
      },
      {
        heading: "ÇİÇEK TÜRLERİ",
        items: [
          { name: "Gül", slug: "gul" },
          { name: "Şakayık", slug: "sakayik" },
          { name: "Lale", slug: "lale" },
          { name: "Kasımpatı", slug: "kasimdagi" },
          { name: "Papatya", slug: "papatya" },
          { name: "Mevsim Çiçekleri", slug: "mevsim" },
        ],
      },
    ],
  },
  {
    id: "cikolata",
    name: "ÇİKOLATA",
    slug: "cikolata",
    displayOrder: 3,
    megaMenu: [
      {
        heading: "DİZAYN TÜRLERİ",
        items: [
          { name: "Tüm Çikolata Dizayn Türleri", slug: "cikolata" },
          { name: "Bayram Çikolataları", slug: "bayram-cikolatalari" },
          { name: "Söz Nişan Çikolatası", slug: "soz-nisan-cikolatasi" },
          { name: "İsme Özel Çikolata", slug: "isme-ozel-cikolata" },
          { name: "Bebek için İsimli Çikolata Kutusu", slug: "bebek-cikolata" },
          { name: "Çikolata Kutusu", slug: "cikolata-kutusu" },
          { name: "Çikolata Tepsisi", slug: "cikolata-tepsisi" },
          { name: "Sevgiliye Çikolata Kutusu", slug: "sevgiliye-cikolata" },
          { name: "Geçmiş Olsun Çikolata Kutusu", slug: "gecmis-olsun-cikolata" },
          { name: "Öğretmenler Günü için Çikolata Kutusu", slug: "ogretmenler-cikolata" },
          { name: "Anneler Günü için Çikolata Kutusu", slug: "anneler-cikolata" },
        ],
      },
      {
        heading: "ÇİKOLATA ÇEŞİTLERİ",
        items: [
          { name: "Tüm Çikolata Çeşitleri", slug: "cikolata-cesitleri" },
          { name: "Sütlü Dolgulu", slug: "sutlu-dolgulu" },
          { name: "Sütlü Fındık Parçalı", slug: "sutlu-findik-parcali" },
          { name: "Bitter Çikolata", slug: "bitter-cikolata" },
          { name: "Badem Draje", slug: "badem-draje" },
        ],
      },
    ],
  },
  {
    id: "hediye-kutusu",
    name: "HEDİYE KUTUSU",
    slug: "hediye-kutusu",
    displayOrder: 4,
    megaMenu: [
      {
        heading: "KUTU TÜRLERİ",
        items: [
          { name: "Tüm Hediye Kutuları", slug: "hediye-kutusu" },
          { name: "Kutu Gül", slug: "kutu-gul" },
          { name: "Lüks Çiçek Kutusu", slug: "luks-cicek-kutusu" },
          { name: "Hediye Seti", slug: "hediye-seti" },
          { name: "Sürpriz Kutu", slug: "surpriz-kutu" },
        ],
      },
      {
        heading: "ÖZEL GÜNLER",
        items: [
          { name: "Doğum Günü Hediyesi", slug: "dogum-gunu-hediye" },
          { name: "Sevgiliye Hediye", slug: "sevgiliye-hediye" },
          { name: "Anneme Hediye", slug: "anneme-hediye" },
          { name: "Söz & Nişan", slug: "soz-nisan" },
          { name: "Bebek Hediyesi", slug: "bebek-hediye" },
        ],
      },
    ],
  },
  {
    id: "orkide",
    name: "ORKİDE",
    slug: "orkide",
    displayOrder: 5,
    megaMenu: [
      {
        heading: "ORKİDE TÜRLERİ",
        items: [
          { name: "Tüm Orkideler", slug: "orkide" },
          { name: "Beyaz Orkide", slug: "beyaz-orkide" },
          { name: "Mor Orkide", slug: "mor-orkide" },
          { name: "Pembe Orkide", slug: "pembe-orkide" },
          { name: "Sarı Orkide", slug: "sari-orkide" },
        ],
      },
      {
        heading: "SUNUM ŞEKLİ",
        items: [
          { name: "Saksıda Orkide", slug: "saksida-orkide" },
          { name: "Vazoda Orkide", slug: "vazoda-orkide" },
          { name: "Kutu Orkide", slug: "kutu-orkide" },
          { name: "Orkide Aranjman", slug: "orkide-aranjman" },
        ],
      },
    ],
  },
  {
    id: "bitki",
    name: "BİTKİ",
    slug: "bitki",
    displayOrder: 6,
    megaMenu: [
      {
        heading: "BİTKİ TÜRLERİ",
        items: [
          { name: "Tüm Bitkiler", slug: "bitki" },
          { name: "İç Mekan Bitkileri", slug: "ic-mekan" },
          { name: "Sukulent", slug: "sukulent" },
          { name: "Kaktüs", slug: "kaktus" },
          { name: "Tropikal Bitkiler", slug: "tropikal" },
        ],
      },
      {
        heading: "ÖZEL KOLEKSİYON",
        items: [
          { name: "Ofis Bitkileri", slug: "ofis-bitkileri" },
          { name: "Mini Saksı Seti", slug: "mini-saksi-seti" },
          { name: "Teraryum", slug: "teraryum" },
        ],
      },
    ],
  },
  {
    id: "gonderim-sebebi",
    name: "GÖNDERİM SEBEBİ",
    slug: "gonderim-sebebi",
    displayOrder: 7,
    megaMenu: [
      {
        heading: "ÖZEL GÜNLER",
        items: [
          { name: "Doğum Günü", slug: "dogum-gunu" },
          { name: "Sevgiliye", slug: "sevgiliye" },
          { name: "Anneme", slug: "anneme" },
          { name: "Babama", slug: "babama" },
          { name: "Söz & Nişan", slug: "soz-nisan" },
          { name: "Düğün", slug: "dugun" },
          { name: "Bebek Doğumu", slug: "bebek-dogumu" },
        ],
      },
      {
        heading: "DİĞER SEBEPLER",
        items: [
          { name: "Geçmiş Olsun", slug: "gecmis-olsun" },
          { name: "Tebrik", slug: "tebrik" },
          { name: "Özür", slug: "ozur" },
          { name: "Teşekkür", slug: "tesekkur" },
          { name: "Yıldönümü", slug: "yildonumu" },
          { name: "Mezuniyet", slug: "mezuniyet" },
        ],
      },
    ],
  },
  {
    id: "koleksiyonlar",
    name: "KOLEKSİYON",
    slug: "koleksiyonlar",
    displayOrder: 8,
    megaMenu: [
      {
        heading: "KOLEKSİYONLAR",
        items: [
          { name: "Yaz Koleksiyonu", slug: "yaz" },
          { name: "Düğün & Nişan", slug: "dugun-nisan" },
          { name: "Kurumsal Çiçek", slug: "kurumsal" },
          { name: "Lüks Koleksiyon", slug: "luks" },
        ],
      },
      {
        heading: "TEMALAR",
        items: [
          { name: "Romantik", slug: "romantik" },
          { name: "Zarif & Minimal", slug: "zarif-minimal" },
          { name: "Renkli & Neşeli", slug: "renkli-neseli" },
          { name: "Pastel Tonlar", slug: "pastel" },
        ],
      },
    ],
  },
  {
    id: "tum-urunler",
    name: "TÜM ÜRÜNLER",
    slug: "tum-urunler",
    displayOrder: 9,
  },
];

