// Layout Components
export {
  TopNav,
  TopNavProfileButton,
  TopNavAiButton,
  TopNavFullscreenButton,
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
  FloatingDock,
  type FloatingDockItem,
} from "./layout/floating-dock";

export {
  AppFloatingDock,
} from "./layout/app-floating-dock";

export {
  SearchBar,
  type SearchBarProps,
} from "./navigation/search-bar";

export {
  GlobalSearchTrigger,
  type GlobalSearchTriggerProps,
} from "./navigation/global-search-trigger";

export {
  HeaderBreadcrumbs,
  type HeaderBreadcrumbsProps,
} from "./navigation/header-breadcrumbs";

export {
  NotificationBell,
  type NotificationBellProps,
} from "./navigation/notification-bell";

export {
  NotificationDropdown,
  type NotificationDropdownProps,
} from "./navigation/notification-dropdown";

// Notification Components
export {
  InvitationNotificationItem,
  type InvitationNotificationItemProps,
} from "./notifications";

export {
  QuickActionsMenu,
  type QuickActionsMenuProps,
} from "./navigation/quick-actions-menu";

export {
  SearchInput,
  type SearchInputProps,
} from "./search";

export { AtmosphericGlows } from "./layouts/atmospheric-glows";
export { WorkspaceHeader } from "./layouts/workspace-header";
export { CommandPalette, type CommandItem } from "./command-palette";
export { AnimatedAvatarPlayer, type AnimatedAvatarPlayerProps } from "./animated-avatar-player";
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
export { VideoBackground, type VideoBackgroundProps } from "./backgrounds/video-background";

// Branding Components
export { AinexStudiosLogo, type AinexStudiosLogoProps } from "./branding/ainex-studios-logo";
export { LogoWordmark, type LogoWordmarkProps } from "./branding/logo-wordmark";

// Animation Components
export { MovingBorder, MovingBorderButton, type MovingBorderButtonProps } from './moving-border';

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

// Section Divider
export {
  SectionDivider,
  type SectionDividerProps,
} from './section-divider';

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
  type VideoBackgroundConfig,
  type DemoStep,
  type NavLink,
  type FeatureCard,
  type AIHighlight,
  type FooterLink,
  type AppCard,
} from "./marketing/homepage-template";

