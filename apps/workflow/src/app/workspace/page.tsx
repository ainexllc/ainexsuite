'use client';

import { useWorkspaceAuth } from '@ainexsuite/auth';
import { WorkspacePageLayout } from '@ainexsuite/ui';
import { WorkflowCanvas } from '@/components/workflow-canvas/WorkflowCanvas';
import { SpaceSwitcher } from '@/components/spaces';

export default function WorkspacePage() {
  const { user } = useWorkspaceAuth();

  if (!user) return null;

  return (
    <WorkspacePageLayout
      maxWidth="full"
      composerActions={<SpaceSwitcher />}
    >
      {/* Workflow Canvas */}
      <div className="h-[calc(100vh-200px)] min-h-[600px] rounded-xl border border-outline-subtle bg-surface-elevated/50 backdrop-blur overflow-hidden relative shadow-inner">
        <WorkflowCanvas />
      </div>
    </WorkspacePageLayout>
  );
}
