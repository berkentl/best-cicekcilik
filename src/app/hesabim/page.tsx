import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase-server";
import { PackageIcon, MapPinIcon, HeartIcon, UserIcon, ArrowRightIcon } from "@/components/icons";
import { FavoriteCountBadge } from "@/components/account/FavoriteCountBadge";
import { STATUS_CONFIG } from "@/components/account/orderStatus";

async function getOverviewData(userId: string, email: string) {
  const sb = createServerClient();

  const [{ data: lastOrder }, { count: orderCount }, { count: addressCount }] = await Promise.all([
    sb
      .from("orders")
      .select("id, order_number, status, total_amount, created_at")
      .or(`user_id.eq.${userId},email.eq.${email}`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    sb
      .from("orders")
      .select("id", { count: "exact", head: true })
      .or(`user_id.eq.${userId},email.eq.${email}`),
    sb
      .from("addresses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
  ]);

  return {
    lastOrder,
    orderCount: orderCount ?? 0,
    addressCount: addressCount ?? 0,
  };
}

export default async function HesabimOverviewPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { lastOrder, orderCount, addressCount } = await getOverviewData(user.id, user.email);
  const firstName = user.name?.split(" ")[0] || "Hoş Geldiniz";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-poppins text-2xl md:text-[28px] font-semibold text-[#1d3435]">
          Merhaba, {firstName}
        </h1>
        <p className="text-[13.5px] text-[#8a9c9c] mt-1">
          Hesap panelinizden siparişlerinizi, adreslerinizi ve favorilerinizi yönetebilirsiniz.
        </p>
      </div>

      {/* Son sipariş */}
      <div className="bg-white rounded-2xl border border-[#ede8e3] p-6 md:p-7">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8a9c9c] mb-4">
          Son Siparişiniz
        </p>
        {lastOrder ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[15px] font-semibold text-[#1d3435] mb-1">
                #{lastOrder.order_number}
              </p>
              <p className="text-[12.5px] text-[#8a9c9c]">
                {new Date(lastOrder.created_at).toLocaleDateString("tr-TR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}{" "}
                · ₺{Number(lastOrder.total_amount).toLocaleString("tr-TR")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-[11.5px] font-semibold px-3 py-1.5 rounded-full ${
                  STATUS_CONFIG[lastOrder.status as keyof typeof STATUS_CONFIG]?.bg ?? "bg-gray-100"
                } ${STATUS_CONFIG[lastOrder.status as keyof typeof STATUS_CONFIG]?.color ?? "text-gray-700"}`}
              >
                {lastOrder.status}
              </span>
              <Link
                href="/hesabim/siparislerim"
                className="flex items-center gap-1.5 text-[13px] font-semibold text-[#1d3435] hover:text-[#3d7b74] transition-colors"
              >
                Detay <ArrowRightIcon size={14} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <p className="text-[13.5px] text-[#8a9c9c]">Henüz bir siparişiniz bulunmuyor.</p>
            <Link href="/tum-urunler" className="btn-primary text-[12px]">
              Alışverişe Başla
            </Link>
          </div>
        )}
      </div>

      {/* Hızlı erişim kartları */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickCard href="/hesabim/siparislerim" icon={PackageIcon} label="Siparişlerim" value={String(orderCount)} />
        <QuickCard href="/hesabim/adreslerim" icon={MapPinIcon} label="Adreslerim" value={String(addressCount)} />
        <QuickCard
          href="/hesabim/favorilerim"
          icon={HeartIcon}
          label="Favorilerim"
          value={<FavoriteCountBadge />}
        />
        <QuickCard href="/hesabim/hesap-bilgilerim" icon={UserIcon} label="Hesap Bilgilerim" value="Düzenle" />
      </div>
    </div>
  );
}

function QuickCard({
  href,
  icon: Icon,
  label,
  value,
}: {
  href: string;
  icon: typeof PackageIcon;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-2xl border border-[#ede8e3] p-5 hover:border-[#3d7b74]/40 hover:shadow-[0_8px_24px_-12px_rgba(29,52,53,0.15)] transition-all duration-200 group"
    >
      <div className="w-9 h-9 rounded-full bg-[#f5f9f8] flex items-center justify-center text-[#3d7b74] mb-3 group-hover:bg-[#3d7b74] group-hover:text-white transition-colors duration-200">
        <Icon size={16} />
      </div>
      <p className="text-[17px] font-semibold text-[#1d3435] leading-none mb-1">{value}</p>
      <p className="text-[12px] text-[#8a9c9c]">{label}</p>
    </Link>
  );
}
