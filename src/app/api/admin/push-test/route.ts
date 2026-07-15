import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { sendPushToAdmins } from "@/lib/push";

export async function POST() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const result = await sendPushToAdmins({
    title: "🔔 Test Bildirimi",
    body: "Push bildirimleri doğru şekilde çalışıyor.",
    url: "/admin",
    tag: "push-test",
  });

  return NextResponse.json(result);
}
