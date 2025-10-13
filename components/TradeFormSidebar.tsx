"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { invalidate } from "@/lib/cache";

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
  const router = useRouter();
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

  const symbol = symbolChoice === "CUSTOM" 
