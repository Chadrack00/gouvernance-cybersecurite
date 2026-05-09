import { ProfileForm } from "@/components/auth/ProfileForm";
import { Avatar } from "@/components/ui/avatar";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mon Profil | Gouvernance Cybersécurité",
  description: "Gérez vos informations personnelles et votre sécurité.",
};

export default function ProfilePage() {
  return (
    <div className="container max-w-full py-10 flex flex-col items-center border relative">
      <Link href="/dashboard" className="absolute left-5 top-5 ">
        <Avatar className="bg-primary/10 flex justify-center items-center">
          <ArrowLeft className="text-primary" />
        </Avatar>
      </Link>
      <h1 className="mb-8 text-3xl font-bold tracking-tight">
        Paramètres du compte
      </h1>
      <ProfileForm />
    </div>
  );
}
