import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ProfileForm } from "@/components/account/ProfileForm";
import { ConsentPreferences } from "@/components/account/ConsentPreferences";

export const metadata = { title: "Hesap Bilgilerim", robots: { index: false, follow: true } };

export default async function HesapBilgilerimPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris?next=/hesabim/hesap-bilgilerim");

  return (
    <div className="space-y-5">
      <ProfileForm user={user} />
      {/* Onaylar profil verisinden ayrı tutulur — her biri bağımsız olarak
          verilebilir ve geri alınabilir olmalıdır. */}
      <ConsentPreferences />
    </div>
  );
}
