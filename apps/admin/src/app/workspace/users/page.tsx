'use client';

import { UsersTable } from '@/components/users-table';
import { Users, Download } from 'lucide-react';

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-500/20">
            <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              User Management
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              View, search, and manage user permissions
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-all duration-200">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      <UsersTable />
    </div>
  );
}
