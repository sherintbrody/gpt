import { NextRequest } from "next/server";
import { getGridFSBucket } from "@/lib/mongoose";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const bucket = await getGridFSBucket();
  try {
    const oid = new ObjectId(params.id);
    const stream = bucket.openDownloadStream(oid);
    // @ts-ignore - Next.js Node response with a stream
    return new Response(stream as any);
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
