'use client';

import { FooterPageLayout as SharedFooterPageLayout, type FooterPageLayoutProps } from '@ainexsuite/ui';

export function FooterPageLayout({ children, maxWidth = 'medium' }: FooterPageLayoutProps) {
  return (
    <SharedFooterPageLayout maxWidth={maxWidth}>
      {children}
    </SharedFooterPageLayout>
  );
}
