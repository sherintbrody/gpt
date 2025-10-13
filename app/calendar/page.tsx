import { connectDB } from "@/lib/mongoose";
import { Trade } from "@/models/Trade";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import Link from "next/link";

export default async function CalendarPage({ searchParams }: { searchParams: { month?: string } }) {
  await connectDB();
  const month = searchParams.month ? new Date(searchParams.month + "-01") : new Date();
  const start = startOfMonth(month);
  const end = endOfMonth(month);

  const trades = await Trade.find({
    exitTime: { $gte: start, $lte: end },
    $or: [{ status: "closed" }, { status: { $exists: false } }]
  }).lean();

  const days = eachDayOfInterval({ start, end }).map(d => {
    const pnl = trades.filter(t => isSameDay(new Date(t.exitTime), d)).reduce((s, t) => s + (t.netPnl || 0), 0);
    return { day: d, pnl };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">P&L Calendar — {format(month, "MMMM yyyy")}</h1>
      </div>
      <div className="card grid grid-cols-7 gap-2">
        {days.map(({ day, pnl }) => {
          const dateStr = format(day, "yyyy-MM-dd");
          return (
            <Link
              href={`/journal?date=${dateStr}`}
              key={day.toISOString()}
              className={`rounded-md p-2 h-20 border text-sm ${pnl > 0 ? "bg-green-50 border-green-200" : pnl < 0 ? "bg-red-50 border-red-200" : "bg-neutral-50 border-neutral-200"} dark:bg-neutral-900 dark:border-neutral-800`}
            >
              <div className="font-semibold">{format(day, "d")}</div>
              <div className={`${pnl > 0 ? "text-green-600" : pnl < 0 ? "text-red-600" : "text-neutral-500"}`}>${pnl.toFixed(2)}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Journal</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
