"use client";

import { createClient } from "@/actions/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/actions/auth.actions";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, LogOut, User } from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";

export function ProfileForm() {
  const supabase = createClient();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { handleSignOut } = useAuth();
  
  const [name, setName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setName(user.user_metadata?.full_name || "");
      }
      setLoading(false);
    };
    fetchUser();
  }, [supabase.auth]);

  async function onUpdateName(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name }
      });
      if (error) throw error;
      toast.success("Profil mis à jour !");
    } catch (err) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setIsUpdating(false);
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

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Informations Personnelles</CardTitle>
              <CardDescription>Gérez vos informations de profil</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form id="profile-form" onSubmit={onUpdateName} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input id="email" value={user.email || ""} disabled className="bg-muted/50" />
              <p className="text-[10px] text-muted-foreground">L&apos;adresse email ne peut pas être modifiée.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nom d&apos;affichage</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} 
                placeholder="Votre nom"
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between border-t bg-muted/20 px-6 py-4">
          <Button 
            type="submit" 
            form="profile-form" 
            disabled={isUpdating || name === (user.user_metadata?.full_name || "")}
          >
            {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Enregistrer les modifications
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-destructive/20 bg-destructive/5 shadow-md">
        <CardHeader>
          <CardTitle className="text-destructive">Zone de danger</CardTitle>
          <CardDescription>Actions irréversibles pour votre compte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Déconnexion</p>
              <p className="text-sm text-muted-foreground">Mettre fin à votre session actuelle</p>
            </div>
            <Button variant="destructive" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
