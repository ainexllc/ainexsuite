"use client";

import { AuthProvider } from "@ainexsuite/auth";
import { NotesProvider } from "@/components/providers/notes-provider";
import { LabelsProvider } from "@/components/providers/labels-provider";
import { RemindersProvider } from "@/components/providers/reminders-provider";
import { PreferencesProvider } from "@/components/providers/preferences-provider";
import { SpacesProvider } from "@/components/providers/spaces-provider";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <SpacesProvider>
        <LabelsProvider>
          <PreferencesProvider>
            <RemindersProvider>
              <NotesProvider>{children}</NotesProvider>
            </RemindersProvider>
          </PreferencesProvider>
        </LabelsProvider>
      </SpacesProvider>
    </AuthProvider>
  );
}
