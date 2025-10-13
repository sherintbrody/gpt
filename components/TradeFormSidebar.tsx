"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editing?: any;
};

const instruments = ["XAUUSD", "NAS100", "US30", "CUSTOM"] as const;

export default function TradeFormSidebar({ open, onClose, onSaved, editing }: Props) {
  const [loading, setLoading] = useState(false);
  const [symbolChoice, setSymbolChoice] = useState<"XAUUSD" | "NAS100" | "US30" | "CUSTOM">("XAUUSD");
  const [customSymbol, setCustomSymbol] = useState("");
  const [form, setForm] = useState<any>({
    direction: "long",
    entryPrice: "",
    exitPrice: "",
    stopLoss: "",
    takeProfit: "",
    quantity: "",
    commission: "",
    netPnl: "",
    entryTime: "",
    exitTime: "",
    tags: "",
    accountType: "Demo",
    comments: "",
    tradeUrl: ""
  });

  useEffect(() => {
    if (editing) {
      setSymbolChoice(["XAUUSD", "NAS100", "US30"].includes(editing.symbol) ? editing.symbol : "CUSTOM");
      setCustomSymbol(["XAUUSD", "NAS100", "US30"].includes(editing.symbol) ? "" : editing.symbol);
      setForm({
        direction: editing.direction,
        entryPrice: editing.entryPrice,
        exitPrice: editing.exitPrice,
        stopLoss: editing.stopLoss ?? "",
        takeProfit: editing.takeProfit ?? "",
        quantity: editing.quantity,
        commission: editing.commission ?? "",
        netPnl: editing.netPnl,
        entryTime: editing.entryTime?.slice(0,16),
        exitTime: editing.exitTime?.slice(0,16),
        tags: (editing.tags || []).join(","),
        accountType: editing.accountType ?? "Demo",
        comments: editing.comments ?? "",
        tradeUrl: editing.tradeUrl ?? ""
      });
    } else {
      setSymbolChoice("XAUUSD");
      setCustomSymbol("");
      setForm((f: any) => ({
        ...f,
        direction: "long",
        entryPrice: "",
        exitPrice: "",
        stopLoss: "",
        takeProfit: "",
        quantity: "",
        commission: "",
        netPnl: "",
        entryTime: "",
        exitTime: "",
        tags: "",
        accountType: "Demo",
        comments: "",
        tradeUrl: ""
      }));
    }
  }, [editing, open]);

  const symbol = symbolChoice === "CUSTOM" ? (customSymbol || "").trim().toUpperCase() : symbolChoice;

  const save = async () => {
    setLoading(true);
    const payload = {
      symbol,
      direction: form.direction,
      entryPrice: Number(form.entryPrice),
      exitPrice: Number(form.exitPrice),
      stopLoss: form.stopLoss ? Number(form.stopLoss) : undefined,
      takeProfit: form.takeProfit ? Number(form.takeProfit) : undefined,
      quantity: Number(form.quantity),
      commission: form.commission ? Number(form.commission) : 0,
      netPnl: Number(form.netPnl),
      entryTime: new Date(form.entryTime).toISOString(),
      exitTime: new Date(form.exitTime).toISOString(),
      tags: form.tags ? form.tags.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
      accountType: form.accountType,
      comments: form.comments,
      tradeUrl: form.tradeUrl
    };
    const method = editing ? "PATCH" : "POST";
    const url = editing ? `/api/trades/${editing._id}` : "/api/trades";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setLoading(false);
    if (!res.ok) {
      const msg = await res.text();
      alert("Error: " + msg);
      return;
    }
    onSaved();
  };

  return (
    <>
      {/* Overlay */}
      <div className={`fixed inset-0 bg-black/30 transition-opacity ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} onClick={onClose} />
      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-800 shadow-xl transition-transform ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-4 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800">
          <div className="font-semibold">{editing ? "Edit Trade" : "New Trade"}</div>
          <button className="btn-outline" onClick={onClose}>Close</button>
        </div>
        <div className="p-4 space-y-3 overflow-y-auto h-[calc(100%-56px)]">
          <div>
            <div className="label">Instrument</div>
            <div className="flex gap-2">
              <select className="input" value={symbolChoice} onChange={(e) => setSymbolChoice(e.target.value as any)}>
                {instruments.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
              {symbolChoice === "CUSTOM" && (
                <input className="input" placeholder="Custom symbol" value={customSymbol} onChange={(e) => setCustomSymbol(e.target.value)} />
              )}
            </div>
          </div>
          <div>
            <div className="label">Direction</div>
            <select className="input" value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value })}>
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="label">Entry Price</div>
              <input className="input" type="number" value={form.entryPrice} onChange={(e) => setForm({ ...form, entryPrice: e.target.value })} />
            </div>
            <div>
              <div className="label">Exit Price</div>
              <input className="input" type="number" value={form.exitPrice} onChange={(e) => setForm({ ...form, exitPrice: e.target.value })} />
            </div>
            <div>
              <div className="label">Stop Loss (optional)</div>
              <input className="input" type="number" value={form.stopLoss} onChange={(e) => setForm({ ...form, stopLoss: e.target.value })} />
            </div>
            <div>
              <div className="label">Take Profit (optional)</div>
              <input className="input" type="number" value={form.takeProfit} onChange={(e) => setForm({ ...form, takeProfit: e.target.value })} />
            </div>
            <div>
              <div className="label">Quantity (Lot size)</div>
              <input className="input" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div>
              <div className="label">Commission</div>
              <input className="input" type="number" value={form.commission} onChange={(e) => setForm({ ...form, commission: e.target.value })} />
            </div>
            <div>
              <div className="label">Net P&L (manual)</div>
              <input className="input" type="number" value={form.netPnl} onChange={(e) => setForm({ ...form, netPnl: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="label">Entry Time</div>
              <input className="input" type="datetime-local" value={form.entryTime} onChange={(e) => setForm({ ...form, entryTime: e.target.value })} />
            </div>
            <div>
              <div className="label">Exit Time</div>
              <input className="input" type="datetime-local" value={form.exitTime} onChange={(e) => setForm({ ...form, exitTime: e.target.value })} />
            </div>
          </div>

          <div>
            <div className="label">Strategy / Labels (comma separated)</div>
            <input className="input" placeholder="BRC, RTTM" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </div>

          <div>
            <div className="label">Account Type</div>
            <select className="input" value={form.accountType} onChange={(e) => setForm({ ...form, accountType: e.target.value })}>
              <option>Live</option>
              <option>Demo</option>
              <option>Prop</option>
              <option>Challenge</option>
            </select>
          </div>

          <div>
            <div className="label">Trade URL (optional)</div>
            <input className="input" value={form.tradeUrl} onChange={(e) => setForm({ ...form, tradeUrl: e.target.value })} />
          </div>

          <div>
            <div className="label">Comments</div>
            <textarea className="input h-24" value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} />
          </div>

          <div className="flex gap-2 pt-2">
            <button className="btn" disabled={loading} onClick={save}>{loading ? "Saving..." : "Save"}</button>
            <button className="btn-outline" onClick={onClose}>Cancel</button>
          </div>

          {editing && (
            <UploadArea tradeId={editing._id} />
          )}
        </div>
      </div>
    </>
  );
}

function UploadArea({ tradeId }: { tradeId: string }) {
  const [files, setFiles] = useState<any[]>([]);
  const [refresh, setRefresh] = useState(0);

  const loadTrade = async () => {
    const res = await fetch(`/api/trades/${tradeId}`);
    const data = await res.json();
    setFiles(data.trade?.files || []);
  };
  useEffect(() => { loadTrade(); }, [tradeId, refresh]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const fd = new FormData();
    fd.append("tradeId", tradeId);
    fd.append("file", f);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) { alert("Upload failed"); return; }
    setRefresh(x => x + 1);
  };

  return (
    <div className="mt-2">
      <div className="label">Uploads (.png, .jpg, .mp4)</div>
      <input type="file" accept=".png,.jpg,.jpeg,.mp4" onChange={onUpload} />
      <div className="mt-2 grid grid-cols-3 gap-2">
        {files.map((f: any) => (
          <a key={f.fileId} href={`/api/media/${f.fileId}`} target="_blank" className="block text-xs underline">
            {f.filename}
          </a>
        ))}
      </div>
    </div>
  );
}
