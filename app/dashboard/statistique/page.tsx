import { getDetailedStats } from "@/actions/stats.actions";
import { 
  AttackSeverityStats, 
  AttackTypesStats, 
  RoleDistribution, 
  StatusOverview 
} from "@/components/statistique/stats-charts";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Statistiques - Gouvernance Cybersécurité",
  description: "Analyses détaillées des accès et des menaces",
};

function StatsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-[400px] rounded-xl" />
            <Skeleton className="h-[400px] rounded-xl" />
            <Skeleton className="h-[400px] rounded-xl" />
            <Skeleton className="h-[400px] rounded-xl" />
        </div>
    )
}

async function StatsContent() {
    const stats = await getDetailedStats();
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RoleDistribution data={stats.roles} />
            <StatusOverview data={stats.statuses} />
            <AttackSeverityStats data={stats.attackSeverity} />
            <AttackTypesStats data={stats.attackTypes} />
        </div>
    )
}

export default function StatistiquePage() {
  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Analyse et Statistiques</h1>
      </div>

      <Suspense fallback={<StatsSkeleton />}>
        <StatsContent />
      </Suspense>
    </div>
  );
}
