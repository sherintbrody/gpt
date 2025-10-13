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

  const q: any = {};
  if (from || to) {
    q.exitTime = {};
    if (from) q.exitTime.$gte = new Date(from);
    if (to) q.exitTime.$lte = new Date(to + "T23:59:59");
  }
  if (direction) q.direction = direction;
  if (tag) q.tags = { $in: [tag] };

  const trades = await Trade.find(q).sort({ exitTime: -1 }).limit(1000).lean();
  return NextResponse.json({ trades });
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  // basic validation
  const required = ["symbol","direction","entryPrice","exitPrice","quantity","netPnl","entryTime","exitTime"];
  for (const k of required) if (body[k] === undefined || body[k] === "") return new NextResponse(`Missing ${k}`, { status: 400 });

  const trade = await Trade.create(body);
  return NextResponse.json({ trade });
}
