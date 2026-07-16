/**
 * Kolaysoft e-Fatura / e-Arşiv Fatura entegrasyonu.
 *
 * ÖNEMLİ — canlıya almadan önce mutlaka okuyun:
 * Buradaki endpoint yolları ve istek/yanıt alan adları, Kolaysoft'un
 * tipik "login → token → fatura oluştur" web servisi desenine göre
 * yazıldı. Kolaysoft hesabınıza özel API dokümantasyonunuz elimde
 * olmadığı için KOLAYSOFT_BASE_URL ve aşağıdaki endpoint sabitlerini,
 * Kolaysoft'un size verdiği gerçek API dokümantasyonu/sandbox ortamıyla
 * karşılaştırıp doğrulamanız gerekir. Yapı (tipler, mapping, akış) sağlam
 * ve kullanıma hazır; sadece gerçek uç nokta/alan adlarının teyidi gerekiyor.
 */

const KOLAYSOFT_BASE_URL =
  process.env.KOLAYSOFT_BASE_URL ?? "https://efaturawebservis.kolaysoft.com";

export type KolaysoftInvoiceType = "E_ARSIV" | "E_FATURA";

export interface KolaysoftInvoiceCustomer {
  fullName: string;
  /**
   * Bireysel müşteri için TC Kimlik No (11 hane), kurumsal müşteri için
   * Vergi Kimlik No (10 hane). Checkout formunda şu an bu alan
   * toplanmıyor — bkz. mapOrderToKolaysoftInvoice() içindeki not.
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
  /** Yüzde olarak KDV oranı — örn. 20. Kesin oran muhasebeciniz ile teyit edilmeli. */
  vatRate: number;
}

export interface KolaysoftCreateInvoiceInput {
  orderNumber: string;
  invoiceType?: KolaysoftInvoiceType;
  customer: KolaysoftInvoiceCustomer;
  items: KolaysoftInvoiceLineItem[];
  /** Faturanın PDF'inin müşteriye e-posta ile de gönderilip gönderilmeyeceği. */
  sendEmailToCustomer?: boolean;
  note?: string;
}

export interface KolaysoftCreateInvoiceResult {
  success: boolean;
  invoiceNumber?: string;
  /** e-Fatura/e-Arşiv Evrensel Tekil Tanımlama Numarası. */
  ettn?: string;
  pdfUrl?: string;
  error?: string;
}

interface KolaysoftLoginResponse {
  token: string;
  /** Saniye cinsinden geçerlilik süresi. */
  expiresIn?: number;
}

interface KolaysoftCreateInvoiceApiRequest {
  orderNumber: string;
  invoiceType: KolaysoftInvoiceType;
  sendEmailToCustomer: boolean;
  note?: string;
  customer: {
    fullName: string;
    identityNumber: string;
    taxOffice?: string;
    email: string;
    phone?: string;
    address: string;
    city: string;
    district: string;
  };
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    vatRate: number;
    lineTotal: number;
    vatAmount: number;
  }[];
  subtotal: number;
  vatTotal: number;
  grandTotal: number;
}

interface KolaysoftCreateInvoiceApiResponse {
  success: boolean;
  invoiceNumber?: string;
  ettn?: string;
  pdfUrl?: string;
  errorMessage?: string;
}

/** e-Arşiv/e-Fatura zorunlu değilse kullanılan, TC Kimlik No toplanmadığında düşecek yer tutucu. */
const GUEST_IDENTITY_NUMBER = "11111111111";

let cachedToken: { value: string; expiresAt: number } | null = null;

