"use client";

import { useState } from "react";
import {
  // AI Icons
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
  // Main App Icons
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
} from "@ainexsuite/ui";

const aiIcons = [
  { name: "Brain", component: AIBrainIcon, description: "Pulsing neural activity", color: "#8b5cf6" },
  { name: "Neural Network", component: NeuralNetworkIcon, description: "Connecting nodes animation", color: "#06b6d4" },
  { name: "Chat", component: AIChatIcon, description: "Typing indicator bubbles", color: "#10b981" },
  { name: "Sparkle", component: AISparkleIcon, description: "Twinkling stars effect", color: "#eab308" },
  { name: "Robot", component: AIRobotIcon, description: "Waving antenna + blinking eyes", color: "#f97316" },
  { name: "Circuit", component: AICircuitIcon, description: "Flowing electricity", color: "#3b82f6" },
  { name: "Processing", component: AIProcessingIcon, description: "Spinning segments", color: "#ec4899" },
  { name: "Magic Wand", component: AIMagicWandIcon, description: "Sparkling tip", color: "#a855f7" },
  { name: "Lightbulb", component: AILightbulbIcon, description: "Glowing idea", color: "#fbbf24" },
  { name: "Voice", component: AIVoiceIcon, description: "Sound wave animation", color: "#14b8a6" },
  { name: "Eye", component: AIEyeIcon, description: "Scanning animation", color: "#6366f1" },
  { name: "Code", component: AICodeIcon, description: "Typing cursor", color: "#22c55e" },
  { name: "Atom", component: AIAtomIcon, description: "Orbiting electrons", color: "#0ea5e9" },
  { name: "Target", component: AITargetIcon, description: "Focusing crosshairs", color: "#ef4444" },
  { name: "Learning", component: AILearningIcon, description: "Continuous refresh", color: "#8b5cf6" },
  { name: "Shield", component: AIShieldIcon, description: "Protection pulse", color: "#22d3ee" },
  { name: "Analytics", component: AIAnalyticsIcon, description: "Growing bars", color: "#f472b6" },
  { name: "Cloud", component: AICloudIcon, description: "Floating animation", color: "#60a5fa" },
  { name: "DNA", component: AIDNAIcon, description: "Rotating helix", color: "#a3e635" },
  { name: "Compass", component: AICompassIcon, description: "Orienting needle", color: "#fb923c" },
];

