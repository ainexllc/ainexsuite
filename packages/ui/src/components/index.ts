// Layout Components
export {
  TopNav,
  TopNavProfileButton,
  type TopNavProps,
  type TopNavProfileButtonProps,
} from "./layout/top-nav";

export {
  ProfileDropdown,
  type ProfileDropdownProps,
} from "./layout/profile-dropdown";

export {
  AppShell,
  AppShellContainer,
  type AppShellProps,
} from "./layout/app-shell";

export {
  NavigationPanel,
  NavigationSection,
  type NavigationPanelProps,
  type NavItem,
  type NavSection,
} from "./layout/navigation-panel";

export {
  ActivityPanel,
  // type ActivityPanelProps, // Export types if needed, currently not exported in component
} from "./layout/activity-panel";

export {
  SubscriptionSidebar,
  type SubscriptionSidebarProps,
} from "./layout/subscription-sidebar";

export {
  ProfileSidebar,
  type ProfileSidebarProps,
} from "./layout/profile-sidebar";

// Profile Components
export {
  ProfileSection,
  type ProfileSectionProps,
} from "./profile/profile-section";

export {
  UsageMeter,
  type UsageMeterProps,
} from "./profile/usage-meter";

export {
  ConnectedApps,
  type ConnectedAppsProps,
  type App,
} from "./profile/connected-apps";

export {
  ActivityStats,
  type ActivityStatsProps,
  type ActivityStat,
} from "./profile/activity-stats";

export {
  ThemeToggle,
  type ThemeToggleProps,
  type Theme,
} from "./profile/theme-toggle";

export {
  HelpSupport,
  type HelpSupportProps,
} from "./profile/help-support";

export {
  WhatsNew,
  type WhatsNewProps,
  type Update,
} from "./profile/whats-new";

export {
  AppNavigationSidebar,
  type AppNavigationSidebarProps,
} from "./layout/app-navigation-sidebar";

export {
  SearchBar,
  type SearchBarProps,
} from "./navigation/search-bar";

export { AtmosphericGlows } from "./layouts/atmospheric-glows";
export { WorkspaceHeader } from "./layouts/workspace-header";
// WorkspacePageHeader hidden - may be used later (see _workspace-page-header.tsx)
export { WorkspaceLayout } from "./layouts/workspace-layout";
export {
  FooterPageLayout,
  type FooterPageLayoutProps,
} from "./layouts/footer-page-layout";

// Background Components
export { LayeredBackground } from "./backgrounds/layered-background";
export { CanvasWaveBackground } from "./backgrounds/canvas-wave-background";
export { WorkspaceBackground } from "./backgrounds/workspace-background";

// Branding Components
export { AinexStudiosLogo, type AinexStudiosLogoProps } from "./branding/ainex-studios-logo";

// Core UI Components
export * from './feedback/feedback-widget';
export * from './buttons/button';
export * from './cards/card';

export { Input, Textarea, FormField, type InputProps, type TextareaProps, type FormFieldProps } from "./forms";

export {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalFooter,
  type ModalProps,
} from "./modal";

export {
  GlassModal,
  GlassModalHeader,
  GlassModalTitle,
  GlassModalDescription,
  GlassModalContent,
  GlassModalFooter,
  type GlassModalProps,
} from "./glass-modal";

export {
  ConfirmationDialog,
  type ConfirmationDialogProps,
} from "./confirmation-dialog";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "./table";

// Marketing Components
export {
  HomepageTemplate,
  type HomepageTemplateProps,
  type DemoStep,
  type NavLink,
  type FeatureCard,
  type AIHighlight,
  type FooterLink,
  type AppCard,
} from "./marketing/homepage-template";

// Suite Components
export { SuiteNavigation, type SuiteNavigationProps } from "./suite-navigation";
export { AppSwitcher, type AppSwitcherProps } from "./app-switcher";
export { AppLoginStatus, AppLoginStatusBadge, type AppLoginStatusProps } from "./app-login-status";

// Legal Components
export {
  PrivacyPolicy,
  TermsOfService,
  CookiePolicy,
  AcceptableUsePolicy,
  GDPRHelp,
  ContactUs,
} from "./legal";

// AI Components
export {
  AIInsightsCard,
  AIInsightsBulletList,
  AIInsightsTagList,
  AIInsightsText,
  type AIInsightsCardProps,
  type AIInsightsSection,
  type AIInsightsBulletListProps,
  type AIInsightsTagListProps,
  type AIInsightsTextProps,
} from "./ai";

// Existing Components
export { Footer } from "./footer";
export { Paywall } from "./paywall";

// Space Components
export {
  SpaceSwitcher,
  SpaceEditor,
  type SpaceSwitcherProps,
  type SpaceEditorProps,
  type SpaceItem,
  type SpaceTypeOption,
} from "./spaces";
