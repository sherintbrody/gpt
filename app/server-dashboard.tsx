import { connectDB } from "@/lib/mongoose";
import { Trade } from "@/models/Trade";
import { startOfDay, endOfDay, formatISO, format } from "date-fns";
import EquityCurve from "@/components/charts/EquityCurve";
import CumulativeR from "@/components/charts/CumulativeR";
import StrategyBar from "@/components/charts/StrategyBar";

export default async function DashboardContent() {
  await connectDB();
  const trades = await Trade.find({}).sort({ exitTime: 1 }).lean();

  const total = trades.length;
  const wins = trades.filter(t => t.netPnl > 0).length;
  const winRate = total ? Math.round((wins / total) * 100) : 0;
  const totalCommission = trades.reduce((s, t) => s + (t.commission || 0), 0);
  const Rvals = trades.map(t => t.R).filter((r) => Number.isFinite(r) && r !== 0);
  const avgR = Rvals.length ? (Rvals.reduce((s, r) => s + r, 0) / Rvals.length) : 0;

  // Equity series (cumulative netPnl by day)
  const byDay = new Map<string, number>();
  trades.forEach(t => {
    const day = format(new Date(t.exitTime), "yyyy-MM-dd");
    byDay.set(day, (byDay.get(day) || 0) + (t.netPnl || 0));
  });
  const equitySeries: { day: string; equity: number }[] = [];
  let eq = 0;
  [...byDay.entries()].sort(([a],[b]) => a.localeCompare(b)).forEach(([day, pnl]) => {
    eq += pnl;
    equitySeries.push({ day, equity: Number(eq.toFixed(2)) });
  });

  // Cumulative R
  let cr = 0;
  const cumRSeries = trades
    .sort((a, b) => new Date(a.exitTime).getTime() - new Date(b.exitTime).getTime())
    .map(t => ({ day: format(new Date(t.exitTime), "yyyy-MM-dd"), cumR: (cr += (t.R || 0)) }));

  // Strategy performance
  const strat = new Map<string, { count: number; avgR: number }>();
  trades.forEach(t => {
    (t.tags || ["Untagged"]).forEach((tag: string) => {
      const s = strat.get(tag) || { count: 0, avgR: 0 };
      const newCount = s.count + 1;
      const newAvg = s.avgR + (t.R || 0);
      strat.set(tag, { count: newCount, avgR: newAvg });
    });
  });
  const strategyData = [...strat.entries()].map(([name, v]) => ({
    name,
    avgR: v.count ? Number((v.avgR / v.count).toFixed(2)) : 0
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="label">Win Rate</div>
          <div className="kpi">{winRate}%</div>
        </div>
        <div className="card">
          <div className="label">Avg R</div>
          <div className="kpi">{avgR.toFixed(2)}</div>
        </div>
        <div className="card">
          <div className="label">Total Commission</div>
          <div className="kpi">${totalCommission.toFixed(2)}</div>
        </div>
        <div className="card">
          <div className="label">Trades</div>
          <div className="kpi">{total}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <div className="mb-2 font-semibold">Equity Curve</div>
          <EquityCurve data={equitySeries} />
        </div>
        <div className="card">
          <div className="mb-2 font-semibold">Cumulative R</div>
          <CumulativeR data={cumRSeries} />
        </div>
      </div>

      <div className="card">
        <div className="mb-2 font-semibold">Performance by Strategy</div>
        <StrategyBar data={strategyData} />
      </div>
    </div>
  );
}
