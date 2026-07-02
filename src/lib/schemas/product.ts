import { z } from "zod";

function coercePrice(val: unknown) {
  if (typeof val === "number") return val;
  const str = String(val ?? "").trim().replace(/\s/g, "").replace(",", ".");
  return str === "" ? undefined : Number(str);
}

export const variantSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, "Varyant adı zorunludur"),
  price: z.preprocess(coercePrice, z.number().positive("Varyant fiyatı 0'dan büyük olmalıdır")),
  stock: z.preprocess((v) => Number(v), z.number().int().min(0, "Stok negatif olamaz")),
});

export const productSchema = z
  .object({
    name: z.string().min(2, "Ürün adı en az 2 karakter olmalıdır"),
    slug: z.string().optional(),
    description: z.string().optional(),
    price: z.preprocess(coercePrice, z.number().positive("Fiyat 0'dan büyük olmalıdır")),
    salePrice: z.preprocess((v) => {
      const n = coercePrice(v);
      return n === undefined || isNaN(n as number) || (n as number) === 0 ? undefined : n;
    }, z.number().min(0).optional()),
    stock: z.preprocess((v) => Number(v), z.number().int().min(0, "Stok negatif olamaz")),
    categorySlug: z.string().min(1, "Ana kategori seçimi zorunludur"),
    categoryName: z.string().optional(),
    categoryId: z.string().optional(),
    subCategorySlug: z.string().optional(),
    subCategoryName: z.string().optional(),
    isActive: z.boolean(),
    isNew: z.boolean(),
    isBestseller: z.boolean(),
    isPinnedToVitrin: z.boolean(),
    variants: z.array(variantSchema).optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    careInstructions: z.string().optional(),
    extraCategorySlugs: z.array(z.object({
      categorySlug: z.string(),
      subCategorySlug: z.string().optional(),
    })).optional(),
  })
  .superRefine((data, ctx) => {
    const sp = data.salePrice;
    if (sp !== undefined && sp > 0 && sp >= data.price) {
      ctx.addIssue({
        code: "custom",
        message: "İndirimli fiyat normal fiyattan küçük olmalıdır",
        path: ["salePrice"],
      });
    }
  });

export type ProductFormValues = z.infer<typeof productSchema>;
export type VariantFormValues = z.infer<typeof variantSchema>;
