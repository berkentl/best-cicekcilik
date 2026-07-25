import { LegalPageLayout } from "@/components/LegalPageLayout";
import { mesafeliSatisSozlesmesi } from "@/content/legal";

export const metadata = {
  title: `${mesafeliSatisSozlesmesi.title} | Dünyanın Çiçeği`,
  description: mesafeliSatisSozlesmesi.description,
};

export default function Page() {
  return <LegalPageLayout doc={mesafeliSatisSozlesmesi} />;
}
