export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { Trade } from "@/models/Trade";

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const direction = searchParams.get("direction");
  const tag = searchParams.get("tag");
  const status = searchParams.get("status"); // optional filter

  const q: any = {};
  if (from || to) {
    q.exitTime = {};
    if (from) q.exitTime.$gte = new Date(from);
    if (to) q.exitTime.$lte = new Date(to + "T23:59:59");
  }
  if (direction) q.direction = direction;
  if (tag) q.tags = { $in: [tag] };
  if (status) q.status = status;

  const trades = await Trade.find(q).sort({ exitTime: -1, createdAt: -1 }).limit(1000).lean();
  return NextResponse.json({ trades });
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();

  const requiredAlways = ["symbol", "direction", "entryPrice", "quantity", "entryTime"];
  for (const k of requiredAlways) if (body[k] == null || body[k] === "") return new NextResponse(`Missing ${k}`, { status: 400 });

  const status = body.status ?? "closed";
  if (status === "closed") {
    const must = ["exitPrice", "exitTime", "netPnl"];
    for (const k of must) if (body[k] == null || body[k] === "") return new NextResponse(`Missing ${k} for closed trade`, { status: 400 });
  } else {
    // Safety: remove exit fields if provided empty
    if (!body.exitTime) delete body.exitTime;
    if (!body.exitPrice) delete body.exitPrice;
    if (!body.netPnl) delete body.netPnl;
  }

  const trade = await Trade.create({ ...body, status });
  return NextResponse.json({ trade });
}
