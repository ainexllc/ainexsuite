"use client";

import { useState } from "react";
import { Settings, Activity, RefreshCw, Trash2 } from "lucide-react";
import { useAuth } from "@ainexsuite/auth";
import { useTheme } from "@ainexsuite/theme";
import { LogoWordmark } from "@/components/branding/logo-wordmark";
import {
  TopNav as SharedTopNav,
  TopNavProfileButton,
  TopNavAiButton,
  TopNavFullscreenButton,
  ProfileDropdown,
} from "@ainexsuite/ui";

type TopNavProps = {
  onMenuClick?: () => void;
  onRefresh?: () => void;
  onOpenSettings?: () => void;
  onOpenActivity?: () => void;
  onOpenAiAssistant?: () => void;
  onOpenTrash?: () => void;
};

export function TopNav({
  onMenuClick,
  onRefresh,
  onOpenSettings,
  onOpenActivity,
  onOpenAiAssistant,
  onOpenTrash,
}: TopNavProps) {
  const { user, loading: authLoading, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isProfileOpen, setProfileOpen] = useState(false);

  const menuItems = [
    onOpenSettings && {
      icon: <Settings className="h-4 w-4" />,
      label: "Settings",
      onClick: onOpenSettings,
    },
    onOpenActivity && {
      icon: <Activity className="h-4 w-4" />,
      label: "Activity",
      onClick: onOpenActivity,
    },
    onRefresh && {
      icon: <RefreshCw className="h-4 w-4" />,
      label: "Refresh",
      onClick: onRefresh,
    },
  ].filter(Boolean) as Array<{ icon: React.ReactNode; label: string; onClick: () => void }>;

  return (
    <SharedTopNav
      logo={<LogoWordmark href="/" iconSize={48} />}
      onMenuClick={onMenuClick}
      theme={theme as "light" | "dark" | undefined}
      accentColor="234,179,8" // Yellow accent for Notes (#eab308)
      actions={
        <>
          <TopNavFullscreenButton />
          {onOpenTrash && (
            <button
              type="button"
              onClick={onOpenTrash}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-white/10"
              aria-label="Open trash"
            >
              <Trash2 className="h-[18px] w-[18px]" />
            </button>
          )}
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
                menuItems={menuItems}
                onSignOut={() => signOut()}
              />
            </div>
          )}
        </>
      }
    />
  );
}
