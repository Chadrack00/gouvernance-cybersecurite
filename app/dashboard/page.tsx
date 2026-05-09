import ServerUi, { typeServer } from "@/components/dashbaord/server-ui";
import type { Metadata } from "next";
import { Suspense } from "react";
import DashboardCharts from "@/components/dashbaord/dashboard-charts";
import { Skeleton } from "@/components/ui/skeleton";

import { getServers } from "@/actions/dashboard.actions";

export const metadata: Metadata = {
  title: "Accueil",
  description: "Plateforme de gouvernance Cybersécurité",
};

function ChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      <Skeleton className="h-[400px] w-full rounded-xl" />
      <Skeleton className="h-[400px] w-full rounded-xl" />
    </div>
  );
}

function ServersSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-[180px] w-full rounded-xl" />
      ))}
    </div>
  );
}

async function ServerList() {
  const SERVERS = await getServers();
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {SERVERS.map((server, index) => (
        <ServerUi
          key={index}
          name={server.name}
          ip={server.ip}
          status={server.status as typeServer}
        />
      ))}
    </div>
  );
}

export default function Page() {
  return (
    <div className="flex-1">
      {/* # Illustration SVG d’un serveur */}
      <Suspense fallback={<ServersSkeleton />}>
        <ServerList />
      </Suspense>

      <Suspense fallback={<ChartsSkeleton />}>
        <DashboardCharts />
      </Suspense>
    </div>
  );
}
