import mongoose from "mongoose";

const uri = process.env.MONGODB_URI!;
const dbName = process.env.DB_NAME || "tradejournal";

declare global {
  // eslint-disable-next-line no-var
  var mongooseConn: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

if (!global.mongooseConn) {
  global.mongooseConn = { conn: null, promise: null };
}

export async function connectDB() {
  if (global.mongooseConn?.conn) return global.mongooseConn.conn;
  if (!global.mongooseConn?.promise) {
    mongoose.set("strictQuery", true);
    global.mongooseConn!.promise = mongoose.connect(uri, { dbName }).then((m) => m);
  }
  global.mongooseConn!.conn = await global.mongooseConn!.promise!;
  return global.mongooseConn!.conn;
}

export async function getGridFSBucket() {
  const conn = await connectDB();
  const db = conn.connection.db;
  const { GridFSBucket } = await import("mongodb");
  return new GridFSBucket(db, { bucketName: "trade_media" });
}
