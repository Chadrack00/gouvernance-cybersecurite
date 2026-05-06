import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Connexion | Gouvernance Cybersécurité",
  description:
    "Connectez-vous ou créez un compte pour accéder à votre espace de gouvernance cybersécurité.",
};

export default function SignInPage() {
  return <Suspense fallback={<div>Loading...</div>}><AuthForm /></Suspense>;
}
