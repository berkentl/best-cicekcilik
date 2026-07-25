import { LegalPageLayout } from "@/components/LegalPageLayout";
import { iptalVeIadeKosullari } from "@/content/legal";

export const metadata = {
  title: `${iptalVeIadeKosullari.title} | Dünyanın Çiçeği`,
  description: iptalVeIadeKosullari.description,
};

export default function Page() {
  return <LegalPageLayout doc={iptalVeIadeKosullari} />;
}
