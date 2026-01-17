'use client';

import { useState } from 'react';
import {
  Plus,
  Search,
  List,
  Trash2,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Pin,
  Tag,
  Archive,
  FolderOpen,
  Copy,
  Star,
  Settings,
  // Analytics & Insights icons
  BarChart3,
  TrendingUp,
  LineChart,
  PieChart,
  Activity,
  CalendarDays,
  Flame,
  Grid3X3,
  // Content Analysis icons
  Heart,
  Palette,
  FileText,
  Key,
  ScanSearch,
  Files,
  // Smart Suggestions icons
  Wand2,
  Link,
  Lightbulb,
  ListOrdered,
  FolderCog,
  // Batch Operations icons
  RefreshCw,
  Tags,
  Sparkles,
  // Writing Assistance icons
  Pencil,
  Maximize2,
  Minimize2,
  Languages,
  AlignLeft,
  // Knowledge Graph icons
  Network,
  Boxes,
  Eye,
  // Planning Tools icons
  Clock,
  Calendar,
  Bell,
  // Wellness Insights icons
  Brain,
  HeartPulse,
  Leaf,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { type ToolCall } from '@/lib/ai/chat-service';

interface ToolCallCardProps {
  toolCall: ToolCall;
}

const toolIcons: Record<string, typeof Plus> = {
  // Core note operations
  createNote: Plus,
  searchNotes: Search,
  listNotes: List,
  deleteNote: Trash2,
  pinNote: Pin,
  unpinNote: Pin,
  listFavorites: Star,
  addLabelToNote: Tag,
  removeLabelFromNote: Tag,
  listLabels: Tag,
  listNotesByLabel: Tag,
  archiveNote: Archive,
  unarchiveNote: Archive,
  listArchivedNotes: Archive,
  moveNoteToSpace: FolderOpen,
  duplicateNote: Copy,
  listSpaces: FolderOpen,
  getCurrentSpace: FolderOpen,
  getUserContext: Settings,
  updateNote: Plus,
  changeNoteColor: Palette,
  setNotePriority: ListOrdered,
  advancedSearch: Search,
  toggleChecklistItem: CheckCircle2,
  addChecklistItem: Plus,
  updateChecklistItem: Plus,
  removeChecklistItem: Trash2,
  toggleAllChecklistItems: CheckCircle2,
  listTrashedNotes: Trash2,
  restoreFromTrash: Archive,
  emptyTrash: Trash2,

  // Analytics & Insights (8 tools)
  getNoteStatistics: BarChart3,
  getProductivityInsights: TrendingUp,
  getActivityTrends: LineChart,
  getChecklistProgress: Activity,
  getLabelAnalytics: PieChart,
  getSpaceComparison: Grid3X3,
  getWeeklyDigest: CalendarDays,
  getActivityHeatmap: Flame,

  // Content Analysis (6 tools)
  analyzeNoteSentiment: Heart,
  extractThemes: Palette,
  generateSummary: FileText,
  findSimilarNotes: ScanSearch,
  extractKeywords: Key,
  detectDuplicates: Files,

  // Smart Suggestions (5 tools)
  suggestLabels: Wand2,
  predictPriority: ListOrdered,
  suggestRelatedNotes: Link,
  suggestNextActions: Lightbulb,
  suggestOrganization: FolderCog,

  // Batch Operations (5 tools)
  bulkUpdateNotes: RefreshCw,
  bulkArchive: Archive,
  bulkDelete: Trash2,
  bulkLabel: Tags,
  autoOrganize: Sparkles,

  // Writing Assistance (5 tools)
  enhanceNote: Pencil,
  expandNote: Maximize2,
  condenseNote: Minimize2,
  formatNote: AlignLeft,
  translateNote: Languages,

  // Knowledge Graph (3 tools)
  getKnowledgeGraph: Network,
  getTopicClusters: Boxes,
  discoverInsights: Eye,

  // Planning Tools (3 tools)
  setDeadline: Clock,
  getUpcomingDeadlines: Calendar,
  createReminder: Bell,

  // Wellness Insights (3 tools)
  getMoodTrends: HeartPulse,
  getEmotionalInsights: Brain,
  getWellnessRecommendations: Leaf,
};

const toolLabels: Record<string, string> = {
  // Core note operations
  createNote: 'Created note',
  searchNotes: 'Searched notes',
  listNotes: 'Listed notes',
  deleteNote: 'Deleted note',
  pinNote: 'Pinned note',
  unpinNote: 'Unpinned note',
  listFavorites: 'Listed favorites',
  addLabelToNote: 'Added label',
  removeLabelFromNote: 'Removed label',
  listLabels: 'Listed labels',
  listNotesByLabel: 'Notes by label',
  archiveNote: 'Archived note',
  unarchiveNote: 'Unarchived note',
  listArchivedNotes: 'Listed archived',
  moveNoteToSpace: 'Moved note',
  duplicateNote: 'Duplicated note',
  listSpaces: 'Listed spaces',
  getCurrentSpace: 'Current space',
  getUserContext: 'Checked context',
  updateNote: 'Updated note',
  changeNoteColor: 'Changed color',
  setNotePriority: 'Set priority',
  advancedSearch: 'Advanced search',
  toggleChecklistItem: 'Toggled item',
  addChecklistItem: 'Added item',
  updateChecklistItem: 'Updated item',
  removeChecklistItem: 'Removed item',
  toggleAllChecklistItems: 'Toggled all',
  listTrashedNotes: 'Listed trash',
  restoreFromTrash: 'Restored note',
  emptyTrash: 'Emptied trash',

  // Analytics & Insights
  getNoteStatistics: 'Note statistics',
  getProductivityInsights: 'Productivity insights',
  getActivityTrends: 'Activity trends',
  getChecklistProgress: 'Checklist progress',
  getLabelAnalytics: 'Label analytics',
  getSpaceComparison: 'Space comparison',
  getWeeklyDigest: 'Weekly digest',
  getActivityHeatmap: 'Activity heatmap',

  // Content Analysis
  analyzeNoteSentiment: 'Sentiment analysis',
  extractThemes: 'Extracted themes',
  generateSummary: 'Generated summary',
  findSimilarNotes: 'Similar notes',
  extractKeywords: 'Extracted keywords',
  detectDuplicates: 'Duplicate detection',

  // Smart Suggestions
  suggestLabels: 'Label suggestions',
  predictPriority: 'Priority prediction',
  suggestRelatedNotes: 'Related notes',
  suggestNextActions: 'Next actions',
  suggestOrganization: 'Organization tips',

  // Batch Operations
  bulkUpdateNotes: 'Bulk update',
  bulkArchive: 'Bulk archive',
  bulkDelete: 'Bulk delete',
  bulkLabel: 'Bulk label',
  autoOrganize: 'Auto-organize',

  // Writing Assistance
  enhanceNote: 'Enhanced note',
  expandNote: 'Expanded note',
  condenseNote: 'Condensed note',
  formatNote: 'Formatted note',
  translateNote: 'Translated note',

  // Knowledge Graph
  getKnowledgeGraph: 'Knowledge graph',
  getTopicClusters: 'Topic clusters',
  discoverInsights: 'Discovered insights',

  // Planning Tools
  setDeadline: 'Set deadline',
  getUpcomingDeadlines: 'Upcoming deadlines',
  createReminder: 'Created reminder',

  // Wellness Insights
  getMoodTrends: 'Mood trends',
  getEmotionalInsights: 'Emotional insights',
  getWellnessRecommendations: 'Wellness tips',
};

function getResultSummary(name: string, result?: string): { text: string; success: boolean } {
  if (!result) {
    return { text: 'Processing...', success: true };
  }

  try {
    const parsed = JSON.parse(result);

    if (!parsed.success) {
      return { text: parsed.message || 'Action failed', success: false };
    }

    switch (name) {
      // Core note operations
      case 'createNote':
        return { text: parsed.message || 'Note created', success: true };
      case 'searchNotes':
      case 'advancedSearch':
        return {
          text: `Found ${parsed.count} note${parsed.count !== 1 ? 's' : ''}`,
          success: true,
        };
      case 'listNotes':
      case 'listFavorites':
      case 'listArchivedNotes':
      case 'listTrashedNotes':
      case 'listNotesByLabel':
        return {
          text: `${parsed.count} note${parsed.count !== 1 ? 's' : ''}`,
          success: true,
        };
      case 'listSpaces':
        return {
          text: `${parsed.count || parsed.spaces?.length || 0} space${(parsed.count || parsed.spaces?.length) !== 1 ? 's' : ''}`,
          success: true,
        };
      case 'getUserContext':
        return {
          text: parsed.hasMultipleSpaces
            ? `${parsed.spaceCount} spaces available`
            : 'Personal space',
          success: true,
        };
      case 'listLabels':
        return {
          text: `${parsed.count || parsed.labels?.length || 0} label${(parsed.count || parsed.labels?.length) !== 1 ? 's' : ''}`,
          success: true,
        };
      case 'deleteNote':
      case 'pinNote':
      case 'unpinNote':
      case 'archiveNote':
      case 'unarchiveNote':
      case 'moveNoteToSpace':
      case 'duplicateNote':
      case 'updateNote':
      case 'changeNoteColor':
      case 'setNotePriority':
      case 'restoreFromTrash':
      case 'emptyTrash':
        return { text: parsed.message || 'Done', success: true };

      // Analytics & Insights
      case 'getNoteStatistics':
        return {
          text: `${parsed.statistics?.totalNotes || 0} notes analyzed`,
          success: true,
        };
      case 'getProductivityInsights':
        return {
          text: parsed.writingStreak
            ? `${parsed.writingStreak}-day streak`
            : 'Insights ready',
          success: true,
        };
      case 'getActivityTrends':
        return {
          text: parsed.trend
            ? `Trending ${parsed.trend}`
            : 'Trends analyzed',
          success: true,
        };
      case 'getChecklistProgress':
        return {
          text: `${parsed.completionRate || 0}% complete`,
          success: true,
        };
      case 'getLabelAnalytics':
        return {
          text: `${parsed.labels?.length || 0} labels analyzed`,
          success: true,
        };
      case 'getSpaceComparison':
        return {
          text: `${parsed.spaces?.length || 0} spaces compared`,
          success: true,
        };
      case 'getWeeklyDigest':
        return {
          text: `${parsed.notesCreated || 0} notes this week`,
          success: true,
        };
      case 'getActivityHeatmap':
        return { text: 'Heatmap generated', success: true };

      // Content Analysis
      case 'analyzeNoteSentiment':
        return {
          text: parsed.overallSentiment
            ? `Overall: ${parsed.overallSentiment}`
            : 'Sentiment analyzed',
          success: true,
        };
      case 'extractThemes':
        return {
          text: `${parsed.themes?.length || 0} themes found`,
          success: true,
        };
      case 'generateSummary':
        return { text: 'Summary generated', success: true };
      case 'findSimilarNotes':
        return {
          text: `${parsed.similarNotes?.length || 0} similar notes`,
          success: true,
        };
      case 'extractKeywords':
        return {
          text: `${parsed.keywords?.length || 0} keywords found`,
          success: true,
        };
      case 'detectDuplicates':
        return {
          text: `${parsed.duplicates?.length || 0} duplicates found`,
          success: true,
        };

      // Smart Suggestions
      case 'suggestLabels':
        return {
          text: `${parsed.suggestions?.length || 0} suggestions`,
          success: true,
        };
      case 'predictPriority':
        return {
          text: parsed.suggestedPriority
            ? `Suggested: ${parsed.suggestedPriority}`
            : 'Priority predicted',
          success: true,
        };
      case 'suggestRelatedNotes':
        return {
          text: `${parsed.relatedNotes?.length || 0} related notes`,
          success: true,
        };
      case 'suggestNextActions':
        return {
          text: `${parsed.actions?.length || 0} actions suggested`,
          success: true,
        };
      case 'suggestOrganization':
        return {
          text: `${parsed.tips?.length || 0} tips generated`,
          success: true,
        };

      // Batch Operations
      case 'bulkUpdateNotes':
      case 'bulkArchive':
      case 'bulkDelete':
      case 'bulkLabel':
        return {
          text: `${parsed.affectedCount || parsed.affected || 0} notes affected`,
          success: true,
        };
      case 'autoOrganize':
        return {
          text: parsed.preview
            ? `Preview: ${parsed.changes?.length || 0} changes`
            : `${parsed.organized || 0} notes organized`,
          success: true,
        };

      // Writing Assistance
      case 'enhanceNote':
        return { text: 'Note enhanced', success: true };
      case 'expandNote':
        return { text: 'Content expanded', success: true };
      case 'condenseNote':
        return { text: 'Content condensed', success: true };
      case 'formatNote':
        return { text: 'Note formatted', success: true };
      case 'translateNote':
        return {
          text: parsed.targetLanguage
            ? `Translated to ${parsed.targetLanguage}`
            : 'Note translated',
          success: true,
        };

      // Knowledge Graph
      case 'getKnowledgeGraph':
        return {
          text: `${parsed.nodes?.length || 0} nodes, ${parsed.edges?.length || 0} connections`,
          success: true,
        };
      case 'getTopicClusters':
        return {
          text: `${parsed.clusters?.length || 0} clusters found`,
          success: true,
        };
      case 'discoverInsights':
        return {
          text: `${parsed.insights?.length || 0} insights discovered`,
          success: true,
        };

      // Planning Tools
      case 'setDeadline':
        return { text: parsed.message || 'Deadline set', success: true };
      case 'getUpcomingDeadlines':
        return {
          text: `${parsed.deadlines?.length || 0} upcoming`,
          success: true,
        };
      case 'createReminder':
        return { text: parsed.message || 'Reminder created', success: true };

      // Wellness Insights
      case 'getMoodTrends':
        return {
          text: parsed.overallTrend
            ? `Trend: ${parsed.overallTrend}`
            : 'Mood analyzed',
          success: true,
        };
      case 'getEmotionalInsights':
        return {
          text: parsed.currentMood?.description
            ? parsed.currentMood.description.slice(0, 30)
            : 'Insights ready',
          success: true,
        };
      case 'getWellnessRecommendations':
        return {
          text: parsed.wellnessScore !== undefined
            ? `Score: ${parsed.wellnessScore}/100`
            : `${parsed.recommendations?.length || 0} tips`,
          success: true,
        };

      default:
        return { text: parsed.message || 'Completed', success: true };
    }
  } catch {
    return { text: 'Completed', success: true };
  }
}

export function ToolCallCard({ toolCall }: ToolCallCardProps) {
  const [expanded, setExpanded] = useState(true); // Always show expanded by default
  const Icon = toolIcons[toolCall.name] || Plus;
  const label = toolLabels[toolCall.name] || toolCall.name;
  const { text: summary, success } = getResultSummary(toolCall.name, toolCall.result);

  let resultData: {
    notes?: Array<{ title: string; preview?: string; color?: string; type?: string }>;
    spaces?: Array<{ name: string; id: string; type?: string }>;
    labels?: Array<{ name: string; id: string; color?: string }>;
    spaceNames?: string[];
  } | null = null;
  try {
    if (toolCall.result) {
      resultData = JSON.parse(toolCall.result);
    }
  } catch {
    resultData = null;
  }

  const hasNotes = resultData?.notes && Array.isArray(resultData.notes) && resultData.notes.length > 0;
  const hasSpaces = resultData?.spaces && Array.isArray(resultData.spaces) && resultData.spaces.length > 0;
  const hasLabels = resultData?.labels && Array.isArray(resultData.labels) && resultData.labels.length > 0;
  const hasDetails = hasNotes || hasSpaces || hasLabels;

  return (
    <div
      className={cn(
        'rounded-xl border overflow-hidden',
        success
          ? 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700'
          : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50'
      )}
    >
      <button
        onClick={() => hasDetails && setExpanded(!expanded)}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors',
          hasDetails && 'hover:bg-zinc-100 dark:hover:bg-zinc-700/50 cursor-pointer'
        )}
        disabled={!hasDetails}
      >
        {/* Icon */}
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
            success
              ? 'bg-orange-100 dark:bg-orange-500/20'
              : 'bg-red-100 dark:bg-red-900/50'
          )}
        >
          <Icon
            className={cn(
              'w-4 h-4',
              success ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'
            )}
          />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <span
            className={cn(
              'text-sm font-medium',
              success ? 'text-zinc-900 dark:text-zinc-100' : 'text-red-700 dark:text-red-300'
            )}
          >
            {label}
          </span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400 ml-2">{summary}</span>
        </div>

        {/* Status icon */}
        {success ? (
          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
        ) : (
          <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
        )}

        {/* Expand icon */}
        {hasDetails && (
          <ChevronDown
            className={cn(
              'w-4 h-4 text-zinc-400 transition-transform flex-shrink-0',
              expanded && 'rotate-180'
            )}
          />
        )}
      </button>

      {/* Expanded details - always shown when there are details */}
      {expanded && hasDetails && (
        <div className="px-3 pb-3 border-t border-zinc-200 dark:border-zinc-700">
          <div className="pt-2 space-y-1.5">
            {/* Notes list */}
            {hasNotes &&
              resultData?.notes?.slice(0, 8).map((note, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-100 truncate">
                      {note.title || 'Untitled'}
                    </div>
                    {note.preview && (
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                        {note.preview}
                      </div>
                    )}
                  </div>
                  {note.type === 'checklist' && (
                    <span className="text-[10px] font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 px-1.5 py-0.5 rounded">
                      Checklist
                    </span>
                  )}
                </div>
              ))}
            {hasNotes && resultData?.notes && resultData.notes.length > 8 && (
              <div className="text-xs text-zinc-500 dark:text-zinc-400 pl-3 pt-1">
                +{resultData.notes.length - 8} more notes
              </div>
            )}

            {/* Spaces list */}
            {hasSpaces &&
              resultData?.spaces?.slice(0, 6).map((space, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700"
                >
                  <FolderOpen className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                    {space.name}
                  </span>
                  {space.type && space.type !== 'personal' && (
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-700 px-1.5 py-0.5 rounded capitalize">
                      {space.type}
                    </span>
                  )}
                </div>
              ))}

            {/* Labels list */}
            {hasLabels &&
              resultData?.labels?.slice(0, 6).map((labelItem, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700"
                >
                  <Tag className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                    {labelItem.name}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
