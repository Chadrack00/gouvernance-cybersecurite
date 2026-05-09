import { getCurrentUserRole } from "@/actions/management.actions";
import { redirect } from "next/navigation";

import { AttackSimulator } from "@/components/dashboard/attack-simulator";
import { Metadata } from "next";
import TableComponent from "./table";
export const metadata: Metadata = {
  title: "Comptes",
  description: "Gérez les utilisateurs de l'application",
};

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default async function AccountsPage() {
  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestion des Comptes</h2>
        <Suspense fallback={<Skeleton className="h-10 w-44" />}>
          <AttackSimulator />
        </Suspense>
      </div>
      <Suspense fallback={<AccountsSkeleton />}>
        <AccountsContent />
      </Suspense>
    </div>
  );
}

async function AccountsContent() {
  const role = await getCurrentUserRole();

  if (role !== "ADMIN") {
    redirect("/dashboard");
  }

  return <TableComponent />;
}

function AccountsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-44" />
      </div>
      <div className="border rounded-lg p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
