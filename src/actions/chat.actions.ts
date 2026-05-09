"use server"

import { createClient } from "./supabase/server"
import { cookies } from "next/headers"

export async function getChatMessages() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // On utilise la vue SQL qui contient déjà le nom et la photo
  const { data, error } = await supabase
    .from("chats_with_users")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(50)

  if (error) {
    console.error("Error fetching chats:", error)
    return []
  }

  return data
}

export async function getCurrentUserProfile() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // On utilise la vue users_profiles pour avoir le nom
  const { data: profile } = await supabase
    .from("users_profiles")
    .select("id, name, photo")
    .eq("id", user.id)
    .single()

  if (!profile) return null

  // On a besoin de id_profile pour l'insertion dans chats
  const { data: p } = await supabase
    .from("profiles")
    .select("id_profile")
    .eq("id_user", user.id)
    .single()

  return {
    id_profile: p?.id_profile,
    name: profile.name || user.user_metadata?.full_name || user.user_metadata?.name || "Utilisateur",
    photo: profile.photo
  }
}

export async function sendChatMessage(message: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from("profiles")
    .select("id_profile")
    .eq("id_user", user.id)
    .single()

  if (!profile) throw new Error("Profile not found")

  const { error } = await supabase
    .from("chats")
    .insert({
      message,
      sender_id: profile.id_profile
    })

  if (error) {
    console.error("Error sending chat:", error)
    throw error
  }
}
