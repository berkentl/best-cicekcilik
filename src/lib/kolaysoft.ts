/**
 * Kolaysoft e-Arşiv Fatura entegrasyonu.
 *
 * `sendDocumentModel` isteği, Kolaysoft'un genel Swagger dokümantasyonunda
 * (`/edonusum/v2/api-docs`) görünenden çok daha fazla alan bekliyor —
 * bunların çoğu iş kuralı validasyonu, spec'te yer almıyor. Kolaysoft
 * destek ekibinin paylaştığı gerçek, çalışan bir örnek istekten (WhatsApp,
 * 2026-07-24) referans alınarak yeniden yazıldı: neredeyse tüm alanlar,
 * kullanılmasa bile boş string olarak JSON'da MUTLAKA bulunmalı — eksik
 * (hiç gönderilmeyen) alanlar sunucuda genel/anlamsız bir hataya
 * (`{"isOk":false,"message":"Fault occurred while processing."}`) yol
 * açıyor, boş string'e açmıyor.
 *
 * Kimlik doğrulama, her istekte `username`/`password` HTTP header'ı ile
 * yapılıyor — ayrı bir login/token adımı yok.
 *
 * Tasarım kararı — her zaman EARSIVFATURA (e-Arşiv) kesiliyor, bireysel/
 * kurumsal fark etmeksizin: Gerçek e-Fatura (EFATURA) SADECE alıcının
 * kendisi GİB'e kayıtlı bir e-Fatura mükellefiyse ve alıcının e-Fatura
 * posta kutusu etiketi (destinationUrn) biliniyorsa kesilebilir — bunun
 * için önce GİB mükellefiyet sorgusu yapmak gerekir. Çiçek siparişi veren
 * kurumsal müşterilerin büyük çoğunluğu e-Fatura mükellefi değildir; onlara
 * da (VKN + unvan ile) e-Arşiv kesmek tamamen yasal ve doğru bir uygulamadır.
 * Bireysel/kurumsal ayrımı sadece alıcı bilgilerinin (TCKN+ad-soyad vs.
 * VKN+unvan+vergi dairesi) nasıl dolduruluğunu belirliyor.
 */

const KOLAYSOFT_BASE_URL =
  process.env.KOLAYSOFT_BASE_URL ?? "https://portal.kolayentegrasyon.net/edonusum";

/** Faturayı kesen taraf (bizim işletmemiz) — Kolaysoft hesap kaydıyla birebir eşleşmeli. */
const SELLER = {
  vknTckn: "3190357404",
  formattedName: "Duru Davet Organizasyon Ve Çiçekçilik Ticaret Ltd. Şti",
  taxOffice: "Mecidiyeköy Vergi Dairesi Müdürlüğü",
  cityName: "İstanbul",
  citySubdivisionName: "Şişli",
  countryName: "Türkiye",
  streetName: "Fulya, 19 Mayıs Aytekin Kotil Cd. No: 18H",
  email: "durucicekorganizasyon@gmail.com",
  telephone: "05322959309",
} as const;

export type KolaysoftInvoiceType = "E_ARSIV" | "E_FATURA";

export interface KolaysoftInvoiceCustomer {
  fullName: string;
  /**
   * Bireysel müşteri için TC Kimlik No (11 hane), kurumsal müşteri için
   * Vergi Kimlik No (10 hane). Checkout'ta TC Kimlik No zorunlu değil —
   * boş gelirse Türkiye'de yaygın kabul gören, checksum'ı geçen bir
   * "kimliksiz alıcı" yer tutucusu kullanılır.
   */
  identityNumber?: string;
  taxOffice?: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  district: string;
}

export interface KolaysoftInvoiceLineItem {
  name: string;
  quantity: number;
  /** KDV hariç birim fiyat (TL). */
  unitPrice: number;
  /** Yüzde olarak KDV oranı — örn. 20. */
  vatRate: number;
}

export interface KolaysoftCreateInvoiceInput {
  orderNumber: string;
  invoiceType?: KolaysoftInvoiceType;
  customer: KolaysoftInvoiceCustomer;
  items: KolaysoftInvoiceLineItem[];
  note?: string;
}

export interface KolaysoftCreateInvoiceResult {
  success: boolean;
  invoiceNumber?: string;
  /** e-Arşiv Fatura Evrensel Tekil Tanımlama Numarası (ETTN) — belge UUID'i ile aynıdır. */
  ettn?: string;
  pdfUrl?: string;
  error?: string;
}

