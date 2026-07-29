import { LegalPageLayout } from "@/components/LegalPageLayout";
import { uyelikSozlesmesi } from "@/content/legal";

export const metadata = {
  alternates: { canonical: "/kullanim-kosullari" },
  title: `${uyelikSozlesmesi.title}`,
  description: uyelikSozlesmesi.description,
};

export default function Page() {
  return <LegalPageLayout doc={uyelikSozlesmesi} />;
}
