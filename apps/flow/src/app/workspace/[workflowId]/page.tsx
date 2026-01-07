'use client';

import { use } from 'react';
import { WorkflowEditor } from '@/components/workflows/workflow-editor';

interface PageProps {
  params: Promise<{ workflowId: string }>;
}

export default function WorkflowEditorPage({ params }: PageProps) {
  const { workflowId } = use(params);

  return <WorkflowEditor workflowId={workflowId} />;
}
