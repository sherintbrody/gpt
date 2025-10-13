"use client";

import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editing?: any;
};

const instruments = ["XAUUSD", "NAS100", "US30", "CUSTOM"] as const;

function toLocalInput(dt?: string | Date): string {
  if (!dt) return "";
  const d = typeof dt === "string" ? new Date(dt) : dt;
  if (isNaN(d.getTime())) return "";
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}

export default function TradeFormSidebar({ open, onClose, onSaved, editing }: Props) {
  const [loading, setLoading] = useState(false);
  const [symbolChoice, setSymbolChoice] = useState<"XAUUSD" | "NAS100" | "US30" | "CUSTOM">("XAUUSD");
  const [customSymbol, setCustomSymbol] = useState("");
  const [form, setForm] = useState<any>({
    status: "closed",
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
      const isPreset = ["XAUUSD", "NAS100", "US30"].includes(editing.symbol);
      setSymbolChoice(isPreset ? editing.symbol : "CUSTOM");
      setCustomSymbol(isPreset ? "" : (editing.symbol || ""));

      setForm({
        status: editing.status ?? "closed",
        direction: editing.direction,
        entryPrice: editing.entryPrice ?? "",
        exitPrice: editing.exitPrice ?? "",
        stopLoss: editing.stopLoss ?? "",
        takeProfit: editing.takeProfit ?? "",
        quantity: editing.quantity ?? "",
        commission: editing.commission ?? "",
        netPnl: editing.netPnl ?? "",
        entryTime: toLocalInput(editing.entryTime),
        exitTime: toLocalInput(editing.exitTime),
        tags: (editing.tags || []).join(","),
        accountType: editing.accountType ?? "Demo",
        comments: editing.comments ?? "",
        tradeUrl: editing.tradeUrl ?? ""
      });
    } else {
      setSymbolChoice("XAUUSD");
      setCustomSymbol("");
      setForm({
        status: "closed",
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
    }
  }, [editing, open]);

  const symbol = symbolChoice === "CUSTOM" ? (customSymbol || "").trim().toUpperCase() : symbolChoice;
  const isOpen = form.status === "open";

  const num = (v: any) => (v === "" || v == null ? undefined : Number(v));

  const save = async () => {
    setLoading(true);
    const payload: any = {
      symbol,
      status: form.status,
      direction: form.direction,
      entryPrice: Number(form.entryPrice),
      stopLoss: num(form.stopLoss),
      takeProfit: num(form.takeProfit),
      quantity: Number(form.quantity),
      commission: num(form.commission) ?? 0,
      entryTime: new Date(form.entryTime).toISOString(),
      tags: form.tags ? form.tags.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
      accountType: form.accountType,
      comments: form.comments,
      tradeUrl: form.tradeUrl
    };
    if (!isOpen) {
      payload.exitPrice = Number(form.exitPrice);
      payload.netPnl = Number(form.netPnl);
      payload.exitTime = new Date(form.exitTime).toISOString();
    } else {
      delete payload.exitPrice;
      delete payload.netPnl;
      delete payload.exitTime;
    }

    const method = editing ? "PATCH" : "POST";
    const url = editing ? `/api/trades/${editing._id}` : "/api/trades";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setLoading(false);
    if (!res.ok) {
      const msg = await res.text();
      alert("Error: " + msg);
      return;
    }
    onSaved();
  };

  const inputCls = "input bg-white dark:bg-white text-ink";

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 transition-opacity ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-full sm:w-[520px] bg-white dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-800 shadow-xl transition-transform ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-4 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800">
          <div className="font-semibold">{editing ? "Edit Trade" : "New Trade"}</div>
          <button className="btn-outline" onClick={onClose}>Close</button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto h-[calc(100%-56px)]">
          <div>
            <div className="label">Instrument</div>
            <div className="flex gap-2">
              <select className={inputCls} value={symbolChoice} onChange={(e) => setSymbolChoice(e.target.value as any)}>
                {instruments.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
              {symbolChoice === "CUSTOM" && (
                <input className={inputCls} placeholder="Custom symbol" value={customSymbol} onChange={(e) => setCustomSymbol(e.target.value)} />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="label">Status</div>
              <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="closed">Closed</option>
                <option value="open">Open</option>
              </select>
            </div>
            <div>
              <div className="label">Direction</div>
              <select className={inputCls} value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value })}>
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="label">Entry Price</div>
              <input className={inputCls} type="number" step="any" value={form.entryPrice} onChange={(e) => setForm({ ...form, entryPrice: e.target.value })} />
            </div>
            <div>
              <div className="label">Exit Price {isOpen && "(disabled while Open)"}</div>
              <input className={inputCls} type="number" step="any" value={form.exitPrice} disabled={isOpen} onChange={(e) => setForm({ ...form, exitPrice: e.target.value })} />
            </div>
            <div>
              <div className="label">Stop Loss (optional)</div>
              <input className={inputCls} type="number" step="any" value={form.stopLoss} onChange={(e) => setForm({ ...form, stopLoss: e.target.value })} />
            </div>
            <div>
              <div className="label">Take Profit (optional)</div>
              <input className={inputCls} type="number" step="any" value={form.takeProfit} onChange={(e) => setForm({ ...form, takeProfit: e.target.value })} />
            </div>
            <div>
              <div className="label">Quantity (Lot size)</div>
              <input className={inputCls} type="number" step="any" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div>
              <div className="label">Commission</div>
              <input className={inputCls} type="number" step="any" value={form.commission} onChange={(e) => setForm({ ...form, commission: e.target.value })} />
            </div>
            <div>
              <div className="label">Net P&L {isOpen && "(disabled while Open)"}</div>
              <input className={inputCls} type="number" step="any" value={form.netPnl} disabled={isOpen} onChange={(e) => setForm({ ...form, netPnl: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="label">Entry Time</div>
              <input className={inputCls} type="datetime-local" value={form.entryTime} onChange={(e) => setForm({ ...form, entryTime: e.target.value })} />
            </div>
            <div>
              <div className="label">Exit Time {isOpen && "(disabled while Open)"}</div>
              <input className={inputCls} type="datetime-local" value={form.exitTime} disabled={isOpen} onChange={(e) => setForm({ ...form, exitTime: e.target.value })} />
            </div>
          </div>

          <div>
            <div className="label">Strategy / Labels (comma separated)</div>
            <input className={inputCls} placeholder="BRC, RTTM" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </div>

          <div>
            <div className="label">Account Type</div>
            <select className={inputCls} value={form.accountType} onChange={(e) => setForm({ ...form, accountType: e.target.value })}>
              <option>Live</option>
              <option>Demo</option>
              <option>Prop</option>
              <option>Challenge</option>
            </select>
          </div>

          <div>
            <div className="label">Trade URL (optional)</div>
            <input className={inputCls} value={form.tradeUrl} onChange={(e) => setForm({ ...form, tradeUrl: e.target.value })} />
          </div>

          <div>
            <div className="label">Comments</div>
            <textarea className={`${inputCls} h-24`} value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} />
          </div>

          <div className="flex gap-2 pt-2">
            <button className="btn" disabled={loading} onClick={save}>{loading ? "Saving..." : "Save"}</button>
            <button className="btn-outline" onClick={onClose}>Cancel</button>
          </div>

          {editing && <UploadArea tradeId={editing._id} />}
        </div>
      </div>
    </>
  );
}

function UploadArea({ tradeId }: { tradeId: string }) {
  const [files, setFiles] = useState<any[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [uploading, setUploading] = useState(false);

  const loadTrade = async () => {
    try {
      const res = await fetch(`/api/trades/${tradeId}`, { cache: "no-store" });
      const data = await res.json();
      setFiles(data.trade?.files || []);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => { loadTrade(); }, [tradeId, refresh]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    if (!list.length) return;
    setUploading(true);
    try {
      for (const f of list) {
        const fd = new FormData();
        fd.append("tradeId", tradeId);
        fd.append("file", f);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || "Upload failed");
        }
      }
      setRefresh(x => x + 1);
    } catch (err: any) {
      alert(err?.message || "Upload failed");
    } finally {
      setUploading(false);
      e.currentTarget.value = "";
    }
  };

  return (
    <div className="mt-2">
      <div className="label">Uploads (.png, .jpg, .mp4)</div>
      <input type="file" accept=".png,.jpg,.jpeg,.mp4" multiple onChange={onUpload} />
      {uploading && <div className="text-xs text-neutral-500 mt-1">Uploading…</div>}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {files.map((f: any) => {
          const id = f.fileId || f._id;
          const url = `/api/media/${id}`;
          const isImage = (f.mimeType || "").startsWith("image/");
          const isVideo = (f.mimeType || "").startsWith("video/");
          return (
            <div key={String(id)} className="rounded border border-neutral-200 p-1 text-xs dark:border-neutral-700">
              {isImage ? (
                <a href={url} target="_blank" rel="noreferrer">
                  <img src={url} alt={f.filename} className="h-24 w-full object-cover rounded" />
                </a>
              ) : isVideo ? (
                <video src={url} className="h-24 w-full rounded" controls />
              ) : (
                <a className="underline block truncate" href={url} target="_blank" rel="noreferrer">
                  {f.filename}
                </a>
              )}
              <div className="mt-1 truncate" title={f.filename}>{f.filename}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
