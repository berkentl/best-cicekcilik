"use client";

import imageCompression from "browser-image-compression";

/** Dosyayı API'ye göndermeden önce ~1MB altına sıkıştırır (zaten küçükse dokunmaz). */
export async function compressImage(file: File, maxSizeMB = 1): Promise<File> {
  if (file.size <= maxSizeMB * 1024 * 1024) return file;
  try {
    return await imageCompression(file, {
      maxSizeMB,
      maxWidthOrHeight: 2000,
      useWebWorker: true,
    });
  } catch (err) {
    console.error("[image-compress] sıkıştırma başarısız, orijinal dosya kullanılıyor:", err);
    return file;
  }
}

/** Boş/HTML/düz metin gövdeleri JSON.parse'a düşürmeden güvenle okur. */
export async function safeJson(res: Response): Promise<Record<string, unknown> | null> {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}
