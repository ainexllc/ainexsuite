"use client";

import { AuthProvider } from "@/lib/auth/auth-context";
import { NotesProvider } from "@/components/providers/notes-provider";
import { LabelsProvider } from "@/components/providers/labels-provider";
import { RemindersProvider } from "@/components/providers/reminders-provider";
import { PreferencesProvider } from "@/components/providers/preferences-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LabelsProvider>
          <PreferencesProvider>
            <RemindersProvider>
              <NotesProvider>{children}</NotesProvider>
            </RemindersProvider>
          </PreferencesProvider>
        </LabelsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
