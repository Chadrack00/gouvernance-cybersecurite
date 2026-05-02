import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Nouveau mot de passe | Gouvernance Cybersécurité",
  description: "Créez un nouveau mot de passe sécurisé pour votre compte.",
};

export default function ResetPasswordPage() {
  return (
    // Suspense requis car ResetPasswordForm utilise useSearchParams()
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
