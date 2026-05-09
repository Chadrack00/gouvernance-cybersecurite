"use server"

import { createClient } from "./supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

// --- Interfaces ---
export interface ServerItem {
  id_serveur: string;
  name: string;
  type: string;
  ip_adresse: string;
  description: string | null;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  created_at: string;
  updated_at: string;
}

export interface LogItem {
  id_log: string;
  content: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AttackItem {
  id_attaque: string;
  type: string;
  data: Record<string, unknown>;
  status: "SUCCESSFUL" | "FAILED";
  created_at: string;
  updated_at: string;
}

// --- Helper to get profile ID ---
async function getProfileId() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("id_profile")
    .eq("id_user", user.id)
    .single()

  return profile?.id_profile || null
}

// --- Servers ---
export async function getManagementServers(): Promise<ServerItem[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data } = await supabase.from("servers").select("*").order("created_at", { ascending: false })
  return (data as ServerItem[]) || []
}

export async function createServer(data: { name: string; type: string; ip_adresse: string; description: string; status: string }) {
  const role = await getCurrentUserRole()
  if (role !== "ADMIN") throw new Error("Unauthorized")

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const profileId = await getProfileId()
  if (!profileId) throw new Error("Unauthorized")

  const { error } = await supabase.from("servers").insert({
    ...data,
    id_profile: profileId
  })

  if (error) throw error
  revalidatePath("/dashboard/management")
}

export async function updateServer(id: string, data: { name: string; type: string; ip_adresse: string; description: string; status: string }) {
  const role = await getCurrentUserRole()
  if (role !== "ADMIN") throw new Error("Unauthorized")

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase
    .from("servers")
    .update(data)
    .eq("id_serveur", id)

  if (error) throw error
  revalidatePath("/dashboard/management")
}

export async function deleteServer(id: string) {
  const role = await getCurrentUserRole()
  if (role !== "ADMIN") throw new Error("Unauthorized")

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase.from("servers").delete().eq("id_serveur", id)

  if (error) throw error
  revalidatePath("/dashboard/management")
}

// --- Logs ---
export async function getManagementLogs(): Promise<LogItem[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data } = await supabase.from("logs").select("*").order("created_at", { ascending: false })
  return (data as LogItem[]) || []
}

export async function createLog(data: { content: Record<string, unknown> }) {
  const role = await getCurrentUserRole()
  if (role !== "ADMIN" && role !== "ANALYST") throw new Error("Unauthorized")

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase.from("logs").insert(data)

  if (error) throw error
  revalidatePath("/dashboard/management")
}

export async function deleteLog(id: string) {
  const role = await getCurrentUserRole()
  if (role !== "ADMIN" && role !== "ANALYST") throw new Error("Unauthorized")

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase.from("logs").delete().eq("id_log", id)

  if (error) throw error
  revalidatePath("/dashboard/management")
}

// --- Attacks ---
export async function getManagementAttacks(): Promise<AttackItem[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data } = await supabase.from("attaques").select("*").order("created_at", { ascending: false })
  return (data as AttackItem[]) || []
}

export async function createAttack(data: { type: string; data: Record<string, unknown>; status: string }) {
  const role = await getCurrentUserRole()
  if (role !== "ADMIN" && role !== "ANALYST") throw new Error("Unauthorized")

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase.from("attaques").insert(data)

  if (error) throw error
  revalidatePath("/dashboard/management")
}

export async function deleteAttack(id: string) {
  const role = await getCurrentUserRole()
  if (role !== "ADMIN" && role !== "ANALYST") throw new Error("Unauthorized")

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase.from("attaques").delete().eq("id_attaque", id)

  if (error) throw error
  revalidatePath("/dashboard/management")
}

export async function simulateAttack() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // 1. Pick a random attack type
  const attackTypes = ["DDoS", "SQL Injection", "Brute Force", "Phishing", "Man-in-the-middle", "Zero-day Exploit"]
  const type = attackTypes[Math.floor(Math.random() * attackTypes.length)]
  const status = Math.random() > 0.7 ? "SUCCESSFUL" : "FAILED"

  // 2. Create the attack
  const { data: attack, error: attackError } = await supabase.from("attaques").insert({
    type,
    status,
    data: {
      origin_ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      target_layer: "Application",
      severity: status === "SUCCESSFUL" ? "HIGH" : "LOW"
    }
  }).select().single()

  if (attackError) throw attackError

  // 3. Create logs
  const logEvents = [
    { content: { event: "Network Scan Detected", source: "External", severity: "INFO" } },
    { content: { event: "Firewall Rule Triggered", rule_id: "FW-99", action: "BLOCK" } },
    { content: { event: "Intrusion Detection System Alert", type, outcome: status } }
  ]
  await supabase.from("logs").insert(logEvents)

  // 4. Randomly disrupt a server if attack was successful
  if (status === "SUCCESSFUL") {
    const { data: servers } = await supabase.from("servers").select("id_serveur")
    if (servers && servers.length > 0) {
      const targetServer = servers[Math.floor(Math.random() * servers.length)]
      await supabase.from("servers").update({ status: "INACTIVE" }).eq("id_serveur", targetServer.id_serveur)
    }
  }

  // 5. Broadcast signal
  const channel = supabase.channel("admin-notifications")
  channel.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      channel.send({
        type: "broadcast",
        event: "new-attack",
        payload: { message: `ALERTE : Nouvelle attaque ${type} détectée !`, type: "ATTACK" }
      })
    }
  })

  revalidatePath("/dashboard/management")
  revalidatePath("/dashboard")
  return { type, status }
}

export async function getCurrentUserRole() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id_user", user.id)
    .single()

  return profile?.role || "USER"
}
