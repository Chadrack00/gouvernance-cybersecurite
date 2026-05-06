"use client";

import { createClient  } from "@/actions/supabase/client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: string; message: string }
> = {
  PENDING: {
    label: "En attente",
    color: "text-yellow-700",
    bg: "bg-yellow-100",
    icon: "⏳",
    message:
      "Votre compte est en cours de validation par notre équipe. Vous recevrez une notification dès que votre accès sera activé.",
  },
  VALID: {
    label: "Valide",
    color: "text-green-700",
    bg: "bg-green-100",
    icon: "✓",
    message:
      "Votre compte est valide. Vous pouvez vous connecter.",
  },
  REJECTED: {
    label: "Rejeté",
    color: "text-red-700",
    bg: "bg-red-100",
    icon: "🚫",
    message:
      "Votre compte a été rejeté. Contactez le support pour plus d'informations.",
  },
  SUSPENDED: {
    label: "Suspendu",
    color: "text-red-700",
    bg: "bg-red-100",
    icon: "🚫",
    message:
      "Votre compte a été temporairement suspendu suite à une activité suspecte ou une violation des règles. Contactez le support si vous pensez qu'il s'agit d'une erreur.",
  },
  BANNED: {
    label: "Banni",
    color: "text-red-900",
    bg: "bg-red-100",
    icon: "⛔",
    message:
      "Votre compte a été définitivement banni. Si vous pensez qu'il s'agit d'une erreur, veuillez contacter notre support.",
  },
};

const DEFAULT_CONFIG = STATUS_CONFIG["PENDING"];

export default function WaitingApprovalContent() {
  const status = useSearchParams().get("status") ?? "PENDING";
  const config = STATUS_CONFIG[status] ?? DEFAULT_CONFIG;
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-xl w-full">
          {/* Card */}
          <div className="bg-card rounded-xl p-8 shadow border flex flex-col items-center text-center">
            {/* Icon */}
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${config.bg}`}
            >
              <span className="text-3xl">{config.icon}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold mb-2">État de votre compte</h1>

            {/* Badge statut */}
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold mb-4 ${config.bg} ${config.color}`}
            >
              {config.label}
            </span>

            {/* Message */}
            <p className="text-muted-foreground mb-6">{config.message}</p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Link href="email:chadracksamba394@gmail.com" className="flex-1 bg-primary text-primary-foreground font-bold py-3 px-6 rounded-lg hover:opacity-90 transition">
                Contacter le support
              </Link>
              <button
                onClick={async () => {
                  setLoading(true);
                  await supabase.auth.signOut();
                  setLoading(false);
                  router.replace("/signin");
                }}
                disabled={loading}
                className="flex-1 flex items-center bg-red-500/70 text-primary-foreground font-bold py-3 px-6 rounded-lg hover:opacity-90 transition"
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {loading ? "Déconnexion..." : "Se déconnecter"}
              </button>
            </div>

            {/* Reference */}
            <div className="mt-6 pt-4 border-t w-full">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                Référence du cas : #SUS-4-X
              </p>
            </div>
          </div>

          {/* Help Cards */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/50 p-4 rounded-lg border">
              <h3 className="text-sm font-semibold mb-1 uppercase">
                Pourquoi cela arrive-t-il ?
              </h3>
              <p className="text-xs text-muted-foreground">
                Cela peut être dû à une activité suspecte ou au non-respect des
                règles de la plateforme.
              </p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg border">
              <h3 className="text-sm font-semibold mb-1 uppercase">
                Délai de réponse
              </h3>
              <p className="text-xs text-muted-foreground">
                Notre équipe répond généralement sous 24 à 48 heures ouvrées.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="max-w-7xl mx-auto py-6 px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <span className="font-bold">Gouvernance Cybersécurité</span>
            <p className="text-sm text-muted-foreground">© 2026</p>
          </div>
          <nav className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition">
              Statut
            </a>
            <a href="#" className="hover:text-foreground transition">
              Docs
            </a>
            <a href="#" className="hover:text-foreground transition">
              Confidentialité
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
