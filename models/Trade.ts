import { Schema, model, models, Types } from "mongoose";

export type Direction = "long" | "short";
export type AccountType = "Live" | "Demo" | "Prop" | "Challenge";
export type InstrumentChoice = "XAUUSD" | "NAS100" | "US30" | "CUSTOM";

const TradeSchema = new Schema(
  {
    symbol: { type: String, required: true },            // e.g., XAUUSD | NAS100 | US30 | Custom string
    direction: { type: String, enum: ["long", "short"], required: true },
    entryPrice: { type: Number, required: true },
    exitPrice: { type: Number, required: true },
    stopLoss: { type: Number },
    takeProfit: { type: Number },
    quantity: { type: Number, required: true },
    commission: { type: Number, default: 0 },            // manual
    netPnl: { type: Number, required: true },            // manual net P&L
    entryTime: { type: Date, required: true },
    exitTime: { type: Date, required: true },
    tags: [{ type: String }],                            // e.g., BRC, RTTM
    accountType: { type: String, enum: ["Live", "Demo", "Prop", "Challenge"], default: "Demo" },
    comments: { type: String },
    tradeUrl: { type: String },

    // Derived fields (server-calculated)
    durationSecs: { type: Number, default: 0 },
    riskAmount: { type: Number, default: 0 },            // computed if stopLoss provided
    R: { type: Number, default: 0 },

    // Media (GridFS files)
    files: [
      {
        fileId: { type: Schema.Types.ObjectId },
        filename: String,
        mimeType: String,
        sizeBytes: Number,
        uploadedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

TradeSchema.pre("save", function (next) {
  const t: any = this;
  const dir = t.direction === "long" ? 1 : -1;
  t.durationSecs = Math.max(0, Math.floor((new Date(t.exitTime).getTime() - new Date(t.entryTime).getTime()) / 1000));
  if (t.stopLoss != null) {
    const riskPerUnit = Math.abs(t.entryPrice - t.stopLoss);
    t.riskAmount = riskPerUnit * t.quantity;
    t.R = t.riskAmount > 0 ? t.netPnl / t.riskAmount : 0;
  } else {
    t.riskAmount = 0;
    t.R = 0;
  }
  next();
});

export const Trade = models.Trade || model("Trade", TradeSchema);
