import { Schema, model, models } from "mongoose";

export type Direction = "long" | "short";
export type AccountType = "Live" | "Demo" | "Prop" | "Challenge";
export type InstrumentChoice = "XAUUSD" | "NAS100" | "US30" | "CUSTOM";

const TradeSchema = new Schema(
  {
    symbol: { type: String, required: true },
    direction: { type: String, enum: ["long", "short"], required: true },
    status: { type: String, enum: ["open", "closed"], default: "closed" },

    entryPrice: { type: Number, required: true },
    exitPrice: { type: Number }, // required only when closed
    stopLoss: { type: Number },
    takeProfit: { type: Number },
    quantity: { type: Number, required: true },
    commission: { type: Number, default: 0 },

    netPnl: { type: Number }, // required only when closed

    entryTime: { type: Date, required: true },
    exitTime: { type: Date }, // required only when closed

    tags: [{ type: String }],
    accountType: { type: String, enum: ["Live", "Demo", "Prop", "Challenge"], default: "Demo" },
    comments: { type: String },
    tradeUrl: { type: String },

    // Derived
    durationSecs: { type: Number, default: 0 },
    riskAmount: { type: Number, default: 0 },
    R: { type: Number, default: 0 },

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

// Require exit fields only if closed
TradeSchema.pre("validate", function (next) {
  const t: any = this;
  if ((t.status ?? "closed") === "closed") {
    if (t.exitPrice == null) return next(new Error("exitPrice is required when status is closed"));
    if (t.exitTime == null) return next(new Error("exitTime is required when status is closed"));
    if (t.netPnl == null) return next(new Error("netPnl is required when status is closed"));
  }
  next();
});

TradeSchema.pre("save", function (next) {
  const t: any = this;
  // Duration: until exit if closed, otherwise so far
  const end = (t.status ?? "closed") === "closed" ? new Date(t.exitTime) : new Date();
  t.durationSecs = Math.max(0, Math.floor((end.getTime() - new Date(t.entryTime).getTime()) / 1000));

  // Compute risk and R only if stopLoss and trade is closed (we could also compute R on open using unrealized, but keeping 0)
  if (t.stopLoss != null && (t.status ?? "closed") === "closed") {
    const riskPerUnit = Math.abs(t.entryPrice - t.stopLoss);
    t.riskAmount = riskPerUnit * t.quantity;
    t.R = t.riskAmount > 0 && typeof t.netPnl === "number" ? t.netPnl / t.riskAmount : 0;
  } else {
    t.riskAmount = 0;
    t.R = 0;
  }
  next();
});

export const Trade = models.Trade || model("Trade", TradeSchema);
