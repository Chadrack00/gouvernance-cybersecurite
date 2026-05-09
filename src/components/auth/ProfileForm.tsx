"use client";

import { useAuth } from "@/actions/auth.actions";
import { createClient } from "@/actions/supabase/client";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
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
import { User as SupabaseUser } from "@supabase/supabase-js";
import { Briefcase, Loader2, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ProfessionalProfile {
  id_user?: string;
  phone?: string;
  speciality?: string;
  adresse?: string;
  photo?: string;
}

export function ProfileForm() {
  const supabase = createClient();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { handleSignOut } = useAuth();

  const [name, setName] = useState("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  const [phone, setPhone] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [adresse, setAdresse] = useState("");
  const [initialProfile, setInitialProfile] =
    useState<ProfessionalProfile | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setName(user.user_metadata?.full_name || "");

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id_user", user.id)
          .single();

        const { data, error } = await supabase.storage.listBuckets();

        console.log(data, error);

        if (profile) {
          setInitialProfile(profile);
          setPhone(profile.phone || "");
          setSpeciality(profile.speciality || "");
          setAdresse(profile.adresse || "");

          if (profile.photo) {
            const { data: publicUrl } = await supabase.storage
              .from("profile")
              .createSignedUrl(profile.photo, 60);
            setAvatarUrl(publicUrl?.signedUrl || null);
          }
        }
      }
      setLoading(false);
    };
    fetchUserAndProfile();
  }, [supabase]);

  async function onUpdateName(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setIsUpdatingName(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name },
      });
      if (error) throw error;
      toast.success("Nom d'affichage mis à jour !");
    } catch (err) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setIsUpdatingName(false);
    }
  }

  async function onUpdateProfessionalInfo(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setIsUpdatingProfile(true);
    try {
      if (initialProfile) {
        const { error } = await supabase
          .from("profiles")
          .update({
            phone,
            speciality,
            adresse,
          })
          .eq("id_user", user.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("profiles")
          .insert({
            phone,
            speciality,
            adresse,
            id_user: user.id,
          })
          .select()
          .single();
        if (error) throw error;
        setInitialProfile(data);
      }
      toast.success("Profil professionnel mis à jour !");
    } catch (err) {
      toast.error("Erreur lors de la mise à jour du profil professionnel");
    } finally {
      setIsUpdatingProfile(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const isProfileChanged =
    (initialProfile?.phone || "") !== phone ||
    (initialProfile?.speciality || "") !== speciality ||
    (initialProfile?.adresse || "") !== adresse;

  console.log("Avatar: ", avatarUrl);
  return (
    <div className="mx-auto max-w-4xl space-y-6 ">
      <Card className="border-border/50 bg-card/80 shadow-xl backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary/10">
              {avatarUrl ? (
                <Avatar className="h-full w-full">
                  <AvatarImage src={avatarUrl} alt={name || "Avatar"} />
                  {/* <AvatarFallback>{name?.substring(0, 2).toUpperCase()}</AvatarFallback> */}
                </Avatar>
              ) : (
                <User className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <CardTitle>Informations Personnelles</CardTitle>
              <CardDescription>Gérez vos informations de base</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form
            id="profile-name-form"
            onSubmit={onUpdateName}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                value={user.email || ""}
                disabled
                className="bg-muted/50"
              />
              <p className="text-[10px] text-muted-foreground">
                L&apos;adresse email ne peut pas être modifiée.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nom d&apos;affichage</Label>
              <Input
                id="name"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
                placeholder="Votre nom"
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between border-t bg-muted/20 px-6 py-4">
          <Button
            type="submit"
            form="profile-name-form"
            disabled={
              isUpdatingName || name === (user.user_metadata?.full_name || "")
            }
          >
            {isUpdatingName ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Enregistrer le nom
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Profil Professionnel</CardTitle>
              <CardDescription>
                Complétez vos informations professionnelles et de contact
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form
            id="profile-info-form"
            onSubmit={onUpdateProfessionalInfo}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="speciality">Spécialité</Label>
              <Input
                id="speciality"
                value={speciality}
                onChange={(e) => setSpeciality(e.target.value)}
                placeholder="Votre spécialité (ex: Cybersécurité)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Numéro de téléphone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Votre numéro de téléphone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adresse">Adresse de résidence</Label>
              <Input
                id="adresse"
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                placeholder="Votre adresse"
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between border-t bg-muted/20 px-6 py-4">
          <Button
            type="submit"
            form="profile-info-form"
            disabled={isUpdatingProfile || !isProfileChanged}
          >
            {isUpdatingProfile ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Enregistrer le profil
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-destructive/20 bg-destructive/5 shadow-md">
        <CardHeader>
          <CardTitle className="text-destructive">Zone de danger</CardTitle>
          <CardDescription>
            Actions irréversibles pour votre compte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Déconnexion</p>
              <p className="text-sm text-muted-foreground">
                Mettre fin à votre session actuelle
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleSignOut}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
