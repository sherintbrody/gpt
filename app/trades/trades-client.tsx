"use client";
import { useEffect, useMemo, useState } from "react";
import TradeFormSidebar from "@/components/TradeFormSidebar";
import { format } from "date-fns";

type Trade = {
  _id: string;
  symbol: string;
  direction: "long" | "short";
  entryPrice: number;
  exitPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  quantity: number;
  commission?: number;
  netPnl: number;
  entryTime: string;
  exitTime: string;
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
  const [filters, setFilters] = useState<{ from?: string; to?: string; direction?: string; tag?: string }>({});

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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <div className="label">From</div>
          <input type="date" className="input" onChange={(e) => setFilters(s => ({ ...s, from: e.target.value }))} />
        </div>
        <div>
          <div className="label">To</div>
          <input type="date" className="input" onChange={(e) => setFilters(s => ({ ...s, to: e.target.value }))} />
        </div>
        <div>
          <div className="label">Direction</div>
          <select className="input" onChange={(e) => setFilters(s => ({ ...s, direction: e.target.value || undefined }))}>
            <option value="">All</option>
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
        </div>
        <div>
          <div className="label">Tag</div>
          <input className="input" placeholder="BRC / RTTM" onChange={(e) => setFilters(s => ({ ...s, tag: e.target.value || undefined }))} />
        </div>
        <button className="btn ml-auto" onClick={onCreate}>New Trade</button>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <div>Loading…</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-neutral-500">
              <tr>
                <th className="p-2">Exit</th>
                <th className="p-2">Symbol</th>
                <th className="p-2">Dir</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Entry</th>
                <th className="p-2">Exit</th>
                <th className="p-2">Net P&L</th>
                <th className="p-2">R</th>
                <th className="p-2">Tags</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {trades.map(t => (
                <tr key={t._id} className="border-t border-neutral-100 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900">
                  <td className="p-2">{format(new Date(t.exitTime), "yyyy-MM-dd HH:mm")}</td>
                  <td className="p-2">{t.symbol}</td>
                  <td className="p-2">{t.direction}</td>
                  <td className="p-2">{t.quantity}</td>
                  <td className="p-2">{t.entryPrice}</td>
                  <td className="p-2">{t.exitPrice}</td>
                  <td className={`p-2 ${t.netPnl >= 0 ? "text-green-600" : "text-red-600"}`}>{t.netPnl.toFixed(2)}</td>
                  <td className="p-2">{(t.R ?? 0).toFixed(2)}</td>
                  <td className="p-2">
                    {(t.tags || []).map(tag => <span key={tag} className="badge mr-1">{tag}</span>)}
                  </td>
                  <td className="p-2 text-right">
                    <button className="btn-outline" onClick={() => onEdit(t)}>Edit</button>
                  </td>
                </tr>
              ))}
              {trades.length === 0 && (
                <tr><td className="p-4 text-center text-neutral-500" colSpan={10}>No trades yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <TradeFormSidebar open={open} onClose={() => setOpen(false)} onSaved={onSaved} editing={editing || undefined} />
    </div>
  );
}
