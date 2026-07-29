import { OrdersList } from "@/components/account/OrdersList";

export const metadata = { title: "Siparişlerim", robots: { index: false, follow: true } };

export default function SiparislerimPage() {
  return <OrdersList />;
}