export interface KolaysoftCancelInvoiceResult {
  success: boolean;
  error?: string;
}

/**
 * TC Kimlik No toplanmadığında düşecek yer tutucu — resmi TC kimlik
 * checksum algoritmasını geçen, yaygın kullanılan bir test/misafir
 * numarasıdır (11111111111 gibi tekrarlı rakamlar checksum'ı geçmez).
 */
const GUEST_IDENTITY_NUMBER = "12345678950";

/** Adet — UN/ECE Recommendation 20 birim kodu. */
const UNIT_PIECE = "C62";
/** KDV vergi kodu. */
const CHARGE_CODE_KDV = "0015";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function authHeaders(): Record<string, string> {
  const { KOLAYSOFT_USERNAME, KOLAYSOFT_PASSWORD } = process.env;
  return {
    "Content-Type": "application/json",
    username: KOLAYSOFT_USERNAME ?? "",
    password: KOLAYSOFT_PASSWORD ?? "",
  };
}

/**
 * İç sipariş verisini Kolaysoft fatura isteği yapısına çevirir.
 *
 * `invoiceType` checkout formunda müşterinin seçtiği "Bireysel"/"Kurumsal"
 * seçeneğine karşılık gelir: bireyselde TC Kimlik No ile, kurumsalda
 * VKN + vergi dairesi + firma adı ile fatura kesilir (ikisi de e-Arşiv).
 */
export function mapOrderToKolaysoftInvoice(order: {
  orderNumber: string;
  invoiceType: "bireysel" | "kurumsal";
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  /** Bireysel fatura için TC Kimlik No (11 hane). */
  tcKimlikNo?: string;
  /** Kurumsal fatura için Vergi Dairesi. */
  vergiDairesi?: string;
  /** Kurumsal fatura için Vergi Kimlik No (10 hane). */
  vergiNo?: string;
  /** Kurumsal fatura için firma adı — fatura üzerinde alıcı olarak görünür. */
  firmaAdi?: string;
  address: string;
  city: string;
  district: string;
  items: { name: string; qty: number; price: number }[];
  vatRate?: number;
}): KolaysoftCreateInvoiceInput {
  const vatRate = order.vatRate ?? 20;
  const isKurumsal = order.invoiceType === "kurumsal";

  return {
    orderNumber: order.orderNumber,
    invoiceType: isKurumsal ? "E_FATURA" : "E_ARSIV",
    customer: {
      fullName: isKurumsal ? (order.firmaAdi || order.customerName) : order.customerName,
      identityNumber: isKurumsal ? order.vergiNo : order.tcKimlikNo,
      taxOffice: isKurumsal ? order.vergiDairesi : undefined,
      email: order.customerEmail,
      phone: order.customerPhone,
      address: order.address,
      city: order.city,
      district: order.district,
    },
    items: order.items.map((item) => ({
      name: item.name,
      quantity: item.qty,
      unitPrice: item.price,
      vatRate,
    })),
  };
}

/** "Ayşe Yılmaz" -> ["Ayşe", "Yılmaz"]. */
function splitName(fullName: string): [string, string] {
  const trimmed = fullName.trim();
  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) return [trimmed, trimmed];
  return [trimmed.slice(0, spaceIndex), trimmed.slice(spaceIndex + 1)];
}

interface EntResponseDetail {
  documentUuid?: string;
  isOk?: boolean;
  message?: string;
}

interface LinkResponse {
  isOk?: boolean;
  link?: string;
  message?: string;
}

interface LastDocumentNumberResponse {
  isOk?: boolean;
  message?: string;
  documentId?: string;
}

/**
 * Belge ön eki — Kolaysoft panelinde e-Arşiv için TANIMLI olmalıdır;
 * tanımsız bir ön ekle gönderim reddedilir.
 *
 * Ortam değişkeniyle yapılandırılıyor çünkü test hesabı ile gerçek hesapta
 * farklı ön ekler kayıtlı. Ayrıca her satış kanalının kendi ön ekini
 * kullanması gerekir: aynı ön eki iki sistem paylaşırsa `lastDocumentNumber`
 * sorgusu ikisinde de aynı numarayı döndürüp fatura numarası çakışmasına
 * yol açar.
 *
 * Panelde tanımlı ön ekler şu uç noktadan görülebilir:
 *   GET /api/document/getPrefixCodeList?documentType=EARSIVFATURA
 */
