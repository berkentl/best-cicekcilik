"use client";

/**
 * Sadece yazdırma sırasında görünür olan A6 kart mesajı şablonu.
 * Ekranda tamamen gizlidir (`hidden`); `window.print()` tetiklendiğinde
 * @media print kuralları sayfadaki diğer her şeyi gizleyip yalnızca bu
 * alanı gösterir. Bileşen unmount olduğunda stil de DOM'dan kalkar,
 * dolayısıyla sitenin başka hiçbir sayfasının yazdırma davranışını etkilemez.
 */
export function CardPrintTemplate({
  message,
  senderName,
}: {
  message: string;
  senderName: string;
}) {
  if (!message) return null;

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #kart-mesaji-print-area, #kart-mesaji-print-area * { visibility: visible; }
          #kart-mesaji-print-area {
            position: fixed;
            top: 0;
            left: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page { size: A6; margin: 0; }
        }
      `}</style>

      <div
        id="kart-mesaji-print-area"
        className="hidden print:flex flex-col font-dancing"
        style={{
          width: "105mm",
          height: "148mm",
          padding: "10mm",
          boxSizing: "border-box",
          border: "1px dashed #c9c2b8",
          background: "#fffdf8",
        }}
      >
        <div className="flex-1 flex items-center justify-center text-center">
          <p style={{ fontSize: "26px", lineHeight: 1.5, color: "#2b2420", whiteSpace: "pre-wrap", overflowWrap: "break-word" }}>
            {message}
          </p>
        </div>
        <p style={{ textAlign: "right", fontSize: "19px", color: "#6e5c44" }}>
          — {senderName}
        </p>
      </div>
    </>
  );
}
