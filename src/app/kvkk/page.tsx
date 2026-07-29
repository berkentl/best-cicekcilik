import { LegalPageLayout } from "@/components/LegalPageLayout";
import { kvkkAydinlatmaMetni } from "@/content/legal";

export const metadata = {
  alternates: { canonical: "/kvkk" },
  title: `${kvkkAydinlatmaMetni.title}`,
  description: kvkkAydinlatmaMetni.description,
};

export default function Page() {
  return <LegalPageLayout doc={kvkkAydinlatmaMetni} />;
}
