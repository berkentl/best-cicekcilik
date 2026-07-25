import { LegalPageLayout } from "@/components/LegalPageLayout";
import { kvkkAydinlatmaMetni } from "@/content/legal";

export const metadata = {
  title: `${kvkkAydinlatmaMetni.title} | Dünyanın Çiçeği`,
  description: kvkkAydinlatmaMetni.description,
};

export default function Page() {
  return <LegalPageLayout doc={kvkkAydinlatmaMetni} />;
}
