'use client';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-zinc-400">System administration and management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-xl font-semibold mb-2">User Management</h3>
            <p className="text-sm text-zinc-400">Manage users and permissions</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-xl font-semibold mb-2">Activity Logs</h3>
            <p className="text-sm text-zinc-400">Monitor system activity</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-xl font-semibold mb-2">Settings</h3>
            <p className="text-sm text-zinc-400">Configure system settings</p>
          </div>
        </div>
      </div>
    </div>
  );
}
