"use client";

import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editing?: any; // journal entry
};

export default function JournalFormSidebar({ open, onClose, onSaved, editing }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<any>({ date: "", content: "", tags: "" });

  useEffect(() => {
    if (editing) {
      setForm({
        date: (editing.date ? toLocalDate(editing.date) : ""),
        content: editing.content || "",
        tags: (editing.tags || []).join(",")
      });
    } else {
      setForm({ date: "", content: "", tags: "" });
    }
  }, [editing, open]);

  const save = async () => {
    setLoading(true);
    const payload = {
      date: new Date(form.date).toISOString(),
      content: form.content,
      tags: form.tags ? form.tags.split(",").map((s: string) => s.trim()).filter(Boolean) : []
    };
    const method = editing ? "PATCH" : "POST";
    const url = editing ? `/api/journal/${editing._id}` : "/api/journal";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setLoading(false);
    if (!res.ok) return alert(await res.text());
    onSaved();
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black/30 transition-opacity ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} onClick={onClose} />
      <div className={`fixed right-0 top-0 h-full w-full sm:w-[520px] bg-white dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-800 shadow-xl transition-transform ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-4 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800">
          <div className="font-semibold">{editing ? "Edit Journal Entry" : "New Journal Entry"}</div>
          <button className="btn-outline" onClick={onClose}>Close</button>
        </div>
        <div className="p-4 space-y-3 overflow-y-auto h-[calc(100%-56px)]">
          <div>
            <div className="label">Date</div>
            <input className="input bg-white dark:bg-white text-ink" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <div className="label">Tags (comma separated)</div>
            <input className="input bg-white dark:bg-white text-ink" placeholder="Mindset, Market, Pre-Plan" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </div>
          <div>
            <div className="label">Notes</div>
            <textarea className="input bg-white dark:bg-white text-ink h-40" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </div>

          {editing && <UploadArea journalId={editing._id} />}

          <div className="flex gap-2 pt-2">
            <button className="btn" disabled={loading} onClick={save}>{loading ? "Saving..." : "Save"}</button>
            <button className="btn-outline" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </>
  );
}

function UploadArea({ journalId }: { journalId: string }) {
  const [files, setFiles] = useState<any[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/journal/${journalId}`, { cache: "no-store" });
      const data = await res.json();
      setFiles(data.entry?.files || []);
    })();
  }, [journalId, refresh]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    if (!list.length) return;
    setUploading(true);
    try {
      for (const f of list) {
        const fd = new FormData();
        fd.append("journalId", journalId);
        fd.append("file", f);
        const res = await fetch("/api/journal/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error(await res.text());
      }
      setRefresh((x) => x + 1);
    } catch (e: any) {
      alert(e?.message || "Upload failed");
    } finally {
      setUploading(false);
      e.currentTarget.value = "";
    }
  };

  return (
    <div>
      <div className="label">Attachments (.png, .jpg, .mp4)</div>
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

function toLocalDate(dt?: string | Date) {
  if (!dt) return "";
  const d = typeof dt === "string" ? new Date(dt) : dt;
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 10);
}
