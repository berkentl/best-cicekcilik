import { LegalPageLayout } from "@/components/LegalPageLayout";
import { mesafeliSatisSozlesmesi } from "@/content/legal";

export const metadata = {
  alternates: { canonical: "/mesafeli-satis-sozlesmesi" },
  title: `${mesafeliSatisSozlesmesi.title}`,
  description: mesafeliSatisSozlesmesi.description,
};

export default function Page() {
  return <LegalPageLayout doc={mesafeliSatisSozlesmesi} />;
}
