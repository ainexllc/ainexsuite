"use client";

import * as React from "react";
import { clsx } from "clsx";
import { X, User, Palette, Bell, Globe, Settings2, Eye, EyeOff, Users, Loader2, Trash2 } from "lucide-react";
import { createPortal } from "react-dom";
import { useTheme } from "next-themes";
import type { UserPreferences, FontFamily, SpaceType } from "@ainexsuite/types";

export type SettingsTab = "profile" | "appearance" | "notifications" | "spaces" | "app";

export interface SettingsUser {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
  emailVerified?: boolean;
}

/** Space item for settings management */
export interface SpaceSettingsItem {
  id: string;
  name: string;
  type: SpaceType;
  isGlobal?: boolean;
  hiddenInApps?: string[];
  memberCount?: number;
  isOwner?: boolean;
}

/** Global space item that user can join */
export interface GlobalSpaceItem {
  id: string;
  name: string;
  type: SpaceType;
  memberCount: number;
  description?: string;
  ownerName?: string;
}

export interface SettingsModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Current user */
  user: SettingsUser | null;
  /** Current preferences */
  preferences: UserPreferences;
  /** Update preferences handler */
  onUpdatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  /** Update profile handler */
  onUpdateProfile?: (updates: { displayName?: string; photoURL?: string }) => Promise<void>;
  /** User's spaces for management */
  spaces?: SpaceSettingsItem[];
  /** Callback when user wants to create a new space */
  onCreateSpace?: () => void;
  /** Callback when user wants to edit a space */
  onEditSpace?: (spaceId: string) => void;
  /** Callback when user updates space visibility */
  onUpdateSpaceVisibility?: (spaceId: string, hiddenInApps: string[]) => Promise<void>;
  /** Callback when user deletes a space */
  onDeleteSpace?: (spaceId: string) => Promise<void>;
  /** Available global spaces that user can join */
  globalSpaces?: GlobalSpaceItem[];
  /** Callback when user wants to join a global space */
  onJoinSpace?: (spaceId: string) => Promise<void>;
  /** Loading state for global spaces */
  globalSpacesLoading?: boolean;
  /** Whether to show the Global tab in spaces settings (default: true) */
  showGlobalSpacesTab?: boolean;
  /** Current app ID for highlighting in spaces tab */
  currentAppId?: string;
  /** App-specific settings content */
  appSettings?: React.ReactNode;
  /** App-specific settings tab label */
  appSettingsLabel?: string;
  /** App-specific settings icon */
  appSettingsIcon?: React.ReactNode;
  /** Default tab to show */
  defaultTab?: SettingsTab;
}

