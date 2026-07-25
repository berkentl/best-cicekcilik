import { LegalPageLayout } from "@/components/LegalPageLayout";
import { onBilgilendirmeFormu } from "@/content/legal";

export const metadata = {
  title: `${onBilgilendirmeFormu.title} | Dünyanın Çiçeği`,
  description: onBilgilendirmeFormu.description,
};

export default function Page() {
  return <LegalPageLayout doc={onBilgilendirmeFormu} />;
}