async function kolaysoftLogin(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  const { KOLAYSOFT_API_KEY, KOLAYSOFT_USERNAME, KOLAYSOFT_PASSWORD } = process.env;
  if (!KOLAYSOFT_API_KEY || !KOLAYSOFT_USERNAME || !KOLAYSOFT_PASSWORD) {
    throw new Error(
      "Kolaysoft ortam değişkenleri eksik (KOLAYSOFT_API_KEY / KOLAYSOFT_USERNAME / KOLAYSOFT_PASSWORD)."
    );
  }

  const res = await fetch(`${KOLAYSOFT_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiKey: KOLAYSOFT_API_KEY,
      username: KOLAYSOFT_USERNAME,
      password: KOLAYSOFT_PASSWORD,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Kolaysoft login başarısız (HTTP ${res.status}): ${text}`);
  }

  const data = (await res.json()) as KolaysoftLoginResponse;
  if (!data.token) {
    throw new Error("Kolaysoft login yanıtında token bulunamadı.");
  }

  const ttlMs = (data.expiresIn ?? 3300) * 1000; // varsayılan ~55dk, süre bitmeden yenilenir
  cachedToken = { value: data.token, expiresAt: Date.now() + ttlMs - 30_000 };
  return data.token;
}

/**
 * İç sipariş verisini Kolaysoft'un fatura oluşturma isteği yapısına çevirir.
 *
 * NOT: `identityNumber` (TC Kimlik No / VKN) şu an checkout formunda
 * toplanmıyor. Yasal olarak doğru e-Arşiv/e-Fatura kesebilmek için bu
 * alanın checkout'a eklenmesi gerekir — eklenene kadar burada geçici bir
 * "misafir" yer tutucu kullanılıyor. Muhasebecinizle teyit edin.
 */
export function mapOrderToKolaysoftInvoice(order: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerIdentityNumber?: string;
  address: string;
  city: string;
  district: string;
  items: { name: string; qty: number; price: number }[];
  vatRate?: number;
  sendEmailToCustomer?: boolean;
}): KolaysoftCreateInvoiceInput {
  const vatRate = order.vatRate ?? 20;

  return {
    orderNumber: order.orderNumber,
    invoiceType: "E_ARSIV",
    sendEmailToCustomer: order.sendEmailToCustomer ?? true,
    customer: {
      fullName: order.customerName,
      identityNumber: order.customerIdentityNumber,
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

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Kolaysoft'a login olup fatura oluşturma isteğini atar. Sipariş
 * tamamlandığında (checkout akışında) çağrılması amaçlanmıştır.
 */
export async function createKolaysoftInvoice(
  input: KolaysoftCreateInvoiceInput
): Promise<KolaysoftCreateInvoiceResult> {
  try {
    const token = await kolaysoftLogin();

    const items = input.items.map((item) => {
      const lineTotal = round2(item.unitPrice * item.quantity);
      const vatAmount = round2(lineTotal * (item.vatRate / 100));
      return {
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        vatRate: item.vatRate,
        lineTotal,
        vatAmount,
      };
    });

    const subtotal = round2(items.reduce((sum, i) => sum + i.lineTotal, 0));
    const vatTotal = round2(items.reduce((sum, i) => sum + i.vatAmount, 0));
    const grandTotal = round2(subtotal + vatTotal);

    const payload: KolaysoftCreateInvoiceApiRequest = {
      orderNumber: input.orderNumber,
      invoiceType: input.invoiceType ?? "E_ARSIV",
      sendEmailToCustomer: input.sendEmailToCustomer ?? true,
      note: input.note,
      customer: {
        fullName: input.customer.fullName,
        identityNumber: input.customer.identityNumber || GUEST_IDENTITY_NUMBER,
        taxOffice: input.customer.taxOffice,
        email: input.customer.email,
        phone: input.customer.phone,
        address: input.customer.address,
        city: input.customer.city,
        district: input.customer.district,
      },
      items,
      subtotal,
      vatTotal,
      grandTotal,
    };

    const res = await fetch(`${KOLAYSOFT_BASE_URL}/api/invoices/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        success: false,
        error: `Kolaysoft fatura oluşturma başarısız (HTTP ${res.status}): ${text}`,
      };
    }

    const data = (await res.json()) as KolaysoftCreateInvoiceApiResponse;
    if (!data.success) {
      return { success: false, error: data.errorMessage ?? "Bilinmeyen Kolaysoft hatası." };
    }

    return {
      success: true,
      invoiceNumber: data.invoiceNumber,
      ettn: data.ettn,
      pdfUrl: data.pdfUrl,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Bilinmeyen hata.",
    };
  }
}
