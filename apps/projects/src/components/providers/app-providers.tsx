"use client";

import { PreferencesProvider } from "@/components/providers/preferences-provider";
import { SpacesProvider } from "@/components/providers/spaces-provider";
import { LabelsProvider } from "@/components/providers/labels-provider";
import { ProjectsProvider } from "@/components/providers/projects-provider";
import { SelectionProvider } from "@/components/providers/selection-provider";

type AppProvidersProps = {
  children: React.ReactNode;
};

/**
 * App-specific providers for Projects app.
 *
 * Provider nesting order (outermost to innermost):
 * 1. PreferencesProvider - User preferences (view mode, columns, sort, filters)
 * 2. SpacesProvider - Space/workspace context
 * 3. LabelsProvider - Project labels management
 * 4. ProjectsProvider - Projects CRUD and state
 * 5. SelectionProvider - Multi-select functionality
 *
 * Note: AuthProvider is handled in layout.tsx as part of the standard nesting:
 * ThemeProvider > AuthProvider > AppColorProvider > AppProviders
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <PreferencesProvider>
      <SpacesProvider>
        <LabelsProvider>
          <ProjectsProvider>
            <SelectionProvider>{children}</SelectionProvider>
          </ProjectsProvider>
        </LabelsProvider>
      </SpacesProvider>
    </PreferencesProvider>
  );
}
