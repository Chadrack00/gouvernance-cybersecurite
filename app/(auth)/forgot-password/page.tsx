import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Mot de passe oublié | Gouvernance Cybersécurité",
  description:
    "Réinitialisez votre mot de passe en recevant un code par email.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
