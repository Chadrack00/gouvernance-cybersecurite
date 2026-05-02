"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/actions/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User as UserIcon, ShieldCheck, Loader2 } from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";

export default function DashboardPage() {
  const supabase = createClient();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    fetchUser();
  }, [supabase.auth]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b bg-card/50 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span>Gouvernance Cyber</span>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/profile" className="gap-2">
                <UserIcon className="h-4 w-4" />
                {user?.user_metadata?.full_name || "Profil"}
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="container flex-1 py-10">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">
            Bienvenue, {user?.user_metadata?.full_name || "Utilisateur"} !
          </h1>
          <p className="text-muted-foreground">
            Vous êtes connecté avec l&apos;adresse : <span className="font-medium text-foreground">{user?.email}</span>
          </p>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-8">
            <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
              <h3 className="font-semibold mb-2 text-lg">Statut de Sécurité</h3>
              <p className="text-sm text-muted-foreground mb-4">Votre compte est protégé par Supabase Auth.</p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/profile">Gérer la sécurité</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