// Space Components
export { SpaceNavigation, type SpaceNavigationProps } from "./space-navigation";
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
  AIInsightsRibbon,
  useInsightsRibbonCollapsed,
  AIInsightsPulldown,
  useInsightsPulldownExpanded,
  AIInsightsModal,
  type AIInsightsCardProps,
  type AIInsightsSection,
  type AIInsightsBulletListProps,
  type AIInsightsTagListProps,
  type AIInsightsTextProps,
  type AIInsightsRibbonProps,
  type AIInsightsRibbonSection,
  type AIInsightsPulldownProps,
  type AIInsightsPulldownSection,
  type AIInsightsModalProps,
  // Animated AI Icons
  AIBrainIcon,
  NeuralNetworkIcon,
  AIChatIcon,
  AISparkleIcon,
  AIRobotIcon,
  AICircuitIcon,
  AIProcessingIcon,
  AIMagicWandIcon,
  AILightbulbIcon,
  AIVoiceIcon,
  AIEyeIcon,
  AICodeIcon,
  AIAtomIcon,
  AITargetIcon,
  AILearningIcon,
  AIShieldIcon,
  AIAnalyticsIcon,
  AICloudIcon,
  AIDNAIcon,
  AICompassIcon,
  AnimatedAIIcons,
  type AnimatedIconProps,
  type AnimatedAIIconName,
  // App-Specific Animated Icons - Group 1 (Main, Notes, Journey)
  MainDashboardIcon,
  MainHomeIcon,
  MainHubIcon,
  MainOverviewIcon,
  MainSpaceIcon,
  MainNotificationsIcon,
  MainSearchIcon,
  MainSettingsIcon,
  MainStatsIcon,
  MainAppsIcon,
  NotesWriteIcon,
  NotesStickyIcon,
  NotesDocumentIcon,
  NotesIdeasIcon,
  NotesColorsIcon,
  NotesBookmarkIcon,
  NotesPinIcon,
  NotesTagIcon,
  NotesSearchIcon,
  NotesArchiveIcon,
  JourneyMoodIcon,
  JourneyJournalIcon,
  JourneyEmotionsIcon,
  JourneyReflectionIcon,
  JourneyMindfulnessIcon,
  JourneyCalendarIcon,
  JourneyGratitudeIcon,
  JourneyGoalsIcon,
  JourneyMemoryIcon,
  JourneyProgressIcon,
  AppIconsGroup1,
  type AppIconGroup1Name,
  // App-Specific Animated Icons - Group 2 (Todo, Health, Moments)
  TodoCheckIcon,
  TodoListIcon,
  TodoPriorityIcon,
  TodoTargetIcon,
  TodoProgressIcon,
  TodoCalendarIcon,
  TodoRepeatIcon,
  TodoTagIcon,
  TodoSubtaskIcon,
  TodoDueDateIcon,
  HealthHeartIcon,
  HealthPulseIcon,
  HealthActivityIcon,
  HealthScaleIcon,
  HealthVitalsIcon,
  HealthSleepIcon,
  HealthNutritionIcon,
  HealthWaterIcon,
  HealthStepsIcon,
  HealthMeditationIcon,
  MomentsCameraIcon,
  MomentsPhotoIcon,
  MomentsAlbumIcon,
  MomentsTimelineIcon,
  MomentsStarIcon,
  MomentsVideoIcon,
  MomentsLocationIcon,
  MomentsHeartIcon,
  MomentsShareIcon,
  MomentsFilterIcon,
  AnimatedAppIconsGroup2,
  type AnimatedAppIconGroup2Name,
  // App-Specific Animated Icons - Group 3 (Grow, Pulse, Fit)
  GrowSeedlingIcon,
  GrowBookIcon,
  GrowStairsIcon,
  GrowTrophyIcon,
  GrowTargetIcon,
  GrowMindIcon,
  GrowHabitIcon,
  GrowJournalIcon,
  GrowMilestoneIcon,
  GrowReflectionIcon,
  PulseHeartbeatIcon,
  PulseWaveIcon,
  PulseActivityIcon,
  PulseEnergyIcon,
  PulseBoltIcon,
  PulseMonitorIcon,
  PulseAlertIcon,
  PulseRecoveryIcon,
  PulseZoneIcon,
  PulseStreakIcon,
  FitDumbbellIcon,
  FitRunningIcon,
  FitBicycleIcon,
  FitStrengthIcon,
  FitTimerIcon,
  FitYogaIcon,
  FitSwimmingIcon,
  FitCaloriesIcon,
  FitGoalIcon,
  FitRestIcon,
  GrowIcons,
  PulseIcons,
  FitIcons,
  AppIconsGroup3,
  type GrowIconName,
  type PulseIconName,
  type FitIconName,
  // App-Specific Animated Icons - Group 4 (Projects, Workflow, Calendar, Admin)
  ProjectsFolderIcon,
  ProjectsKanbanIcon,
  ProjectsMilestoneIcon,
  ProjectsTeamIcon,
  ProjectsDeliverableIcon,
  ProjectsTaskIcon,
  ProjectsTimelineIcon,
  ProjectsBudgetIcon,
  ProjectsDocumentIcon,
  ProjectsStatusIcon,
  WorkflowAutomationIcon,
  WorkflowFlowIcon,
  WorkflowNodeIcon,
  WorkflowConnectionIcon,
  WorkflowProcessIcon,
  WorkflowTriggerIcon,
  WorkflowConditionIcon,
  WorkflowActionIcon,
  WorkflowLoopIcon,
  WorkflowIntegrationIcon,
  CalendarGridIcon,
  CalendarEventIcon,
  CalendarScheduleIcon,
  CalendarTimeIcon,
  CalendarAppointmentIcon,
  CalendarWeekIcon,
  CalendarReminderIcon,
  CalendarRecurringIcon,
  CalendarTodayIcon,
  CalendarSyncIcon,
  AdminSettingsIcon,
  AdminShieldIcon,
  AdminUsersIcon,
  AdminControlsIcon,
  AdminManagementIcon,
  AdminDatabaseIcon,
  AdminLogsIcon,
  AdminAPIIcon,
  AdminSecurityIcon,
  AdminAnalyticsIcon,
  ProjectsIcons,
  WorkflowIcons,
  CalendarIcons,
  AdminIcons,
  AppIconsGroup4,
  type ProjectsIconName,
  type WorkflowIconName,
  type CalendarIconName,
  type AdminIconName,
  // AI Voice Icon Mockups (1-20)
  CircularSoundWaves,
  HorizontalEQBars,
  SineWaveCircle,
  RadialSoundBurst,
  AudioWaveformRing,
  PulsingBrainOutline,
  NeuralNetworkNodes,
  CircuitMind,
  SynapseSpark,
  AICore,
  GlowingMic,
  MicWithWaves,
  VoiceBubble,
  SoundwaveMic,
  MorphingOrb,
  RotatingGradientRing,
  ParticleSwirl,
  BreathingCircle,
  AIEyeSoundwave,
  MagicSparkMic,
  AIVoiceMockups,
  type AIVoiceMockupName,
  // Mic-focused Mockups (21-40)
  ClassicMicPulse,
  MicLiveIndicator,
  PodcastMic,
  VoiceAssistantCircle,
  RecordingMic,
  SiriStyleMic,
  TapToSpeak,
  FrequencyMic,
  VoiceRecognition,
  AlexaStyleRing,
  ListeningEars,
  SoundInput,
  GlowMicButton,
  WaveformCircle,
  VoiceCommand,
  ActiveListening,
  SmartAssistant,
  VoiceDetector,
  SpeakNow,
  AudioCapture,
  AIMicMockups,
  type AIMicMockupName,
  MockupShowcase,
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
  SpaceSettings,
  SpacesHubModal,
  SpaceManagementModal,
  InviteMemberModal,
  AddChildModal,
  InlineSpacePicker,
  SpaceTabSelector,
  MemberManager,
  type SpaceSwitcherProps,
  type SpaceSettingsProps,
  type SpacesHubModalProps,
  type SpaceManagementModalProps,
  type SpaceHubItem,
  type UserSpace,
  type InviteMemberModalProps,
  type AddChildModalProps,
  type SpaceItem,
  type InlineSpacePickerProps,
  type InlineSpaceItem,
  type SpaceTabSelectorProps,
  type SpaceTabItem,
  type MemberManagerProps,
  type MemberManagerMember,
  type MemberManagerSpace,
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
export { ThemeSwitcher, AnimatedThemeToggler } from "./theme";

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
  type QuickDatePreset,
  type NoteTypeFilter,
  type DateRangeField,
} from "./toolbar";

