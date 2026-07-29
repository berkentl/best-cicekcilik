import { LegalPageLayout } from "@/components/LegalPageLayout";
import { teslimatBilgileri } from "@/content/legal";

export const metadata = {
  alternates: { canonical: "/teslimat" },
  title: `${teslimatBilgileri.title}`,
  description: teslimatBilgileri.description,
};

export default function Page() {
  return <LegalPageLayout doc={teslimatBilgileri} />;
}
