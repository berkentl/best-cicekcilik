"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCurrencyStore } from "@/store/currencyStore";
import { formatPrice } from "@/lib/currency";
import { HeartIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { BestsellerBadge } from "@/components/ui/award-badge";
import type { Product, SiteSettings } from "@/types";

const DEFAULT_CARE = "Çiçekleri teslim aldıktan sonra saplarını 2–3 cm kısaltın.\nTemiz suya koyun ve her 2 günde bir suyunu değiştirin.\nDoğrudan güneş ışığından ve sıcak ortamlardan uzak tutun.\nPaket içindeki çiçek ömrü uzatıcı tozu suya ekleyin.";

function buildShippingLines(
  product: Product,
  settings?: SiteSettings,
  customText?: string
): string {
  if (customText) return customText;
  const base = settings?.baseShippingFee ?? 200;
  const custom = product.customShippingFee;

  const lines: string[] = [
    "Saat 14:00'a kadar verilen siparişler aynı gün teslim edilir.",
    "Tüm İstanbul ilçelerine teslimat yapılmaktadır.",
  ];

  if (custom !== undefined && custom === 0) {
    lines.push("Bu ürün için kargo ücretsizdir.");
  } else if (custom !== undefined && custom > 0) {
    lines.push(`Bu ürüne özel kargo ücreti: ₺${custom.toLocaleString("tr-TR")}.`);
  } else if (base === 0) {
    lines.push("Tüm siparişlerde kargo ücretsizdir.");
  } else {
    lines.push(`Standart kargo ücreti: ₺${base.toLocaleString("tr-TR")}.`);
  }
  lines.push("Teslimat saatini sipariş notunuza ekleyebilirsiniz.");
  return lines.join("\n");
}

interface AddressSuggestion { id:string; name:string; address:string; district:string; ilce:string; }

const DB: AddressSuggestion[] = [{"id":"kk1","name":"Halkalı Merkez","address":"Halkalı Caddesi, Küçükçekmece/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Küçükçekmece"},{"id":"kk2","name":"İstasyon, Halkalı Hızlı Tren İstasyonu","address":"Yarımburgaz Caddesi, Küçükçekmece/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Küçükçekmece"},{"id":"kk3","name":"Kanarya, Halkalı Marmaray Durağı","address":"Küçükçekmece/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Küçükçekmece"},{"id":"kk4","name":"Sefaköy Mahallesi","address":"Sefaköy, Küçükçekmece/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Küçükçekmece"},{"id":"kk5","name":"Atakent Mahallesi","address":"Atakent Caddesi, Küçükçekmece/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Küçükçekmece"},{"id":"kk6","name":"Florya, Havaalanı Yolu","address":"Küçükçekmece/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Küçükçekmece"},{"id":"kk7","name":"İkitelli Sanayi, OSB Metro Durağı","address":"Küçükçekmece/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Küçükçekmece"},{"id":"kk8","name":"Yarımburgaz, Küçükçekmece","address":"Küçükçekmece/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Küçükçekmece"},{"id":"ss1","name":"Nişantaşı, Abdi İpekçi Caddesi","address":"Şişli/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Şişli"},{"id":"ss2","name":"Teşvikiye, Vali Konağı Caddesi","address":"Şişli/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Şişli"},{"id":"ss3","name":"Fulya, Aytekin Kotil Caddesi","address":"Şişli/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Şişli"},{"id":"ss4","name":"Mecidiyeköy, Büyükdere Caddesi","address":"Şişli/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Şişli"},{"id":"ss5","name":"Osmanbey, Halaskargazi Caddesi","address":"Şişli/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Şişli"},{"id":"ss6","name":"19 Mayıs, İstanbul Cevahir AVM","address":"Büyükdere Caddesi, Şişli/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Şişli"},{"id":"ss7","name":"Gayrettepe Metro Durağı","address":"Büyükdere Caddesi, Şişli/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Şişli"},{"id":"bk1","name":"Levent, Büyükdere Caddesi","address":"Beşiktaş/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Beşiktaş"},{"id":"bk2","name":"Etiler, Nispetiye Caddesi","address":"Beşiktaş/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Beşiktaş"},{"id":"bk3","name":"Bebek, Cevdet Paşa Caddesi","address":"Beşiktaş/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Beşiktaş"},{"id":"bk4","name":"Ortaköy, Muallim Naci Caddesi","address":"Beşiktaş/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Beşiktaş"},{"id":"bk5","name":"Balmumcu, Barbaros Bulvarı","address":"Beşiktaş/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Beşiktaş"},{"id":"bk6","name":"Beşiktaş İskelesi, Çırağan Caddesi","address":"Beşiktaş/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Beşiktaş"},{"id":"bk7","name":"Vodafone Park, Dolmabahçe Caddesi","address":"Beşiktaş/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Beşiktaş"},{"id":"bk8","name":"4. Levent Metro Durağı","address":"Büyükdere Caddesi, Beşiktaş/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Beşiktaş"},{"id":"by1","name":"İstiklal Caddesi","address":"Beyoğlu/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Beyoğlu"},{"id":"by2","name":"Cihangir, Akarsu Sokak","address":"Beyoğlu/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Beyoğlu"},{"id":"by3","name":"Galata Kulesi, Galata","address":"Beyoğlu/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Beyoğlu"},{"id":"by4","name":"Karaköy, Kemeraltı Caddesi","address":"Beyoğlu/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Beyoğlu"},{"id":"by5","name":"Taksim Meydanı","address":"Beyoğlu/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Beyoğlu"},{"id":"by6","name":"Taksim Metro Durağı","address":"Taksim Meydanı, Beyoğlu/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Beyoğlu"},{"id":"by7","name":"Kasımpaşa, Piyalepaşa Bulvarı","address":"Beyoğlu/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Beyoğlu"},{"id":"sy1","name":"Maslak, Büyükdere Caddesi","address":"Sarıyer/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Sarıyer"},{"id":"sy2","name":"Tarabya, Tarabya Sahil Yolu","address":"Sarıyer/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Sarıyer"},{"id":"sy3","name":"İstinye Park AVM, İstinye","address":"Sarıyer/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Sarıyer"},{"id":"sy4","name":"Emirgan, Emirgan Korusu","address":"Sarıyer/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Sarıyer"},{"id":"sy5","name":"Yeniköy, Köybaşı Caddesi","address":"Sarıyer/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Sarıyer"},{"id":"ft1","name":"Sultanahmet, Sultan Ahmet Meydanı","address":"Fatih/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Fatih"},{"id":"ft2","name":"Kapalıçarşı, Beyazıt","address":"Fatih/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Fatih"},{"id":"ft3","name":"Eminönü, Mısır Çarşısı","address":"Fatih/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Fatih"},{"id":"ft4","name":"Balat, Vodina Caddesi","address":"Fatih/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Fatih"},{"id":"ft5","name":"Aksaray, Millet Caddesi","address":"Fatih/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Fatih"},{"id":"br1","name":"Bakırköy, İstasyon Caddesi","address":"Bakırköy/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Bakırköy"},{"id":"br2","name":"Yeşilköy, Sahil Yolu","address":"Bakırköy/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Bakırköy"},{"id":"br3","name":"Ataköy, E-5 Sahil Yolu","address":"Bakırköy/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Bakırköy"},{"id":"br4","name":"Bakırköy Marmaray Durağı","address":"İstasyon Caddesi, Bakırköy/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Bakırköy"},{"id":"kg1","name":"Çağlayan, Piyalepaşa Bulvarı","address":"Kağıthane/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Kağıthane"},{"id":"kg2","name":"Kağıthane Merkez","address":"Kağıthane/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Kağıthane"},{"id":"ey1","name":"Eyüpsultan Camii, Eyüp Sultan Meydanı","address":"Eyüpsultan/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Eyüpsultan"},{"id":"ey2","name":"Pierre Loti Tepesi","address":"Eyüpsultan/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Eyüpsultan"},{"id":"bp1","name":"Bayrampaşa Merkez","address":"Bayrampaşa/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Bayrampaşa"},{"id":"bp2","name":"Forum İstanbul AVM","address":"Kocatepe Mah., Bayrampaşa/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Bayrampaşa"},{"id":"gp1","name":"Gaziosmanpaşa Merkez","address":"Gaziosmanpaşa/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Gaziosmanpaşa"},{"id":"es1","name":"Esenler Merkez","address":"Esenler/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Esenler"},{"id":"es2","name":"Menderes Metro Durağı","address":"Esenler/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Esenler"},{"id":"bg1","name":"Güneşli, Bağcılar","address":"Bağcılar/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Bağcılar"},{"id":"bg2","name":"Bağcılar Merkez","address":"Bağcılar/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Bağcılar"},{"id":"bg3","name":"Kirazlı Metrobüs Durağı","address":"Bağcılar/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Bağcılar"},{"id":"bh1","name":"Bahçelievler Merkez","address":"Bahçelievler/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Bahçelievler"},{"id":"bh2","name":"Şirinevler, Adnan Kahveci Bulvarı","address":"Bahçelievler/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Bahçelievler"},{"id":"zb1","name":"Zeytinburnu Merkez","address":"Zeytinburnu/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Zeytinburnu"},{"id":"zb2","name":"Kazlıçeşme Marmaray Durağı","address":"Zeytinburnu/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Zeytinburnu"},{"id":"gn1","name":"Güngören Merkez","address":"Güngören/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Güngören"},{"id":"av1","name":"Avcılar Merkez, Deniz Caddesi","address":"Avcılar/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Avcılar"},{"id":"av2","name":"Firuzköy, Firuzköy Caddesi","address":"Avcılar/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Avcılar"},{"id":"bl1","name":"Beylikdüzü Merkez, Cumhuriyet Caddesi","address":"Beylikdüzü/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Beylikdüzü"},{"id":"bl2","name":"Migros AVM Beylikdüzü","address":"Adnan Kahveci Bulvarı, Beylikdüzü/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Beylikdüzü"},{"id":"en1","name":"Esenyurt Merkez, 1. Cadde","address":"Esenyurt/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Esenyurt"},{"id":"bs1","name":"Başakşehir Merkez","address":"Başakşehir/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Başakşehir"},{"id":"bs2","name":"Olimpiyat Stadyumu, Başakşehir","address":"Başakşehir Bulvarı, Başakşehir/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Başakşehir"},{"id":"bs3","name":"Kayaşehir, Kayaşehir Caddesi","address":"Başakşehir/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Başakşehir"},{"id":"ak1","name":"Tayakadın, İstanbul Havalimanı (IST)","address":"Terminal Caddesi, Arnavutköy/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Arnavutköy"},{"id":"ak2","name":"Arnavutköy Merkez","address":"Arnavutköy/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Arnavutköy"},{"id":"sg1","name":"Sultangazi Merkez","address":"Sultangazi/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Sultangazi"},{"id":"bc1","name":"Büyükçekmece Merkez","address":"Büyükçekmece/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Büyükçekmece"},{"id":"sl1","name":"Silivri Merkez, Yalı Caddesi","address":"Silivri/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Silivri"},{"id":"kd1","name":"Moda, Moda Caddesi","address":"Kadıköy/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Kadıköy"},{"id":"kd2","name":"Kadıköy Çarşı, Yoğurtçu Parkı","address":"Kadıköy/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Kadıköy"},{"id":"kd3","name":"Bağdat Caddesi","address":"Kadıköy/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Kadıköy"},{"id":"kd4","name":"Fenerbahçe, Şükrü Saracoğlu Stadyumu","address":"Kadıköy/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Kadıköy"},{"id":"kd5","name":"Göztepe, Bağdat Caddesi","address":"Kadıköy/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Kadıköy"},{"id":"kd6","name":"Suadiye, Bağdat Caddesi","address":"Kadıköy/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Kadıköy"},{"id":"kd7","name":"Kadıköy Marmaray Durağı","address":"İskele Caddesi, Kadıköy/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Kadıköy"},{"id":"us1","name":"Üsküdar Meydanı, İskele Caddesi","address":"Üsküdar/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Üsküdar"},{"id":"us2","name":"Çengelköy, Çengelköy Caddesi","address":"Üsküdar/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Üsküdar"},{"id":"us3","name":"Kuzguncuk, Kuzguncuk Caddesi","address":"Üsküdar/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Üsküdar"},{"id":"us4","name":"Beylerbeyi, Çengelköy Caddesi","address":"Üsküdar/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Üsküdar"},{"id":"us5","name":"Büyük Çamlıca Camii, Kısıklı","address":"Üsküdar/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Üsküdar"},{"id":"us6","name":"Üsküdar Marmaray Durağı","address":"Üsküdar/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Üsküdar"},{"id":"at1","name":"Ataşehir Merkez, Ataşehir Bulvarı","address":"Ataşehir/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Ataşehir"},{"id":"at2","name":"Küçükbakkalköy, Ataşehir","address":"Ataşehir/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Ataşehir"},{"id":"at3","name":"İçerenköy, Kayışdağı Caddesi","address":"Ataşehir/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Ataşehir"},{"id":"at4","name":"Palladium AVM, Ataşehir","address":"Ataşehir/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Ataşehir"},{"id":"ml1","name":"Maltepe Sahil, Sahil Yolu","address":"Maltepe/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Maltepe"},{"id":"ml2","name":"Bağlarbaşı, Bağlarbaşı Caddesi","address":"Maltepe/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Maltepe"},{"id":"ml3","name":"Küçükyalı, Sahil Yolu","address":"Maltepe/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Maltepe"},{"id":"ml4","name":"Maltepe Marmaray Durağı","address":"Maltepe/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Maltepe"},{"id":"kr1","name":"Kartal Merkez, Ankara Caddesi","address":"Kartal/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Kartal"},{"id":"kr2","name":"Cevizli, İstanbul Anadolu Adalet Sarayı","address":"E-5 Yanyol, Kartal/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Kartal"},{"id":"kr3","name":"Kartal Marmaray Durağı","address":"Kartal/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Kartal"},{"id":"pk1","name":"Pendik Merkez, İstasyon Caddesi","address":"Pendik/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Pendik"},{"id":"pk2","name":"Sabiha Gökçen Havalimanı (SAW)","address":"Kurtköy, Pendik/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Pendik"},{"id":"pk3","name":"Kaynarca, Pendik","address":"Pendik/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Pendik"},{"id":"pk4","name":"Pendik Marmaray Durağı","address":"Pendik/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Pendik"},{"id":"tz1","name":"Tuzla Merkez","address":"Tuzla/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Tuzla"},{"id":"tz2","name":"Tuzla Marmaray Durağı","address":"Tuzla/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Tuzla"},{"id":"um1","name":"Ümraniye Merkez","address":"Ümraniye/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Ümraniye"},{"id":"um2","name":"Dudullu, Ümraniye","address":"Ümraniye/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Ümraniye"},{"id":"sc1","name":"Sancaktepe Merkez","address":"Sancaktepe/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Sancaktepe"},{"id":"sb1","name":"Sultanbeyli Merkez","address":"Sultanbeyli/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Sultanbeyli"},{"id":"ck1","name":"Çekmeköy Merkez","address":"Çekmeköy/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Çekmeköy"},{"id":"bz1","name":"Beykoz Merkez","address":"Beykoz/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Beykoz"},{"id":"bz2","name":"Paşabahçe, Sahil Yolu","address":"Beykoz/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Beykoz"},{"id":"bz3","name":"Anadolu Kavağı, Boğaz","address":"Beykoz/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Beykoz"},{"id":"se1","name":"Şile Merkez, Sahil Caddesi","address":"Şile/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Şile"},{"id":"on1","name":"Florence Nightingale Hastanesi","address":"Abide-i Hürriyet Caddesi, Şişli/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Şişli"},{"id":"on2","name":"Acıbadem Hastanesi Maslak","address":"Büyükdere Caddesi, Sarıyer/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Sarıyer"},{"id":"on3","name":"İstanbul Üniversitesi, Merkez Kampüs","address":"Beyazıt, Fatih/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Fatih"},{"id":"on4","name":"Boğaziçi Üniversitesi, Bebek Kampüs","address":"Rumeli Hisarı, Beşiktaş/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Beşiktaş"},{"id":"on5","name":"Acıbadem Hastanesi Kadıköy","address":"Tekin Sokak, Kadıköy/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Kadıköy"},{"id":"on6","name":"Emaar AVM, Ataşehir","address":"Yenişehir Mah., Ataşehir/İstanbul","district":"İSTANBUL-ANADOLU","ilce":"Ataşehir"},{"id":"on7","name":"Medipol Üniversitesi, Bağcılar","address":"TEM Bağlantı Yolu, Bağcılar/İstanbul","district":"İSTANBUL-AVRUPA","ilce":"Bağcılar"}];

function norm(s: string) {
  return s.toLowerCase()
    .replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ş/g,"s")
    .replace(/ı/g,"i").replace(/ö/g,"o").replace(/ç/g,"c")
    .replace(/İ/g,"i").replace(/Ğ/g,"g").replace(/Ü/g,"u")
    .replace(/Ş/g,"s").replace(/Ö/g,"o").replace(/Ç/g,"c");
}

