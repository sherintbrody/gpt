"use client";
import { useEffect, useState } from "react";
import { subscribeToast } from "@/lib/toast";

export default function Toaster() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    return subscribeToast((t) => {
      setItems((prev) => [...prev, t]);
      setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== t.id)), 2500);
    });
  }, []);
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2">
      {items.map((i) => (
        <div key={i.id} className={`toast ${i.kind}`}>{i.text}</div>
      ))}
    </div>
  );
}
