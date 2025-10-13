import { Suspense } from "react";
import DashboardContent from "./server-dashboard";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading dashboard…</div>}>
      {/* Server component does DB aggregation */}
      <DashboardContent />
    </Suspense>
  );
}
