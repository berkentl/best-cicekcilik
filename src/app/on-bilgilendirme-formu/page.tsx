import { LegalPageLayout } from "@/components/LegalPageLayout";
import { onBilgilendirmeFormu } from "@/content/legal";

export const metadata = {
  alternates: { canonical: "/on-bilgilendirme-formu" },
  title: `${onBilgilendirmeFormu.title}`,
  description: onBilgilendirmeFormu.description,
};

export default function Page() {
  return <LegalPageLayout doc={onBilgilendirmeFormu} />;
}
