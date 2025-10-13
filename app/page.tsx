import { Suspense } from "react";
import DashboardContent from "./server-dashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense fallback={<div>Loading dashboard…</div>}>
      <DashboardContent />
    </Suspense>
  );
}