const appIconGroups = [
  {
    app: "Main",
    color: "#f97316",
    description: "Central dashboard hub",
    icons: [
      { name: "Dashboard", component: MainDashboardIcon, description: "Expanding grid" },
      { name: "Home", component: MainHomeIcon, description: "Pulsing house" },
      { name: "Hub", component: MainHubIcon, description: "Connecting spokes" },
      { name: "Overview", component: MainOverviewIcon, description: "Scanning view" },
      { name: "Suite", component: MainSpaceIcon, description: "Orbiting apps" },
      { name: "Notifications", component: MainNotificationsIcon, description: "Bell animation" },
      { name: "Search", component: MainSearchIcon, description: "Scanning search" },
      { name: "Settings", component: MainSettingsIcon, description: "Gear rotation" },
      { name: "Stats", component: MainStatsIcon, description: "Chart growth" },
      { name: "Apps", component: MainAppsIcon, description: "Grid animation" },
    ],
  },
  {
    app: "Notes",
    color: "#eab308",
    description: "Colorful notes",
    icons: [
      { name: "Write", component: NotesWriteIcon, description: "Writing animation" },
      { name: "Sticky", component: NotesStickyIcon, description: "Floating note" },
      { name: "Document", component: NotesDocumentIcon, description: "Page flip" },
      { name: "Ideas", component: NotesIdeasIcon, description: "Sparkling bulb" },
      { name: "Colors", component: NotesColorsIcon, description: "Palette animation" },
      { name: "Bookmark", component: NotesBookmarkIcon, description: "Bookmark wave" },
      { name: "Pin", component: NotesPinIcon, description: "Pin bounce" },
      { name: "Tag", component: NotesTagIcon, description: "Tag swing" },
      { name: "Search", component: NotesSearchIcon, description: "Search pulse" },
      { name: "Archive", component: NotesArchiveIcon, description: "Box close" },
    ],
  },
  {
    app: "Journey",
    color: "#f97316",
    description: "Mood/reflections",
    icons: [
      { name: "Mood", component: JourneyMoodIcon, description: "Emoji animation" },
      { name: "Journal", component: JourneyJournalIcon, description: "Writing pages" },
      { name: "Emotions", component: JourneyEmotionsIcon, description: "Heart pulse" },
      { name: "Reflection", component: JourneyReflectionIcon, description: "Mirror effect" },
      { name: "Mindfulness", component: JourneyMindfulnessIcon, description: "Breathing circle" },
      { name: "Calendar", component: JourneyCalendarIcon, description: "Day highlight" },
      { name: "Gratitude", component: JourneyGratitudeIcon, description: "Heart bloom" },
      { name: "Goals", component: JourneyGoalsIcon, description: "Target pulse" },
      { name: "Memory", component: JourneyMemoryIcon, description: "Brain sparkle" },
      { name: "Progress", component: JourneyProgressIcon, description: "Growth chart" },
    ],
  },
  {
    app: "Todo",
    color: "#8b5cf6",
    description: "Task management",
    icons: [
      { name: "Check", component: TodoCheckIcon, description: "Checkbox completion" },
      { name: "List", component: TodoListIcon, description: "Scrolling items" },
      { name: "Priority", component: TodoPriorityIcon, description: "Pulsing flag" },
      { name: "Target", component: TodoTargetIcon, description: "Focusing aim" },
      { name: "Progress", component: TodoProgressIcon, description: "Growing bar" },
      { name: "Calendar", component: TodoCalendarIcon, description: "Date highlight" },
      { name: "Repeat", component: TodoRepeatIcon, description: "Rotation cycle" },
      { name: "Tag", component: TodoTagIcon, description: "Tag swing" },
      { name: "Subtask", component: TodoSubtaskIcon, description: "Nested items" },
      { name: "Due Date", component: TodoDueDateIcon, description: "Clock alert" },
    ],
  },
  {
    app: "Health",
    color: "#10b981",
    description: "Body metrics",
    icons: [
      { name: "Heart", component: HealthHeartIcon, description: "Beating heart" },
      { name: "Pulse", component: HealthPulseIcon, description: "ECG wave" },
      { name: "Activity", component: HealthActivityIcon, description: "Running figure" },
      { name: "Scale", component: HealthScaleIcon, description: "Balancing" },
      { name: "Vitals", component: HealthVitalsIcon, description: "Dashboard pulse" },
      { name: "Sleep", component: HealthSleepIcon, description: "Moon animation" },
      { name: "Nutrition", component: HealthNutritionIcon, description: "Apple bounce" },
      { name: "Water", component: HealthWaterIcon, description: "Drop fill" },
      { name: "Steps", component: HealthStepsIcon, description: "Footprint walk" },
      { name: "Meditation", component: HealthMeditationIcon, description: "Zen pulse" },
    ],
  },
  {
    app: "Moments",
    color: "#ec4899",
    description: "Memory curation",
    icons: [
      { name: "Camera", component: MomentsCameraIcon, description: "Shutter flash" },
      { name: "Photo", component: MomentsPhotoIcon, description: "Polaroid shake" },
      { name: "Album", component: MomentsAlbumIcon, description: "Flipping pages" },
      { name: "Timeline", component: MomentsTimelineIcon, description: "Scrolling dots" },
      { name: "Star", component: MomentsStarIcon, description: "Twinkling star" },
      { name: "Video", component: MomentsVideoIcon, description: "Play button" },
      { name: "Location", component: MomentsLocationIcon, description: "Pin drop" },
      { name: "Heart", component: MomentsHeartIcon, description: "Like pulse" },
      { name: "Share", component: MomentsShareIcon, description: "Share spread" },
      { name: "Filter", component: MomentsFilterIcon, description: "Lens adjust" },
    ],
  },
  {
    app: "Grow",
    color: "#14b8a6",
    description: "Personal development",
    icons: [
      { name: "Seedling", component: GrowSeedlingIcon, description: "Growing plant" },
      { name: "Book", component: GrowBookIcon, description: "Page turning" },
      { name: "Stairs", component: GrowStairsIcon, description: "Climbing progress" },
      { name: "Trophy", component: GrowTrophyIcon, description: "Glowing cup" },
      { name: "Target", component: GrowTargetIcon, description: "Bulls-eye pulse" },
      { name: "Mind", component: GrowMindIcon, description: "Brain expand" },
      { name: "Habit", component: GrowHabitIcon, description: "Streak chain" },
      { name: "Journal", component: GrowJournalIcon, description: "Writing flow" },
      { name: "Milestone", component: GrowMilestoneIcon, description: "Flag plant" },
      { name: "Reflection", component: GrowReflectionIcon, description: "Mirror pulse" },
    ],
  },
  {
    app: "Pulse",
    color: "#ef4444",
    description: "Vitality tracking",
    icons: [
      { name: "Heartbeat", component: PulseHeartbeatIcon, description: "ECG animation" },
      { name: "Wave", component: PulseWaveIcon, description: "Flowing wave" },
      { name: "Activity", component: PulseActivityIcon, description: "Ring progress" },
      { name: "Energy", component: PulseEnergyIcon, description: "Lightning bolt" },
      { name: "Bolt", component: PulseBoltIcon, description: "Power surge" },
      { name: "Monitor", component: PulseMonitorIcon, description: "Screen pulse" },
      { name: "Alert", component: PulseAlertIcon, description: "Warning blink" },
      { name: "Recovery", component: PulseRecoveryIcon, description: "Heal animation" },
      { name: "Zone", component: PulseZoneIcon, description: "Target ring" },
      { name: "Streak", component: PulseStreakIcon, description: "Fire growth" },
    ],
  },
  {
    app: "Fit",
    color: "#3b82f6",
    description: "Workout tracking",
    icons: [
      { name: "Dumbbell", component: FitDumbbellIcon, description: "Lifting animation" },
      { name: "Running", component: FitRunningIcon, description: "Running figure" },
      { name: "Bicycle", component: FitBicycleIcon, description: "Spinning wheels" },
      { name: "Strength", component: FitStrengthIcon, description: "Flexing muscle" },
      { name: "Timer", component: FitTimerIcon, description: "Countdown clock" },
      { name: "Yoga", component: FitYogaIcon, description: "Pose flow" },
      { name: "Swimming", component: FitSwimmingIcon, description: "Wave stroke" },
      { name: "Calories", component: FitCaloriesIcon, description: "Fire burn" },
      { name: "Goal", component: FitGoalIcon, description: "Target hit" },
      { name: "Rest", component: FitRestIcon, description: "Moon pulse" },
    ],
  },
  {
    app: "Projects",
    color: "#6366f1",
    description: "Project management",
    icons: [
      { name: "Folder", component: ProjectsFolderIcon, description: "Opening folder" },
      { name: "Kanban", component: ProjectsKanbanIcon, description: "Moving cards" },
      { name: "Milestone", component: ProjectsMilestoneIcon, description: "Flag wave" },
      { name: "Team", component: ProjectsTeamIcon, description: "Collaborating" },
      { name: "Deliverable", component: ProjectsDeliverableIcon, description: "Checkmark pop" },
      { name: "Task", component: ProjectsTaskIcon, description: "Check animation" },
      { name: "Timeline", component: ProjectsTimelineIcon, description: "Progress flow" },
      { name: "Budget", component: ProjectsBudgetIcon, description: "Coin stack" },
      { name: "Document", component: ProjectsDocumentIcon, description: "File open" },
      { name: "Status", component: ProjectsStatusIcon, description: "Indicator pulse" },
    ],
  },
  {
    app: "Workflow",
    color: "#06b6d4",
    description: "Visual automation",
    icons: [
      { name: "Automation", component: WorkflowAutomationIcon, description: "Spinning gears" },
      { name: "Flow", component: WorkflowFlowIcon, description: "Flowing path" },
      { name: "Node", component: WorkflowNodeIcon, description: "Pulsing node" },
      { name: "Connection", component: WorkflowConnectionIcon, description: "Linking nodes" },
      { name: "Process", component: WorkflowProcessIcon, description: "Step progression" },
      { name: "Trigger", component: WorkflowTriggerIcon, description: "Spark ignite" },
      { name: "Condition", component: WorkflowConditionIcon, description: "Branch split" },
      { name: "Action", component: WorkflowActionIcon, description: "Play execute" },
      { name: "Loop", component: WorkflowLoopIcon, description: "Cycle repeat" },
      { name: "Integration", component: WorkflowIntegrationIcon, description: "Plug connect" },
    ],
  },
  {
    app: "Calendar",
    color: "#06b6d4",
    description: "Scheduling",
    icons: [
      { name: "Grid", component: CalendarGridIcon, description: "Day highlighting" },
      { name: "Event", component: CalendarEventIcon, description: "Event pop" },
      { name: "Schedule", component: CalendarScheduleIcon, description: "Time blocks" },
      { name: "Time", component: CalendarTimeIcon, description: "Clock animation" },
      { name: "Appointment", component: CalendarAppointmentIcon, description: "Bell ring" },
      { name: "Week", component: CalendarWeekIcon, description: "Week highlight" },
      { name: "Reminder", component: CalendarReminderIcon, description: "Alert pulse" },
      { name: "Recurring", component: CalendarRecurringIcon, description: "Loop cycle" },
      { name: "Today", component: CalendarTodayIcon, description: "Day focus" },
      { name: "Sync", component: CalendarSyncIcon, description: "Refresh spin" },
    ],
  },
  {
    app: "Admin",
    color: "#64748b",
    description: "Admin dashboard",
    icons: [
      { name: "Settings", component: AdminSettingsIcon, description: "Spinning gear" },
      { name: "Shield", component: AdminShieldIcon, description: "Protection pulse" },
      { name: "Users", component: AdminUsersIcon, description: "People animation" },
      { name: "Controls", component: AdminControlsIcon, description: "Slider movement" },
      { name: "Management", component: AdminManagementIcon, description: "Dashboard pulse" },
      { name: "Database", component: AdminDatabaseIcon, description: "Data flow" },
      { name: "Logs", component: AdminLogsIcon, description: "List scroll" },
      { name: "API", component: AdminAPIIcon, description: "Connect pulse" },
      { name: "Security", component: AdminSecurityIcon, description: "Lock secure" },
      { name: "Analytics", component: AdminAnalyticsIcon, description: "Chart grow" },
    ],
  },
];

