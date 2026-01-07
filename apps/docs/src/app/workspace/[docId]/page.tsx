'use client';

import { use } from 'react';
import { FullPageDocEditor } from '@/components/docs/full-page-doc-editor';

interface PageProps {
  params: Promise<{ docId: string }>;
}

export default function DocEditorPage({ params }: PageProps) {
  const { docId } = use(params);

  return <FullPageDocEditor docId={docId} />;
}
