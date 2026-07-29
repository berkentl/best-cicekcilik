import { LegalPageLayout } from "@/components/LegalPageLayout";
import { acikRizaMetni } from "@/content/legal";

export const metadata = {
  alternates: { canonical: "/acik-riza-metni" },
  title: `${acikRizaMetni.title}`,
  description: acikRizaMetni.description,
};

export default function Page() {
  return <LegalPageLayout doc={acikRizaMetni} />;
}
