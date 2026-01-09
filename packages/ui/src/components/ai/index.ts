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
} from "./ai-insights-card";

export {
  AIInsightsRibbon,
  useInsightsRibbonCollapsed,
  type AIInsightsRibbonProps,
  type AIInsightsRibbonSection,
} from "./ai-insights-ribbon";

export {
  AIInsightsPulldown,
  useInsightsPulldownExpanded,
  type AIInsightsPulldownProps,
  type AIInsightsPulldownSection,
} from "./ai-insights-pulldown";

export {
  AIInsightsModal,
  type AIInsightsModalProps,
} from "./ai-insights-modal";

// Insight sub-components
export {
  InsightCard,
  MoodOrb,
  ProgressRing,
  ThemePills,
  ActionItems,
  ReflectionPrompt,
  MOOD_COLORS,
  PILL_COLORS,
  type InsightCardProps,
  type MoodOrbProps,
  type ProgressRingProps,
  type ThemePillsProps,
  type ActionItemsProps,
  type ReflectionPromptProps,
} from "./insights";

export {
  // Individual icons
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
  // Collection
  AnimatedAIIcons,
  // Types
  type AnimatedIconProps,
  type AnimatedAIIconName,
} from "./animated-ai-icons";

// ============================================================================
// App-Specific Animated Icons
// ============================================================================

// Group 1: Main, Notes, Journey
export {
  // Main App Icons
  MainDashboardIcon,
  MainHomeIcon,
  MainHubIcon,
  MainOverviewIcon,
  MainSuiteIcon,
  MainNotificationsIcon,
  MainSearchIcon,
  MainSettingsIcon,
  MainStatsIcon,
  MainAppsIcon,
  // Notes App Icons
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
  // Journey App Icons
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
  // Collection
  AppIconsGroup1,
  type AppIconGroup1Name,
} from "./animated-app-icons-group1";

// Group 2: Todo, Health, Moments
export {
  // Todo App Icons
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
  // Health App Icons
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
  // Moments App Icons
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
  // Collection
  AnimatedAppIconsGroup2,
  type AnimatedAppIconGroup2Name,
} from "./animated-app-icons-group2";

// Group 3: Grow, Pulse, Fit
export {
  // Grow App Icons
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
  // Pulse App Icons
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
  // Pulse Display/Screensaver Icons
  PulseDisplayIcon,
  PulseClockIcon,
  PulseWidgetIcon,
  PulseAmbientIcon,
  PulseFrameIcon,
  PulseNightIcon,
  PulseDeskIcon,
  PulseSmartIcon,
  PulseZenIcon,
  PulseSlideshowIcon,
  // Fit App Icons
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
  // Collections
  GrowIcons,
  PulseIcons,
  FitIcons,
  AppIconsGroup3,
  type GrowIconName,
  type PulseIconName,
  type FitIconName,
} from "./animated-app-icons-group3";

// Group 4: Projects, Workflow, Calendar, Admin, Subs, Docs
export {
  // Projects App Icons
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
  // Workflow App Icons
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
  // Calendar App Icons
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
  // Admin App Icons
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
  // Subs App Icons
  SubsWalletIcon,
  SubsCardIcon,
  SubsRecurringIcon,
  // Docs App Icons
  DocsDocumentIcon,
  DocsEditIcon,
  DocsPageIcon,
  // Collections
  ProjectsIcons,
  WorkflowIcons,
  CalendarIcons,
  AdminIcons,
  SubsIcons,
  DocsIcons,
  AppIconsGroup4,
  type ProjectsIconName,
  type WorkflowIconName,
  type CalendarIconName,
  type AdminIconName,
  type SubsIconName,
  type DocsIconName,
} from "./animated-app-icons-group4";

// AI Voice Icon Mockups (1-20)
export {
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
  // Showcase
  MockupShowcase,
} from "./mockups";
