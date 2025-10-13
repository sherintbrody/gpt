export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { connectDB, getGridFSBucket } from "@/lib/mongoose";
import { JournalEntry } from "@/models/JournalEntry";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  await connectDB();
  const form = await req.formData();
  const journalId = form.get("journalId") as string;
  const file = form.get("file") as File | null;

  if (!journalId || !file) return new NextResponse("journalId and file required", { status: 400 });

  const entry = await JournalEntry.findById(journalId);
  if (!entry) return new NextResponse("Journal not found", { status: 404 });

  const mime = (file.type || "").toLowerCase();
  if (!["image/png", "image/jpg", "image/jpeg", "video/mp4"].includes(mime)) {
    return new NextResponse("Invalid file type", { status: 400 });
  }

  const bucket = await getGridFSBucket();
  const filename = `journal_${journalId}/${file.name}`;
  const uploadStream = bucket.openUploadStream(filename, { metadata: { journalId, mimeType: mime } });
  const buf = Buffer.from(await file.arrayBuffer());

  await new Promise<void>((resolve, reject) => {
    uploadStream.once("finish", resolve);
    uploadStream.once("error", reject);
    uploadStream.end(buf);
  });

  const fileId = uploadStream.id as ObjectId;
  entry.files.push({
    fileId,
    filename: file.name,
    mimeType: mime,
    sizeBytes: buf.byteLength
  });
  await entry.save();

  return NextResponse.json({ ok: true, fileId });
}
