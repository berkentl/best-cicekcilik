import webPush from "web-push";
import { createServerClient } from "@/lib/supabase-server";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY ?? "";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webPush.setVapidDetails(
    "mailto:berketimr2@gmail.com",
    VAPID_PUBLIC,
    VAPID_PRIVATE
  );
}

export type PushResult = {
  vapidConfigured: boolean;
  subscriptionCount: number;
  sent: number;
  failed: number;
  errors: string[];
};

export async function sendPushToAdmins(payload: {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}): Promise<PushResult> {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    console.warn("[push] VAPID keys not configured — skipping push");
    return { vapidConfigured: false, subscriptionCount: 0, sent: 0, failed: 0, errors: [] };
  }

  const sb = createServerClient();
  const { data: subs } = await sb.from("push_subscriptions").select("subscription");
  if (!subs?.length) {
    return { vapidConfigured: true, subscriptionCount: 0, sent: 0, failed: 0, errors: [] };
  }

  const message = JSON.stringify(payload);
  const errors: string[] = [];
  let sent = 0;

  const results = await Promise.allSettled(
    subs.map(({ subscription }) =>
      // urgency: "high" — mobil işletim sistemine cihazı hemen uyandırıp
      // bildirimi geciktirmeden teslim etmesini söyler (varsayılan "normal"
      // pil tasarrufu için teslimi erteleyebiliyor, özellikle kilitli/arka
      // plandaki telefonlarda gözle görülür gecikmeye yol açar).
      webPush.sendNotification(subscription as webPush.PushSubscription, message, {
        urgency: "high",
        TTL: 60,
      })
    )
  );

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      sent++;
      return;
    }
    const err = result.reason as { statusCode?: number; body?: string; message?: string };
    errors.push(`${err.statusCode ?? "?"}: ${err.body ?? err.message ?? "bilinmeyen hata"}`);
    if (err.statusCode === 410 || err.statusCode === 404) {
      const endpoint = (subs[i].subscription as { endpoint: string }).endpoint;
      sb.from("push_subscriptions").delete().eq("endpoint", endpoint).then(() => {});
    }
  });

  return {
    vapidConfigured: true,
    subscriptionCount: subs.length,
    sent,
    failed: subs.length - sent,
    errors,
  };
}
