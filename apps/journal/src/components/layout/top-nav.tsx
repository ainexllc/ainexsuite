"use client";

import { useState } from "react";
import { useAuth } from "@ainexsuite/auth";
import { useTheme } from "@ainexsuite/theme";
import {
  LogoWordmark,
  TopNav as SharedTopNav,
  TopNavProfileButton,
  TopNavAiButton,
  ProfileDropdown,
} from "@ainexsuite/ui";

type TopNavProps = {
  onMenuClick?: () => void;
  onOpenAiAssistant?: () => void;
};

export function TopNav({
  onMenuClick,
  onOpenAiAssistant,
}: TopNavProps) {
  const { user, loading: authLoading, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isProfileOpen, setProfileOpen] = useState(false);

  return (
    <SharedTopNav
      logo={<LogoWordmark iconSize={48} asLink />}
      onMenuClick={onMenuClick}
      theme={theme === "dark" ? "dark" : "light"}
      accentColor="147,51,234" // Purple accent for Journey
      actions={
        <>
          {onOpenAiAssistant && <TopNavAiButton onClick={onOpenAiAssistant} />}
          {user && !authLoading && (
            <div className="relative">
              <TopNavProfileButton
                user={user}
                onClick={() => setProfileOpen((prev) => !prev)}
                loading={authLoading}
              />
              <ProfileDropdown
                isOpen={isProfileOpen}
                onClose={() => setProfileOpen(false)}
                user={user}
                theme={{
                  current: theme as "light" | "dark" | "system",
                  setTheme: setTheme,
                }}
                onSignOut={() => signOut()}
              />
            </div>
          )}
        </>
      }
    />
  );
}
