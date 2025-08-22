export default function Overview() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Overview</h1>
      <p className="text-gray-600">Welcome to Mezgeb. Use the sidebar to manage Clients and Leads.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="p-4 border rounded bg-white">
          <div className="font-medium">Clients</div>
          <div className="text-sm text-gray-600">Create, edit, and track client information and statuses.</div>
        </div>
        <div className="p-4 border rounded bg-white">
          <div className="font-medium">Leads</div>
          <div className="text-sm text-gray-600">Capture and qualify potential clients.</div>
        </div>
      </div>
    </div>
  );
}
