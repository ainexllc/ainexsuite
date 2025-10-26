'use client';

import type { ComponentProps } from 'react';
import { Footer as SharedFooter } from '@ainexsuite/ui';

type SharedFooterProps = ComponentProps<typeof SharedFooter>;

export function Footer(props: SharedFooterProps) {
  return <SharedFooter appName="AINex Fit" {...props} />;
}
