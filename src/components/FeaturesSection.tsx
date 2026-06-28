import { TruckIcon, StarIcon, PhoneIcon, HeartIcon } from "@/components/icons";

const features = [
  {
    icon: TruckIcon,
    title: "Aynı Gün Teslimat",
    desc: "Saat 14:00'a kadar verilen siparişlerde tüm İstanbul'a aynı gün teslimat.",
  },
  {
    icon: StarIcon,
    title: "Taze & Kaliteli",
    desc: "Günlük taze çiçekler, özenle hazırlanmış aranjmanlar.",
  },
  {
    icon: HeartIcon,
    title: "Kişiye Özel",
    desc: "İsteklerinize göre özel tasarım ve kart notları hazırlıyoruz.",
  },
  {
    icon: PhoneIcon,
    title: "7/24 Destek",
    desc: "Her türlü sorunuz için 0532 295 93 09 numaramızdan ulaşabilirsiniz.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-14 border-t border-[#e8e8e8]">
      <div className="container-site">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-full border border-[#e8e8e8] flex items-center justify-center text-[#1d3435]">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="text-[13px] font-semibold text-[#1d3435] mb-1 uppercase tracking-wider">
                    {f.title}
                  </h3>
                  <p className="text-[13px] text-[#545454] leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
