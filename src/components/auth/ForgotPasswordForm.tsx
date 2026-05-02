"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAuth } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/types/auth.types";

export function ForgotPasswordForm() {
  const [emailSent, setEmailSent] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { handleForgotPassword } = useAuth();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    setIsLoading(true);
    try {
      await handleForgotPassword(data);
      setSentTo(data.email);
      setEmailSent(true);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erreur lors de l&apos;envoi";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }

  // ─── État : email envoyé ────────────────────────────────────────────────
  if (emailSent) {
    return (
      <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm shadow-2xl">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <MailCheck className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold">Email envoyé !</h2>
            <p className="text-sm text-muted-foreground">
              Un lien de réinitialisation a été envoyé à{" "}
              <span className="font-medium text-foreground">{sentTo}</span>.
              <br />
              Vérifiez votre boîte de réception (et les spams).
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setEmailSent(false)}
            className="text-sm text-muted-foreground hover:text-foreground hover:underline"
          >
            Renvoyer l&apos;email
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ─── Formulaire principal ───────────────────────────────────────────────
  return (
    <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm shadow-2xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-center">
          Mot de passe oublié
        </CardTitle>
        <CardDescription className="text-center">
          Entrez votre email pour recevoir un code de réinitialisation
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          id="forgot-password-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <div className="space-y-1">
            {form.formState.errors.email && (
              <p className="text-xs text-destructive font-medium">
                ⚠ {form.formState.errors.email.message}
              </p>
            )}
            <Label htmlFor="forgot-email">Adresse email</Label>
            <Input
              id="forgot-email"
              type="email"
              placeholder="vous@example.com"
              autoComplete="email"
              aria-invalid={!!form.formState.errors.email}
              {...form.register("email")}
            />
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <Button
          type="submit"
          form="forgot-password-form"
          className="w-full h-9 font-semibold"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            "Envoyer le code"
          )}
        </Button>

        <Button variant="ghost" size="sm" asChild className="gap-1">
          <Link href="/signin">
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour à la connexion
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
