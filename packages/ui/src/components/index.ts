// Layout Components
export {
  TopNav,
  TopNavProfileButton,
  TopNavAiButton,
  type TopNavProps,
  type TopNavProfileButtonProps,
  type TopNavAiButtonProps,
} from "./layout/top-nav";

export {
  ProfileDropdown,
  type ProfileDropdownProps,
  type ThemeValue,
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
  Sidebar,
  SidebarHeader,
  SidebarSection,
  SidebarItem,
  SidebarFooter,
  useSidebarCollapsed,
  type SidebarProps,
  type SidebarPosition,
  type SidebarHeaderProps,
  type SidebarSectionProps,
  type SidebarItemProps,
  type SidebarFooterProps,
} from "./layout/sidebar";

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

export {
  SearchInput,
  type SearchInputProps,
} from "./search";

export { AtmosphericGlows } from "./layouts/atmospheric-glows";
export { WorkspaceHeader } from "./layouts/workspace-header";
// WorkspacePageHeader hidden - may be used later (see _workspace-page-header.tsx)
export { WorkspaceLayout } from "./layouts/workspace-layout";
export { WorkspacePageLayout } from "./layouts/workspace-page-layout";
export { WorkspaceLoadingScreen } from "./layouts/workspace-loading-screen";
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
export { LogoWordmark, type LogoWordmarkProps } from "./branding/logo-wordmark";

// Core UI Components
export * from './feedback/feedback-widget';
export * from './buttons/button';
export { LoadingButton, type LoadingButtonProps } from './buttons/loading-button';
export * from './cards/card';
export * from './cards/stats-card';
export { DataCard, type DataCardProps, type DataCardVariant } from './cards/data-card';

// Header Components
export {
  PageHeader,
  SectionHeader,
  ContentHeader,
  type PageHeaderProps,
  type SectionHeaderProps,
  type ContentHeaderProps,
  type Breadcrumb,
} from './headers';

// List Components
export {
  ListSection,
  ListItem,
  EmptyState,
  ListSkeleton,
  type ListSectionProps,
  type ListItemProps,
  type EmptyStateProps,
  type ListSkeletonProps,
} from './lists';

// Loading Components
export {
  Spinner,
  LoadingOverlay,
  LoadingDots,
  PageLoading,
  LoadingSkeleton,
  type SpinnerProps,
  type SpinnerSize,
  type LoadingOverlayProps,
  type LoadingDotsProps,
  type LoadingDotsSize,
  type PageLoadingProps,
  type LoadingSkeletonProps,
  type SkeletonVariant,
} from './loading';

// Form Components
export {
  Input,
  Textarea,
  FormField,
  TagInput,
  Tag,
  TagList,
  BaseComposer,
  type InputProps,
  type TextareaProps,
  type FormFieldProps,
  type TagInputProps,
  type TagProps,
  type TagListProps,
  type BaseComposerProps,
} from "./forms";

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

// Modal Variants - Specialized modal components for common use cases
export {
  FilterModal,
  FormModal,
  AlertModal,
  type FilterModalProps,
  type FilterTab,
  type FormModalProps,
  type AlertModalProps,
  type AlertType,
} from "./modal/index";

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
  useInsightsCollapsed,
  type AIInsightsCardProps,
  type AIInsightsSection,
  type AIInsightsBulletListProps,
  type AIInsightsTagListProps,
  type AIInsightsTextProps,
} from "./ai";

// AI Insights Banner (Full-width collapsible banner for workspace pages)
export {
  AIInsightsBanner,
  InsightCard,
} from "./insights/ai-insights-banner";

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

// Toast/Notification Components
export {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  Toaster,
  useToast,
  toast,
  type ToastProps,
  type ToastActionElement,
  type ToastVariant,
  type ToasterProps,
  type ToastData,
  type ToastInput,
} from "./toast";

// Control Components
export {
  ViewToggle,
  SegmentedControl,
  type ViewToggleProps,
  type ViewToggleOption,
  type ViewToggleSize,
  type ViewToggleVariant,
  type SegmentedControlProps,
  type SegmentedControlOption,
} from "./controls";

// Progress Components
export {
  ProgressBar,
  ProgressRing,
  ProgressSteps,
  StreakProgress,
  type ProgressBarProps,
  type ProgressRingProps,
  type ProgressStepsProps,
  type Step,
  type StreakProgressProps,
} from "./progress";

// Avatar Components
export {
  Avatar,
  AvatarGroup,
  UserDisplay,
  type AvatarProps,
  type AvatarGroupProps,
  type UserDisplayProps,
} from "./avatar";

// Theme Components
export { ThemeSwitcher } from "./theme";

// Toolbar Components
export {
  WorkspaceToolbar,
  ViewToggleGroup,
  FilterDropdown,
  SortDropdown,
  ActivityCalendar,
  ToolbarButton,
  type WorkspaceToolbarProps,
  type ViewToggleGroupProps,
  type FilterDropdownProps,
  type SortDropdownProps,
  type ActivityCalendarProps,
  type ToolbarButtonProps,
  type BaseViewMode,
  type SortField,
  type SortDirection,
  type SortConfig,
  type FilterValue,
  type ActivityData,
  type ViewOption,
  type SortOption,
} from "./toolbar";
