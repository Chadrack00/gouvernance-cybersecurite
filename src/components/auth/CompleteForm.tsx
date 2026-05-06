"use client";

import { useAuth } from "@/actions/auth.actions";
import { PhoneInput } from "@/components/phone-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  completeProfilSchema,
  type CompleteProfilSchema,
} from "@/types/auth.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { File, FileSpreadsheet, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

export default function CompleteForm() {
  const { completeProfile } = useAuth();
  const router = useRouter();

  // ── React Hook Form (déclaré en premier pour que setValue soit disponible) ──
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CompleteProfilSchema>({
    resolver: zodResolver(completeProfilSchema),
    defaultValues: { numero: "", specialite: "", adresse: "" },
  });

  // ── File upload state ────────────────────────────────────────────────────────
  const [uploadState, setUploadState] = useState<{
    file: File | null;
    progress: number;
    uploading: boolean;
  }>({ file: null, progress: 0, uploading: false });
  const [showDummy, setShowDummy] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validFileTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (validFileTypes.includes(file.type)) {
      setUploadState({ file, progress: 0, uploading: true });
      // Synchronise le fichier sélectionné avec React Hook Form
      setValue("photo", file, { shouldValidate: true, shouldDirty: true });
      const interval = setInterval(() => {
        setUploadState((prev) => {
          const newProgress = prev.progress + 5;
          if (newProgress >= 100) {
            clearInterval(interval);
            return { ...prev, progress: 100, uploading: false };
          }
          return { ...prev, progress: newProgress };
        });
      }, 200);
    } else {
      toast.error("Veuillez choisir une image (JPG, PNG, WEBP ou GIF).", {
        position: "bottom-right",
        duration: 3000,
      });
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) =>
    handleFile(event.target.files?.[0]);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleFile(event.dataTransfer.files?.[0]);
  };

  const resetFile = () => {
    setUploadState({ file: null, progress: 0, uploading: false });
    if (fileInputRef.current) fileInputRef.current.value = "";
    // Réinitialise aussi le champ dans RHF
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue("photo", undefined as any, { shouldValidate: false });
  };

  const getFileIcon = () => {
    if (!uploadState.file) return <File />;
    return <FileSpreadsheet className="h-5 w-5 text-foreground" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const { file, progress, uploading } = uploadState;
  // ────────────────────────────────────────────────────────────────────────────

  async function onCompletForm(data: CompleteProfilSchema) {
    await completeProfile(data)
      .then((d) => {
        toast.success("Profil complété avec succès");
        console.log(d);
        router.replace("/waiting-approval?status=PENDING");
      })
      .catch((err) => {
        console.log(err)
        toast.error(err.message);
      });
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <h2 className="mb-6 text-center text-2xl font-bold tracking-tight">
          Compléter votre profil
        </h2>

        <form onSubmit={handleSubmit(onCompletForm)} className="space-y-6">
          {/* ── Photo de profil ────────────────────────────────────────────── */}
          <div className="space-y-1">
            <Label>Photo de profil</Label>

            {/* Zone de dépôt */}
            <div
              className="flex justify-center rounded-md border mt-2 border-dashed border-input px-6 py-10"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <div className="text-center">
                <File
                  className="mx-auto h-10 w-10 text-muted-foreground"
                  aria-hidden
                />
                <div className="mt-2 flex text-sm leading-6 text-muted-foreground justify-center">
                  <p>Glisser-déposer ou</p>
                  <label
                    htmlFor="profile-photo-upload"
                    className="relative cursor-pointer rounded-sm pl-1 font-medium text-primary hover:underline hover:underline-offset-4"
                  >
                    <span>choisir un fichier</span>
                    <input
                      id="profile-photo-upload"
                      name="profile-photo-upload"
                      type="file"
                      className="sr-only"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                  </label>
                  <p className="pl-1">à uploader</p>
                </div>
              </div>
            </div>

            <p className="mt-1 text-xs text-muted-foreground sm:flex sm:items-center sm:justify-between">
              <span>Types acceptés : JPG, PNG, WEBP, GIF, HEIC.</span>
              <span className="pl-1 sm:pl-0">Max. 5 MB</span>
            </p>

            {/* Aperçu fichier factice */}
            {!file && showDummy && (
              <Card className="relative mt-4 bg-muted p-4 gap-4 shadow-none">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-1 top-1 text-muted-foreground hover:text-foreground"
                  aria-label="Retirer"
                  onClick={() => setShowDummy(false)}
                >
                  <X className="h-5 w-5 shrink-0" aria-hidden />
                </Button>
                <div className="flex items-center space-x-2.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-background shadow-sm ring-1 ring-inset ring-border">
                    <FileSpreadsheet className="h-5 w-5 text-foreground" aria-hidden />
                  </span>
                  <div>
                    <p className="text-xs font-medium text-foreground">photo_profil.jpg</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">1.2 MB</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 mt-2">
                  <Progress value={45} className="h-1.5" />
                  <span className="text-xs text-muted-foreground">45%</span>
                </div>
              </Card>
            )}

            {/* Aperçu fichier réel */}
            {file && (
              <Card className="relative mt-4 bg-muted p-4 gap-4 shadow-none">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-1 top-1 text-muted-foreground hover:text-foreground"
                  aria-label="Retirer"
                  onClick={resetFile}
                >
                  <X className="h-5 w-5 shrink-0" aria-hidden />
                </Button>
                <div className="flex items-center space-x-2.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-background shadow-sm ring-1 ring-inset ring-border">
                    {getFileIcon()}
                  </span>
                  <div>
                    <p className="text-xs font-medium text-foreground">{file.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 mt-2">
                  <Progress value={progress} className="h-1.5" />
                  <span className="text-xs text-muted-foreground">{progress}%</span>
                </div>
              </Card>
            )}

            {errors.photo && (
              <span className="text-xs text-destructive font-medium">
                ⚠ {errors.photo.message}
              </span>
            )}
          </div>

          {/* ── Numéro de téléphone ─────────────────────────────────────────── */}
          <div className="space-y-1">
            <FieldGroup>
              <Controller
                name="numero"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="complete-form-numero">
                      Numéro de téléphone
                    </FieldLabel>
                    <PhoneInput
                      id="complete-form-numero"
                      placeholder="Entrer un numéro de téléphone"
                      {...field}
                    />
                    {errors.numero && (
                      <span className="text-xs text-destructive font-medium">
                        ⚠ {errors.numero.message}
                      </span>
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </div>

          {/* ── Spécialité ──────────────────────────────────────────────────── */}
          <div className="space-y-1">
            <Label htmlFor="complete-form-specialite">Spécialité</Label>
            <Controller
              name="specialite"
              control={control}
              render={({ field }) => (
                <Input
                  id="complete-form-specialite"
                  type="text"
                  placeholder="Ex : Cybersécurité, Réseau…"
                  {...field}
                />
              )}
            />
            {errors.specialite && (
              <span className="text-xs text-destructive font-medium">
                ⚠ {errors.specialite.message}
              </span>
            )}
          </div>

          {/* ── Adresse ─────────────────────────────────────────────────────── */}
          <div className="space-y-1">
            <Label htmlFor="complete-form-adresse">Adresse de résidence *</Label>
            <Controller
              name="adresse"
              control={control}
              render={({ field }) => (
                <Input
                  id="complete-form-adresse"
                  type="text"
                  placeholder="Ex : 12 rue de la Paix, Kinshasa"
                  {...field}
                />
              )}
            />
            {errors.adresse && (
              <span className="text-xs text-destructive font-medium">
                ⚠ {errors.adresse.message}
              </span>
            )}
          </div>

          {/* ── Bouton de soumission ─────────────────────────────────────────── */}
          <Button
            type="submit"
            className="w-full"
            disabled={uploading}
          >
            Compléter le profil
          </Button>
        </form>
      </div>
    </div>
  );
}
