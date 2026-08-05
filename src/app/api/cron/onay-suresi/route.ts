import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { sweepExpiredApprovals } from "@/lib/approval";

/**
 * Süresi dolmuş görsel onay taleplerini işleyen zamanlayıcı ucu.
 *
 * NEDEN AYRICA VAR: Süre iki yerde uygulanıyor — yönetici panelinin yoklama
 * ucunda (panel açıkken 15 saniyede bir) ve burada. Panel açıkken ilki
 * yeterlidir ve bu uç hiç çağrılmasa da sistem doğru çalışır. Bu uç yalnızca
 * "panel kapalı ve müşteri linki hiç açmadı" durumunu kapatır: o hâlde sipariş
 * bir sonraki panel açılışına kadar onay bekliyor kalır.
 *
 * VARSAYILAN OLARAK KAPALIDIR. `CRON_SECRET` tanımlı değilse uç 503 döndürür
 * ve hiçbir iş yapmaz — bilinçli bir tercih: kimliksiz çağrılabilen bir uç,
 * siparişleri dışarıdan onaylatmaya izin verirdi.
 *
 * ETKİNLEŞTİRMEK İÇİN:
 *  1. Vercel'de `CRON_SECRET` değişkenine uzun ve rastgele bir değer verin.
 *  2. Bir zamanlayıcı bu adresi 5 dakikada bir çağırsın:
 *       GET /api/cron/onay-suresi
 *       Authorization: Bearer <CRON_SECRET>
 *     Vercel Cron bu başlığı kendisi ekler, ancak Hobby planında zamanlama
 *     günlük hassasiyette olduğu için 15 dakikalık bir pencere için yetmez.
 *     Dışarıdan ücretsiz bir zamanlayıcı (örn. cron-job.org) uygundur.
 */
export const dynamic = "force-dynamic";

function yetkili(header: string | null): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const gelen = header?.startsWith("Bearer ") ? header.slice(7) : "";
  if (!gelen) return false;

  // Hash'leyip karşılaştırmak, uzunlukları eşitleyerek timingSafeEqual'ın
  // fırlatmasını önler ve sızdırdığı tek bilgi eşit olup olmadıklarıdır.
  const a = createHash("sha256").update(gelen).digest();
  const b = createHash("sha256").update(secret).digest();
  return timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: "CRON_SECRET tanımlı değil — bu uç kapalı." },
      { status: 503 }
    );
  }

  if (!yetkili(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const onaylanan = await sweepExpiredApprovals();
  return NextResponse.json({ onaylanan });
}
