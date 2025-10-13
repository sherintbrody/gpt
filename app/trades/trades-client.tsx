"use client";
import { useEffect, useState } from "react";
import TradeFormSidebar from "@/components/TradeFormSidebar";
import { format } from "date-fns";

type Trade = {
  _id: string;
  symbol: string;
  direction: "long" | "short";
  status?: "open" | "closed";
  entryPrice: number;
  exitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  quantity: number;
  commission?: number;
  netPnl?: number;
  entryTime: string;
  exitTime?: string;
  tags?: string[];
  accountType?: string;
  comments?: string;
  tradeUrl?: string;
  R?: number;
};

export default function TradesClient() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Trade | null>(null);
  const [filters, setFilters] = useState<{ from?: string; to?: string; direction?: string; tag?: string; status?: string }>({});

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams(filters as any).toString();
    const res = await fetch(`/api/trades?${params}`, { cache: "no-store" });
    const data = await res.json();
    setTrades(data.trades || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [JSON.stringify(filters)]);

  const onCreate = () => { setEditing(null); setOpen(true); };
  const onEdit = (t: Trade) => { setEditing(t); setOpen(true); };
  const onSaved = () => { setOpen(false); load(); };

  const onCloseTrade = (t: Trade) => {
    // Open editor with status set to closed; user will fill exit fields
    setEditing({ ...t, status: "closed" });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <div className="label">From</div>
          <input type="date" className="input bg-white dark:bg-white text-ink" onChange={(e) => setFilters(s => ({ ...s, from: e.target.value }))} />
        </div>
        <div>
          <div className="label">To</div>
          <input type="date" className="input bg-white dark:bg-white text-ink" onChange={(e) => setFilters(s => ({ ...s, to: e.target.value }))} />
        </div>
        <div>
          <div className="label">Direction</div>
          <select className="input bg-white dark:bg-white text-ink" onChange={(e) => setFilters(s => ({ ...s, direction: e.target.value || undefined }))}>
            <option value="">All</option>
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
        </div>
        <div>
          <div className="label">Status</div>
          <select className="input bg-white dark:bg-white text-ink" onChange={(e) => setFilters(s => ({ ...s, status: e.target.value || undefined }))}>
            <option value="">All</option>
            <option value="closed">Closed</option>
            <option value="open">Open</option>
          </select>
        </div>
        <div>
          <div className="label">Tag</div>
          <input className="input bg-white dark:bg-white text-ink" placeholder="BRC / RTTM" onChange={(e) => setFilters(s => ({ ...s, tag: e.target.value || undefined }))} />
        </div>
        <button className="btn ml-auto" onClick={onCreate}>New Trade</button>
      </div>

      <div className="card bg-white dark:bg-white border-neutral-200">
        {loading ? (
          <div>Loading…</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-neutral-500">
              <tr>
                <th className="p-2">Exit/Status</th>
                <th className="p-2">Symbol</th>
                <th className="p-2">Dir</th>
                <th className="p-2">Status</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Entry</th>
                <th className="p-2">Exit</th>
                <th className="p-2">Net P&L</th>
                <th className="p-2">R</th>
                <th className="p-2">Tags</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody className="[&_tr]:bg-white">
              {trades.map(t => {
                const isOpen = (t.status ?? "closed") === "open";
                return (
                  <tr key={t._id} className="border-t border-neutral-100 hover:bg-neutral-50">
                    <td className="p-2">
                      {isOpen ? <span className="badge">Open</span> : format(new Date(t.exitTime as string), "yyyy-MM-dd HH:mm")}
                    </td>
                    <td className="p-2">{t.symbol}</td>
                    <td className="p-2">{t.direction}</td>
                    <td className="p-2">{t.status ?? "closed"}</td>
                    <td className="p-2">{t.quantity}</td>
                    <td className="p-2">{t.entryPrice}</td>
                    <td className="p-2">{t.exitPrice ?? "-"}</td>
                    <td className={`p-2 ${!isOpen && (t.netPnl ?? 0) >= 0 ? "text-green-600" : !isOpen ? "text-red-600" : "text-neutral-400"}`}>
                      {!isOpen ? Number(t.netPnl ?? 0).toFixed(2) : "—"}
                    </td>
                    <td className="p-2">{!isOpen ? Number(t.R ?? 0).toFixed(2) : "—"}</td>
                    <td className="p-2">
                      {(t.tags || []).map(tag => <span key={tag} className="badge mr-1">{tag}</span>)}
                    </td>
                    <td className="p-2 text-right space-x-2">
                      <button className="btn-outline" onClick={() => onEdit(t)}>Edit</button>
                      {isOpen && <button className="btn-outline" onClick={() => onCloseTrade(t)}>Close</button>}
                    </td>
                  </tr>
                );
              })}
              {trades.length === 0 && (
                <tr><td className="p-4 text-center text-neutral-500" colSpan={11}>No trades yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <TradeFormSidebar open={open} onClose={() => setOpen(false)} onSaved={onSaved} editing={editing || undefined} />
    </div>
  );
}
