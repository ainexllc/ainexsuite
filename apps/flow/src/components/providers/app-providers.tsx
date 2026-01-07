"use client";

import type { ReactNode } from "react";
import { SpacesProvider } from "./spaces-provider";
import { LabelsProvider } from "./labels-provider";
import { WorkflowsProvider } from "./workflows-provider";

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * App-level providers for the Workflow app.
 * Wraps all context providers in the correct hierarchy.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SpacesProvider>
      <LabelsProvider>
        <WorkflowsProvider>{children}</WorkflowsProvider>
      </LabelsProvider>
    </SpacesProvider>
  );
}
