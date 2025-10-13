"use client";

import { useEffect, useMemo, useState } from "react";
import JournalFormSidebar from "@/components/JournalFormSidebar";
import { format } from "date-fns";

type Entry = {
  _id: string;
  date: string;
  content: string;
  tags?: string[];
  files?: any[];
};

export default function JournalClient() {
  const url = new URL(globalThis.location?.href || "http://x");
  const initialDate = url.searchParams.get("date") || "";

  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [filterMonth, setFilterMonth] = useState(initialDate ? initialDate.slice(0, 7) : format(new Date(), "yyyy-MM"));

  const load = async () => {
    setLoading(true);
    const from = `${filterMonth}-01`;
    const to = `${filterMonth}-31`;
    const res = await fetch(`/api/journal?from=${from}&to=${to}`, { cache: "no-store" });
    const data = await res.json();
    setEntries(data.entries || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [filterMonth]);

  // P&L context for selected day
  const [dailyContext, setDailyContext] = useState<{ pnl: number; wins: number; losses: number } | null>(null);
  useEffect(() => {
    const day = editing ? format(new Date(editing.date), "yyyy-MM-dd") : initialDate || "";
    if (!day) { setDailyContext(null); return; }
    (async () => {
      const res = await fetch(`/api/trades?from=${day}&to=${day}`, { cache: "no-store" });
      const data = await res.json();
      const trades = data.trades || [];
      const pnl = trades.reduce((s: number, t: any) => s + (t.netPnl || 0), 0);
      const wins = trades.filter((t: any) => (t.netPnl || 0) > 0).length;
      const losses = trades.filter((t: any) => (t.netPnl || 0) < 0).length;
      setDailyContext({ pnl, wins, losses });
    })();
  }, [editing?._id, initialDate]);

  const onCreate = () => { setEditing(null); setOpen(true); };
  const onEdit = (e: Entry) => { setEditing(e); setOpen(true); };
  const onSaved = () => { setOpen(false); load(); };

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        <div>
          <div className="label">Month</div>
          <input className="input bg-white dark:bg-white text-ink" type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} />
        </div>
        <button className="btn ml-auto" onClick={onCreate}>New Entry</button>
      </div>

      {editing && dailyContext && (
        <div className="card">
          <div className="text-sm text-neutral-500">Daily Context for {format(new Date(editing.date), "yyyy-MM-dd")}</div>
          <div className="mt-1 text-sm">
            P&L: <span className={dailyContext.pnl >= 0 ? "text-green-600" : "text-red-600"}>${dailyContext.pnl.toFixed(2)}</span> ·
            Wins: {dailyContext.wins} · Losses: {dailyContext.losses}
          </div>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div>Loading…</div>
        ) : entries.length === 0 ? (
          <div className="text-neutral-500">No journal entries for this month.</div>
        ) : (
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {entries.map((e) => (
              <li key={e._id} className="py-3 flex items-start gap-3">
                <div className="w-24 shrink-0">
                  <div className="text-sm font-medium">{format(new Date(e.date), "MMM d")}</div>
                  <div className="text-xs text-neutral-500">{format(new Date(e.date), "yyyy")}</div>
                </div>
                <div className="flex-1">
                  <div className="text-sm whitespace-pre-wrap">{(e.content || "").slice(0, 240)}{(e.content || "").length > 240 ? "…" : ""}</div>
                  <div className="mt-2">
                    {(e.tags || []).map((t) => <span key={t} className="badge mr-1">{t}</span>)}
                  </div>
                </div>
                <div className="shrink-0">
                  <button className="btn-outline" onClick={() => onEdit(e)}>Open</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <JournalFormSidebar open={open} onClose={() => setOpen(false)} onSaved={onSaved} editing={editing || undefined} />
    </div>
  );
}
