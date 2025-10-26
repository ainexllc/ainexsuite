"use client";

import { Container } from "@ainexsuite/ui/layout/container";
import { useAuth } from "@ainexsuite/auth";

export default function {{APP_NAME_CAPITALIZED}}Page() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Container variant="narrow">
        <div className="flex items-center justify-center py-20">
          <div className="text-ink-600">Loading...</div>
        </div>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container variant="narrow">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-ink-900">Welcome to {{APP_NAME_CAPITALIZED}}</h1>
            <p className="mt-2 text-ink-600">Please sign in to continue</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container variant="narrow">
      <div className="space-y-6 py-8">
        {/* Page Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-ink-900">{{APP_NAME_CAPITALIZED}}</h1>
            <p className="mt-1 text-sm text-ink-600">
              Welcome back, {user.displayName || user.email}
            </p>
          </div>
        </header>

        {/* Main Content */}
        <div className="surface-card p-6 rounded-xl">
          <p className="text-ink-700">
            This is your {{APP_NAME}} app. Start building your features here!
          </p>
        </div>
      </div>
    </Container>
  );
}
