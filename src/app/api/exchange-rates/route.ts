import { NextResponse } from "next/server";

export const revalidate = 3600; // 1 saatte bir yenile

export async function GET() {
  try {
    // TRY bazlı USD ve EUR kurları — ECB (Avrupa Merkez Bankası) verisi
    const res = await fetch(
      "https://api.frankfurter.app/latest?from=TRY&to=USD,EUR",
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) throw new Error("API yanıt vermedi");

    const data = await res.json() as {
      rates: { USD: number; EUR: number };
      date: string;
    };

    return NextResponse.json({
      TRY: 1,
      USD: data.rates.USD,
      EUR: data.rates.EUR,
      updatedAt: data.date,
    });
  } catch {
    // API erişilemezse yaklaşık sabit kurlarla devam et
    return NextResponse.json({
      TRY: 1,
      USD: 0.027,
      EUR: 0.025,
      updatedAt: null,
    });
  }
}
