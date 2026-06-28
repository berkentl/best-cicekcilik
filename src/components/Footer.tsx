import Link from "next/link";
import { PhoneIcon, MapPinIcon, MailIcon, InstagramIcon, FacebookIcon, WhatsAppIcon } from "@/components/icons";
import { siteConfig, navCategories } from "@/lib/data";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#063735] text-white">
      {/* Main footer content */}
      <div className="container-site py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="mb-5">
              <span className="font-heading text-[22px] font-semibold tracking-wide text-white">
                Best Çiçekçilik
              </span>
              <br />
              <span className="text-[12px] text-white/60 tracking-widest uppercase">
                & Organizasyon
              </span>
            </div>
            <p className="text-[13px] text-white/70 leading-relaxed mb-6">
              İstanbul Şişli'de lüks çiçek tasarımı ve organizasyon hizmetleri.
              Aynı gün teslimat ile sevdiklerinize en güzel çiçekleri
              ulaştırıyoruz.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/bestcicekcilik"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-sm border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-white/50 transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon size={16} />
              </a>
              <a
                href="https://facebook.com/bestcicekcilik"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-sm border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-white/50 transition-colors"
                aria-label="Facebook"
              >
                <FacebookIcon size={16} />
              </a>
              <a
                href={`https://wa.me/${siteConfig.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-sm border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-white/50 transition-colors"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon size={16} />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white/90 mb-5">
              Kategoriler
            </h4>
            <ul className="space-y-2.5">
              {navCategories.slice(0, 7).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/${cat.slug}`}
                    className="text-[13px] text-white/60 hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info links */}
          <div>
            <h4 className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white/90 mb-5">
              Kurumsal
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Hakkımızda", href: "/hakkimizda" },
                { label: "İletişim", href: "/iletisim" },
                { label: "Teslimat Bilgileri", href: "/teslimat" },
                { label: "İptal & İade", href: "/iade" },
                { label: "Gizlilik Politikası", href: "/gizlilik" },
                { label: "Kullanım Koşulları", href: "/kullanim-kosullari" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white/90 mb-5">
              İletişim
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPinIcon size={15} className="text-white/50 mt-0.5 shrink-0" />
                <span className="text-[13px] text-white/60 leading-relaxed">
                  Fulya, 19 Mayıs, Aytekin Kotil Cd. No:18
                  <br />
                  34360 Şişli / İstanbul
                </span>
              </li>
              <li>
                <a
                  href="tel:05322959309"
                  className="flex items-center gap-3 text-[13px] text-white/60 hover:text-white transition-colors"
                >
                  <PhoneIcon size={15} className="text-white/50 shrink-0" />
                  0532 295 93 09
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@bestcicekcilik.com"
                  className="flex items-center gap-3 text-[13px] text-white/60 hover:text-white transition-colors"
                >
                  <MailIcon size={15} className="text-white/50 shrink-0" />
                  info@bestcicekcilik.com
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${siteConfig.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-[#25d366] text-white text-[12px] font-semibold rounded-sm hover:bg-[#20ba58] transition-colors"
                >
                  <WhatsAppIcon size={14} />
                  WhatsApp ile Yaz
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-site py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-white/40">
            © {year} Best Çiçekçilik & Organizasyon. Tüm hakları saklıdır.
          </p>
          <p className="text-[12px] text-white/40">
            <a href="https://bestcicekcilik.com" className="hover:text-white/70 transition-colors">
              bestcicekcilik.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
