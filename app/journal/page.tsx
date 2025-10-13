import JournalClient from "./journal-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function JournalPage() {
  return <JournalClient />;
}
