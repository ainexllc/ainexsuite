// Mock note data for card sizing mockups

export type MockNote = {
  id: string;
  title?: string;
  body?: string;
  type: "note" | "checklist";
  checklist?: { id: string; text: string; completed: boolean }[];
  color: string;
  pinned: boolean;
  hasImage?: boolean;
};

export const MOCK_NOTES: MockNote[] = [
  // Favorites (pinned)
  {
    id: "fav-1",
    title: "Project Roadmap Q1",
    body: "Focus areas for the quarter:\n\n1. Launch new dashboard redesign\n2. Implement real-time collaboration\n3. Mobile app beta release\n4. Performance optimization sprint\n\nKey metrics to track: DAU, session duration, feature adoption rates.",
    type: "note",
    color: "note-sky",
    pinned: true,
  },
  {
    id: "fav-2",
    title: "Launch Checklist",
    type: "checklist",
    checklist: [
      { id: "1", text: "Finalize marketing copy", completed: true },
      { id: "2", text: "QA sign-off on all features", completed: true },
      { id: "3", text: "Load testing complete", completed: true },
      { id: "4", text: "Documentation updated", completed: false },
      { id: "5", text: "Stakeholder demo", completed: false },
      { id: "6", text: "Press release drafted", completed: false },
      { id: "7", text: "Social media scheduled", completed: false },
      { id: "8", text: "Support team briefed", completed: false },
    ],
    color: "note-mint",
    pinned: true,
  },

  // Short notes
  {
    id: "short-1",
    body: "Call mom back",
    type: "note",
    color: "default",
    pinned: false,
  },
  {
    id: "short-2",
    title: "API Key",
    body: "sk-proj-abc123...",
    type: "note",
    color: "note-coal",
    pinned: false,
  },
  {
    id: "short-3",
    type: "checklist",
    checklist: [
      { id: "1", text: "Buy milk", completed: false },
      { id: "2", text: "Pick up dry cleaning", completed: true },
    ],
    color: "note-lemon",
    pinned: false,
  },

  // Medium notes
  {
    id: "med-1",
    title: "Meeting Notes",
    body: "Discussed the new feature rollout timeline. Team agreed on phased approach starting next month. Need to follow up with design team about updated mockups.",
    type: "note",
    color: "note-lavender",
    pinned: false,
  },
  {
    id: "med-2",
    title: "Recipe Ideas",
    body: "Thai basil chicken\nMiso glazed salmon\nMushroom risotto\nLemon herb roasted chicken",
    type: "note",
    color: "note-peach",
    pinned: false,
  },
  {
    id: "med-3",
    title: "Weekly Goals",
    type: "checklist",
    checklist: [
      { id: "1", text: "Complete code review", completed: true },
      { id: "2", text: "Update documentation", completed: true },
      { id: "3", text: "Team standup presentation", completed: false },
      { id: "4", text: "Review PRs", completed: false },
      { id: "5", text: "1:1 with manager", completed: false },
    ],
    color: "note-fog",
    pinned: false,
  },

  // Long notes
  {
    id: "long-1",
    title: "Product Strategy 2024",
    body: "Our vision for the coming year centers on three pillars:\n\nUser Experience: Simplify core workflows, reduce clicks by 40%, introduce AI-powered suggestions.\n\nScalability: Migrate to edge computing, implement smart caching, optimize database queries.\n\nGrowth: Expand to 3 new markets, launch enterprise tier, build partner ecosystem.\n\nSuccess metrics include NPS improvement, revenue growth, and technical performance benchmarks.",
    type: "note",
    color: "note-sky",
    pinned: false,
  },
  {
    id: "long-2",
    title: "Sprint Planning",
    type: "checklist",
    checklist: [
      { id: "1", text: "User authentication refactor", completed: true },
      { id: "2", text: "Dashboard performance optimization", completed: true },
      { id: "3", text: "New onboarding flow", completed: true },
      { id: "4", text: "API rate limiting", completed: false },
      { id: "5", text: "Mobile responsive fixes", completed: false },
      { id: "6", text: "Accessibility audit", completed: false },
      { id: "7", text: "Analytics integration", completed: false },
      { id: "8", text: "Error handling improvements", completed: false },
      { id: "9", text: "Unit test coverage", completed: false },
      { id: "10", text: "Documentation updates", completed: false },
      { id: "11", text: "Security review", completed: false },
      { id: "12", text: "Performance benchmarks", completed: false },
    ],
    color: "note-moss",
    pinned: false,
  },
  {
    id: "long-3",
    title: "Book Notes: Atomic Habits",
    body: "Key takeaways:\n\n• 1% better every day = 37x better in a year\n• Habits are the compound interest of self-improvement\n• Focus on systems, not goals\n• Identity-based habits: 'I am the type of person who...'\n• Make it obvious, attractive, easy, satisfying\n• Environment design matters more than motivation\n• Never miss twice - get back on track immediately",
    type: "note",
    color: "note-tangerine",
    pinned: false,
    hasImage: true,
  },

  // With images
  {
    id: "img-1",
    title: "Design Inspiration",
    body: "Clean minimalist approach with subtle gradients",
    type: "note",
    color: "note-blush",
    pinned: false,
    hasImage: true,
  },
  {
    id: "img-2",
    title: "Vacation Planning",
    body: "Portugal trip in September. Check flights and Airbnb options.",
    type: "note",
    color: "note-sky",
    pinned: false,
    hasImage: true,
  },
];

