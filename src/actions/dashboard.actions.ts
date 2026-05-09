"use server"

import { createClient } from "./supabase/server"
import { cookies } from "next/headers"
import { subDays, startOfDay, endOfDay, format } from "date-fns"

export async function getDashboardStats() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const now = new Date()
  const sevenDaysAgo = subDays(now, 7)
  const fourteenDaysAgo = subDays(now, 14)

  // Fetch logs
  const { data: logsData, error: logsError } = await supabase
    .from("logs")
    .select("created_at")
    .gte("created_at", fourteenDaysAgo.toISOString())

  if (logsError) console.error("Error fetching logs:", logsError);

  // Fetch attacks
  const { data: attacksData, error: attacksError } = await supabase
    .from("attaques")
    .select("created_at")
    .gte("created_at", fourteenDaysAgo.toISOString())

  if (attacksError) console.error("Error fetching attacks:", attacksError);
  console.log("LogsT",logsData, attacksData)

  const processData = (data: { created_at: string }[] | null) => {
    if (!data) return { chartData: [], trendValue: 0 }

    const last7DaysTotal = data.filter(d => new Date(d.created_at) >= sevenDaysAgo).length
    const previous7DaysTotal = data.filter(d => new Date(d.created_at) < sevenDaysAgo && new Date(d.created_at) >= fourteenDaysAgo).length

    const trendValue = previous7DaysTotal === 0 
      ? (last7DaysTotal > 0 ? 100 : 0) 
      : ((last7DaysTotal - previous7DaysTotal) / previous7DaysTotal) * 100

    const chartData = []
    for (let i = 6; i >= 0; i--) {
      const date = subDays(now, i)
      const dateStr = format(date, "MMM dd")
      const count = data.filter(d => {
        const dDate = new Date(d.created_at)
        return dDate >= startOfDay(date) && dDate <= endOfDay(date)
      }).length
      chartData.push({ date: dateStr, count })
    }

    return { chartData, trendValue }
  }

  return {
    logs: processData(logsData),
    attacks: processData(attacksData),
    period: `${format(sevenDaysAgo, "MMMM dd")} - ${format(now, "MMMM dd, yyyy")}`
  }
}

export async function getServers() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("servers")
    .select("name, ip_adresse, status")

  if (error) {
    console.error("Error fetching servers:", error)
    return []
  }

  return data.map(server => ({
    name: server.name,
    ip: server.ip_adresse,
    status: server.status
  }))
}
