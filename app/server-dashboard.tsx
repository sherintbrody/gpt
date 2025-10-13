import { connectDB } from "@/lib/mongoose";
import { Trade } from "@/models/Trade";
import { format } from "date-fns";
import EquityCurve from "@/components/charts/EquityCurve";
import CumulativeR from "@/components/charts/CumulativeR";
import StrategyBar from "@/components/charts/StrategyBar";
import WinRateByInstrument from "@/components/charts/WinRateByInstrument";
import WinRatePie from "@/components/charts/WinRatePie";
import { unstable_noStore as noStore } from "next/cache";

export default async function DashboardContent() {
  noStore();
  await connectDB();

  // Only closed trades affect P&L/Win rate
  const trades = await Trade.find({
    $or: [{ status: "closed" }, { status: { $exists: false } }]
  })
    .sort({ exitTime: 1 })
    .lean();

  const total = trades.length;
  const winners = trades.filter((t: any) => (t.netPnl ?? 0) > 0);
  const losers = trades.filter((t: any) => (t.netPnl ?? 0) < 0);
  const wins = winners.length;
  const losses = losers.length;
  const winRate = total ? Math.round((wins / total) * 100) : 0;

  const totalCommission = trades.reduce((s: number, t: any) => s + (t.commission || 0), 0);
  const Rvals = trades.map((t: any) => t.R).filter((r: any) => Number.isFinite(r) && r !== 0);
  const avgR = Rvals.length ? Rvals.reduce((s: number, r: number) => s + r, 0) / Rvals.length : 0;

  const avgWin = winners.length ? winners.reduce((s: number, t: any) => s + (t.netPnl || 0), 0) / winners.length : 0;
  const avgLoss = losers.length ? Math.abs(losers.reduce((s: number, t: any) => s + (t.netPnl || 0), 0) / losers.length) : 0;
  const sumWins = winners.reduce((s: number, t: any) => s + (t.netPnl || 0), 0);
  const sumLossesAbs = Math.abs(losers.reduce((s: number, t: any) => s + (t.netPnl || 0), 0));
  const profitFactor = sumLossesAbs > 0 ? sumWins / sumLossesAbs : (sumWins > 0 ? Infinity : 0);

  // Daily P&L and equity
  const byDay = new Map<string, number>();
  trades.forEach((t: any) => {
    const day = format(new Date(t.exitTime), "yyyy-MM-dd");
    byDay.set(day, (byDay.get(day) || 0) + (t.netPnl || 0));
  });
  const equityData: { day: string; equity: number; dailyPnl: number }[] = [];
  let eq = 0;
  [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).forEach(([day, pnl]) => {
    eq += pnl;
    equityData.push({ day, equity: Number(eq.toFixed(2)), dailyPnl: Number(pnl.toFixed(2)) });
  });

  // Cumulative R
  let cr = 0;
  const cumRSeries = trades
    .map((t: any) => ({ day: format(new Date(t.exitTime), "yyyy-MM-dd"), r: t.R || 0 }))
    .sort((a, b) => a.day.localeCompare(b.day))
    .map((d) => ({ day: d.day, cumR: (cr += d.r) }));

  // Strategy performance
  const strat = new Map<string, { sumR: number; count: number }>();
  trades.forEach((t: any) => {
    const tags = t.tags?.length ? t.tags : ["Untagged"];
    tags.forEach((tag: string) => {
      const s = strat.get(tag) || { sumR: 0, count: 0 };
      s.sumR += t.R || 0;
      s.count += 1;
      strat.set(tag, s);
    });
  });
  const strategyData = [...strat.entries()].map(([name, v]) => ({
    name,
    avgR: v.count ? Number((v.sumR / v.count).toFixed(2)) : 0
  }));

  // Win rate by instrument
  const byInstr = new Map<string, { wins: number; total: number }>();
  trades.forEach((t: any) => {
    const key = t.symbol || "Unknown";
    const curr = byInstr.get(key) || { wins: 0, total: 0 };
    curr.total += 1;
    if ((t.netPnl ?? 0) > 0) curr.wins += 1;
    byInstr.set(key, curr);
  });
  const winRateInstrumentData = [...byInstr.entries()].map(([instrument, v]) => ({
    instrument,
    winRate: v.total ? Math.round((v.wins / v.total) * 100) : 0
  }));

  // Win rate pie
  const winRatePie = [
    { name: "Wins", value: wins },
    { name: "Losses", value: losses }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="card">
          <div className="label">Win Rate</div>
          <div className="kpi">{winRate}%</div>
        </div>
        <div className="card">
          <div className="label">Avg R</div>
          <div className="kpi">{avgR.toFixed(2)}</div>
        </div>
        <div className="card">
          <div className="label">Avg Win</div>
          <div className="kpi">${avgWin.toFixed(2)}</div>
        </div>
        <div className="card">
          <div className="label">Avg Loss</div>
          <div className="kpi">-${avgLoss.toFixed(2)}</div>
        </div>
        <div className="card">
          <div className="label">Profit Factor</div>
          <div className="kpi">{profitFactor === Infinity ? "∞" : profitFactor.toFixed(2)}</div>
        </div>
        <div className="card">
          <div className="label">Total Commission</div>
          <div className="kpi">${totalCommission.toFixed(2)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="card">
          <div className="mb-2 font-semibold">Equity Curve</div>
          <EquityCurve data={equityData} />
        </div>
        <div className="card">
          <div className="mb-2 font-semibold">Cumulative R</div>
          <CumulativeR data={cumRSeries} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="card">
          <div className="mb-2 font-semibold">Win Rate</div>
          <WinRatePie data={winRatePie} />
        </div>
        <div className="card">
          <div className="mb-2 font-semibold">Win Rate by Instrument</div>
          <WinRateByInstrument data={winRateInstrumentData} />
        </div>
      </div>

      <div className="card">
        <div className="mb-2 font-semibold">Performance by Strategy</div>
        <StrategyBar data={strategyData} />
      </div>
    </div>
  );
}