function searchDB(q: string): AddressSuggestion[] {
  if (!q || q.trim().length < 2) return [];
  const nq = norm(q.trim());
  const starts: AddressSuggestion[] = [];
  const rest: AddressSuggestion[] = [];
  for (const item of DB) {
    const hay = norm(item.name + " " + item.address + " " + item.ilce);
    if (norm(item.name).startsWith(nq) || hay.startsWith(nq)) starts.push(item);
    else if (hay.includes(nq)) rest.push(item);
  }
  return [...starts, ...rest].slice(0, 8);
}

function AccordionList({ lines }: { lines: string }) {
  return (
    <ul className="space-y-2 pl-1">
      {lines.split("\n").filter(Boolean).map((line, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-[#3d7b74] mt-0.5">✦</span>
          <span dangerouslySetInnerHTML={{ __html: line }} />
        </li>
      ))}
    </ul>
  );
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-[#e4e2e2]">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-left">
        <span className="text-[14px] font-semibold text-[#1b1c1c] tracking-[0.02em]">{title}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#727973" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round"
          className={cn("transition-transform duration-300 flex-shrink-0", open && "rotate-180")}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <div className={cn("overflow-hidden transition-all duration-300 ease-in-out", open ? "max-h-[2000px] pb-4" : "max-h-0")}>
        <div className="text-[14px] text-[#424844] leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function AddressSearch({ onChange }: { onChange: (ilce: string) => void }) {
  const [query, setQuery]         = useState("");
  const [results, setResults]     = useState<AddressSuggestion[]>([]);
  const [open, setOpen]           = useState(false);
  const [focused, setFocused]     = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const wrapRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const run = useCallback((q: string) => {
    const r = searchDB(q);
    setResults(r);
    setOpen(r.length > 0 && q.trim().length >= 2);
    setActiveIdx(-1);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => run(query), 180);
    return () => clearTimeout(t);
  }, [query, run]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false); setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (item: AddressSuggestion) => {
    setQuery(item.name + ", " + item.address);
    onChange(item.ilce);
    setOpen(false);
  };

  const clear = () => {
    setQuery(""); onChange(""); setResults([]); setOpen(false);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && activeIdx >= 0) { e.preventDefault(); select(results[activeIdx]); }
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative">
      <div className={cn(
        "flex items-center gap-2.5 bg-white border rounded-xl px-4 py-3 transition-all duration-200",
        focused || open ? "border-[#163426] ring-2 ring-[#163426]/10 shadow-sm" : "border-[#e4e2e2] hover:border-[#c1c8c2]"
      )}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
          stroke={focused || open ? "#163426" : "#bbb"}
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 transition-colors">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => { setFocused(true); if (query.length >= 2) run(query); }}
          onKeyDown={onKeyDown}
          placeholder="Gönderim Yeri Seçin"
          autoComplete="off"
          className="flex-1 text-[14px] text-[#1b1c1c] placeholder:text-[#bbb] focus:outline-none bg-transparent min-w-0"
        />
        {query ? (
          <button type="button" onClick={clear}
            className="flex-shrink-0 w-5 h-5 rounded-full bg-[#ebebeb] hover:bg-[#d4d4d4] flex items-center justify-center transition-colors">
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="#666" strokeWidth="2.2" strokeLinecap="round">
              <line x1="1" y1="1" x2="9" y2="9"/><line x1="9" y1="1" x2="1" y2="9"/>
            </svg>
          </button>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        )}
      </div>

      {!open && !query && (
        <p className="text-[12px] text-[#bbb] mt-2 leading-snug px-0.5">
          Mahalle, cadde, hastane veya önemli nokta ismi girin.
        </p>
      )}

      {open && (
        <div className="absolute z-50 left-0 right-0 top-[calc(100%+8px)] bg-white border border-[#e8e8e8] rounded-xl shadow-md overflow-hidden">
          <div className="max-h-[288px] overflow-y-auto overscroll-contain divide-y divide-[#f3f3f3]">
            {results.map((item, i) => (
              <button key={item.id} type="button"
                onMouseDown={e => { e.preventDefault(); select(item); }}
                onMouseEnter={() => setActiveIdx(i)}
                className={cn("w-full text-left px-4 py-3.5 transition-colors duration-100",
                  i === activeIdx ? "bg-[#f2f6f2]" : "hover:bg-[#f8faf8]")}>
                <p className="text-[13px] font-semibold text-[#1e4f9c] leading-snug">
                  {item.name}<span className="font-normal text-[#1e4f9c]/75">,&nbsp;{item.address}</span>
                </p>
                <p className="text-[11px] text-[#aaa] mt-0.5 font-bold tracking-[0.08em] uppercase">{item.district}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {focused && query.trim().length >= 2 && !open && results.length === 0 && (
        <div className="absolute z-50 left-0 right-0 top-[calc(100%+8px)] bg-white border border-[#e8e8e8] rounded-xl shadow-md px-4 py-5 text-center">
          <p className="text-[13px] text-[#bbb]">Adres bulunamadı. Farklı bir kelime deneyin.</p>
        </div>
      )}
    </div>
  );
}

const SAATLER = ["09:00 – 12:00","12:00 – 15:00","15:00 – 18:00","18:00 – 21:00"];

interface Props {
  product: Product;
  categorySlug: string;
  inStock: boolean;
  shippingInfo?: string;  // Admin'den gelen özel metin (her satır = madde)
  siteSettings?: SiteSettings;
}

export function ProductDetailPanel({ product, categorySlug, inStock, shippingInfo, siteSettings }: Props) {
  const [added, setAdded] = useState(false);
  const [, setIlce]       = useState("");
  const [tarih, setTarih] = useState("");
  const [saat, setSaat]   = useState("");

  const addItem         = useCartStore(s => s.addItem);
  const { toggle, has } = useWishlistStore();
  const wishlisted      = has(product.id);
  const currency        = useCurrencyStore(s => s.currency);
  const rates           = useCurrencyStore(s => s.rates);

  const hasDiscount = product.salePrice !== undefined && product.salePrice < product.price;
  const discountPct = hasDiscount ? Math.round(((product.price - product.salePrice!) / product.price) * 100) : 0;

  const handleAddToCart = () => {
    if (!inStock) return;
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="flex flex-col gap-5">

      <Link href={`/${categorySlug}`}
        className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#727973] hover:text-[#1d3435] transition-colors">
        {product.category}
      </Link>

      <h1 className="font-heading italic text-[32px] md:text-[38px] font-medium text-[#163426] leading-tight">
        {product.name}
      </h1>

      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[24px] font-semibold text-[#163426] tabular-nums">
          {formatPrice(product.salePrice ?? product.price, currency, rates)}
        </span>
        {hasDiscount && <span className="text-[16px] text-[#727973] line-through">{formatPrice(product.price, currency, rates)}</span>}
        {product.isNew && <span className="bg-[#fde8e6] text-[#5c2020] text-[11px] font-semibold tracking-[0.06em] px-3 py-1 rounded-full">Yeni Ürün</span>}
        {product.isBestseller && (
          <span className="inline-block w-[180px] align-middle">
            <BestsellerBadge />
          </span>
        )}
        {hasDiscount && <span className="bg-[#7b3535] text-white text-[11px] font-semibold px-3 py-1 rounded-full">-%{discountPct}</span>}
      </div>

      {product.description && (
        <blockquote className="border-l-2 border-[#c1c8c2] pl-4 bg-[#f5f3f3] rounded-r-xl py-3 pr-4">
          <p className="text-[14px] italic text-[#424844] leading-relaxed">
            &ldquo;{product.description.replace(/<[^>]*>/g,"")}&rdquo;
          </p>
        </blockquote>
      )}

      <div className="border-t border-[#e4e2e2]" />

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold tracking-[0.06em] uppercase text-[#424844]">Teslimat Adresi</label>
          <AddressSearch onChange={setIlce} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold tracking-[0.06em] uppercase text-[#424844]">Teslimat Tarihi</label>
            <input type="date" min={today} value={tarih} onChange={e => setTarih(e.target.value)}
              className="w-full bg-white border border-[#e4e2e2] rounded-xl px-4 py-3 text-[14px] text-[#1b1c1c] focus:outline-none focus:border-[#163426] focus:ring-2 focus:ring-[#163426]/10 hover:border-[#c1c8c2] transition-all [&::-webkit-calendar-picker-indicator]:opacity-40" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold tracking-[0.06em] uppercase text-[#424844]">Saat Aralığı</label>
            <div className="relative">
              <select value={saat} onChange={e => setSaat(e.target.value)}
                className={cn("w-full appearance-none bg-white border border-[#e4e2e2] rounded-xl px-4 py-3 text-[14px] pr-9 focus:outline-none focus:border-[#163426] focus:ring-2 focus:ring-[#163426]/10 hover:border-[#c1c8c2] transition-all", !saat ? "text-[#bbb]" : "text-[#1b1c1c]")}>
                <option value="" disabled>Seçin</option>
                {SAATLER.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#bbb]"
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-1">
        <button onClick={handleAddToCart} disabled={!inStock}
          className={cn("flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl text-[15px] font-semibold tracking-[0.03em] text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
            added ? "bg-[#3d7b74]" : "bg-[#163426] hover:bg-[#1e4434] active:scale-[0.98]")}>
          {added ? (
            <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Sepete Eklendi</>
          ) : (
            <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>{!inStock ? "Stokta Yok" : "Sipariş Ver"}</>
          )}
        </button>
        <button onClick={() => toggle(product)} aria-label={wishlisted ? "Favorilerden çıkar" : "Favorilere ekle"}
          className={cn("w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 transition-all duration-200",
            wishlisted ? "border-[#fde8e6] bg-[#fde8e6] text-[#c4806a]" : "border-[#e4e2e2] bg-white text-[#424844] hover:border-[#fde8e6] hover:bg-[#fde8e6] hover:text-[#c4806a]")}>
          <HeartIcon size={18} className={wishlisted ? "fill-[#c4806a] stroke-[#c4806a]" : ""} />
        </button>
      </div>

      <div className="flex flex-col items-center gap-2 py-2">
        <div className="flex items-center gap-1.5 text-[11px] text-[#727973]">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          %100 Güvenli Alışveriş
        </div>
        <div className="flex items-center gap-4 text-[#c1c8c2]">
          <svg viewBox="0 0 48 20" width="48" height="20" fill="currentColor"><rect x="2" y="4" width="10" height="12" rx="2"/><rect x="16" y="2" width="8" height="16" rx="2"/><rect x="28" y="6" width="18" height="8" rx="2"/></svg>
          <svg width="26" height="18" viewBox="0 0 26 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="1" width="24" height="16" rx="3"/><line x1="1" y1="6" x2="25" y2="6"/><line x1="5" y1="12" x2="9" y2="12"/></svg>
          <svg width="16" height="18" viewBox="0 0 16 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="8" width="14" height="10" rx="2.5"/><path d="M4 8V5a4 4 0 1 1 8 0v3"/></svg>
        </div>
      </div>

      <div>
        <Accordion title="Bakım Talimatları">
          <AccordionList lines={product.careInstructions || DEFAULT_CARE} />
        </Accordion>
        <Accordion title="Gönderim Bilgileri">
          <AccordionList lines={buildShippingLines(product, siteSettings, shippingInfo)} />
        </Accordion>
        <div className="border-t border-[#e4e2e2]" />
      </div>

    </div>
  );
}
