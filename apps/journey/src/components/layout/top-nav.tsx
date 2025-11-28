"use client";

import { useState } from "react";
import { useAuth } from "@ainexsuite/auth";
import { LogoWordmark } from "@/components/branding/logo-wordmark";
import {
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
  const [isProfileOpen, setProfileOpen] = useState(false);

  return (
    <SharedTopNav
      logo={<LogoWordmark href="/" iconSize={48} />}
      onMenuClick={onMenuClick}
      theme="light" // Journey uses light theme
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
                onSignOut={() => signOut()}
              />
            </div>
          )}
        </>
      }
    />
  );
}
