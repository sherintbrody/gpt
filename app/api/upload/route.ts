export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { connectDB, getGridFSBucket } from "@/lib/mongoose";
import { Trade } from "@/models/Trade";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  await connectDB();
  const form = await req.formData();
  const tradeId = form.get("tradeId") as string;
  const file = form.get("file") as File | null;

  if (!tradeId || !file) return new NextResponse("tradeId and file required", { status: 400 });

  const trade = await Trade.findById(tradeId);
  if (!trade) return new NextResponse("Trade not found", { status: 404 });

  const mime = (file.type || "").toLowerCase();
  if (!["image/png", "image/jpg", "image/jpeg", "video/mp4"].includes(mime)) {
    return new NextResponse("Invalid file type", { status: 400 });
  }

  const bucket = await getGridFSBucket();
  const filename = `trade_${tradeId}/${file.name}`;
  const uploadStream = bucket.openUploadStream(filename, {
    metadata: { tradeId, mimeType: mime }
  });

  const buf = Buffer.from(await file.arrayBuffer());

  await new Promise<void>((resolve, reject) => {
    uploadStream.once("finish", resolve);
    uploadStream.once("error", reject);
    uploadStream.end(buf);
  });

  const fileId = uploadStream.id as ObjectId;
  trade.files.push({
    fileId,
    filename: file.name,
    mimeType: mime,
    sizeBytes: buf.byteLength
  });
  await trade.save();

  return NextResponse.json({ ok: true, fileId });
}
