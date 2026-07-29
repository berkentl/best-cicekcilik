import { LegalPageLayout } from "@/components/LegalPageLayout";
import { iptalVeIadeKosullari } from "@/content/legal";

export const metadata = {
  alternates: { canonical: "/iade" },
  title: `${iptalVeIadeKosullari.title}`,
  description: iptalVeIadeKosullari.description,
};

export default function Page() {
  return <LegalPageLayout doc={iptalVeIadeKosullari} />;
}
