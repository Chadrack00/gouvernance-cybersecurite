"use client";

import type {
  CompleteProfilSchema,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  SignInFormData,
  SignUpFormData,
} from "@/types/auth.types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "./supabase/client";

/**
 * Hook regroupant toutes les actions d'authentification.
 * Gère les erreurs et les redirections avec Supabase.
 */
export function useAuth() {
  const router = useRouter();
  const supabase = createClient();

  /**
   * Connexion avec email + mot de passe
   */
  async function handleSignIn(data: SignInFormData): Promise<void> {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      console.log(error?.message + " " + error?.code);
      if (error?.code === "invalid_credentials") {
        toast.error("Email ou mot de passe incorrect");
      } else {
        toast.success("Connexion réussie !");
        router.replace("/dashboard");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur de connexion";
      throw new Error(message);
    }
  }

  /**
   * Inscription avec email + mot de passe
   */
  async function handleSignUp(data: SignUpFormData): Promise<boolean> {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
          },
        },
      });
      console.log("Data : ", authData.user?.identities);
      // if (error) {
      //   if (error.message.includes("User already registered")) {
      //     throw new Error("Un compte existe déjà avec cet email");
      //   }
      //   throw error;
      // }
      if (authData.user?.identities?.length === 0) {
        toast.warning("Un compte existe déjà avec cet email");
        return false;
      } else {
        toast.success("Votre compte a été crée avec succès");
        return true;
      }

      // // Supabase renvoie une session vide si la vérification de l'email est requise
      // if (authData.user && !authData.session) {
      //   toast.success("Un code de vérification a été envoyé à votre email !");
      //   return true; // Passe à l'étape de vérification
      // }

      // toast.success("Compte créé avec succès !");
      // router.replace("/dashboard");
      return false;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur d'inscription";
      throw new Error(message);
    }
  }

  /**
   * Vérification de l'email avec le code OTP
   */
  async function handleVerifyEmail(email: string, code: string): Promise<void> {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "signup",
      });

      if (error) {
        if (error.message.includes("Token has expired or is invalid")) {
          throw new Error("Code de vérification invalide ou expiré");
        }
        throw error;
      }

      toast.success("Compte vérifié avec succès !");
      router.replace("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur de vérification";
      throw new Error(message);
    }
  }

  /**
   * Connexion via Google OAuth
   */
  async function handleGoogleSignIn(): Promise<void> {
    try {
      console.log(`${window.location.origin}/api/auth/callback`)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // IMPORTANT: Ne pas mettre "/dashboard" ici !
          // En Next.js SSR, Google doit rediriger vers cette API pour que le serveur
          // crée les cookies de session AVANT que le middleware ne vérifie les routes.
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur avec Google";
      toast.error(message);
    }
  }

  /**
   * Demande de réinitialisation du mot de passe (envoie l'email)
   */
  async function handleForgotPassword(
    data: ForgotPasswordFormData,
  ): Promise<void> {
    try {
      const { data: res, error } = await supabase.auth.resetPasswordForEmail(
        data.email,
        {
          redirectTo: `${process.env.NEXT_PUBLIC_APP}/reset-password`,
        },
      );
      console.log("data =>", res);
      console.log("Error => :", error);
      if (error) throw error;

      toast.success("Email de réinitialisation envoyé !");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de l'envoi";
      throw new Error(message);
    }
  }

  /**
   * Vérification du code + nouveau mot de passe
   */
  async function handleResetPassword(
    data: ResetPasswordFormData,
  ): Promise<void> {
    try {
      // 1. Mettre à jour le mot de passe
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (updateError) throw updateError;
      await supabase.auth.signOut();
      window.location.href = "/signin";
      toast.success("Mot de passe réinitialisé avec succès !");
      router.replace("/signin");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur de réinitialisation";
      throw new Error(message);
    }
  }

  /**
   * Déconnexion
   */
  async function handleSignOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast.success("Déconnecté avec succès");
      router.replace("/signin");
    } catch {
      toast.error("Erreur lors de la déconnexion");
    }
  }

  /**
   * Vérification du temps de validité
   */
  function isLinkStillValid(
    sentAt: string | null,
    expirationMinutes: number = 60,
  ): boolean {
    if (!sentAt) return false;

    const now = new Date().getTime();
    const sentTime = new Date(sentAt).getTime();

    const diffMinutes = (now - sentTime) / (1000 * 60);

    return diffMinutes <= expirationMinutes;
  }

  /**
   * Vérification de la validité du lien d'inscription
   */
  async function handleIsLinkStillValid(): Promise<boolean> {
    try {
      const {
        error,
        data: { user },
      } = await supabase.auth.getUser();

      if (error) throw error;

      if (!isLinkStillValid(user?.email_confirmed_at as string)) {
        toast.warning(
          "Votre email n'est pas encore confirmé, veuillez renvoyer un autre lien de confirmation",
        );
        return false;
      }
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de la vérification";
      toast.error(message);
      return false;
    }
  }

  /**
   * Renvoyez le lien de confirmation
   */
  async function resendConfirmationEmail({
    email,
  }: {
    email: string;
  }): Promise<void> {
    try {
      const { error } = await supabase.auth.resend({
        email: email,
        type: "signup",
      });

      if (error) throw error;

      toast.success("Email de confirmation renvoyé avec succès !");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur lors du renvoi";
      toast.error(message);
    }
  }

  /**
   * Completer les informations du profil
   */
  async function completeProfile(data: CompleteProfilSchema) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error("Utilisateur introuvable");
    }

    // -------------------- avatar upload --------------------------
    const avatarFile = data.photo;
    // Sanitize filename: remove accents, replace spaces/special chars → Supabase rejects keys with apostrophes, spaces, etc.
    const ext = avatarFile.name.split(".").pop()?.toLowerCase() ?? "bin";
    const safeName = avatarFile.name
      .normalize("NFD") // décompose les caractères accentués
      .replace(/[\u0300-\u036f]/g, "") // supprime les diacritiques (accents)
      .replace(/[^a-zA-Z0-9._-]/g, "-") // remplace tout caractère non sûr par -
      .replace(/-+/g, "-") // réduit les tirets consécutifs
      .replace(/^-|-$/g, ""); // retire les tirets en début/fin
    const filePath = `${user.user.id}/${Date.now()}-${safeName || `photo.${ext}`}`;

    const { data: uploadData, error: avatarError } = await supabase.storage
      .from("profile")
      .upload(filePath, avatarFile);

    if (avatarError) {
      throw new Error(avatarError.message ?? "Échec de l'upload de la photo");
    }

    const { error: insertError } = await supabase.from("profiles").insert({
      photo: uploadData?.path,
      phone: data.numero,
      adresse: data.adresse,
      speciality: data.specialite,
      id_user: user.user.id,
    });

    if (insertError) {
      // Supabase PostgREST errors expose .message and .details
      throw new Error(insertError.message ?? "Échec de la création du profil");
    }
  }

  return {
    handleSignIn,
    handleSignUp,
    handleVerifyEmail,
    handleGoogleSignIn,
    handleForgotPassword,
    handleResetPassword,
    handleSignOut,
    handleIsLinkStillValid,
    resendConfirmationEmail,
    completeProfile,
  };
}