// Filter Components
export {
  ActiveFilterChips,
  type FilterChip,
  type FilterChipType,
} from "./filters";

// Date Picker Components
export {
  DatePicker,
  DateTimePicker,
  DateRangePicker,
  CalendarGrid,
  TimeInput,
  PresetButtons,
  RangePresetButtons,
  // Utilities
  getSmartPresets,
  getBasicPresets,
  getSmartRangePresets,
  formatDisplayDate,
  // Types
  type DatePickerProps,
  type DateTimePickerProps,
  type DateRangePickerProps,
  type DateRange,
  type CalendarGridProps,
  type TimeInputProps,
  type PresetOption,
  type RangePresetOption,
  type PresetMode,
  type TimeFormat,
  type MinuteStep,
} from "./date-picker";

// Settings Components
export {
  SettingsModal,
  type SettingsModalProps,
  type SettingsUser,
  type SettingsTab,
  type SpaceSettingsItem,
  type SpaceSettingsMember,
} from "./settings";

// Re-export hooks for convenience (main export is from '../hooks')
export { useFontPreference, useFontSizePreference, useThemePreference } from "../hooks";

// Error Pages
export {
  NotFound,
  type NotFoundProps,
} from "./not-found";

// Editor Components
export {
  EntryEditorShell,
  type EntryEditorShellProps,
} from "./editors/entry-editor-shell";

// Priority Components
export {
  PriorityIcon,
  PriorityBadge,
  AdaptivePriorityIcon,
  AdaptivePriorityBadge,
  type PriorityIconProps,
  type PriorityLevel,
  type AdaptivePriorityIconProps,
} from "./priority";

// Effects Components
export { FocusGlow } from "./effects";

// Noise Background
export { NoiseBackground } from "./noise-background";

