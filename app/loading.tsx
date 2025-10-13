export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => <div key={i} className="card skeleton h-20" />)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="card skeleton h-96" />
        <div className="card skeleton h-80" />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="card skeleton h-72" />
        <div className="card skeleton h-72" />
      </div>
      <div className="card skeleton h-72" />
    </div>
  );
}
