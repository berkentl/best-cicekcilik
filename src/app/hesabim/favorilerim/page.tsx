import { FavorilerClient } from "@/app/favoriler/FavorilerClient";

export const metadata = { title: "Favorilerim | Dünyanın Çiçeği" };

export default function FavorilerimPage() {
  return (
    <div>
      <h1 className="font-poppins text-2xl font-semibold text-[#1d3435] mb-2">Favorilerim</h1>
      <p className="text-[13.5px] text-[#8a9c9c] mb-2">
        Beğendiğiniz ürünler cihazınızda saklanır ve buradan tekrar ulaşabilirsiniz.
      </p>
      <FavorilerClient />
    </div>
  );
}
