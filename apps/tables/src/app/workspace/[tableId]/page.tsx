'use client';

import { use } from 'react';
import { FullPageTableEditor } from '@/components/tables/full-page-table-editor';

interface PageProps {
  params: Promise<{ tableId: string }>;
}

export default function TableEditorPage({ params }: PageProps) {
  const { tableId } = use(params);

  return <FullPageTableEditor tableId={tableId} />;
}
