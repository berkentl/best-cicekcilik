import { LegalPageLayout } from "@/components/LegalPageLayout";
import { uyelikSozlesmesi } from "@/content/legal";

export const metadata = {
  title: `${uyelikSozlesmesi.title} | Dünyanın Çiçeği`,
  description: uyelikSozlesmesi.description,
};

export default function Page() {
  return <LegalPageLayout doc={uyelikSozlesmesi} />;
}
