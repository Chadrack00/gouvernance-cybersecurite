"use client";
import { createClient } from "@/actions/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: "VALID", label: "Valider" },
  { value: "PENDING", label: "Mettre en attente" },
  { value: "REJECTED", label: "Rejeter" },
  { value: "SUSPENDED", label: "Suspendre" },
  { value: "BANNED", label: "Bannir" },
];

const ROLE_OPTIONS = [
  { value: "USER", label: "Utilisateur" },
  { value: "ANALYST", label: "Analyste" },
  { value: "OPERATOR", label: "Opérateur" },
  { value: "ADMIN", label: "Administrateur" },
];

export interface UserProfile {
  id: string | number;
  avatar_url?: string;
  name?: string;
  speciality?: string;
  phone?: string;
  status?: string;
  role?: string;
}

export default function TableComponent() {
  const [profile, setProfile] = useState<UserProfile[] | null>(null);
  const [loadingId, setLoadingId] = useState<string | number | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const supabase = createClient();
  const router = useRouter();
  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from("users_profiles").select("*");

      console.log(data);
      setProfile(data);
    };
    fetchUsers();

    const user_id = (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      return session?.user.id;
    })();

    const channel = supabase
      .channel("user-status")
      .on("broadcast", { event: "status-changed" }, (payload) => {
        const { userId, status } = payload.payload;
        setProfile((prev) =>
          prev
            ? prev.map((user) =>
                user.id === userId ? { ...user, status } : user,
              )
            : null,
        );

        if (payload.payload.newStatus !== "VALID" && userId !== user_id) {
          toast.warning("Votre a été invalidé");
          supabase.auth.signOut();
          router.replace("/signin");
          supabase.removeChannel(channel);
        }
        console.log("Après le socket");
      })
      .on("broadcast", { event: "role-changed" }, (payload) => {
        const { userId, role } = payload.payload;
        setProfile((prev) =>
          prev
            ? prev.map((user) =>
                user.id === userId ? { ...user, role } : user,
              )
            : null,
        );
      })
      .subscribe();
    console.log("Après le user status");
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router, setProfile]);

  const handleStatusChange = async (
    userId: string | number,
    newStatus: string,
  ) => {
    setLoadingId(userId);
    // Optimistic update
    setProfile((prev) =>
      prev
        ? prev.map((user) =>
            user.id === userId ? { ...user, status: newStatus } : user,
          )
        : null,
    );
    console.log("newStatus : ", newStatus + " id : ", userId)
    const { error } = await supabase
      .from("profiles")
      .update({ status: newStatus })
      .eq("id_user", userId);

    if (error) {
      toast.error("Erreur lors de la mise à jour du statut");
      console.log(error);
      // Optionnel: Revert optimistic update si erreur
    } else {
      const channel = supabase.channel("user-status");
      toast.success("Statut mis à jour avec succès");
      const c = await channel.send({
        type: "broadcast",
        event: "status-changed",
        payload: {
          userId: userId,
          status: newStatus,
        },
      });
      console.log(c);
    }

    setLoadingId(null);
  };

  const handleRoleChange = async (
    userId: string | number,
    newRole: string,
  ) => {
    setLoadingId(userId);
    // Optimistic update
    setProfile((prev) =>
      prev
        ? prev.map((user) =>
            user.id === userId ? { ...user, role: newRole } : user,
          )
        : null,
    );

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id_user", userId);

    if (error) {
      toast.error("Erreur lors de la mise à jour du rôle");
      console.log(error);
    } else {
      toast.success("Rôle mis à jour avec succès");
      const channel = supabase.channel("user-status");
      await channel.send({
        type: "broadcast",
        event: "role-changed",
        payload: {
          userId: userId,
          role: newRole,
        },
      });
    }

    setLoadingId(null);
  };

  // console.log(data);
  const statusColor = (status: string) => {
    switch (status) {
      case "VALID":
        return "bg-green-50 text-green-700";
      case "PENDING":
        return "bg-yellow-50 text-yellow-700";
      case "REJECTED":
        return "bg-red-50 text-red-700";
      case "SUSPENDED":
        return "bg-orange-50 text-orange-700";
      case "BANNED":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };
  const filteredProfiles = profile?.filter(
    (user) => roleFilter === "ALL" || user.role === roleFilter,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Les utilisateurs de l&apos;application</h2>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrer par rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous les rôles</SelectItem>
            {ROLE_OPTIONS.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">N°</TableHead>
          <TableHead>Nom</TableHead>
          <TableHead>specialité</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Rôle</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredProfiles?.map((user: UserProfile, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">#{index + 1}</TableCell>

            <TableCell className="flex items-center gap-2">
              <Avatar>
                <AvatarImage
                  src={user.avatar_url}
                  alt={user.name || "Avatar"}
                />
                <AvatarFallback>
                  {user.name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {user.name}
            </TableCell>

            <TableCell>{user.speciality}</TableCell>

            <TableCell>{user.phone}</TableCell>

            <TableCell>
              <Badge className={statusColor(user.status!)}>{user.status}</Badge>
            </TableCell>

            <TableCell>
              <Badge variant="outline">{user.role}</Badge>
            </TableCell>

            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    disabled={loadingId === user.id}
                  >
                    <span className="sr-only">Ouvrir le menu</span>
                    {loadingId === user.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MoreHorizontal className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Modifier le Statut</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {STATUS_OPTIONS.filter(
                    (option) => option.value !== user.status,
                  ).map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => handleStatusChange(user.id, option.value)}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Modifier le Rôle</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {ROLE_OPTIONS.filter(
                    (option) => option.value !== user.role,
                  ).map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => handleRoleChange(user.id, option.value)}
                    >
                      Mettre en {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </div>
  );
}