// Adaptive Quality Icons
export {
  // Adaptive Quality System
  useAdaptiveQuality,
  useQualityTier,
  QualityProvider,
  useQuality,
  useIs3DEnabled,
  useIsCanvasEnabled,
  type QualityTier,
  type AdaptiveQualityResult,
  // Fire Icon
  FireIcon,
  FireIconWithPreset,
  FireIconSVG,
  FireIconCanvas,
  FireIcon3D,
  FIRE_COLOR_PRESETS,
  type FireIconProps,
  type FireColorPreset,
  type FireIconIntensity,
  type FireIconSVGProps,
  type FireIconCanvasProps,
  type FireIcon3DProps,
} from "./icons";

// Text Effects
export {
  AnimatedGradientText,
  type AnimatedGradientTextProps,
} from "./text";

// Checklist Components
export {
  AnimatedCheckbox,
  ChecklistItemRow,
  findParentIndex,
  findChildrenIndices,
  getSubtreeIndices,
  getChildrenCompletionStats,
  canIndent,
  canUnindent,
  MAX_INDENT_LEVEL,
  INDENT_WIDTH,
  type AnimatedCheckboxProps,
  type ChecklistItemRowProps,
} from "./checklist";

// Keyboard Shortcuts Components
export {
  useKeyboardShortcuts,
  KeyboardShortcutsModal,
  formatShortcut,
  getModifierKey,
  type KeyboardShortcut,
  type UseKeyboardShortcutsOptions,
  type KeyboardShortcutsModalProps,
} from "./keyboard-shortcuts";

// Rich Text Editor Components
export {
  RichTextEditor,
  EditorToolbar,
  ToolbarButton as EditorToolbarButton,
  ToolbarDivider,
  runCommand,
  FONT_COLORS,
  type RichTextEditorRef,
  type RichTextEditorProps,
  type EditorToolbarProps,
  type ToolbarButtonProps as EditorToolbarButtonProps,
  type FontColor,
  type Editor,
} from "./rich-text-editor";

// AI Panel Components
export {
  AIFloatingPanel,
  BotAvatarDisplay,
  ChatMarkdown,
  usePanelDragResize,
  type AIFloatingPanelProps,
  type AIFloatingPanelUser,
  type AIMessage,
  type SuggestedPrompt,
  type AIContextStats,
  type BotAvatarDisplayProps,
  type ChatMarkdownProps,
  type PanelState,
  type UsePanelDragResizeOptions,
  type DragHandleProps,
  type ResizeHandleProps,
  type ResizeEdge,
} from "./ai-panel";

// Picker Components
export {
  ColorPicker,
  PriorityPicker,
  LabelPicker,
  ReminderPicker,
  BackgroundPicker,
  getPriorityButtonStyles,
  getPriorityColor,
  formatDateTimeLocalInput,
  DEFAULT_PRIORITY_OPTIONS,
  DEFAULT_FREQUENCIES,
  OVERLAY_OPTIONS,
  type ColorPickerProps,
  type PriorityPickerProps,
  // PriorityLevel is exported from "./priority"
  type PriorityOption,
  type LabelPickerProps,
  type PickerLabel,
  type ReminderPickerProps,
  type ReminderConfig,
  type ReminderFrequency,
  type ReminderChannel,
  type ReminderChannelConfig,
  type FrequencyOption,
  type BackgroundPickerProps,
} from "./pickers";

// Entry Toolbar Components
export {
  EntryActionsToolbar,
  type EntryActionsToolbarProps,
  type EntryToolbarVariant,
  type ToolbarAction,
  type ToolbarActionGroup,
} from "./entry-toolbar";

// Bulk Action Bar Components
export {
  BulkActionBar,
  type BulkActionBarProps,
  type BulkAction,
  type BulkActionLabel,
} from "./bulk-action-bar";

// Hints System Components
export {
  HintsProvider,
  useHints,
  createLocalStorageAdapter,
  Hint,
  type HintConfig,
  type HintPlacement,
  type HintsStorageAdapter,
  type HintProps,
} from "./hints";

// Entry Footer Toolbar Components
export {
  EntryFooterToolbar,
  type EntryFooterToolbarProps,
  type EntryFooterVariant,
  type FooterSpace,
  type FooterAction,
  type PriorityLevel as FooterPriorityLevel,
} from "./entry-footer-toolbar";

// Color Picker Dropdown Components
export {
  ColorPickerDropdown,
  type ColorPickerDropdownProps,
} from "./color-picker-dropdown";

// Tremor Calendar Component
export {
  TremorCalendar,
  type Matcher as TremorCalendarMatcher,
  type TremorCalendarProps,
} from "./tremor-calendar";
