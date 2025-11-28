"use client";

import { useState } from "react";
import { Settings, Activity, RefreshCw } from "lucide-react";
import { useAuth } from "@ainexsuite/auth";
import { useTheme } from "@ainexsuite/theme";
import { LogoWordmark } from "@/components/branding/logo-wordmark";
import {
  TopNav as SharedTopNav,
  TopNavProfileButton,
  TopNavAiButton,
  ProfileDropdown,
} from "@ainexsuite/ui";

type TopNavProps = {
  onMenuClick?: () => void;
  onRefresh?: () => void;
  onOpenSettings?: () => void;
  onOpenActivity?: () => void;
  onOpenAiAssistant?: () => void;
};

export function TopNav({
  onMenuClick,
  onRefresh,
  onOpenSettings,
  onOpenActivity,
  onOpenAiAssistant,
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
      accentColor="59,130,246" // Blue accent for Notes
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
                  current: theme as "light" | "dark",
                  toggle: () => setTheme(theme === "dark" ? "light" : "dark"),
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