const tabs: Array<{ id: SettingsTab; label: string; icon: React.ReactNode }> = [
  { id: "profile", label: "Profile", icon: <User className="h-4 w-4" /> },
  { id: "appearance", label: "Appearance", icon: <Palette className="h-4 w-4" /> },
  { id: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
  { id: "spaces", label: "Spaces", icon: <Globe className="h-4 w-4" /> },
];

export function SettingsModal({
  isOpen,
  onClose,
  user,
  preferences,
  onUpdatePreferences,
  onUpdateProfile,
  spaces,
  onCreateSpace,
  onEditSpace,
  onUpdateSpaceVisibility,
  onDeleteSpace,
  globalSpaces,
  onJoinSpace,
  globalSpacesLoading,
  showGlobalSpacesTab = true,
  currentAppId,
  appSettings,
  appSettingsLabel,
  appSettingsIcon,
  defaultTab = "profile",
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = React.useState<SettingsTab>(defaultTab);

  // Reset tab when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  // Handle escape key
  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const allTabs = appSettings
    ? [
        ...tabs,
        {
          id: "app" as SettingsTab,
          label: appSettingsLabel || "App Settings",
          icon: appSettingsIcon || <Palette className="h-4 w-4" />,
        },
      ]
    : tabs;

  const content = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/40 dark:bg-background/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative z-[101] w-full max-w-[95vw] md:max-w-4xl lg:max-w-5xl xl:max-w-6xl h-[min(800px,90vh)] rounded-3xl bg-popover/95 backdrop-blur-2xl border border-border shadow-2xl animate-in zoom-in-95 fade-in duration-300 flex overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        {/* Sidebar */}
        <div className="w-52 lg:w-56 shrink-0 border-r border-border bg-muted/30 p-3 flex flex-col">
          <h2 id="settings-title" className="px-3 py-2 text-sm font-semibold text-foreground">
            Settings
          </h2>
          <nav className="flex-1 space-y-1">
            {allTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                  activeTab === tab.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">
              {allTabs.find((t) => t.id === activeTab)?.label}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close settings"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "profile" && (
              <ProfileSettings
                user={user}
                onUpdateProfile={onUpdateProfile}
              />
            )}
            {activeTab === "appearance" && (
              <AppearanceSettings
                preferences={preferences}
                onUpdatePreferences={onUpdatePreferences}
              />
            )}
            {activeTab === "notifications" && (
              <NotificationSettings
                preferences={preferences}
                onUpdatePreferences={onUpdatePreferences}
              />
            )}
            {activeTab === "spaces" && (
              <SpacesSettings
                spaces={spaces || []}
                currentAppId={currentAppId}
                onCreateSpace={onCreateSpace}
                onEditSpace={onEditSpace}
                onUpdateSpaceVisibility={onUpdateSpaceVisibility}
                onDeleteSpace={onDeleteSpace}
                user={user}
                globalSpaces={globalSpaces}
                onJoinSpace={onJoinSpace}
                globalSpacesLoading={globalSpacesLoading}
                showGlobalTab={showGlobalSpacesTab}
              />
            )}
            {activeTab === "app" && appSettings}
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}

// ============================================================================
// Profile Settings Tab
// ============================================================================

interface ProfileSettingsProps {
  user: SettingsUser | null;
  onUpdateProfile?: (updates: { displayName?: string; photoURL?: string }) => Promise<void>;
}

function ProfileSettings({ user, onUpdateProfile }: ProfileSettingsProps) {
  const [displayName, setDisplayName] = React.useState(user?.displayName || "");
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const handleSave = async () => {
    if (!onUpdateProfile) return;
    setSaving(true);
    try {
      await onUpdateProfile({ displayName });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = displayName !== (user?.displayName || "");

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        {user?.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.photoURL}
            alt={user.displayName || "User"}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground grid place-items-center font-semibold text-xl">
            {(user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U").toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-foreground">Profile Photo</p>
          <p className="text-xs text-muted-foreground">Managed by your Google account</p>
        </div>
      </div>

      {/* Display Name */}
      <div className="space-y-2">
        <label htmlFor="displayName" className="text-sm font-medium text-foreground">
          Display Name
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Enter your name"
        />
      </div>

      {/* Email (read-only) */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Email</label>
        <div className="flex items-center gap-2">
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="flex-1 rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-muted-foreground"
          />
          {user?.emailVerified && (
            <span className="text-xs text-emerald-500 font-medium px-2 py-1 bg-emerald-500/10 rounded-lg">
              Verified
            </span>
          )}
        </div>
      </div>

      {/* Save Button */}
      {onUpdateProfile && (
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={clsx(
              "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
              hasChanges && !saving
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Appearance Settings Tab
// ============================================================================

interface AppearanceSettingsProps {
  preferences: UserPreferences;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
}

const FONT_OPTIONS: Array<{ id: FontFamily; label: string; fontClass: string }> = [
  { id: "plus-jakarta-sans", label: "Plus Jakarta Sans", fontClass: "font-[var(--font-plus-jakarta-sans)]" },
  { id: "inter", label: "Inter", fontClass: "font-[var(--font-inter)]" },
  { id: "geist", label: "Geist", fontClass: "font-[var(--font-geist)]" },
  { id: "dm-sans", label: "DM Sans", fontClass: "font-[var(--font-dm-sans)]" },
  { id: "system", label: "System (SF Pro)", fontClass: "font-[var(--font-system)]" },
];

function AppearanceSettings({ preferences, onUpdatePreferences }: AppearanceSettingsProps) {
  const [saving, setSaving] = React.useState(false);
  const { setTheme } = useTheme();

  // Local state for immediate visual feedback
  const [selectedTheme, setSelectedTheme] = React.useState<"light" | "dark" | "system">(
    preferences.theme || "dark"
  );

  const handleThemeChange = async (theme: "light" | "dark" | "system") => {
    // Update local state immediately for visual feedback
    setSelectedTheme(theme);
    setSaving(true);
    try {
      // Apply theme immediately to next-themes
      setTheme(theme);
      // Persist to Firestore
      await onUpdatePreferences({ theme });
    } finally {
      setSaving(false);
    }
  };

  const handleFontFamilyChange = async (fontFamily: FontFamily) => {
    setSaving(true);
    try {
      await onUpdatePreferences({ fontFamily });
      // Apply font immediately to DOM
      document.documentElement.setAttribute("data-font", fontFamily);
    } finally {
      setSaving(false);
    }
  };

  const handleFontSizeChange = async (fontSize: "sm" | "md" | "lg") => {
    setSaving(true);
    try {
      await onUpdatePreferences({ fontSize });
    } finally {
      setSaving(false);
    }
  };

  const handleDensityChange = async (density: "compact" | "comfortable" | "spacious") => {
    setSaving(true);
    try {
      await onUpdatePreferences({ density });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Theme */}
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-foreground">Theme</h4>
          <p className="text-xs text-muted-foreground">Choose your preferred color scheme</p>
        </div>
        <div className="flex gap-2">
          {(["light", "dark", "system"] as const).map((theme) => (
            <button
              key={theme}
              type="button"
              onClick={() => handleThemeChange(theme)}
              disabled={saving}
              className={clsx(
                "flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                selectedTheme === theme
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={clsx(
                  "w-12 h-8 rounded-lg border",
                  theme === "light" && "bg-white border-zinc-200",
                  theme === "dark" && "bg-zinc-900 border-zinc-700",
                  theme === "system" && "bg-gradient-to-r from-white to-zinc-900 border-zinc-400"
                )}
              />
              <span className="text-xs font-medium capitalize">{theme}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Font Family */}
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-foreground">Font</h4>
          <p className="text-xs text-muted-foreground">Choose your preferred typeface</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {FONT_OPTIONS.map((font) => (
            <button
              key={font.id}
              type="button"
              onClick={() => handleFontFamilyChange(font.id)}
              disabled={saving}
              className={clsx(
                "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all",
                (preferences.fontFamily || "plus-jakarta-sans") === font.id
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <span
                className="text-lg font-medium"
                style={{ fontFamily: `var(--font-${font.id === "plus-jakarta-sans" ? "plus-jakarta-sans" : font.id})` }}
              >
                Aa
              </span>
              <span className="text-[10px] font-medium truncate w-full text-center">{font.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-foreground">Font Size</h4>
          <p className="text-xs text-muted-foreground">Adjust the text size across the app</p>
        </div>
        <div className="flex gap-2 p-1 bg-muted rounded-xl">
          {(["sm", "md", "lg"] as const).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => handleFontSizeChange(size)}
              disabled={saving}
              className={clsx(
                "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                (preferences.fontSize || "md") === size
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {size === "sm" && "Small"}
              {size === "md" && "Medium"}
              {size === "lg" && "Large"}
            </button>
          ))}
        </div>
      </div>

      {/* Density */}
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-foreground">Density</h4>
          <p className="text-xs text-muted-foreground">Control spacing and padding</p>
        </div>
        <div className="flex gap-2 p-1 bg-muted rounded-xl">
          {(["compact", "comfortable", "spacious"] as const).map((density) => (
            <button
              key={density}
              type="button"
              onClick={() => handleDensityChange(density)}
              disabled={saving}
              className={clsx(
                "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                (preferences.density || "comfortable") === density
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="capitalize">{density}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Notification Settings Tab
// ============================================================================

interface NotificationSettingsProps {
  preferences: UserPreferences;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
}

function NotificationSettings({ preferences, onUpdatePreferences }: NotificationSettingsProps) {
  const [saving, setSaving] = React.useState(false);

  const handleToggle = async (key: keyof UserPreferences["notifications"], value: boolean) => {
    setSaving(true);
    try {
      await onUpdatePreferences({
        notifications: {
          ...preferences.notifications,
          [key]: value,
        },
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDigestChange = async (digest: "none" | "daily" | "weekly") => {
    setSaving(true);
    try {
      await onUpdatePreferences({
        notifications: {
          ...preferences.notifications,
          digest,
        },
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification Channels */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-foreground">Notification Channels</h4>
          <p className="text-xs text-muted-foreground">Choose how you want to be notified</p>
        </div>

        <div className="space-y-3">
          <ToggleRow
            label="Email Notifications"
            description="Receive updates via email"
            checked={preferences.notifications.email}
            onChange={(checked) => handleToggle("email", checked)}
            disabled={saving}
          />
          <ToggleRow
            label="Push Notifications"
            description="Browser push notifications"
            checked={preferences.notifications.push}
            onChange={(checked) => handleToggle("push", checked)}
            disabled={saving}
          />
          <ToggleRow
            label="In-App Notifications"
            description="Show notifications within the app"
            checked={preferences.notifications.inApp}
            onChange={(checked) => handleToggle("inApp", checked)}
            disabled={saving}
          />
        </div>
      </div>

      {/* Digest Frequency */}
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-foreground">Email Digest</h4>
          <p className="text-xs text-muted-foreground">Summary of your activity</p>
        </div>
        <div className="flex gap-2 p-1 bg-muted rounded-xl">
          {(["none", "daily", "weekly"] as const).map((freq) => (
            <button
              key={freq}
              type="button"
              onClick={() => handleDigestChange(freq)}
              disabled={saving}
              className={clsx(
                "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                (preferences.notifications.digest || "none") === freq
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="capitalize">{freq === "none" ? "Off" : freq}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-foreground">Quiet Hours</h4>
          <p className="text-xs text-muted-foreground">Pause notifications during these times</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 space-y-1">
            <label className="text-xs text-muted-foreground">Start</label>
            <input
              type="time"
              value={preferences.notifications.quietHoursStart || "22:00"}
              onChange={async (e) => {
                await onUpdatePreferences({
                  notifications: {
                    ...preferences.notifications,
                    quietHoursStart: e.target.value,
                  },
                });
              }}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs text-muted-foreground">End</label>
            <input
              type="time"
              value={preferences.notifications.quietHoursEnd || "07:00"}
              onChange={async (e) => {
                await onUpdatePreferences({
                  notifications: {
                    ...preferences.notifications,
                    quietHoursEnd: e.target.value,
                  },
                });
              }}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Toggle Row Component
// ============================================================================

interface ToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function ToggleRow({ label, description, checked, onChange, disabled }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={clsx(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
          checked ? "bg-primary" : "bg-muted",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span
          className={clsx(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}

// ============================================================================
// Spaces Settings Tab
// ============================================================================

/** Available apps for visibility configuration (excludes main and admin) */
const AVAILABLE_APPS = [
  { id: "notes", label: "Notes", icon: "📝" },
  { id: "journal", label: "Journal", icon: "📔" },
  { id: "todo", label: "Todo", icon: "✓" },
  { id: "health", label: "Health", icon: "❤️" },
  { id: "album", label: "Album", icon: "📷" },
  { id: "habits", label: "Habits", icon: "🌱" },
  { id: "display", label: "Display", icon: "📺" },
  { id: "projects", label: "Projects", icon: "📊" },
  { id: "workflow", label: "Workflow", icon: "⚡" },
  { id: "calendar", label: "Calendar", icon: "📅" },
  { id: "track", label: "Track", icon: "💰" },
] as const;

const SPACE_TYPE_LABELS: Record<SpaceType, string> = {
  personal: "Personal",
  family: "Family",
  work: "Work",
  couple: "Couple",
  buddy: "Buddy",
  squad: "Squad",
  project: "Project",
};

/** Default template spaces that users can join to create their own instance */
const TEMPLATE_GLOBAL_SPACES: Array<{
  id: string;
  name: string;
  type: SpaceType;
  description: string;
}> = [
  { id: "template-family", name: "Family", type: "family", description: "Share with family members" },
  { id: "template-couple", name: "Couples", type: "couple", description: "Share with your partner" },
  { id: "template-work", name: "Teams", type: "work", description: "Team collaboration" },
  { id: "template-squad", name: "Groups", type: "squad", description: "Group accountability" },
  { id: "template-project", name: "Work", type: "project", description: "Work/professional space" },
];

// ============================================================================
// Internal Global Spaces Hook (for automatic fetching)
// ============================================================================

interface InternalGlobalSpacesOptions {
  userId?: string | null;
}

interface InternalGlobalSpacesReturn {
  globalSpaces: GlobalSpaceItem[];
  loading: boolean;
  joinSpace: (spaceId: string, user: { uid: string; displayName?: string | null; photoURL?: string | null }) => Promise<void>;
}

function useInternalGlobalSpaces({ userId }: InternalGlobalSpacesOptions): InternalGlobalSpacesReturn {
  const [globalSpaces, setGlobalSpaces] = React.useState<GlobalSpaceItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!userId) {
      setGlobalSpaces([]);
      setLoading(false);
      return;
    }

    // Dynamically import firebase to avoid SSR issues
    let unsubscribe: (() => void) | undefined;

    const setupListener = async () => {
      try {
        const { db } = await import("@ainexsuite/firebase");
        const { collection, query, where, onSnapshot } = await import("firebase/firestore");

        const spacesRef = collection(db, "spaces");
        const q = query(spacesRef, where("isGlobal", "==", true));

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const spaces: GlobalSpaceItem[] = [];

            snapshot.docs.forEach((docSnap) => {
              const data = docSnap.data();

              // Skip spaces the user is already a member of
              if (data.memberUids?.includes(userId)) {
                return;
              }

              // Find owner name from members
              const owner = data.members?.find((m: { uid: string; displayName?: string }) => m.uid === data.ownerId);
              const ownerName = owner?.displayName || undefined;

              spaces.push({
                id: docSnap.id,
                name: data.name,
                type: data.type,
                memberCount: data.memberUids?.length || data.members?.length || 0,
                description: data.description,
                ownerName,
              });
            });

            setGlobalSpaces(spaces);
            setLoading(false);
          },
          (err) => {
            // eslint-disable-next-line no-console
            console.error("[GlobalSpaces] Error fetching global spaces:", err);
            setLoading(false);
          }
        );
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[GlobalSpaces] Error setting up listener:", err);
        setLoading(false);
      }
    };

    void setupListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userId]);

  const joinSpace = React.useCallback(
    async (
      spaceId: string,
      user: { uid: string; displayName?: string | null; photoURL?: string | null }
    ) => {
      if (!user.uid) {
        throw new Error("Must be authenticated to join a space");
      }

      const { db } = await import("@ainexsuite/firebase");
      const { doc, updateDoc, arrayUnion, Timestamp } = await import("firebase/firestore");

      const spaceRef = doc(db, "spaces", spaceId);

      const newMember = {
        uid: user.uid,
        displayName: user.displayName || "User",
        photoURL: user.photoURL || undefined,
        role: "member",
        joinedAt: Timestamp.now(),
      };

      await updateDoc(spaceRef, {
        members: arrayUnion(newMember),
        memberUids: arrayUnion(user.uid),
      });
    },
    []
  );

  return {
    globalSpaces,
    loading,
    joinSpace,
  };
}

interface SpacesSettingsProps {
  spaces: SpaceSettingsItem[];
  currentAppId?: string;
  onCreateSpace?: () => void;
  onEditSpace?: (spaceId: string) => void;
  onUpdateSpaceVisibility?: (spaceId: string, hiddenInApps: string[]) => Promise<void>;
  onDeleteSpace?: (spaceId: string) => Promise<void>;
  /** User for fetching/joining global spaces */
  user?: { uid: string; displayName?: string | null; photoURL?: string | null } | null;
  /** Optional: Override with external global spaces data */
  globalSpaces?: GlobalSpaceItem[];
  onJoinSpace?: (spaceId: string) => Promise<void>;
  globalSpacesLoading?: boolean;
  /** Whether to show the Global tab (default: true) */
  showGlobalTab?: boolean;
}

type SpacesTab = "global" | "custom";

function SpacesSettings({
  spaces,
  currentAppId,
  onCreateSpace: _onCreateSpace,
  onEditSpace,
  onUpdateSpaceVisibility,
  onDeleteSpace,
  user,
  globalSpaces: externalGlobalSpaces,
  onJoinSpace: externalOnJoinSpace,
  globalSpacesLoading: externalGlobalSpacesLoading,
  showGlobalTab = true,
}: SpacesSettingsProps) {
  // If global tab is hidden, default to "custom" tab
  const [activeSpacesTab, setActiveSpacesTab] = React.useState<SpacesTab>(showGlobalTab ? "global" : "custom");
  const [expandedSpaceId, setExpandedSpaceId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [joiningSpaceId, setJoiningSpaceId] = React.useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = React.useState<{ spaceId: string; spaceName: string } | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  // Use internal hook for global spaces if external data not provided
  const {
    globalSpaces: internalGlobalSpaces,
    loading: internalGlobalSpacesLoading,
    joinSpace: internalJoinSpace,
  } = useInternalGlobalSpaces({ userId: user?.uid });

  // Use external data if provided, otherwise use internal
  const globalSpaces = externalGlobalSpaces ?? internalGlobalSpaces;
  const globalSpacesLoading = externalGlobalSpacesLoading ?? internalGlobalSpacesLoading;

  // Global space types (from templates)
  const GLOBAL_SPACE_TYPES = new Set(TEMPLATE_GLOBAL_SPACES.map(t => t.type));

  // Filter template spaces based on what types the user already has
  const availableTemplates = React.useMemo(() => {
    const userSpaceTypes = new Set(spaces.map(s => s.type));
    return TEMPLATE_GLOBAL_SPACES.filter(template => !userSpaceTypes.has(template.type));
  }, [spaces]);

  // User's global spaces (spaces matching template types)
  const userGlobalSpaces = React.useMemo(() => {
    return spaces.filter(s => GLOBAL_SPACE_TYPES.has(s.type));
  }, [spaces]);

  // Create a new space from a template
  const createSpaceFromTemplate = React.useCallback(
    async (template: typeof TEMPLATE_GLOBAL_SPACES[0]) => {
      if (!user) return;

      const { db } = await import("@ainexsuite/firebase");
      const { collection, addDoc, Timestamp } = await import("firebase/firestore");

      const spacesRef = collection(db, "spaces");

      const newMember = {
        uid: user.uid,
        displayName: user.displayName || "User",
        photoURL: user.photoURL || undefined,
        role: "admin",
        joinedAt: Timestamp.now(),
      };

      await addDoc(spacesRef, {
        name: template.name,
        type: template.type,
        members: [newMember],
        memberUids: [user.uid],
        createdAt: Timestamp.now(),
        ownerId: user.uid,
        isGlobal: false, // User's own space, not a shared global space
      });
    },
    [user]
  );

  const handleJoinSpace = async (spaceId: string) => {
    setJoiningSpaceId(spaceId);
    try {
      // Check if this is a template space
      if (spaceId.startsWith("template-")) {
        const template = TEMPLATE_GLOBAL_SPACES.find(t => t.id === spaceId);
        if (template && user) {
          await createSpaceFromTemplate(template);
        }
      } else if (externalOnJoinSpace) {
        await externalOnJoinSpace(spaceId);
      } else if (user) {
        await internalJoinSpace(spaceId, {
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
      }
    } finally {
      setJoiningSpaceId(null);
    }
  };

  const handleToggleAppVisibility = async (spaceId: string, appId: string, currentHiddenApps: string[]) => {
    if (!onUpdateSpaceVisibility) return;
    setSaving(true);
    try {
      const isCurrentlyHidden = currentHiddenApps.includes(appId);
      const newHiddenApps = isCurrentlyHidden
        ? currentHiddenApps.filter((id) => id !== appId)
        : [...currentHiddenApps, appId];
      await onUpdateSpaceVisibility(spaceId, newHiddenApps);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation || !onDeleteSpace) return;
    setDeleting(true);
    try {
      await onDeleteSpace(deleteConfirmation.spaceId);
      setDeleteConfirmation(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Tabs - only show when global tab is enabled */}
      {showGlobalTab && (
        <div className="flex gap-1 p-1 rounded-xl bg-muted/50">
          <button
            type="button"
            onClick={() => setActiveSpacesTab("global")}
            className={clsx(
              "flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeSpacesTab === "global"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <Globe className="h-4 w-4" />
              <span>Global</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setActiveSpacesTab("custom")}
            className={clsx(
              "flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeSpacesTab === "custom"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="h-4 w-4" />
              <span>My Spaces</span>
              {spaces.length > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                  {spaces.length}
                </span>
              )}
            </div>
          </button>
        </div>
      )}

      {/* Global Tab Content */}
      {showGlobalTab && activeSpacesTab === "global" && (
        <div className="space-y-6">
          {/* User's Global Spaces with App Visibility */}
          {userGlobalSpaces.length > 0 && (
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-foreground">Your Global Spaces</h4>
                <p className="text-xs text-muted-foreground">
                  Configure which apps can access each space
                </p>
              </div>
              <div className="space-y-2">
                {userGlobalSpaces.map((space) => {
                  const isExpanded = expandedSpaceId === space.id;
                  const hiddenApps = space.hiddenInApps || [];
                  return (
                    <div
                      key={space.id}
                      className="rounded-xl border border-border bg-muted/30 overflow-hidden"
                    >
                      <div
                        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setExpandedSpaceId(isExpanded ? null : space.id)}
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Globe className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground truncate">
                              {space.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                              {SPACE_TYPE_LABELS[space.type]}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {space.memberCount && space.memberCount > 1 && (
                              <span>{space.memberCount} members</span>
                            )}
                            {hiddenApps.length > 0 && (
                              <>
                                {space.memberCount && space.memberCount > 1 && <span>•</span>}
                                <span className="text-amber-500">
                                  Hidden in {hiddenApps.length} app{hiddenApps.length !== 1 ? "s" : ""}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {space.isOwner && onEditSpace && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditSpace(space.id);
                              }}
                              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                              title="Edit space"
                            >
                              <Settings2 className="h-4 w-4 text-muted-foreground" />
                            </button>
                          )}
                          <span className={clsx("transition-transform text-xs", isExpanded && "rotate-180")}>
                            ▼
                          </span>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="px-3 pb-3 border-t border-border pt-3">
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            Show in Apps
                          </p>
                          <div className="grid grid-cols-3 gap-1.5">
                            {AVAILABLE_APPS.map((app) => {
                              const isVisible = !hiddenApps.includes(app.id);
                              const isCurrentApp = app.id === currentAppId;
                              return (
                                <button
                                  key={app.id}
                                  type="button"
                                  onClick={() => handleToggleAppVisibility(space.id, app.id, hiddenApps)}
                                  disabled={saving}
                                  className={clsx(
                                    "flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-all",
                                    isVisible
                                      ? "bg-primary/10 text-foreground"
                                      : "bg-muted text-muted-foreground",
                                    isCurrentApp && "ring-1 ring-primary",
                                    saving && "opacity-50 cursor-not-allowed"
                                  )}
                                >
                                  {isVisible ? (
                                    <Eye className="h-3 w-3 text-primary" />
                                  ) : (
                                    <EyeOff className="h-3 w-3" />
                                  )}
                                  <span className="font-medium">{app.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available Global Spaces */}
          {(availableTemplates.length > 0 || globalSpacesLoading || (globalSpaces && globalSpaces.length > 0)) && (
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-foreground">Available Global Spaces</h4>
                <p className="text-xs text-muted-foreground">
                  Add a space to start collaborating with others
                </p>
              </div>
              <div className="space-y-2">
                {/* Template Spaces */}
                {availableTemplates.map((template) => (
              <div
                key={template.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">
                      {template.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                      {SPACE_TYPE_LABELS[template.type]}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {template.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleJoinSpace(template.id)}
                  disabled={joiningSpaceId === template.id}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                    joiningSpaceId === template.id
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {joiningSpaceId === template.id ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <span>Add</span>
                  )}
                </button>
              </div>
            ))}

            {/* Global Spaces from Firestore */}
            {globalSpacesLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="ml-2 text-xs text-muted-foreground">Loading shared spaces...</span>
              </div>
            ) : (
              globalSpaces?.map((space) => (
                <div
                  key={space.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">
                        {space.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-medium">
                        Shared
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{SPACE_TYPE_LABELS[space.type]}</span>
                      <span>•</span>
                      <Users className="h-3 w-3" />
                      <span>{space.memberCount} member{space.memberCount !== 1 ? "s" : ""}</span>
                      {space.ownerName && (
                        <>
                          <span>•</span>
                          <span>by {space.ownerName}</span>
                        </>
                      )}
                    </div>
                    {space.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {space.description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleJoinSpace(space.id)}
                    disabled={joiningSpaceId === space.id}
                    className={clsx(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                      joiningSpaceId === space.id
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    {joiningSpaceId === space.id ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Joining...</span>
                      </>
                    ) : (
                      <span>Join</span>
                    )}
                  </button>
                </div>
              ))
            )}

              </div>
            </div>
          )}

          {/* Empty state for global tab - when no global spaces exist and none available */}
          {userGlobalSpaces.length === 0 && availableTemplates.length === 0 && !globalSpacesLoading && (!globalSpaces || globalSpaces.length === 0) && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No global spaces available.</p>
            </div>
          )}
        </div>
      )}

      {/* My Spaces Tab Content */}
      {activeSpacesTab === "custom" && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Manage your spaces and their visibility across apps
            </p>
          </div>

          {/* Spaces List */}
          <div className="space-y-2">
        {spaces.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
            No spaces yet. Create your first space!
          </div>
        ) : (
          spaces.map((space) => {
            const isExpanded = expandedSpaceId === space.id;
            const hiddenApps = space.hiddenInApps || [];

            return (
              <div
                key={space.id}
                className="rounded-xl border border-border bg-muted/30 overflow-hidden"
              >
                {/* Space Header */}
                <div
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setExpandedSpaceId(isExpanded ? null : space.id)}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Globe className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">
                        {space.name}
                      </span>
                      {space.isGlobal && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-medium">
                          Global
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{SPACE_TYPE_LABELS[space.type]}</span>
                      {space.memberCount && space.memberCount > 1 && (
                        <>
                          <span>•</span>
                          <span>{space.memberCount} members</span>
                        </>
                      )}
                      {!space.isGlobal && hiddenApps.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-amber-500">
                            Hidden in {hiddenApps.length} app{hiddenApps.length !== 1 ? "s" : ""}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {space.isOwner && onEditSpace && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditSpace(space.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                        title="Edit space"
                      >
                        <Settings2 className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}
                    {space.isOwner && onDeleteSpace && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmation({ spaceId: space.id, spaceName: space.name });
                        }}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors group"
                        title="Delete space"
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-destructive" />
                      </button>
                    )}
                    <span
                      className={clsx(
                        "transition-transform ml-1",
                        isExpanded && "rotate-180"
                      )}
                    >
                      ▼
                    </span>
                  </div>
                </div>

                {/* Expanded: App Visibility */}
                {isExpanded && !space.isGlobal && (
                  <div className="px-3 pb-3 border-t border-border pt-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Show in Apps
                    </p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {AVAILABLE_APPS.map((app) => {
                        const isVisible = !hiddenApps.includes(app.id);
                        const isCurrentApp = app.id === currentAppId;
                        return (
                          <button
                            key={app.id}
                            type="button"
                            onClick={() =>
                              handleToggleAppVisibility(space.id, app.id, hiddenApps)
                            }
                            disabled={saving}
                            className={clsx(
                              "flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-all",
                              isVisible
                                ? "bg-primary/10 text-foreground"
                                : "bg-muted text-muted-foreground",
                              isCurrentApp && "ring-1 ring-primary",
                              saving && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            {isVisible ? (
                              <Eye className="h-3 w-3 text-primary" />
                            ) : (
                              <EyeOff className="h-3 w-3" />
                            )}
                            <span className="font-medium">{app.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Global spaces can't have per-app visibility */}
                {isExpanded && space.isGlobal && (
                  <div className="px-3 pb-3 border-t border-border pt-3">
                    <p className="text-xs text-muted-foreground">
                      This is a global space. It&apos;s visible in all apps.
                      To manage per-app visibility, disable the global setting when editing.
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-background/60 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteConfirmation(null)}
          />
          <div className="relative z-[201] w-full max-w-sm rounded-2xl bg-popover border border-border shadow-xl p-6 animate-in zoom-in-95 fade-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <Trash2 className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Delete Space
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to delete <strong className="text-foreground">{deleteConfirmation.spaceName}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmation(null)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-muted text-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
