import { LegalPageLayout } from "@/components/LegalPageLayout";
import { teslimatBilgileri } from "@/content/legal";

export const metadata = {
  title: `${teslimatBilgileri.title} | Dünyanın Çiçeği`,
  description: teslimatBilgileri.description,
};

export default function Page() {
  return <LegalPageLayout doc={teslimatBilgileri} />;
}
