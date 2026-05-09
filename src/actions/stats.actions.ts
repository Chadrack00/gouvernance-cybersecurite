"use server"

import { createClient } from "./supabase/server"
import { cookies } from "next/headers"

export interface StatItem {
  name: string
  value: number
}

export interface DetailedStats {
  roles: StatItem[]
  statuses: StatItem[]
  attackTypes: StatItem[]
  attackSeverity: StatItem[]
}

export async function getDetailedStats(): Promise<DetailedStats> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Roles distribution
  const { data: profiles } = await supabase
    .from("profiles")
    .select("role, status")

  const rolesCount = (profiles || []).reduce((acc: Record<string, number>, p) => {
    const role = p.role as string
    acc[role] = (acc[role] || 0) + 1
    return acc
  }, {})

  const statusCount = (profiles || []).reduce((acc: Record<string, number>, p) => {
    const status = (p.status as string) || "PENDING"
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  // Attacks distribution
  const { data: attacks } = await supabase
    .from("attaques")
    .select("type, severite")

  const attacksByType = (attacks || []).reduce((acc: Record<string, number>, a) => {
    const type = a.type as string
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {})

  const attacksBySeverity = (attacks || []).reduce((acc: Record<string, number>, a) => {
    const severite = a.severite as string
    acc[severite] = (acc[severite] || 0) + 1
    return acc
  }, {})

  return {
    roles: Object.entries(rolesCount).map(([name, value]) => ({ name, value })),
    statuses: Object.entries(statusCount).map(([name, value]) => ({ name, value })),
    attackTypes: Object.entries(attacksByType).map(([name, value]) => ({ name, value })),
    attackSeverity: Object.entries(attacksBySeverity).map(([name, value]) => ({ name, value })),
  }
}
