export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { JournalEntry } from "@/models/JournalEntry";

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const q: any = {};
  if (from || to) {
    q.date = {};
    if (from) q.date.$gte = new Date(from);
    if (to) q.date.$lte = new Date(to);
  }
  const entries = await JournalEntry.find(q).sort({ date: -1 }).lean();
  return NextResponse.json({ entries });
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  if (!body.date) return new NextResponse("Missing date", { status: 400 });
  const entry = await JournalEntry.create({
    date: new Date(body.date),
    content: body.content || "",
    tags: Array.isArray(body.tags) ? body.tags : []
  });
  return NextResponse.json({ entry });
}