const DOCUMENT_PREFIX = process.env.KOLAYSOFT_DOCUMENT_PREFIX ?? "DCC";

interface PrefixCodeListResponse {
  isOk?: boolean;
  message?: string;
  prefixCodeList?: Array<{ prefixCode?: string; active?: boolean }>;
}

/**
 * Belge ön ekinin Kolaysoft panelinde tanımlı ve aktif olduğunu doğrular.
 *
 * Bu kontrol gerekli çünkü tanımsız bir ön ekte `lastDocumentNumber` sorgusu
 * HATA VERMİYOR: `isOk: true` ile "<ÖNEK><YIL>000000000" ve "0000-00-00"
 * döndürüyor. Kod bunu geçerli sanıp göndermeye çalışır ve gönderim
 * aşamasında anlaşılmaz bir hatayla başarısız olur. Ön kontrol, hatayı
 * eyleme dönüştürülebilir bir mesaja çevirir.
 */
async function assertPrefixRegistered(prefixCode: string): Promise<void> {
  const res = await fetch(
    `${KOLAYSOFT_BASE_URL}/api/document/getPrefixCodeList?documentType=EARSIVFATURA`,
    { headers: authHeaders() }
  );
  const data = (await res.json().catch(() => ({}))) as PrefixCodeListResponse;

  const list = data.prefixCodeList ?? [];
  // Liste hiç alınamadıysa engellemiyoruz — geçici bir API sorunu yüzünden
  // fatura kesimini durdurmak, belirsiz hata riskinden daha zararlı olur.
  if (!data.isOk || list.length === 0) return;

  const kayitli = list.find((p) => p.prefixCode === prefixCode);
  if (!kayitli) {
    const mevcut = list.map((p) => p.prefixCode).filter(Boolean).join(", ");
    throw new Error(
      `Belge ön eki "${prefixCode}" Kolaysoft panelinde tanımlı değil. ` +
        `Tanımlı ön ekler: ${mevcut || "yok"}. ` +
        `Panelde bu ön eki oluşturun veya KOLAYSOFT_DOCUMENT_PREFIX değerini güncelleyin.`
    );
  }
  if (kayitli.active === false) {
    throw new Error(
      `Belge ön eki "${prefixCode}" tanımlı fakat pasif durumda. Kolaysoft panelinden aktifleştirin.`
    );
  }
}

/**
 * Bir sonraki fatura numarasını üretir (örn. "DCC2026000000004").
 * Kolaysoft'ta `documentId` boş bırakılamıyor — sunucu ön eki `substring`
 * ile ayırdığı için boş string gönderilirse "String index out of range"
 * hatası veriyor. Ön ek + yıl birleşik olmalı (örn. "DCC2026"), sadece
 * "DCC" gönderilirse "HATALI FATURA ÖN EKİ" hatası dönüyor.
 */
async function getNextDocumentId(): Promise<string> {
  await assertPrefixRegistered(DOCUMENT_PREFIX);

  const year = new Date().getFullYear();
  const documentIdPrefix = `${DOCUMENT_PREFIX}${year}`;
  const params = new URLSearchParams({
    documentType: "EARSIVFATURA",
    documentIdPrefix,
  });
  const res = await fetch(`${KOLAYSOFT_BASE_URL}/api/document/lastDocumentNumber?${params.toString()}`, {
    headers: authHeaders(),
  });
  const data = (await res.json().catch(() => ({}))) as LastDocumentNumberResponse;

  const sequenceLength = 16 - documentIdPrefix.length;
  if (data.isOk && data.documentId) {
    const lastSequence = Number(data.documentId.slice(documentIdPrefix.length));
    const nextSequence = String(lastSequence + 1).padStart(sequenceLength, "0");
    return `${documentIdPrefix}${nextSequence}`;
  }

  // Bu ön ek/yıl için hiç fatura yoksa 1'den başlar.
  return `${documentIdPrefix}${"1".padStart(sequenceLength, "0")}`;
}

/** Boş sevkiyat/teslimat detayı — bu sipariş için kullanılmıyor ama API alanların JSON'da bulunmasını bekliyor. */
const EMPTY_DELIVERY_DETAIL = {
  actualPackageId: "",
  actualPackagePTC: "",
  actualPackageQuantity: "",
  buildingName: "",
  buildingNumber: "",
  city: "",
  citySubdivision: "",
  country: "",
  deliveryTerms: "",
  gtip: "",
  packageBrand: "",
  postalZone: "",
  shipmentId: "",
  streetName: "",
  transportMeansTypeCode: "",
  transportModeCode: "",
} as const;

