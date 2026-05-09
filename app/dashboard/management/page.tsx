import { Suspense } from "react"
import { getManagementServers, getManagementLogs, getManagementAttacks, getCurrentUserRole } from "@/actions/management.actions"
import ManagementTabs from "@/components/management/management-tabs"
import { Skeleton } from "@/components/ui/skeleton"

async function ManagementContent() {
  const [servers, logs, attacks, role] = await Promise.all([
    getManagementServers(),
    getManagementLogs(),
    getManagementAttacks(),
    getCurrentUserRole()
  ])

  return (
    <ManagementTabs 
      initialServers={servers} 
      initialLogs={logs} 
      initialAttacks={attacks} 
      role={role}
    />
  )
}

function ManagementSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-[400px]" />
      <Skeleton className="h-[600px] w-full rounded-xl" />
    </div>
  )
}

export default function ManagementPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Management</h2>
      </div>
      <Suspense fallback={<ManagementSkeleton />}>
        <ManagementContent />
      </Suspense>
    </div>
  )
}
