import { LegalPageLayout } from "@/components/LegalPageLayout";
import { gizlilikVeCerezPolitikasi } from "@/content/legal";

export const metadata = {
  title: `${gizlilikVeCerezPolitikasi.title} | Dünyanın Çiçeği`,
  description: gizlilikVeCerezPolitikasi.description,
};

export default function Page() {
  return <LegalPageLayout doc={gizlilikVeCerezPolitikasi} />;
}
