import { LegalPageLayout } from "@/components/LegalPageLayout";
import { ticariElektronikIleti } from "@/content/legal";

export const metadata = {
  title: `${ticariElektronikIleti.title} | Dünyanın Çiçeği`,
  description: ticariElektronikIleti.description,
};

export default function Page() {
  return <LegalPageLayout doc={ticariElektronikIleti} />;
}