const EMPTY_DESPATCH_SHIPMENT = {
  actualDespatchDatetime: "",
  carrierId: "",
  carrierTitle: "",
  deliveryBuildingName: "",
  deliveryBuildingNumber: "",
  deliveryCity: "",
  deliveryCitySubdivision: "",
  deliveryCountry: "",
  deliveryPostalZone: "",
  deliveryRegion: "",
  deliveryRoomNumber: "",
  deliveryStreet: "",
  transportId: "",
} as const;

const EMPTY_DESPATCH_DRIVER_INFO = {
  familyName: "",
  firstName: "",
  identityCardNo: "",
} as const;

/**
 * Kolaysoft'a e-Arşiv fatura oluşturma isteği atar. Sadece sipariş
 * "Teslim Edildi" durumuna geçtiğinde çağrılması amaçlanmıştır — bkz.
 * admin/orders/[id]/route.ts.
 */
export async function createKolaysoftInvoice(
  input: KolaysoftCreateInvoiceInput
): Promise<KolaysoftCreateInvoiceResult> {
  const { KOLAYSOFT_USERNAME, KOLAYSOFT_PASSWORD } = process.env;
  if (!KOLAYSOFT_USERNAME || !KOLAYSOFT_PASSWORD) {
    return {
      success: false,
      error: "Kolaysoft ortam değişkenleri eksik (KOLAYSOFT_USERNAME / KOLAYSOFT_PASSWORD).",
    };
  }

  try {
    const documentUuid = crypto.randomUUID();
    const documentId = await getNextDocumentId();
    const now = new Date();
    const issueDateTime = now.toISOString().slice(0, 19);
    const issueDate = now.toISOString().slice(0, 10);

    const lines = input.items.map((item) => {
      const lineExtensionAmount = round2(item.unitPrice * item.quantity);
      const vatAmount = round2(lineExtensionAmount * (item.vatRate / 100));
      return {
        barcode: "",
        buyersItemIdentification: "",
        chargeUnitSerialNumber: "",
        charges: [
          {
            chargeCode: CHARGE_CODE_KDV,
            exemptionReason: "",
            exemptionReasonCode: "",
            stoppageCode: "",
            stoppageName: "",
            withholdingCode: "",
            withholdingName: "",
            taxableAmount: lineExtensionAmount,
            percentage: item.vatRate,
            amount: vatAmount,
          },
        ],
        classificationType: "",
        classificationValue: "",
        deliveryDetail: EMPTY_DELIVERY_DETAIL,
        expiry: "",
        gumrukTakipNo: "",
        innerItemCount: item.quantity,
        itemCode: "",
        itemName: item.name,
        kunyeNo: "",
        lineExplanation: "",
        lineExtensionAmount,
        lineId: "",
        lineNumber: "",
        malSahibi: "",
        malSahibiVkntckn: "",
        manufacturersItemIdentification: "",
        note: "",
        orderLineReference: "",
        originCountryCode: "",
        otvExemptionCode: "",
        outstandingQuantity: 0,
        outstandingReason: "",
        oversupplyQuantity: 0,
        plakaNo: "",
        quantity: item.quantity,
        rejectReason: "",
        timingComplaint: "",
        unit: UNIT_PIECE,
        unitPrice: item.unitPrice,
        vatRate: item.vatRate,
      };
    });

    const lineExtensionAmount = round2(lines.reduce((sum, l) => sum + l.lineExtensionAmount, 0));
    const vatTotal = round2(
      lines.reduce((sum, l) => sum + l.charges.reduce((s, c) => s + c.amount, 0), 0)
    );
    const taxInclusiveAmount = round2(lineExtensionAmount + vatTotal);

    // Türkiye'de fiili KDV oranı %20 fakat Kolaysoft'un alan adı tarihsel
    // olarak hâlâ "Kdv18" — %18 ve %20 aynı kovaya toplanır.
    const kdvBuckets = { 0: 0, 1: 0, 8: 0, 18: 0 } as Record<0 | 1 | 8 | 18, number>;
    for (const line of lines) {
      for (const charge of line.charges) {
        const bucket = charge.percentage === 20 ? 18 : (charge.percentage as 0 | 1 | 8 | 18);
        kdvBuckets[bucket] = round2((kdvBuckets[bucket] ?? 0) + charge.amount);
      }
    }

    const identityNumber = input.customer.identityNumber || GUEST_IDENTITY_NUMBER;
    const isKurumsal = input.invoiceType === "E_FATURA";
    const [givenName, familyName] = splitName(input.customer.fullName);

    const customer = {
      buildingName: "",
      buildingNo: "",
      cityName: input.customer.city || SELLER.cityName,
      citySubdivisionName: input.customer.district || SELLER.citySubdivisionName,
      countryName: "Türkiye",
      email: input.customer.email,
      familyName: isKurumsal ? "" : familyName,
      fax: "",
      formattedName: input.customer.fullName,
      givenName: isKurumsal ? "" : givenName,
      middleName: "",
      partyIdentifications: [],
      postalAddressRegion: "",
      postalAddressRoom: "",
      postalZone: "",
      postboxAlias: "",
      streetName: input.customer.address,
      taxOffice: isKurumsal ? input.customer.taxOffice ?? "" : "",
      telephone: input.customer.phone ?? "",
      title: "",
      vknTckn: identityNumber,
      webSite: "",
    };

    const supplierInfo = {
      buildingName: "",
      buildingNo: "",
      cityName: SELLER.cityName,
      citySubdivisionName: SELLER.citySubdivisionName,
      countryName: SELLER.countryName,
      email: SELLER.email,
      familyName: "",
      fax: "",
      formattedName: SELLER.formattedName,
      givenName: "",
      middleName: "",
      postalAddressRoom: "",
      postalZone: "",
      streetName: SELLER.streetName,
      taxOffice: SELLER.taxOffice,
      telephone: SELLER.telephone,
      vknTckn: SELLER.vknTckn,
    };

    const documentModel = {
      documentId,
      documentUuid,
      issueDateTime,
      additionalReferences: [],
      notes: input.note ? [input.note] : [""],
      documentCurrencyCode: "TRY",
      documentTypeCode: "SATIS",
      okcSerialNumber: "",
      profileId: "EARSIVFATURA",
      invoiceUuid: documentUuid,
      invoiceType: "EARSIVFATURA",
      sendingType: "ELEKTRONIK",
      customer,
      supplier: supplierInfo,
      destinationUrn: "",
      sourceUrn: "",
      deliveryPartyFirstName: "",
      deliveryPartyFamilyName: "",
      deliveryPartyId: "",
      deliveryPartyName: "",
      lineExtensionAmount,
      allowanceTotalAmount: 0,
      taxExclusiveAmount: lineExtensionAmount,
      taxInclusiveAmount,
      payableAmount: taxInclusiveAmount,
      actualDeliveryDate: "",
      instructionNote: "",
      orderReferenceDate: "",
      orderReferenceId: "",
      paymentChannelCode: "",
      paymentFinancialAccount: "",
      paymentFinancialCurrencyCode: "TRY",
      periodEndDate: "",
      periodStartDate: "",
      sgkFileNo: "",
      sgkMukellefAdi: "",
      sgkMukellefKodu: "",
      paymentDueDate: "",
      lines,
      despatchShipment: EMPTY_DESPATCH_SHIPMENT,
      despatchDriverInfo: EMPTY_DESPATCH_DRIVER_INFO,
      xsltId: "",
      despatchTypeCode: "",
      receiptDocumentReferenceNo: "",
      paymentVkn: "",
      paymentFormattedName: "",
      paymentCity: "",
      paymentCountry: "",
      isManual: true,
      totalKdv0Amount: kdvBuckets[0],
      totalKdv1Amount: kdvBuckets[1],
      totalKdv8Amount: kdvBuckets[8],
      totalKdv18Amount: kdvBuckets[18],
      mesulMudurAdSoyad: "",
      mesulMudurRuhsatnameTarih: "",
      mesulMudurBelgeNo: "",
      startDateTime: "",
      endDateTime: "",
      despatchId: "",
      despatchUuid: "",
      periodStartDateTime: "",
      periodEndDateTime: "",
      plakaNo: "",
      esuRaporId: "",
      esuRaporIdIssueDate: "",
      aracKimlikNo: "",
    };

    const body = [
      {
        destinationIdentifier: "",
        destinationUrn: "",
        documentDate: issueDate,
        documentId,
        documentModel,
        documentType: "EARSIVFATURA",
        documentUuid,
        localId: input.orderNumber,
        smmNote: "",
        sourceUrn: "",
        updateDocument: false,
      },
    ];

    const res = await fetch(`${KOLAYSOFT_BASE_URL}/api/document/sendDocumentModel`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        success: false,
        error: `Kolaysoft fatura oluşturma başarısız (HTTP ${res.status}): ${text}`,
      };
    }

    const results = (await res.json()) as EntResponseDetail[];
    const result = results[0];

    if (!result?.isOk) {
      return { success: false, error: result?.message ?? "Bilinmeyen Kolaysoft hatası." };
    }

    const pdfUrl = await fetchInvoicePdfLink(documentUuid, issueDate);

    return {
      success: true,
      invoiceNumber: documentId,
      ettn: documentUuid,
      pdfUrl,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Bilinmeyen hata.",
    };
  }
}

