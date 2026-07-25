import { LegalPageLayout } from "@/components/LegalPageLayout";
import { acikRizaMetni } from "@/content/legal";

export const metadata = {
  title: `${acikRizaMetni.title} | Dünyanın Çiçeği`,
  description: acikRizaMetni.description,
};

export default function Page() {
  return <LegalPageLayout doc={acikRizaMetni} />;
}
