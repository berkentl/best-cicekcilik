"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  useForm,
  useFieldArray,
  Controller,
  type SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { navCategories } from "@/lib/data";
import { productSchema, type ProductFormValues } from "@/lib/schemas/product";
import type { Category, Product } from "@/types";

// ─── Rich Text Toolbar ───────────────────────────────────────────────────────

function RichTextToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;
  const btn = (action: () => boolean, active: boolean, title: string, content: React.ReactNode) => (
    <button type="button" onClick={() => action()} title={title}
      className={`p-1.5 rounded text-[13px] transition-colors ${active ? "bg-[#1d3435] text-white" : "text-[#545454] hover:bg-[#f0f0f0]"}`}>
      {content}
    </button>
  );
  return (
    <div className="flex items-center flex-wrap gap-0.5 px-3 py-2 border-b border-[#e8e8e8] bg-[#fafafa] rounded-t-md">
      {btn(() => editor.chain().focus().toggleBold().run(), editor.isActive("bold"), "Kalın", <strong>B</strong>)}
      {btn(() => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"), "İtalik", <em>I</em>)}
      {btn(() => editor.chain().focus().toggleUnderline().run(), editor.isActive("underline"), "Altı çizili", <span className="underline">U</span>)}
      <div className="w-px h-5 bg-[#e8e8e8] mx-1" />
      {btn(() => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList"), "Liste",
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>)}
      <div className="w-px h-5 bg-[#e8e8e8] mx-1" />
      {btn(() => editor.chain().focus().undo().run(), false, "Geri al",
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>)}
    </div>
  );
}

// ─── Image Dropzone ───────────────────────────────────────────────────────────

function ImageDropzone({ images, onAdd, onRemove }: {
  images: string[];
  onAdd: (urls: string[]) => void;
  onRemove: (idx: number) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const onDrop = useCallback(async (files: File[]) => {
    setUploading(true);
    setUploadError("");
    const urls: string[] = [];
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (json.url) urls.push(json.url);
        else if (json.error) setUploadError(json.error);
      } catch {
        setUploadError("Yükleme sırasında bağlantı hatası oluştu.");
      }
    }
    if (urls.length > 0) onAdd(urls);
    setUploading(false);
  }, [onAdd]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
    maxSize: 10 * 1024 * 1024,
    onDropRejected: () => setUploadError("Sadece resim dosyaları desteklenir."),
  });

  return (
    <div className="space-y-3">
      <div {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
          isDragActive ? "border-[#3d7b74] bg-[#3d7b74]/5" : "border-[#e8e8e8] hover:border-[#3d7b74] hover:bg-[#f9f9f9]"
        }`}>
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-[#3d7b74]">
            <svg className="w-8 h-8 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <p className="text-[13px] font-medium">Yükleniyor...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-[#999]">
            <svg className="w-10 h-10 text-[#ccc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-[13px] font-semibold text-[#545454]">Yeni görsel eklemek için sürükleyin veya tıklayın</p>
            <p className="text-[12px]">PNG, JPG, WEBP — otomatik sıkıştırılır</p>
          </div>
        )}
      </div>

      {uploadError && <p className="text-[12px] text-red-600 font-medium">{uploadError}</p>}

      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {images.map((url, i) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-[#e8e8e8]">
              <Image src={url} alt={`Görsel ${i + 1}`} fill unoptimized className="object-cover" sizes="100px" />
              {i === 0 && (
                <span className="absolute top-1 left-1 text-[9px] bg-[#1d3435] text-white px-1.5 py-0.5 rounded font-bold">ANA</span>
              )}
              <button type="button" onClick={() => onRemove(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full items-center justify-center hidden group-hover:flex text-[11px] font-bold">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Yardımcı Bileşenler ──────────────────────────────────────────────────────

function Section({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-[#ebebeb] shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-[#f5f5f5] flex items-center gap-2">
        <h2 className="text-[14px] font-bold text-[#1d3435]">{title}</h2>
        {badge && (
          <span className="text-[10px] font-bold bg-[#3d7b74]/10 text-[#3d7b74] px-2 py-0.5 rounded-full uppercase tracking-wide">{badge}</span>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

const inputCls = "w-full border border-[#e8e8e8] rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-[#3d7b74] focus:ring-2 focus:ring-[#3d7b74]/10 transition-all bg-white";
const inputErrCls = "w-full border border-red-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-red-400 transition-all bg-white";
const labelCls = "block text-[11px] font-bold uppercase tracking-widest text-[#1d3435] mb-1.5";

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1 text-[12px] text-red-600 flex items-center gap-1">
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {msg}
    </p>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <button type="button" onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-all ${checked ? "bg-[#3d7b74]" : "bg-[#d0cdc8]"}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </button>
      <span className="text-[13px] text-[#545454] font-medium">{label}</span>
    </label>
  );
}

function autoSlug(name: string) {
  return name.toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

// ─── Ana Sayfa ────────────────────────────────────────────────────────────────

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const productId = params.id;

  const [images, setImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [extraCats, setExtraCats] = useState<{ categorySlug: string; subCategorySlug?: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as unknown as Resolver<ProductFormValues>,
    defaultValues: {
      isActive: true,
      isNew: false,
      isBestseller: false,
      isPinnedToVitrin: false,
      stock: 0,
      variants: [],
    },
  });

  const { fields: variantFields, append, remove, replace } = useFieldArray({ control, name: "variants" });

  const watchedName = watch("name");
  const watchedSlug = watch("slug");
  const watchedPrice = watch("price");
  const watchedSalePrice = watch("salePrice");
  const watchedSeoTitle = watch("seoTitle");
  const watchedSeoDesc = watch("seoDescription");
  const watchedStock = watch("stock");
  const watchedCatSlug = watch("categorySlug");
  const watchedIsPinned = watch("isPinnedToVitrin");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Ürün açıklamasını buraya yazın..." }),
    ],
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[140px] px-4 py-3 text-[13px] text-[#1d3435] focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      setValue("description", editor.getHTML(), { shouldValidate: false });
    },
  });

  // Kategorileri yükle
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((dbCats: Category[]) => {
        const merged = dbCats.map((cat) => {
          const staticCat = navCategories.find((c) => c.slug === cat.slug);
          return { ...cat, megaMenu: (cat.megaMenu && cat.megaMenu.length > 0) ? cat.megaMenu : (staticCat?.megaMenu ?? []) };
        });
        setCategories(merged);
      })
      .catch(() => setCategories(navCategories));
  }, []);

  // Ürünü yükle ve formu doldur
  useEffect(() => {
    if (!productId) return;

    fetch(`/api/products/${productId}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); return null; }
        return r.json();
      })
      .then((p: Product | null) => {
        if (!p) return;

        reset({
          name: p.name,
          slug: p.slug,
          description: p.description ?? "",
          careInstructions: p.careInstructions ?? "",
          price: p.price,
          salePrice: p.salePrice ?? undefined,
          stock: p.stock ?? 0,
          categorySlug: p.categorySlug ?? "",
          categoryName: p.category ?? "",
          categoryId: "",
          subCategorySlug: p.subCategorySlug ?? "",
          subCategoryName: p.subCategory ?? "",
          isActive: p.isActive ?? true,
          isNew: p.isNew ?? false,
          isBestseller: p.isBestseller ?? false,
          isPinnedToVitrin: p.isPinnedToVitrin ?? false,
          seoTitle: p.seoTitle ?? "",
          seoDescription: p.seoDescription ?? "",
          variants: (p.variants ?? []).map((v) => ({
            id: String(v.id ?? Date.now()),
            label: String(v.label ?? ""),
            price: Number(v.price ?? 0),
            stock: Number(v.stock ?? 0),
          })),
        });

        // Varyantları fieldArray'e aktar
        if (p.variants && p.variants.length > 0) {
          replace(p.variants.map((v) => ({
            id: String(v.id ?? Date.now()),
            label: String(v.label ?? ""),
            price: Number(v.price ?? 0),
            stock: Number(v.stock ?? 0),
          })));
        }

        // Görseller
        setImages(p.images ?? []);

        // Ek kategoriler
        setExtraCats(p.extraCategorySlugs ?? []);

        // Rich text editör içeriği
        if (editor && p.description) {
          editor.commands.setContent(p.description);
        }
      })
      .finally(() => setLoadingProduct(false));
  // editor sadece mount'ta hazır olduğunda çalıştır
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, reset, replace]);

  // Editor hazır olduktan sonra içeriği set et (useEffect'ten önce hazır olmayabilir)
  useEffect(() => {
    if (!editor || loadingProduct) return;
    const desc = watch("description");
    if (desc && editor.isEmpty) {
      editor.commands.setContent(desc);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, loadingProduct]);

  const selectedCat = categories.find((c) => c.slug === watchedCatSlug);
  const subCategories = selectedCat?.megaMenu?.flatMap((col) => col.items) ?? [];

  const discountPct =
    watchedPrice && watchedSalePrice && Number(watchedSalePrice) > 0
      ? Math.round(((Number(watchedPrice) - Number(watchedSalePrice)) / Number(watchedPrice)) * 100)
      : 0;

  const onSubmit: SubmitHandler<ProductFormValues> = async (values) => {
    setSaving(true);
    setSaveError("");

    const payload = {
      ...values,
      slug: values.slug || autoSlug(values.name),
      seoTitle: values.seoTitle || values.name,
      images,
      extraCategorySlugs: extraCats,
    };

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error ?? "Güncelleme hatası");
      }
      router.push("/admin/urunler");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  // ── Yükleniyor ──
  if (loadingProduct) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <svg className="w-8 h-8 animate-spin text-[#3d7b74] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p className="text-[13px] text-[#999]">Ürün yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-xl font-bold text-[#1d3435] mb-2">Ürün Bulunamadı</p>
        <p className="text-[13px] text-[#999] mb-5">Bu ID&apos;ye sahip ürün mevcut değil.</p>
        <Link href="/admin/urunler" className="px-5 py-2 bg-[#1d3435] text-white rounded-md text-[13px] font-bold hover:bg-[#2a4a4b]">
          Ürünlere Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">

      {/* ── Başlık ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link href="/admin/urunler" className="text-[#999] hover:text-[#1d3435] transition-colors flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="font-heading text-lg sm:text-xl font-medium text-[#1d3435]">Ürünü Düzenle</h1>
            <p className="text-[12px] text-[#999] font-mono truncate">{watchedSlug}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link href="/admin/urunler"
            className="px-4 py-2 text-[13px] border border-[#e8e8e8] rounded-md text-[#545454] hover:text-[#1d3435] transition-colors font-medium">
            İptal
          </Link>
          <button onClick={handleSubmit(onSubmit)} disabled={saving}
            className="px-5 py-2 bg-[#1d3435] text-white rounded-md text-[13px] font-bold hover:bg-[#2a4a4b] transition-colors disabled:opacity-60 flex items-center gap-2">
            {saving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Kaydediliyor...
              </>
            ) : "Değişiklikleri Kaydet"}
          </button>
        </div>
      </div>

      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-[13px] text-red-700 font-medium">{saveError}</div>
      )}

      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-[13px] text-red-700">
          <p className="font-bold mb-1">Lütfen aşağıdaki alanları düzeltin:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {Object.entries(errors).map(([key, err]) =>
              "message" in err ? <li key={key}>{err.message as string}</li> : null
            )}
          </ul>
        </div>
      )}

      {/* ── Temel Bilgiler ── */}
      <Section title="Temel Bilgiler">
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Ürün Adı *</label>
            <input type="text" {...register("name")}
              className={errors.name ? inputErrCls : inputCls}
              onChange={(e) => {
                register("name").onChange(e);
                if (!watchedSeoTitle) setValue("seoTitle", e.target.value, { shouldValidate: false });
              }}
            />
            <FieldError msg={errors.name?.message} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Slug (URL)</label>
              <input type="text" {...register("slug")} className={`${inputCls} font-mono text-[12px]`} />
              <p className="text-[11px] text-[#999] mt-1">
                bestcicekcilik.com/urun/<strong>{watchedSlug || "..."}</strong>
              </p>
            </div>
            <div>
              <label className={labelCls}>Durum</label>
              <div className="flex flex-col gap-2.5 pt-1">
                <Controller control={control} name="isActive" render={({ field }) => (
                  <Toggle checked={field.value} onChange={field.onChange} label="Satışta (Aktif)" />
                )} />
                <Controller control={control} name="isNew" render={({ field }) => (
                  <Toggle checked={field.value} onChange={field.onChange} label="Yeni Ürün Rozeti" />
                )} />
                <Controller control={control} name="isBestseller" render={({ field }) => (
                  <Toggle checked={field.value} onChange={field.onChange} label="En Çok Satan Rozeti" />
                )} />
                <div className="pt-1 border-t border-[#f0f0f0]">
                  <Controller control={control} name="isPinnedToVitrin" render={({ field }) => (
                    <Toggle checked={field.value} onChange={field.onChange} label="Ana Sayfa Vitrinine Sabitle" />
                  )} />
                  {watchedIsPinned && (
                    <p className="text-[11px] text-[#3d7b74] mt-1.5 ml-[52px] font-medium">
                      Bu ürün ana sayfada öncelikli gösterilecek.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Kategori ── */}
      <Section title="Kategori & Alt Kategori">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Ana Kategori *</label>
            <select {...register("categorySlug")}
              className={errors.categorySlug ? inputErrCls : inputCls}
              onChange={(e) => {
                const cat = categories.find((c) => c.slug === e.target.value);
                setValue("categorySlug", e.target.value);
                setValue("categoryName", cat?.name ?? "");
                setValue("categoryId", cat?.id ?? "");
                setValue("subCategorySlug", "");
                setValue("subCategoryName", "");
              }}>
              <option value="">Seçin...</option>
              {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
            <FieldError msg={errors.categorySlug?.message} />
          </div>
          <div>
            <label className={labelCls}>Alt Kategori</label>
            <select className={inputCls} disabled={subCategories.length === 0}
              value={watch("subCategorySlug") ?? ""}
              onChange={(e) => {
                const sub = subCategories.find((s) => s.slug === e.target.value);
                setValue("subCategorySlug", e.target.value);
                setValue("subCategoryName", sub?.name ?? "");
              }}>
              <option value="">{subCategories.length === 0 ? "Önce ana kategori seçin" : "Seçin..."}</option>
              {subCategories.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
            </select>
          </div>
        </div>

        {/* Ek Kategoriler */}
        <div className="border-t border-[#ebebeb] pt-4 mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#1d3435]">Ek Kategoriler</p>
              <p className="text-[11px] text-[#999] mt-0.5">Bu ürünü birden fazla kategoride göster.</p>
            </div>
            <button type="button" onClick={() => setExtraCats((p) => [...p, { categorySlug: "", subCategorySlug: "" }])}
              className="text-[12px] font-bold text-[#3d7b74] hover:text-[#1d3435] transition-colors whitespace-nowrap">
              + Kategori Ekle
            </button>
          </div>
          {extraCats.length === 0 && (
            <p className="text-[11px] text-[#bbb]">Ek kategori yok — yalnızca ana kategorisinde görünür.</p>
          )}
          {extraCats.map((ec, idx) => {
            const ecCatObj = categories.find((c) => c.slug === ec.categorySlug);
            const ecSubs = ecCatObj?.megaMenu?.flatMap((col) => col.items) ?? [];
            return (
              <div key={idx} className="flex items-center gap-2">
                <select className={inputCls} value={ec.categorySlug}
                  onChange={(e) => setExtraCats((p) => p.map((item, i) =>
                    i === idx ? { categorySlug: e.target.value, subCategorySlug: "" } : item
                  ))}>
                  <option value="">Ana Kategori...</option>
                  {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                </select>
                <select className={inputCls} value={ec.subCategorySlug ?? ""} disabled={ecSubs.length === 0}
                  onChange={(e) => setExtraCats((p) => p.map((item, i) =>
                    i === idx ? { ...item, subCategorySlug: e.target.value } : item
                  ))}>
                  <option value="">Alt Kategori...</option>
                  {ecSubs.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
                </select>
                <button type="button" onClick={() => setExtraCats((p) => p.filter((_, i) => i !== idx))}
                  className="text-red-400 hover:text-red-600 flex-shrink-0 text-[20px] leading-none font-light">×</button>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── Fiyat & Stok ── */}
      <Section title="Fiyat & Stok">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Normal Fiyat (₺) *</label>
            <input type="text" inputMode="decimal" {...register("price")}
              className={errors.price ? inputErrCls : inputCls} />
            <FieldError msg={errors.price?.message} />
          </div>
          <div>
            <label className={labelCls}>İndirimli Fiyat (₺)</label>
            <input type="text" inputMode="decimal" {...register("salePrice")}
              placeholder="Boş bırakın" className={errors.salePrice ? inputErrCls : inputCls} />
            {discountPct > 0 && <p className="text-[11px] text-green-600 mt-1 font-semibold">%{discountPct} indirim uygulanacak</p>}
          </div>
          <div>
            <label className={labelCls}>Stok Adeti</label>
            <input type="number" min="0" {...register("stock")} className={errors.stock ? inputErrCls : inputCls} />
            {Number(watchedStock) === 0 && <p className="text-[11px] text-red-500 mt-1">Stokta yok olarak görünür</p>}
            {Number(watchedStock) > 0 && Number(watchedStock) < 5 && <p className="text-[11px] text-orange-500 mt-1">Düşük stok uyarısı</p>}
          </div>
        </div>
      </Section>

      {/* ── Görseller ── */}
      <Section title="Ürün Görselleri" badge="Supabase Storage">
        <ImageDropzone
          images={images}
          onAdd={(urls) => setImages((p) => [...p, ...urls])}
          onRemove={(i) => setImages((p) => p.filter((_, idx) => idx !== i))}
        />
        <p className="text-[11px] text-[#999] mt-2">İlk görsel ana görsel olarak kullanılır. Sürükleyerek sıralarını değiştirebilirsiniz.</p>
      </Section>

      {/* ── Açıklama ── */}
      <Section title="Ürün Açıklaması" badge="Rich Text">
        <div className="border border-[#e8e8e8] rounded-md overflow-hidden">
          <RichTextToolbar editor={editor} />
          <EditorContent editor={editor} />
        </div>
      </Section>

      {/* ── Bakım Talimatları ── */}
      <Section title="Bakım Talimatları" badge="Opsiyonel">
        <textarea rows={5} {...register("careInstructions")}
          placeholder="Çiçekleri teslim aldıktan sonra saplarını 2–3 cm kısaltın.&#10;Temiz suya koyun ve her 2 günde bir suyunu değiştirin."
          className={`${inputCls} resize-none`} />
        <p className="text-[11px] text-[#999] mt-1.5">Her satır ürün sayfasında ayrı madde olarak gösterilir.</p>
      </Section>

      {/* ── Varyantlar ── */}
      <Section title="Varyant Yönetimi" badge="Opsiyonel">
        <p className="text-[12px] text-[#999] mb-4">Renk, beden veya boyut gibi seçenekler varsa ekleyin.</p>
        {variantFields.length > 0 && (
          <div className="space-y-3 mb-4">
            <div className="hidden sm:grid grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-widest text-[#999] px-1">
              <span className="col-span-5">Varyant Adı</span>
              <span className="col-span-3">Fiyat (₺)</span>
              <span className="col-span-3">Stok</span>
              <span className="col-span-1" />
            </div>
            {variantFields.map((field, index) => (
              <div key={field.id} className="flex flex-col sm:grid sm:grid-cols-12 gap-2 items-start sm:items-center bg-[#fafafa] sm:bg-transparent rounded-lg sm:rounded-none p-3 sm:p-0 border border-[#f0f0f0] sm:border-0">
                <div className="w-full sm:col-span-5">
                  <input type="text" placeholder="Ör: Kırmızı / L" {...register(`variants.${index}.label`)}
                    className={errors.variants?.[index]?.label ? inputErrCls : inputCls} />
                </div>
                <div className="w-full sm:col-span-3">
                  <input type="number" placeholder="450" {...register(`variants.${index}.price`)}
                    className={errors.variants?.[index]?.price ? inputErrCls : inputCls} />
                </div>
                <div className="w-full sm:col-span-3">
                  <input type="number" placeholder="0" {...register(`variants.${index}.stock`)}
                    className={errors.variants?.[index]?.stock ? inputErrCls : inputCls} />
                </div>
                <div className="sm:col-span-1 flex justify-end sm:justify-center w-full sm:w-auto">
                  <button type="button" onClick={() => remove(index)}
                    className="text-red-400 hover:text-red-600 transition-colors p-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <button type="button"
          onClick={() => append({ id: Date.now().toString(), label: "", price: 0, stock: 0 })}
          className="flex items-center gap-2 text-[13px] text-[#3d7b74] font-semibold hover:text-[#1d3435] transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Varyant Ekle
        </button>
      </Section>

      {/* ── SEO ── */}
      <Section title="SEO Ayarları" badge="Opsiyonel">
        <div className="space-y-4">
          <div>
            <label className={labelCls}>SEO Başlığı</label>
            <input type="text" {...register("seoTitle")}
              placeholder={watchedName || "Ürün adı otomatik kullanılır"} className={inputCls} />
            <p className="text-[11px] text-[#999] mt-1">{(watchedSeoTitle ?? "").length}/60 karakter</p>
          </div>
          <div>
            <label className={labelCls}>Meta Açıklama</label>
            <textarea rows={3} {...register("seoDescription")}
              placeholder="Arama motorlarında görünecek kısa açıklama"
              className={`${inputCls} resize-none`} />
            <p className="text-[11px] text-[#999] mt-1">{(watchedSeoDesc ?? "").length}/160 karakter</p>
          </div>
          <div className="border border-[#e8e8e8] rounded-md p-3 bg-[#f9f9f9]">
            <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-2">Google Önizleme</p>
            <p className="text-[13px] text-blue-700 font-medium truncate">
              {watchedSeoTitle || watchedName || "Ürün Başlığı"} | Best Çiçekçilik
            </p>
            <p className="text-[11px] text-green-700">bestcicekcilik.com › urun › {watchedSlug || "urun-slug"}</p>
            <p className="text-[12px] text-[#545454] mt-0.5 line-clamp-2">
              {watchedSeoDesc || "Ürün açıklaması buraya gelecek..."}
            </p>
          </div>
        </div>
      </Section>

      {/* ── Alt Kaydet ── */}
      <div className="flex justify-end gap-3 pb-8">
        <Link href="/admin/urunler"
          className="px-5 py-2.5 text-[13px] border border-[#e8e8e8] rounded-md text-[#545454] hover:text-[#1d3435] transition-colors font-medium">
          İptal
        </Link>
        <button onClick={handleSubmit(onSubmit)} disabled={saving}
          className="px-6 py-2.5 bg-[#1d3435] text-white rounded-md text-[13px] font-bold hover:bg-[#2a4a4b] transition-colors disabled:opacity-60">
          {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </button>
      </div>
    </div>
  );
}
