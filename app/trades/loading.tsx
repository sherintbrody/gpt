export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-10 w-40 rounded" />)}
      </div>
      <div className="card skeleton h-64" />
    </div>
  );
}
