/**
 * Privacy context value provided to consumers
 */
export interface PrivacyContextValue {
  /** Whether private content is currently unlocked */
  isUnlocked: boolean;
  /** Remaining time in seconds until auto-lock */
  remainingTime: number;
  /** Whether the user has set up a passcode */
  hasPasscode: boolean;
  /** Whether privacy settings are still loading */
  isLoading: boolean;
  /** Set up a new passcode */
  setupPasscode: (passcode: string) => Promise<boolean>;
  /** Verify passcode and unlock private content */
  verifyPasscode: (passcode: string) => Promise<boolean>;
  /** Immediately lock private content */
  lockNow: () => void;
  /** Extend the current unlock session */
  extendSession: () => void;
  /** Remove the passcode protection */
  removePasscode: () => Promise<boolean>;
}

/**
 * Configuration for the PrivacyProvider
 */
export interface PrivacyProviderConfig {
  /**
   * App name for namespacing storage keys
   * @example 'journey', 'notes'
   */
  appName: string;

  /**
   * Firestore collection name for user settings
   * @default 'user_settings'
   */
  settingsCollection?: string;

  /**
   * Session duration in milliseconds
   * @default 900000 (15 minutes)
   */
  sessionDuration?: number;

  /**
   * Custom toast messages
   */
  messages?: {
    passcodeSet?: string;
    passcodeSetDescription?: string;
    passcodeRemoved?: string;
    passcodeRemovedDescription?: string;
    unlocked?: string;
    unlockedDescription?: string;
    sessionExtended?: string;
    sessionExtendedDescription?: string;
    incorrectPasscode?: string;
    incorrectPasscodeDescription?: string;
    error?: string;
    errorDescription?: string;
  };
}

/**
 * Props for PrivacyProvider component
 */
export interface PrivacyProviderProps {
  children: React.ReactNode;
  config: PrivacyProviderConfig;
}

/**
 * Props for PasscodeModal component
 */
export interface PasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (passcode: string) => Promise<boolean>;
  mode: 'setup' | 'verify';
  title: string;
  /** Optional accent color (CSS variable or hex) */
  accentColor?: string;
}

/**
 * Props for BlurredContent component
 */
export interface BlurredContentProps {
  isLocked: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
  /** Optional accent color for lock icon (CSS variable or hex) */
  accentColor?: string;
}

/**
 * Props for PrivateEntryNotice component
 */
export interface PrivateEntryNoticeProps {
  isPrivate: boolean;
  /** Link to settings page for setting up passcode */
  settingsLink?: string;
  /** Optional accent color (CSS variable or hex) */
  accentColor?: string;
}
