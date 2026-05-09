import { getDashboardStats } from "@/actions/dashboard.actions";
import { ChartAreaDefault } from "./server-chart";

export default async function DashboardCharts() {
  const stats = await getDashboardStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      <ChartAreaDefault
        title="Historique des logs"
        description="Evolution des logs sur les 7 derniers jours"
        chartData={stats.logs.chartData}
        trendValue={stats.logs.trendValue}
        footerLabel={stats.period}
      />

      <ChartAreaDefault
        title="Historique des attaques"
        description="Evolution des attaques sur les 7 derniers jours"
        chartData={stats.attacks.chartData}
        trendValue={stats.attacks.trendValue}
        footerLabel={stats.period}
      />
    </div>
  );
}
