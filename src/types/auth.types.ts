import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";

// ─── Schémas Zod ────────────────────────────────────────────────────────────

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Adresse email invalide"),
  password: z
    .string()
    .min(1, "Le mot de passe est requis")
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(1, "Le nom est requis")
      .min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z
      .string()
      .min(1, "L'email est requis")
      .email("Adresse email invalide"),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(/[A-Z]/, "Doit contenir au moins une majuscule")
      .regex(/[0-9]/, "Doit contenir au moins un chiffre"),
    confirmPassword: z.string().min(1, "La confirmation est requise"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Adresse email invalide"),
});

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(/[A-Z]/, "Doit contenir au moins une majuscule")
      .regex(/[0-9]/, "Doit contenir au moins un chiffre"),
    confirmNewPassword: z.string().min(1, "La confirmation est requise"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmNewPassword"],
  });

export const verifyEmailSchema = z.object({
  code: z
    .string()
    .min(1, "Le code de vérification est requis")
    .length(8, "Le code doit contenir 8 caractères"),
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const completeProfilSchema = z.object({
  photo: z
    .file({
      error: "Image requise",
    })
    .max(MAX_FILE_SIZE, { message: "Max 5MB" })
    .mime(
      ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"],
      {
        message: "Format invalide",
      },
    ),
  numero: z
    .string("Le de téléphone est requis")
    .refine(isValidPhoneNumber, { message: "Numéro de téléphone invalide" }),
  specialite: z
    .string()
    .max(30, "Au maximum 30 caractères")
    .min(3, "Pas moins de 3 caractères")
    .optional(),
  adresse: z
    .string("L'adresse de résidence est requis")
    .max(100, "Au maximum 100 caractères")
    .min(5, "Une adresse minimim de 5 caractères"),
});

// ─── Types inférés ───────────────────────────────────────────────────────────

export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;
export type CompleteProfilSchema = z.infer<typeof completeProfilSchema>;

export type AuthStep = "signIn" | "signUp" | "verifyEmail";
