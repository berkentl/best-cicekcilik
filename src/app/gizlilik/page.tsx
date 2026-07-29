import { LegalPageLayout } from "@/components/LegalPageLayout";
import { gizlilikVeCerezPolitikasi } from "@/content/legal";

export const metadata = {
  alternates: { canonical: "/gizlilik" },
  title: `${gizlilikVeCerezPolitikasi.title}`,
  description: gizlilikVeCerezPolitikasi.description,
};

export default function Page() {
  return <LegalPageLayout doc={gizlilikVeCerezPolitikasi} />;
}
