import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

export interface OrderConfirmationProps {
  customerName: string;
  orderNumber: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  address: string;
  deliveryDate: string;
  deliveryTime: string;
  recipientName: string;
  cardMessage?: string;
  trackingUrl?: string;
  siteUrl?: string;
}

const currency = (n: number) => `₺${n.toLocaleString("tr-TR")}`;

export default function OrderConfirmation({
  customerName = "Ayşe Yılmaz",
  orderNumber = "ORD-A1B2C3D4-123",
  items = [
    { name: "13 Pink Peony", qty: 1, price: 5000 },
    { name: "Söz & Nişan Çikolatası", qty: 2, price: 750 },
  ],
  total = 6500,
  address = "Fulya, 19 Mayıs, Aytekin Kotil Cd. No:18, Şişli/İstanbul",
  deliveryDate = "18 Temmuz 2026",
  deliveryTime = "14:00 - 18:00",
  recipientName = "Ayşe Yılmaz",
  cardMessage,
  trackingUrl = "https://dunyanincicegi.com/siparis-takip",
  siteUrl = "https://dunyanincicegi.com",
}: OrderConfirmationProps) {
  return (
    <Html lang="tr">
      <Head />
      <Preview>
        Siparişiniz alındı — {orderNumber} numaralı siparişiniz özenle hazırlanıyor.
      </Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                ink: "#1d3435",
                accent: "#3d7b74",
                mint: "#6dbfb8",
                cream: "#faf8f5",
                line: "#ede8e3",
              },
            },
          },
        }}
      >
        <Body className="bg-[#faf8f5] font-sans">
          <Container className="mx-auto my-10 max-w-[560px] overflow-hidden rounded-2xl border border-line bg-white">
            {/* Header */}
            <Section className="bg-ink px-10 py-9 text-center">
              <Row>
                <Column align="center">
                  <Img
                    src={`${siteUrl}/icons/icon-192.png`}
                    width="40"
                    height="40"
                    alt="Dünyanın Çiçeği"
                    className="mx-auto mb-3 rounded-full"
                  />
                  <Text className="m-0 text-[11px] font-semibold uppercase tracking-[0.25em] text-mint">
                    Dünyanın Çiçeği
                  </Text>
                  <Heading className="m-0 mt-2 text-[26px] font-medium text-white">
                    Siparişiniz Alındı 🌸
                  </Heading>
                </Column>
              </Row>
            </Section>

            {/* Body */}
            <Section className="px-10 py-9">
              <Text className="m-0 mb-1 text-[13px] text-[#888]">
                Merhaba {customerName},
              </Text>
              <Text className="m-0 mb-6 text-[14px] leading-relaxed text-ink">
                Siparişiniz başarıyla alındı. Çiçeklerinizi özenle hazırlayıp
                belirttiğiniz adrese aynı gün teslim edeceğiz.
              </Text>

              {/* Order + delivery info */}
              <Section className="mb-6 rounded-xl border border-[#dceee8] bg-[#f5f9f8] px-5 py-4">
                <Row>
                  <Column>
                    <Text className="m-0 text-[10px] font-bold uppercase tracking-[0.15em] text-mint">
                      Sipariş Numarası
                    </Text>
                    <Text className="m-0 mt-1 text-[17px] font-bold text-ink">
                      {orderNumber}
                    </Text>
                  </Column>
                  <Column align="right">
                    <Text className="m-0 text-[10px] font-bold uppercase tracking-[0.15em] text-mint">
                      Teslimat
                    </Text>
                    <Text className="m-0 mt-1 text-[13px] font-semibold text-ink">
                      {deliveryDate} · {deliveryTime}
                    </Text>
                  </Column>
                </Row>
              </Section>

              {/* Items */}
              <table width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <td style={{ padding: "0 0 8px", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#999", borderBottom: "2px solid #f0ebe6" }}>
                      Ürün
                    </td>
                    <td style={{ padding: "0 0 8px", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#999", borderBottom: "2px solid #f0ebe6", textAlign: "center" }}>
                      Adet
                    </td>
                    <td style={{ padding: "0 0 8px", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#999", borderBottom: "2px solid #f0ebe6", textAlign: "right" }}>
                      Tutar
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i}>
                      <td style={{ padding: "10px 0", fontSize: 13, color: "#1d3435", borderBottom: "1px solid #f0ebe6" }}>
                        {item.name}
                      </td>
                      <td style={{ padding: "10px 0", fontSize: 13, color: "#666", borderBottom: "1px solid #f0ebe6", textAlign: "center" }}>
                        ×{item.qty}
                      </td>
                      <td style={{ padding: "10px 0", fontSize: 13, fontWeight: 600, color: "#1d3435", borderBottom: "1px solid #f0ebe6", textAlign: "right" }}>
                        {currency(item.price * item.qty)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2} style={{ padding: "14px 0 0", fontSize: 14, fontWeight: 700, color: "#1d3435" }}>
                      Toplam
                    </td>
                    <td style={{ padding: "14px 0 0", fontSize: 17, fontWeight: 800, color: "#1d3435", textAlign: "right" }}>
                      {currency(total)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Delivery details */}
              <Section className="mt-6 rounded-xl bg-cream px-5 py-4">
                <Text className="m-0 mb-1 text-[13px] leading-relaxed text-[#545454]">
                  <span className="font-semibold text-ink">Alıcı:</span> {recipientName}
                </Text>
                <Text className="m-0 text-[13px] leading-relaxed text-[#545454]">
                  <span className="font-semibold text-ink">Adres:</span> {address}
                </Text>
                {cardMessage && (
                  <Text className="m-0 mt-2 text-[13px] italic leading-relaxed text-[#888]">
                    &ldquo;{cardMessage}&rdquo;
                  </Text>
                )}
              </Section>

              {/* CTA */}
              <Section className="mt-8 text-center">
                <Link
                  href={trackingUrl}
                  className="inline-block rounded-lg bg-accent px-8 py-3 text-[13px] font-bold uppercase tracking-wider text-white no-underline"
                >
                  Siparişimi Takip Et
                </Link>
              </Section>
            </Section>

            <Hr className="m-0 border-line" />

            {/* Footer */}
            <Section className="bg-[#f9f7f4] px-10 py-6 text-center">
              <Text className="m-0 text-[12px] text-[#999]">
                Sorularınız için:{" "}
                <Link href="tel:05322959309" className="text-accent no-underline">
                  0532 295 93 09
                </Link>
              </Text>
              <Text className="m-0 mt-1.5 text-[11px] text-[#bbb]">
                dunyanincicegi.com · Şişli, İstanbul
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