/**
 * Kesilmiş bir e-Arşiv faturasını GİB nezdinde iptal eder.
 *
 * Sipariş "İptal" veya "İade" durumuna alındığında çağrılır — bkz.
 * admin/orders/[id]/route.ts. e-Arşiv faturaları GİB'e günlük raporlarla
 * bildirildiğinden, iptal edilen fatura ilgili raporda iptal kaydıyla yer
 * alır; bu süreci Kolaysoft kendi tarafında yürütür, bizim yalnızca iptal
 * talebini iletmemiz gerekir.
 *
 * Vergi Usul Kanunu bakımından iptal işleminin gerekçesi ve tarihi mali
 * denetimde ispat aracı olduğundan, çağıran taraf sonucu mutlaka
 * veritabanına yazmalıdır.
 */
export async function cancelKolaysoftInvoice(params: {
  /** İptal edilecek faturanın ETTN'i (belge UUID'i). */
  ettn: string;
  /** İptal gerekçesi — GİB'e iletilir, boş bırakılamaz. */
  reason: string;
}): Promise<KolaysoftCancelInvoiceResult> {
  const { KOLAYSOFT_USERNAME, KOLAYSOFT_PASSWORD } = process.env;
  if (!KOLAYSOFT_USERNAME || !KOLAYSOFT_PASSWORD) {
    return {
      success: false,
      error: "Kolaysoft ortam değişkenleri eksik (KOLAYSOFT_USERNAME / KOLAYSOFT_PASSWORD).",
    };
  }

  if (!params.ettn) {
    return { success: false, error: "İptal edilecek faturanın ETTN'i bulunamadı." };
  }

  try {
    const body = {
      documentType: "EARSIVFATURA",
      documentUuid: params.ettn,
      cancelDate: new Date().toISOString().slice(0, 10),
      cancelReason: params.reason,
    };

    const res = await fetch(`${KOLAYSOFT_BASE_URL}/api/document/cancelDocument`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        success: false,
        error: `Kolaysoft fatura iptali başarısız (HTTP ${res.status}): ${text}`,
      };
    }

    // cancelDocument tek bir EntResponseDetail döner (sendDocumentModel'in
    // aksine dizi değil), fakat sunucunun dizi sarmalaması ihtimaline karşı
    // her iki biçim de karşılanıyor.
    const parsed = (await res.json()) as EntResponseDetail | EntResponseDetail[];
    const result = Array.isArray(parsed) ? parsed[0] : parsed;

    if (!result?.isOk) {
      return {
        success: false,
        error: result?.message ?? "Kolaysoft fatura iptalinde bilinmeyen hata.",
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Bilinmeyen hata.",
    };
  }
}

/** Fatura PDF linkini alır — başarısız olsa bile fatura kesimini geçersiz kılmaz, sadece pdfUrl boş kalır. */
async function fetchInvoicePdfLink(uuid: string, issueDate: string): Promise<string | undefined> {
  try {
    const params = new URLSearchParams({
      contentType: "PDF",
      documentType: "EARSIVFATURA",
      uuid,
      issueDate,
    });
    const res = await fetch(`${KOLAYSOFT_BASE_URL}/api/document/createLink?${params.toString()}`, {
      headers: authHeaders(),
    });
    if (!res.ok) return undefined;
    const data = (await res.json()) as LinkResponse;
    return data.isOk ? data.link : undefined;
  } catch {
    return undefined;
  }
}
