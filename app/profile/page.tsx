import type { Metadata } from "next";
import { ProfileForm } from "@/components/auth/ProfileForm";

export const metadata: Metadata = {
  title: "Mon Profil | Gouvernance Cybersécurité",
  description: "Gérez vos informations personnelles et votre sécurité.",
};

export default function ProfilePage() {
  return (
    <div className="container max-w-2xl py-10">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Paramètres du compte</h1>
      <ProfileForm />
    </div>
  );
}
