"use client";

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
import { Separator } from "@/components/ui/separator";
import {
  signInSchema,
  signUpSchema,
  type AuthStep,
  type SignInFormData,
  type SignUpFormData,
} from "@/types/auth.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { GoogleSignInButton } from "./GoogleSignInButton";

export function AuthForm() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const [step, setStep] = useState<AuthStep>("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const {
    handleSignIn,
    handleSignUp,
    handleIsLinkStillValid,
    resendConfirmationEmail,
  } = useAuth();
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (errorParam) {
      toast.error(decodeURIComponent(errorParam));
    }
  }, [errorParam]);

  // ─── Formulaire SignIn ───────────────────────────────────────────────────
  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  // ─── Formulaire SignUp ───────────────────────────────────────────────────
  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const isSignIn = step === "signIn";
  const isSignUp = step === "signUp";
  const isVerifyEmail = step === "verifyEmail";

  function toggleStep() {
    setStep(isSignIn ? "signUp" : "signIn");
    signInForm.clearErrors();
    signUpForm.clearErrors();
  }

  // ─── Submit SignIn ───────────────────────────────────────────────────────
  async function onSignIn(data: SignInFormData) {
    setIsLoading(true);
    try {
      await handleSignIn(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur de connexion";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }

  // ─── Submit SignUp ───────────────────────────────────────────────────────
  async function onSignUp(data: SignUpFormData) {
    setIsLoading(true);
    try {
      const needsVerification = await handleSignUp(data);
      if (needsVerification) {
        setPendingEmail(data.email);
        setStep("verifyEmail");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur d'inscription";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }

  // ─── Submit Resend Email ─────────────────────────────────────────────────
  async function onResendEmail() {
    setIsResending(true);
    try {
      // Optionnel: On peut vérifier si le lien est valide avant de renvoyer
      // const isValid = await handleIsLinkStillValid();
      // if (!isValid) { ... }

      await resendConfirmationEmail({ email: pendingEmail });
    } finally {
      setIsResending(false);
    }
  }

  return (
    <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm shadow-2xl">
      {/* ── En-tête ── */}
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="text-2xl font-bold tracking-tight text-center">
          {isSignIn && "Connexion"}
          {isSignUp && "Créer un compte"}
          {isVerifyEmail && "Vérifiez votre email"}
        </CardTitle>
        <CardDescription className="text-center">
          {isSignIn && "Connectez-vous à votre espace sécurisé"}
          {isSignUp && "Rejoignez la plateforme de gouvernance"}
          {isVerifyEmail &&
            `Un lien de confirmation a été envoyé à ${pendingEmail}`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ── Google OAuth ── */}
        {!isVerifyEmail && (
          <>
            <GoogleSignInButton />
            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                ou continuer avec l&apos;email
              </span>
            </div>
          </>
        )}

        {/* ── Formulaire SignIn ── */}
        {isSignIn && (
          <form
            id="signin-form"
            onSubmit={signInForm.handleSubmit(onSignIn)}
            className="space-y-4"
            noValidate
          >
            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="signin-email">Adresse email</Label>
              <Input
                id="signin-email"
                type="email"
                placeholder="vous@example.com"
                autoComplete="email"
                aria-invalid={!!signInForm.formState.errors.email}
                {...signInForm.register("email")}
              />
              {signInForm.formState.errors.email && (
                <p className="text-xs text-destructive font-medium">
                  ⚠ {signInForm.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Mot de passe */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="signin-password">Mot de passe</Label>
                <a
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Mot de passe oublié ?
                </a>
              </div>
              <Input
                id="signin-password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={!!signInForm.formState.errors.password}
                {...signInForm.register("password")}
              />
              {signInForm.formState.errors.password && (
                <p className="text-xs text-destructive font-medium">
                  ⚠ {signInForm.formState.errors.password.message}
                </p>
              )}
            </div>
          </form>
        )}

        {/* ── Formulaire SignUp ── */}
        {isSignUp && (
          <form
            id="signup-form"
            onSubmit={signUpForm.handleSubmit(onSignUp)}
            className="space-y-4"
            noValidate
          >
            {/* Nom */}
            <div className="space-y-1">
              <Label htmlFor="signup-name">Nom complet</Label>
              <Input
                id="signup-name"
                type="text"
                placeholder="Jean Dupont"
                autoComplete="name"
                aria-invalid={!!signUpForm.formState.errors.name}
                {...signUpForm.register("name")}
              />
              {signUpForm.formState.errors.name && (
                <p className="text-xs text-destructive font-medium">
                  ⚠ {signUpForm.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="signup-email">Adresse email</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="vous@example.com"
                autoComplete="email"
                aria-invalid={!!signUpForm.formState.errors.email}
                {...signUpForm.register("email")}
              />
              {signUpForm.formState.errors.email && (
                <p className="text-xs text-destructive font-medium">
                  ⚠ {signUpForm.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Mot de passe */}
            <div className="space-y-1">
              <Label htmlFor="signup-password">Mot de passe</Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="Min. 8 caractères, 1 maj, 1 chiffre"
                autoComplete="new-password"
                aria-invalid={!!signUpForm.formState.errors.password}
                {...signUpForm.register("password")}
              />
              {signUpForm.formState.errors.password && (
                <p className="text-xs text-destructive font-medium">
                  ⚠ {signUpForm.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* Confirmation */}
            <div className="space-y-1">
              <Label htmlFor="signup-confirm">Confirmer le mot de passe</Label>
              <Input
                id="signup-confirm"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                aria-invalid={!!signUpForm.formState.errors.confirmPassword}
                {...signUpForm.register("confirmPassword")}
              />
              {signUpForm.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive font-medium">
                  ⚠ {signUpForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
          </form>
        )}

        {/* ── Formulaire VerifyEmail ── */}
        {isVerifyEmail && (
          <div id="verify-email-form" className="space-y-6 text-center py-2">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">
                Veuillez vérifier votre boîte de réception et cliquer sur le
                lien pour confirmer votre adresse email.
              </h3>

              <div className="pt-4 flex flex-col gap-3">
                <span className="text-xs text-muted-foreground">
                  Vous n&apos;avez pas reçu l&apos;email ou le lien a expiré ?
                  Cliquez sur le bouton ci-dessous pour en recevoir un nouveau.
                </span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onResendEmail}
                  disabled={isResending}
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Renvoi
                      en cours...
                    </>
                  ) : (
                    "Renvoyer le lien de vérification"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* ── Footer ── */}
      <CardFooter className="flex flex-col gap-3">
        {!isVerifyEmail && (
          <Button
            type="submit"
            form={isSignIn ? "signin-form" : "signup-form"}
            className="w-full h-9 font-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isSignIn ? "Connexion..." : "Création..."}
              </>
            ) : isSignIn ? (
              "Se connecter"
            ) : (
              "Créer mon compte"
            )}
          </Button>
        )}

        {!isVerifyEmail && (
          <p className="text-sm text-muted-foreground text-center">
            {isSignIn ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
            <button
              type="button"
              onClick={toggleStep}
              className="text-primary font-medium hover:underline focus:outline-none"
            >
              {isSignIn ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        )}

        {isVerifyEmail && (
          <p className="text-sm text-muted-foreground text-center">
            <button
              type="button"
              onClick={() => {
                setStep("signUp");
                setPendingEmail("");
              }}
              className="text-primary font-medium hover:underline focus:outline-none"
            >
              Retour à l&apos;inscription
            </button>
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
