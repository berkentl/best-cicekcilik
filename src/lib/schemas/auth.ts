import { z } from "zod";
import { isValidTurkishPhone } from "@/lib/phone";

const emailField = z
  .string()
  .min(1, "E-posta adresi zorunludur")
  .email("Geçerli bir e-posta adresi girin")
  .transform((v) => v.trim().toLowerCase());

const passwordField = z
  .string()
  .min(6, "Şifre en az 6 karakter olmalıdır")
  .max(72, "Şifre en fazla 72 karakter olabilir");

const optionalPhoneField = z
  .string()
  .optional()
  .refine((v) => !v || isValidTurkishPhone(v), {
    message: "Geçerli bir telefon numarası girin (0XXX XXX XX XX)",
  });

const requiredPhoneField = z
  .string()
  .min(1, "Telefon numarası zorunludur")
  .refine((v) => isValidTurkishPhone(v), {
    message: "Geçerli bir telefon numarası girin (0XXX XXX XX XX)",
  });

export const registerSchema = z
  .object({
    name: z.string().min(2, "Ad soyad en az 2 karakter olmalıdır"),
    email: emailField,
    phone: optionalPhoneField,
    password: passwordField,
    passwordConfirm: z.string(),
    kvkkConsent: z.boolean().refine((v) => v === true, {
      message: "Devam etmek için KVKK Aydınlatma Metni'ni onaylamalısınız",
    }),
    marketingConsent: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.passwordConfirm) {
      ctx.addIssue({
        code: "custom",
        message: "Şifreler eşleşmiyor",
        path: ["passwordConfirm"],
      });
    }
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Şifre zorunludur"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: passwordField,
    passwordConfirm: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.passwordConfirm) {
      ctx.addIssue({
        code: "custom",
        message: "Şifreler eşleşmiyor",
        path: ["passwordConfirm"],
      });
    }
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const profileSchema = z.object({
  name: z.string().min(2, "Ad soyad en az 2 karakter olmalıdır"),
  phone: optionalPhoneField,
  kvkkConsent: z.boolean().optional(),
  marketingConsent: z.boolean().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mevcut şifrenizi girin"),
    newPassword: passwordField,
    newPasswordConfirm: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.newPasswordConfirm) {
      ctx.addIssue({
        code: "custom",
        message: "Yeni şifreler eşleşmiyor",
        path: ["newPasswordConfirm"],
      });
    }
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export const addressSchema = z.object({
  title: z.string().min(1, "Adres başlığı zorunludur (Ör: Ev, Ofis)"),
  recipientName: z.string().min(2, "Alıcı adı soyadı zorunludur"),
  recipientPhone: requiredPhoneField,
  city: z.string().min(1, "Şehir zorunludur"),
  district: z.string().min(1, "İlçe zorunludur"),
  fullAddress: z.string().min(10, "Adres en az 10 karakter olmalıdır"),
  isDefault: z.boolean().optional(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
