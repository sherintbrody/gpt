import { NextRequest, NextResponse } from "next/server";
import { connectDB, getGridFSBucket } from "@/lib/mongoose";
import { Trade } from "@/models/Trade";
import { ObjectId } from "mongodb";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const trade = await Trade.findById(params.id).lean();
  if (!trade) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json({ trade });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const body = await req.json();
  const trade = await Trade.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
  if (!trade) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json({ trade });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const t = await Trade.findById(params.id);
  if (!t) return new NextResponse("Not found", { status: 404 });
  // delete media from GridFS
  const bucket = await getGridFSBucket();
  for (const f of (t.files || [])) {
    try { await bucket.delete(new ObjectId(f.fileId)); } catch {}
  }
  await t.deleteOne();
  return NextResponse.json({ ok: true });
}
