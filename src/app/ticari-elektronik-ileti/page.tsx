import { LegalPageLayout } from "@/components/LegalPageLayout";
import { ticariElektronikIleti } from "@/content/legal";

export const metadata = {
  alternates: { canonical: "/ticari-elektronik-ileti" },
  title: `${ticariElektronikIleti.title}`,
  description: ticariElektronikIleti.description,
};

export default function Page() {
  return <LegalPageLayout doc={ticariElektronikIleti} />;
}
