"use client";

const WORDS = ["Arkadaşa", "Anneye", "Eşe", "Sevgiliye", "Yeni İşe", "Mutluluğa"];

export function AnimatedSectionTitle() {
  return (
    <>
      <style>{`
        @keyframes title_spin {
          0%   { transform: translateY(0); }
          7%   { transform: translateY(-102%); }
          14%  { transform: translateY(-100%); }
          21%  { transform: translateY(-202%); }
          28%  { transform: translateY(-200%); }
          35%  { transform: translateY(-302%); }
          42%  { transform: translateY(-300%); }
          49%  { transform: translateY(-402%); }
          56%  { transform: translateY(-400%); }
          63%  { transform: translateY(-502%); }
          70%  { transform: translateY(-500%); }
          77%  { transform: translateY(-602%); }
          85%  { transform: translateY(-600%); }
          100% { transform: translateY(-600%); }
        }
        .anim-word {
          display: block;
          height: 54px;
          line-height: 54px;
          animation: title_spin 6s ease-in-out infinite;
        }
        @media (max-width: 768px) {
          .anim-word { height: 42px; line-height: 42px; }
          .anim-words-clip { height: 42px !important; }
        }
      `}</style>

      <div className="flex items-center justify-center gap-[0.3em] flex-wrap">
        {/* Animasyonlu kayan kelimeler */}
        <div
          className="overflow-hidden relative anim-words-clip"
          style={{ height: "54px" }}
        >
          {/* İlk kelime sona eklenir → seamless loop */}
          {[...WORDS, WORDS[0]].map((word, i) => (
            <span
              key={i}
              className="anim-word whitespace-nowrap text-[32px] md:text-[42px] font-medium text-[#c8746a]"
              style={{ fontFamily: "var(--font-poppins), sans-serif" }}
            >
              {word}
            </span>
          ))}
        </div>

        {/* Sabit sağ metin */}
        <span
          className="whitespace-nowrap text-[32px] md:text-[42px] font-medium text-[#1d3435] font-semibold"
          style={{ fontFamily: "var(--font-poppins), sans-serif" }}
        >
          Çiçek
        </span>
      </div>
    </>
  );
}
