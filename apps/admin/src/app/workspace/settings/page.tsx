'use client';

import { Settings, Bell, Shield, Database, Globe } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-muted-foreground" />
          Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure system-wide settings and preferences.
        </p>
      </div>

      {/* Settings Sections */}
      <div className="grid gap-6">
        {/* Notifications */}
        <section className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Notifications</h2>
              <p className="text-xs text-muted-foreground">Configure alert preferences</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">Email Notifications</p>
                <p className="text-xs text-muted-foreground mt-0.5">Receive updates via email</p>
              </div>
              <button className="w-12 h-6 bg-emerald-500 rounded-full relative">
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">New User Alerts</p>
                <p className="text-xs text-muted-foreground mt-0.5">Get notified when new users register</p>
              </div>
              <button className="w-12 h-6 bg-surface-elevated rounded-full relative">
                <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Security</h2>
              <p className="text-xs text-muted-foreground">Manage security settings</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground mt-0.5">Require 2FA for admin access</p>
              </div>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/15 text-sm font-medium text-white rounded-lg transition-colors">
                Configure
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">Session Timeout</p>
                <p className="text-xs text-muted-foreground mt-0.5">Auto-logout after inactivity</p>
              </div>
              <select className="bg-surface-elevated border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>4 hours</option>
                <option>Never</option>
              </select>
            </div>
          </div>
        </section>

        {/* Database */}
        <section className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Database</h2>
              <p className="text-xs text-muted-foreground">Firestore configuration</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Project ID</span>
                <span className="text-sm font-mono text-white">ainexsuite</span>
              </div>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Region</span>
                <span className="text-sm font-mono text-white">us-central1</span>
              </div>
            </div>
          </div>
        </section>

        {/* Deployment */}
        <section className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Deployment</h2>
              <p className="text-xs text-muted-foreground">Vercel deployment settings</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Domain</span>
                <span className="text-sm font-mono text-white">admin.ainexsuite.com</span>
              </div>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Auto Deploy</span>
                <span className="text-sm text-emerald-400">Enabled</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