// Helper to get content size category
export function getContentSize(note: MockNote): "tiny" | "small" | "medium" | "large" {
  // Notes with images are always large
  if (note.hasImage) return "large";

  if (note.type === "checklist") {
    const count = note.checklist?.length || 0;
    if (count <= 2) return "small"; // 140px
    if (count <= 5) return "medium"; // 200px
    return "large"; // 260px (6+ items)
  }

  // Regular notes
  const textLength = (note.title?.length || 0) + (note.body?.length || 0);
  if (!note.title && textLength < 30) return "tiny"; // 100px
  if (textLength < 100) return "small"; // 140px
  if (textLength < 250) return "medium"; // 200px
  return "large"; // 260px
}

// Color mappings for Tailwind classes
export const COLOR_CLASSES: Record<string, { bg: string; border: string }> = {
  default: { bg: "bg-white dark:bg-zinc-800", border: "border-zinc-200 dark:border-zinc-700" },
  "note-sky": { bg: "bg-blue-50 dark:bg-blue-950/50", border: "border-blue-200 dark:border-blue-800" },
  "note-mint": { bg: "bg-green-50 dark:bg-green-950/50", border: "border-green-200 dark:border-green-800" },
  "note-lemon": { bg: "bg-yellow-50 dark:bg-yellow-950/50", border: "border-yellow-200 dark:border-yellow-800" },
  "note-peach": { bg: "bg-orange-50 dark:bg-orange-950/50", border: "border-orange-200 dark:border-orange-800" },
  "note-lavender": { bg: "bg-purple-50 dark:bg-purple-950/50", border: "border-purple-200 dark:border-purple-800" },
  "note-blush": { bg: "bg-pink-50 dark:bg-pink-950/50", border: "border-pink-200 dark:border-pink-800" },
  "note-fog": { bg: "bg-slate-100 dark:bg-slate-800/50", border: "border-slate-200 dark:border-slate-700" },
  "note-coal": { bg: "bg-zinc-200 dark:bg-zinc-900", border: "border-zinc-300 dark:border-zinc-600" },
  "note-moss": { bg: "bg-emerald-50 dark:bg-emerald-950/50", border: "border-emerald-200 dark:border-emerald-800" },
  "note-tangerine": { bg: "bg-amber-50 dark:bg-amber-950/50", border: "border-amber-200 dark:border-amber-800" },
};
