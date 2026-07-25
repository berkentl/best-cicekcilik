import { createServerClient } from "@/lib/supabase-server";

export interface CustomerRow {
  id: string | null;
  name: string;
  email: string;
  phone: string;
  isMember: boolean;
  orders: number;
  total: number;
  joined: string;
  /**
   * Ticari elektronik ileti onayı — consent_logs'taki en son kayda göre.
   * Kampanya SMS'i / e-postası göndermeden önce MUTLAKA kontrol edilmelidir;
   * onayı olmayan kişiye gönderim 6563 sayılı Kanun ihlalidir.
   */
  pazarlamaEposta: boolean;
  pazarlamaSms: boolean;
  /**
   * Onay alınmış fakat henüz İYS'ye yüklenmemiş kayıt var mı?
   * İYS'ye yüklenmemiş onaya dayanarak gönderim yapılamaz.
   */
  iysBekliyor: boolean;
}

/** Üye (`users`) ve misafir (`orders`) kayıtlarını e-postaya göre birleştirip tek bir müşteri listesi üretir. */
export async function getAggregatedCustomers(): Promise<CustomerRow[]> {
  const sb = createServerClient();

  const [
    { data: users, error: usersErr },
    { data: orders, error: ordersErr },
    { data: consents, error: consentsErr },
  ] = await Promise.all([
    sb.from("users").select("id, name, email, phone, created_at"),
    sb
      .from("orders")
      .select("email, customer_name, customer_phone, total_amount, status, created_at"),
    // Yalnızca ticari ileti onayları — çerez onayları müşteri bazlı
      // pazarlama izniyle ilgili olmadığı için dışarıda bırakılıyor.
    sb
      .from("consent_logs")
      .select("email, consent_type, granted, iys_status, created_at")
      .in("consent_type", ["pazarlama_eposta", "pazarlama_sms"])
      .order("created_at", { ascending: false }),
  ]);

  if (usersErr) console.error("[customers] users error:", usersErr);
  if (ordersErr) console.error("[customers] orders error:", ordersErr);
  if (consentsErr) console.error("[customers] consent_logs error:", consentsErr);

  /**
   * E-posta + onay türü başına EN SON kayıt geçerlidir. Sorgu created_at'e
   * göre azalan sırada geldiğinden, ilk görülen kayıt en yenisidir.
   */
  const onaylar = new Map<
    string,
    { pazarlamaEposta: boolean; pazarlamaSms: boolean; iysBekliyor: boolean }
  >();

  const gorulen = new Set<string>();
  for (const c of consents ?? []) {
    const email = String(c.email ?? "").toLowerCase().trim();
    if (!email) continue;

    const kayit =
      onaylar.get(email) ??
      { pazarlamaEposta: false, pazarlamaSms: false, iysBekliyor: false };

    const anahtar = `${email}|${c.consent_type}`;
    if (!gorulen.has(anahtar)) {
      gorulen.add(anahtar);
      if (c.consent_type === "pazarlama_eposta") kayit.pazarlamaEposta = c.granted;
      if (c.consent_type === "pazarlama_sms") kayit.pazarlamaSms = c.granted;
      // Geçerli onay İYS'ye yüklenmemişse gönderim yapılamaz
      if (c.granted && (c.iys_status === "beklemede" || c.iys_status === "hata")) {
        kayit.iysBekliyor = true;
      }
    }

    onaylar.set(email, kayit);
  }

  const onayGetir = (email: string) =>
    onaylar.get(email) ?? {
      pazarlamaEposta: false,
      pazarlamaSms: false,
      iysBekliyor: false,
    };

  const map = new Map<string, CustomerRow>();

  for (const u of users ?? []) {
    const email = String(u.email ?? "").toLowerCase().trim();
    if (!email) continue;
    map.set(email, {
      id: u.id,
      name: u.name || email,
      email,
      phone: u.phone || "—",
      isMember: true,
      orders: 0,
      total: 0,
      joined: u.created_at,
      ...onayGetir(email),
    });
  }

  for (const o of orders ?? []) {
    const email = String(o.email ?? "").toLowerCase().trim();
    if (!email) continue;
    const isCancelled = o.status === "İptal" || o.status === "cancelled";
    const existing = map.get(email);

    if (existing) {
      existing.orders += 1;
      if (!isCancelled) existing.total += o.total_amount ?? 0;
      if (!existing.isMember && new Date(o.created_at) < new Date(existing.joined)) {
        existing.joined = o.created_at;
      }
    } else {
      map.set(email, {
        id: null,
        name: o.customer_name || email,
        email,
        phone: o.customer_phone || "—",
        isMember: false,
        orders: 1,
        total: isCancelled ? 0 : (o.total_amount ?? 0),
        joined: o.created_at,
        ...onayGetir(email),
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}
