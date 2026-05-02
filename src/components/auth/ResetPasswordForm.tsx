"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/types/auth.types";

export function ResetPasswordForm() {
  // const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { handleResetPassword } = useAuth();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmNewPassword: "" },
  });

  async function onSubmit(data: ResetPasswordFormData) {
    // if (!email) {
    //   toast.error("Email manquant. Recommencez depuis la page précédente.");
    //   return;
    // }
    setIsLoading(true);
    try {
      await handleResetPassword(data);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erreur de réinitialisation";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm shadow-2xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-center">
          Nouveau mot de passe
        </CardTitle>
        <CardDescription className="text-center">
          Entrez le code reçu par email et choisissez un nouveau mot de passe
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          id="reset-password-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          {/* Email affiché en lecture seule */}
          {/* {email && (
            <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              Code envoyé à{" "}
              <span className="font-medium text-foreground">{email}</span>
            </div>
          )} */}

          {/* Code OTP
          <div className="space-y-1">
            {form.formState.errors.code && (
              <p className="text-xs text-destructive font-medium">
                ⚠ {form.formState.errors.code.message}
              </p>
            )}
            <Label htmlFor="reset-code">Code de vérification (8 chiffres)</Label>
            <Input
              id="reset-code"
              type="text"
              inputMode="numeric"
              placeholder="12345678"
              maxLength={8}
              autoComplete="one-time-code"
              aria-invalid={!!form.formState.errors.code}
              className="tracking-widest text-center text-lg font-mono"
              {...form.register("code")}
            />
          </div> */}

          {/* Nouveau mot de passe */}
          <div className="space-y-1">
            {form.formState.errors.newPassword && (
              <p className="text-xs text-destructive font-medium">
                ⚠ {form.formState.errors.newPassword.message}
              </p>
            )}
            <Label htmlFor="reset-new-password">Nouveau mot de passe</Label>
            <div className="relative">
              <Input
                id="reset-new-password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 car., 1 maj, 1 chiffre"
                autoComplete="new-password"
                aria-invalid={!!form.formState.errors.newPassword}
                className="pr-9"
                {...form.register("newPassword")}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Masquer" : "Afficher"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirmation */}
          <div className="space-y-1">
            {form.formState.errors.confirmNewPassword && (
              <p className="text-xs text-destructive font-medium">
                ⚠ {form.formState.errors.confirmNewPassword.message}
              </p>
            )}
            <Label htmlFor="reset-confirm">Confirmer le mot de passe</Label>
            <div className="relative">
              <Input
                id="reset-confirm"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                aria-invalid={!!form.formState.errors.confirmNewPassword}
                className="pr-9"
                {...form.register("confirmNewPassword")}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showConfirm ? "Masquer" : "Afficher"}
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <Button
          type="submit"
          form="reset-password-form"
          className="w-full h-9 font-semibold"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Réinitialisation...
            </>
          ) : (
            "Réinitialiser le mot de passe"
          )}
        </Button>

        <Button variant="ghost" size="sm" asChild className="gap-1">
          <Link href="/forgot-password">
            <ArrowLeft className="h-3.5 w-3.5" />
            Renvoyer le code
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
