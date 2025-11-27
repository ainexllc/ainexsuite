'use client';

import { AdminWorkspaceLayout } from '@/components/admin-workspace-layout';

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminWorkspaceLayout>{children}</AdminWorkspaceLayout>;
}
