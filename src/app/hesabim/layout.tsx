import { redirect } from "next/navigation";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { Footer } from "@/components/Footer";
import { AccountShell } from "@/components/account/AccountShell";
import { getCurrentUser } from "@/lib/auth";

export const metadata = {
  title: "Hesabım | Dünyanın Çiçeği",
};

export default async function HesabimLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/giris?next=/hesabim");
  }

  return (
    <>
      <AnnouncementBar />
      <HeaderWrapper />
      <main>
        <AccountShell user={user}>{children}</AccountShell>
      </main>
      <Footer />
    </>
  );
}
