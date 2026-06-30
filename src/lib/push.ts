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

export async function sendPushToAdmins(payload: {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    console.warn("[push] VAPID keys not configured — skipping push");
    return;
  }

  const sb = createServerClient();
  const { data: subs } = await sb.from("push_subscriptions").select("subscription");
  if (!subs?.length) return;

  const message = JSON.stringify(payload);

  await Promise.allSettled(
    subs.map(({ subscription }) =>
      webPush.sendNotification(
        subscription as webPush.PushSubscription,
        message
      ).catch((err) => {
        if (err.statusCode === 410) {
          sb.from("push_subscriptions").delete().eq("endpoint", (subscription as { endpoint: string }).endpoint);
        }
      })
    )
  );
}
