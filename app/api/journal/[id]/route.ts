export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { connectDB, getGridFSBucket } from "@/lib/mongoose";
import { JournalEntry } from "@/models/JournalEntry";
import { ObjectId } from "mongodb";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const entry = await JournalEntry.findById(params.id).lean();
  if (!entry) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json({ entry });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const body = await req.json();
  const update: any = {};
  if (body.date) update.date = new Date(body.date);
  if (body.content !== undefined) update.content = body.content;
  if (body.tags) update.tags = Array.isArray(body.tags) ? body.tags : [];
  const entry = await JournalEntry.findByIdAndUpdate(params.id, update, { new: true });
  if (!entry) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json({ entry });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const e = await JournalEntry.findById(params.id);
  if (!e) return new NextResponse("Not found", { status: 404 });
  const bucket = await getGridFSBucket();
  for (const f of (e.files || [])) {
    try { await bucket.delete(new ObjectId(f.fileId)); } catch {}
  }
  await e.deleteOne();
  return NextResponse.json({ ok: true });
}
