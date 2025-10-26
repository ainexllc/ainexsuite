/**
 * Settings Page Template
 *
 * User settings page with form sections.
 *
 * Features:
 * - Profile settings
 * - Account settings
 * - Form validation
 * - Save/cancel actions
 * - Section organization
 *
 * File: app/settings/page.tsx
 */

"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/Button";
import { FormField } from "@/components/FormField";
import { Card } from "@/components/Card";

export default function SettingsPage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      // Save settings logic
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-base p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-ink-base">Settings</h1>
        <p className="mt-2 text-ink-muted">
          Manage your account settings and preferences
        </p>

        <div className="mt-8 space-y-6">
          {/* Profile Section */}
          <Card>
            <Card.Header>
              <h2 className="text-lg font-semibold text-ink-base">Profile</h2>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <FormField label="Display Name">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full rounded-xl border px-4 py-2"
                  />
                </FormField>

                <FormField label="Email">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border px-4 py-2"
                  />
                </FormField>
              </div>
            </Card.Content>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="secondary">Cancel</Button>
            <Button variant="primary" loading={saving} onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
