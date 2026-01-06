"use client";

import { SpacesProvider } from "@/components/providers/spaces-provider";
import { HintsProvider } from "@/components/hints";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <HintsProvider>
      <SpacesProvider>
        {children}
      </SpacesProvider>
    </HintsProvider>
  );
}