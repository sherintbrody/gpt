import { Schema, model, models } from "mongoose";

const JournalSchema = new Schema(
  {
    date: { type: Date, required: true }, // store date (any time is ok; UI uses date-only)
    content: { type: String, default: "" },
    tags: [{ type: String }],
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

export const JournalEntry = models.JournalEntry || model("JournalEntry", JournalSchema);
