import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ProfileForm } from "@/components/account/ProfileForm";

export const metadata = { title: "Hesap Bilgilerim | Dünyanın Çiçeği" };

export default async function HesapBilgilerimPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris?next=/hesabim/hesap-bilgilerim");

  return <ProfileForm user={user} />;
}