export default function AnimatedAIIconsShowcase() {
  const [selectedSize, setSelectedSize] = useState(48);
  const [isAnimating, setIsAnimating] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<"ai" | "apps">("ai");

  return (
    <div className={`min-h-screen p-8 transition-colors ${isDarkMode ? "bg-zinc-950" : "bg-zinc-100"}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-zinc-900"}`}>
            Animated Icons Library
          </h1>
          <p className={`text-lg ${isDarkMode ? "text-white/60" : "text-zinc-600"}`}>
            150 animated icons (20 AI + 130 app-specific) built with Framer Motion
          </p>
        </div>

        {/* Tab Switcher */}
        <div className={`flex gap-2 p-1 rounded-xl mb-8 w-fit ${isDarkMode ? "bg-white/5" : "bg-zinc-200"}`}>
          <button
            onClick={() => setActiveTab("ai")}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "ai"
                ? "bg-violet-500 text-white"
                : isDarkMode
                ? "text-white/60 hover:text-white"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            AI Icons (20)
          </button>
          <button
            onClick={() => setActiveTab("apps")}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "apps"
                ? "bg-violet-500 text-white"
                : isDarkMode
                ? "text-white/60 hover:text-white"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            App Icons (130)
          </button>
        </div>

        {/* Controls */}
        <div className={`flex flex-wrap items-center gap-6 p-4 rounded-xl mb-8 ${isDarkMode ? "bg-white/5 border border-white/10" : "bg-white border border-zinc-200"}`}>
          {/* Size selector */}
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${isDarkMode ? "text-white/70" : "text-zinc-700"}`}>Size:</span>
            <div className="flex gap-1">
              {[24, 32, 48, 64, 96].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedSize === size
                      ? "bg-violet-500 text-white"
                      : isDarkMode
                      ? "bg-white/10 text-white/60 hover:bg-white/20"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {size}px
                </button>
              ))}
            </div>
          </div>

          {/* Animation toggle */}
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${isDarkMode ? "text-white/70" : "text-zinc-700"}`}>Animation:</span>
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isAnimating
                  ? "bg-emerald-500 text-white"
                  : isDarkMode
                  ? "bg-white/10 text-white/60"
                  : "bg-zinc-100 text-zinc-600"
              }`}
            >
              {isAnimating ? "ON" : "OFF"}
            </button>
          </div>

          {/* Theme toggle */}
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${isDarkMode ? "text-white/70" : "text-zinc-700"}`}>Theme:</span>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isDarkMode
                  ? "bg-zinc-700 text-white"
                  : "bg-white text-zinc-900 border border-zinc-300"
              }`}
            >
              {isDarkMode ? "Dark" : "Light"}
            </button>
          </div>
        </div>

        {/* AI Icons Tab */}
        {activeTab === "ai" && (
          <>
            {/* Icons Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {aiIcons.map(({ name, component: Icon, description, color }) => (
                <div
                  key={name}
                  className={`group relative p-6 rounded-2xl transition-all hover:scale-[1.02] ${
                    isDarkMode
                      ? "bg-white/5 border border-white/10 hover:border-white/20"
                      : "bg-white border border-zinc-200 hover:border-zinc-300 shadow-sm"
                  }`}
                >
                  {/* Glow effect on hover */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity blur-xl"
                    style={{ backgroundColor: color }}
                  />

                  {/* Icon */}
                  <div className="relative flex flex-col items-center gap-4">
                    <div
                      className={`flex items-center justify-center rounded-xl ${
                        isDarkMode ? "bg-white/5" : "bg-zinc-50"
                      }`}
                      style={{
                        width: selectedSize + 24,
                        height: selectedSize + 24,
                        boxShadow: `0 0 30px ${color}20`,
                      }}
                    >
                      <Icon
                        size={selectedSize}
                        color={color}
                        isAnimating={isAnimating}
                      />
                    </div>

                    {/* Label */}
                    <div className="text-center">
                      <h3 className={`font-semibold text-sm ${isDarkMode ? "text-white" : "text-zinc-900"}`}>
                        {name}
                      </h3>
                      <p className={`text-xs mt-0.5 ${isDarkMode ? "text-white/50" : "text-zinc-500"}`}>
                        {description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* App Icons Tab */}
        {activeTab === "apps" && (
          <div className="space-y-8">
            {appIconGroups.map(({ app, color, description, icons }) => (
              <div key={app} className={`p-6 rounded-2xl ${isDarkMode ? "bg-white/5 border border-white/10" : "bg-white border border-zinc-200"}`}>
                {/* App Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-zinc-900"}`}>
                    {app}
                  </h2>
                  <span className={`text-sm ${isDarkMode ? "text-white/50" : "text-zinc-500"}`}>
                    {description}
                  </span>
                </div>

                {/* Icons Row */}
                <div className="flex flex-wrap gap-4">
                  {icons.map(({ name, component: Icon, description: iconDesc }) => (
                    <div
                      key={name}
                      className={`group relative p-4 rounded-xl transition-all hover:scale-[1.02] ${
                        isDarkMode
                          ? "bg-white/5 hover:bg-white/10"
                          : "bg-zinc-50 hover:bg-zinc-100"
                      }`}
                    >
                      {/* Glow effect on hover */}
                      <div
                        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity blur-lg"
                        style={{ backgroundColor: color }}
                      />

                      {/* Icon */}
                      <div className="relative flex flex-col items-center gap-3">
                        <div
                          className="flex items-center justify-center"
                          style={{
                            width: selectedSize + 16,
                            height: selectedSize + 16,
                          }}
                        >
                          <Icon
                            size={selectedSize}
                            color={color}
                            isAnimating={isAnimating}
                          />
                        </div>

                        {/* Label */}
                        <div className="text-center">
                          <h3 className={`font-semibold text-sm ${isDarkMode ? "text-white" : "text-zinc-900"}`}>
                            {name}
                          </h3>
                          <p className={`text-xs mt-0.5 ${isDarkMode ? "text-white/40" : "text-zinc-500"}`}>
                            {iconDesc}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Usage Example */}
        <div className={`mt-12 p-6 rounded-2xl ${isDarkMode ? "bg-white/5 border border-white/10" : "bg-white border border-zinc-200"}`}>
          <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-zinc-900"}`}>
            Usage Example
          </h2>
          <pre className={`p-4 rounded-lg overflow-x-auto text-sm ${isDarkMode ? "bg-black/40" : "bg-zinc-100"}`}>
            <code className={isDarkMode ? "text-emerald-400" : "text-emerald-600"}>
{`import {
  AIBrainIcon,
  MainDashboardIcon,
  TodoCheckIcon,
  FitDumbbellIcon
} from "@ainexsuite/ui";

// Use individual icons with customization
<AIBrainIcon size={32} color="#8b5cf6" isAnimating={true} />
<MainDashboardIcon size={32} color="#f97316" isAnimating={true} />
<TodoCheckIcon size={32} color="#8b5cf6" isAnimating={true} />
<FitDumbbellIcon size={32} color="#3b82f6" isAnimating={true} />`}
            </code>
          </pre>
        </div>

        {/* Feature List */}
        <div className={`mt-8 p-6 rounded-2xl ${isDarkMode ? "bg-white/5 border border-white/10" : "bg-white border border-zinc-200"}`}>
          <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-zinc-900"}`}>
            Features
          </h2>
          <ul className={`grid md:grid-cols-2 gap-3 ${isDarkMode ? "text-white/70" : "text-zinc-600"}`}>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-500" />
              Built with Framer Motion for smooth 60fps animations
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              Fully customizable size and color props
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Toggle animations on/off with isAnimating prop
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              TypeScript support with full type definitions
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Server component compatible (use client boundary)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              App-specific icons match each app&apos;s brand color
            </li>
          </ul>
        </div>

        {/* Summary Stats */}
        <div className={`mt-8 grid grid-cols-2 md:grid-cols-4 gap-4`}>
          <div className={`p-4 rounded-xl text-center ${isDarkMode ? "bg-white/5" : "bg-white border border-zinc-200"}`}>
            <div className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-zinc-900"}`}>150</div>
            <div className={`text-sm ${isDarkMode ? "text-white/50" : "text-zinc-500"}`}>Total Icons</div>
          </div>
          <div className={`p-4 rounded-xl text-center ${isDarkMode ? "bg-white/5" : "bg-white border border-zinc-200"}`}>
            <div className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-zinc-900"}`}>20</div>
            <div className={`text-sm ${isDarkMode ? "text-white/50" : "text-zinc-500"}`}>AI Icons</div>
          </div>
          <div className={`p-4 rounded-xl text-center ${isDarkMode ? "bg-white/5" : "bg-white border border-zinc-200"}`}>
            <div className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-zinc-900"}`}>13</div>
            <div className={`text-sm ${isDarkMode ? "text-white/50" : "text-zinc-500"}`}>Apps Covered</div>
          </div>
          <div className={`p-4 rounded-xl text-center ${isDarkMode ? "bg-white/5" : "bg-white border border-zinc-200"}`}>
            <div className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-zinc-900"}`}>130</div>
            <div className={`text-sm ${isDarkMode ? "text-white/50" : "text-zinc-500"}`}>App Icons</div>
          </div>
        </div>
      </div>
    </div>
  );
}
