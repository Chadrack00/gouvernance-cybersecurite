import { Toaster } from "@/components/ui/sonner";
import { Metadata } from "next";
import type { ReactNode } from "react";
export const metadata: Metadata = {
  title: {
    template: "%s | Gouvernance",
    default: "Gouvernance",
  },
  description: "Plateforme de gouvernance Cybersécurité",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* ── Fond animé avec orbes ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {/* Orbe bleu */}
        <div
          className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, oklch(0.6 0.2 264) 0%, transparent 70%)",
            animation: "pulse 8s ease-in-out infinite",
          }}
        />
        {/* Orbe violet */}
        <div
          className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full opacity-15 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, oklch(0.55 0.22 290) 0%, transparent 70%)",
            animation: "pulse 10s ease-in-out infinite 2s",
          }}
        />
        {/* Grille décorative */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.5 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(0.5 0 0) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* ── Logo en haut ── */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <span className="text-sm font-semibold tracking-tight text-foreground">
          Gouvernance Cybersécurité
        </span>
      </div>

      {/* ── Contenu (formulaire) ── */}
      <main className="w-full px-4 py-24 flex items-center justify-center">
        {children}
      </main>

      {/* ── Footer ── */}
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
        © 2026 Gouvernance Cybersécurité · Sécurité & Conformité
      </p>

      <Toaster position="top-right" richColors />
    </div>
  );
}
