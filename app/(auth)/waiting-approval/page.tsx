import { Suspense } from "react";
import WaitingApprovalContent from "./waiting-approval-content";

export default function WaitingApprovalPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="animate-pulse text-muted-foreground">Chargement…</p>
        </div>
      }
    >
      <WaitingApprovalContent />
    </Suspense>
  );
}