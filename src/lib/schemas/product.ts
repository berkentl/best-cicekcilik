import { z } from "zod";

export const variantSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, "Varyant adÄ± zorunludur"),
  price: z.coerce.number().positive("Varyant fiyatÄ± 0'dan bÃ¼yÃ¼k olmalÄ±dÄ±r"),
  stock: z.coerce.number().int().min(0, "Stok negatif olamaz"),
});

export const productSchema = z
  .object({
    name: z.string().min(2, "ÃœrÃ¼n adÄ± en az 2 karakter olmalÄ±dÄ±r"),
    slug: z.string().optional(),
    description: z.string().optional(),
    price: z.coerce.number().positive("Fiyat 0'dan bÃ¼yÃ¼k olmalÄ±dÄ±r"),
    salePrice: z.coerce.number().min(0).optional(),
    stock: z.coerce.number().int().min(0, "Stok negatif olamaz"),
    categorySlug: z.string().min(1, "Ana kategori seÃ§imi zorunludur"),
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
        message: "Ä°ndirimli fiyat normal fiyattan kÃ¼Ã§Ã¼k olmalÄ±dÄ±r",
        path: ["salePrice"],
      });
    }
  });

export type ProductFormValues = z.infer<typeof productSchema>;
export type VariantFormValues = z.infer<typeof variantSchema>;

