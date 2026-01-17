import { db } from '@ainexsuite/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import type { Note, NoteColor, NotePriority, ChecklistItem } from './notes-service';
import { listLabels } from './notes-service';

// ============================================
// TYPES
// ============================================

export interface KnowledgeNode {
  id: string;
  title: string;
  type: 'text' | 'checklist';
  connections: number;
  color?: NoteColor;
  priority?: NotePriority;
  labels?: string[];
  excerpt?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeEdge {
  from: string;
  to: string;
  relationship: 'similar_content' | 'shared_labels' | 'temporal' | 'linked' | 'same_topic';
  strength: number; // 0-1 scale
  reason?: string;
}

export interface TopicCluster {
  topic: string;
  keywords: string[];
  notes: Array<{ id: string; title: string; relevance: number }>;
  suggestedLabel?: string;
  noteCount: number;
}

export interface KnowledgeGraph {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  clusters: TopicCluster[];
  totalNotes: number;
  totalConnections: number;
}

export interface DiscoveredInsights {
  patterns: Array<{
    type: 'writing_habit' | 'topic_trend' | 'organization' | 'productivity';
    description: string;
    metric?: string;
    recommendation?: string;
  }>;
  forgottenNotes: Array<{
    id: string;
    title: string;
    lastUpdated: Date;
    daysSinceUpdate: number;
    hasUnfinishedTasks?: boolean;
  }>;
  unusualConnections: Array<{
    noteA: { id: string; title: string };
    noteB: { id: string; title: string };
    sharedConcept: string;
    surprise: number; // How unexpected this connection is (0-1)
  }>;
  recommendations: string[];
}

// ============================================
// HELPERS
// ============================================

function mapNoteDoc(docSnapshot: { id: string; data: () => Record<string, unknown> }): Note {
  const data = docSnapshot.data();
  return {
    id: docSnapshot.id,
    ownerId: (data.ownerId as string) || '',
    spaceId: (data.spaceId as string) || 'personal',
    title: (data.title as string) || '',
    body: (data.body as string) || '',
    type: (data.type as 'text' | 'checklist') || 'text',
    checklist: (data.checklist as ChecklistItem[]) || [],
    color: (data.color as NoteColor) || 'default',
    pinned: (data.pinned as boolean) || false,
    archived: (data.archived as boolean) || false,
    priority: (data.priority as NotePriority) || null,
    labelIds: (data.labelIds as string[]) || [],
    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
    deletedAt: (data.deletedAt as Timestamp)?.toDate() || null,
  };
}

async function getAllActiveNotes(userId: string, spaceId?: string): Promise<Note[]> {
  const notesRef = collection(db, 'users', userId, 'notes');
  let q;

  if (spaceId) {
    q = query(
      notesRef,
      where('spaceId', '==', spaceId),
      orderBy('updatedAt', 'desc'),
      limit(200)
    );
  } else {
    q = query(notesRef, orderBy('updatedAt', 'desc'), limit(200));
  }

  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => mapNoteDoc({ id: doc.id, data: () => doc.data() }))
    .filter((note) => !note.deletedAt && !note.archived);
}

/**
 * Extract keywords from text using simple tokenization and stop word filtering
 */
function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
    'shall', 'can', 'need', 'it', 'its', 'this', 'that', 'these', 'those', 'i', 'me',
    'my', 'we', 'our', 'you', 'your', 'he', 'she', 'they', 'them', 'their', 'what',
    'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both',
    'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not', 'only', 'own', 'same',
    'so', 'than', 'too', 'very', 'just', 'also', 'now', 'here', 'there', 'then', 'if',
  ]);

  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));

  // Count word frequency
  const wordCounts: Record<string, number> = {};
  words.forEach((word) => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });

  // Return top keywords sorted by frequency
  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

/**
 * Calculate text similarity using Jaccard index on word sets
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = new Set(extractKeywords(text1));
  const words2 = new Set(extractKeywords(text2));

  if (words1.size === 0 || words2.size === 0) return 0;

  const intersection = new Set([...words1].filter((w) => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Calculate how many labels two notes share
 */
function calculateLabelOverlap(labels1: string[], labels2: string[]): number {
  if (labels1.length === 0 || labels2.length === 0) return 0;

  const set1 = new Set(labels1);
  const shared = labels2.filter((l) => set1.has(l)).length;
  const total = new Set([...labels1, ...labels2]).size;

  return shared / total;
}

/**
 * Calculate temporal proximity (notes created/updated close together)
 */
function calculateTemporalProximity(date1: Date, date2: Date): number {
  const diffMs = Math.abs(date1.getTime() - date2.getTime());
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  // Decay function: 1 for same day, approaches 0 for distant dates
  return Math.exp(-diffDays / 7); // Half-life of about 5 days
}

// ============================================
// MAIN FUNCTIONS
// ============================================

/**
 * Get knowledge graph showing note connections
 * @param userId - The user ID
 * @param spaceId - Optional space ID to filter notes
 * @param centerNoteId - Optional note ID to center the graph around
 * @param depth - How many connection hops to include (1-3, default 2)
 */
export async function getKnowledgeGraph(
  userId: string,
  spaceId?: string,
  centerNoteId?: string,
  depth: number = 2
): Promise<KnowledgeGraph> {
  const notes = await getAllActiveNotes(userId, spaceId);
  const labels = await listLabels(userId);
  const labelMap = new Map(labels.map((l) => [l.id, l.name]));

  // Build nodes
  const nodes: KnowledgeNode[] = notes.map((note) => ({
    id: note.id,
    title: note.title,
    type: note.type,
    connections: 0, // Will be calculated
    color: note.color,
    priority: note.priority,
    labels: note.labelIds.map((id) => labelMap.get(id) || id),
    excerpt: note.body.slice(0, 100) + (note.body.length > 100 ? '...' : ''),
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  }));

  // Build edges by analyzing relationships
  const edges: KnowledgeEdge[] = [];
  const connectionCounts: Record<string, number> = {};

  for (let i = 0; i < notes.length; i++) {
    for (let j = i + 1; j < notes.length; j++) {
      const noteA = notes[i];
      const noteB = notes[j];

      // Calculate various relationship strengths
      const contentA = `${noteA.title} ${noteA.body}`;
      const contentB = `${noteB.title} ${noteB.body}`;

      // Content similarity
      const contentSimilarity = calculateTextSimilarity(contentA, contentB);
      if (contentSimilarity > 0.2) {
        edges.push({
          from: noteA.id,
          to: noteB.id,
          relationship: 'similar_content',
          strength: contentSimilarity,
          reason: 'Similar topics and keywords',
        });
        connectionCounts[noteA.id] = (connectionCounts[noteA.id] || 0) + 1;
        connectionCounts[noteB.id] = (connectionCounts[noteB.id] || 0) + 1;
      }

      // Shared labels
      const labelOverlap = calculateLabelOverlap(noteA.labelIds, noteB.labelIds);
      if (labelOverlap > 0) {
        edges.push({
          from: noteA.id,
          to: noteB.id,
          relationship: 'shared_labels',
          strength: labelOverlap,
          reason: 'Share common labels',
        });
        connectionCounts[noteA.id] = (connectionCounts[noteA.id] || 0) + 1;
        connectionCounts[noteB.id] = (connectionCounts[noteB.id] || 0) + 1;
      }

      // Temporal proximity
      const temporalProximity = calculateTemporalProximity(noteA.createdAt, noteB.createdAt);
      if (temporalProximity > 0.5) {
        edges.push({
          from: noteA.id,
          to: noteB.id,
          relationship: 'temporal',
          strength: temporalProximity,
          reason: 'Created around the same time',
        });
        connectionCounts[noteA.id] = (connectionCounts[noteA.id] || 0) + 1;
        connectionCounts[noteB.id] = (connectionCounts[noteB.id] || 0) + 1;
      }
    }
  }

  // Update node connection counts
  nodes.forEach((node) => {
    node.connections = connectionCounts[node.id] || 0;
  });

  // Filter to center note and depth if specified
  let filteredNodes = nodes;
  let filteredEdges = edges;

  if (centerNoteId) {
    const includedIds = new Set<string>([centerNoteId]);

    // BFS to find connected notes up to depth
    for (let d = 0; d < depth; d++) {
      const newIds = new Set<string>();
      edges.forEach((edge) => {
        if (includedIds.has(edge.from) && !includedIds.has(edge.to)) {
          newIds.add(edge.to);
        }
        if (includedIds.has(edge.to) && !includedIds.has(edge.from)) {
          newIds.add(edge.from);
        }
      });
      newIds.forEach((id) => includedIds.add(id));
    }

    filteredNodes = nodes.filter((n) => includedIds.has(n.id));
    filteredEdges = edges.filter((e) => includedIds.has(e.from) && includedIds.has(e.to));
  }

  // Generate topic clusters
  const clusters = await getTopicClusters(userId, spaceId, 5);

  return {
    nodes: filteredNodes,
    edges: filteredEdges,
    clusters: clusters.clusters,
    totalNotes: notes.length,
    totalConnections: filteredEdges.length,
  };
}

/**
 * Group notes by topic using keyword extraction and clustering
 * @param userId - The user ID
 * @param spaceId - Optional space ID to filter notes
 * @param maxClusters - Maximum number of clusters to return (default 5)
 */
export async function getTopicClusters(
  userId: string,
  spaceId?: string,
  maxClusters: number = 5
): Promise<{ clusters: TopicCluster[] }> {
  const notes = await getAllActiveNotes(userId, spaceId);

  // Extract keywords from all notes
  const noteKeywords: Map<string, Set<string>> = new Map();
  const globalKeywordCounts: Record<string, number> = {};

  notes.forEach((note) => {
    const content = `${note.title} ${note.body}`;
    const keywords = extractKeywords(content);
    noteKeywords.set(note.id, new Set(keywords));

    keywords.forEach((kw) => {
      globalKeywordCounts[kw] = (globalKeywordCounts[kw] || 0) + 1;
    });
  });

  // Find top keywords that appear in multiple notes (potential topics)
  const topicCandidates = Object.entries(globalKeywordCounts)
    .filter(([, count]) => count >= 2) // Topic should appear in at least 2 notes
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxClusters * 3); // Get more candidates than needed

  // Build clusters around top keywords
  const clusters: TopicCluster[] = [];
  const assignedNotes = new Set<string>();

  for (const [keyword] of topicCandidates) {
    if (clusters.length >= maxClusters) break;

    // Find all notes containing this keyword
    const clusterNotes: Array<{ id: string; title: string; relevance: number }> = [];
    const clusterKeywords = new Set<string>([keyword]);

    notes.forEach((note) => {
      if (assignedNotes.has(note.id)) return;

      const keywords = noteKeywords.get(note.id);
      if (keywords?.has(keyword)) {
        // Calculate relevance based on keyword presence in title
        const inTitle = note.title.toLowerCase().includes(keyword);
        const relevance = inTitle ? 1.0 : 0.7;

        clusterNotes.push({
          id: note.id,
          title: note.title,
          relevance,
        });

        // Add other keywords from this note to cluster keywords
        keywords.forEach((kw) => clusterKeywords.add(kw));
      }
    });

    if (clusterNotes.length >= 2) {
      // Mark notes as assigned
      clusterNotes.forEach((n) => assignedNotes.add(n.id));

      // Sort by relevance
      clusterNotes.sort((a, b) => b.relevance - a.relevance);

      // Generate suggested label from top keywords
      const topClusterKeywords = [...clusterKeywords]
        .filter((kw) => {
          const count = clusterNotes.filter((n) => noteKeywords.get(n.id)?.has(kw)).length;
          return count >= Math.ceil(clusterNotes.length / 2);
        })
        .slice(0, 3);

      clusters.push({
        topic: keyword.charAt(0).toUpperCase() + keyword.slice(1),
        keywords: topClusterKeywords,
        notes: clusterNotes,
        suggestedLabel: topClusterKeywords[0]?.charAt(0).toUpperCase() + topClusterKeywords[0]?.slice(1),
        noteCount: clusterNotes.length,
      });
    }
  }

  return { clusters };
}

/**
 * Discover hidden patterns, forgotten notes, and surprising connections
 * @param userId - The user ID
 * @param spaceId - Optional space ID to filter notes
 */
export async function discoverInsights(
  userId: string,
  spaceId?: string
): Promise<DiscoveredInsights> {
  const notes = await getAllActiveNotes(userId, spaceId);
  const labels = await listLabels(userId);

  const patterns: DiscoveredInsights['patterns'] = [];
  const forgottenNotes: DiscoveredInsights['forgottenNotes'] = [];
  const unusualConnections: DiscoveredInsights['unusualConnections'] = [];
  const recommendations: string[] = [];

  const now = new Date();

  // ---- Analyze writing patterns ----

  // Activity by day of week
  const dayActivity: Record<number, number> = {};
  notes.forEach((note) => {
    const day = note.createdAt.getDay();
    dayActivity[day] = (dayActivity[day] || 0) + 1;
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const mostActiveDay = Object.entries(dayActivity)
    .sort((a, b) => b[1] - a[1])[0];

  if (mostActiveDay && mostActiveDay[1] > notes.length / 7 * 1.5) {
    patterns.push({
      type: 'writing_habit',
      description: `You tend to create most notes on ${dayNames[parseInt(mostActiveDay[0])]}s`,
      metric: `${Math.round((mostActiveDay[1] / notes.length) * 100)}% of your notes`,
    });
  }

  // Check for topic trends (recent notes vs older)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentNotes = notes.filter((n) => n.createdAt >= thirtyDaysAgo);
  const olderNotes = notes.filter((n) => n.createdAt < thirtyDaysAgo);

  if (recentNotes.length >= 3 && olderNotes.length >= 3) {
    const recentKeywords = new Set<string>();
    const olderKeywords = new Set<string>();

    recentNotes.forEach((note) => {
      extractKeywords(`${note.title} ${note.body}`).forEach((kw) => recentKeywords.add(kw));
    });
    olderNotes.forEach((note) => {
      extractKeywords(`${note.title} ${note.body}`).forEach((kw) => olderKeywords.add(kw));
    });

    // Find new topics
    const newTopics = [...recentKeywords].filter((kw) => !olderKeywords.has(kw));
    if (newTopics.length > 0) {
      patterns.push({
        type: 'topic_trend',
        description: `New topics appearing in recent notes: ${newTopics.slice(0, 3).join(', ')}`,
        recommendation: 'Consider creating labels for these emerging themes',
      });
    }
  }

  // Organization patterns
  const notesWithLabels = notes.filter((n) => n.labelIds.length > 0).length;
  const labelUsagePercent = Math.round((notesWithLabels / notes.length) * 100);

  if (labelUsagePercent < 30 && labels.length > 0) {
    patterns.push({
      type: 'organization',
      description: `Only ${labelUsagePercent}% of your notes have labels`,
      metric: `${notes.length - notesWithLabels} unlabeled notes`,
      recommendation: 'Adding labels can help you find notes faster',
    });
  }

  // Checklist productivity
  const checklists = notes.filter((n) => n.type === 'checklist');
  let completedTasks = 0;
  let totalTasks = 0;

  checklists.forEach((cl) => {
    cl.checklist.forEach((item) => {
      totalTasks++;
      if (item.completed) completedTasks++;
    });
  });

  if (totalTasks > 10) {
    const completionRate = Math.round((completedTasks / totalTasks) * 100);
    patterns.push({
      type: 'productivity',
      description: `Your overall task completion rate is ${completionRate}%`,
      metric: `${completedTasks}/${totalTasks} tasks completed`,
      recommendation: completionRate < 50 ? 'Consider breaking down larger tasks into smaller steps' : undefined,
    });
  }

  // ---- Find forgotten notes ----

  const thirtyDaysAgoTimestamp = thirtyDaysAgo.getTime();

  notes
    .filter((note) => note.updatedAt.getTime() < thirtyDaysAgoTimestamp)
    .sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime())
    .slice(0, 10)
    .forEach((note) => {
      const daysSinceUpdate = Math.floor(
        (now.getTime() - note.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Check for unfinished tasks
      const hasUnfinishedTasks = note.type === 'checklist' &&
        note.checklist.some((item) => !item.completed);

      forgottenNotes.push({
        id: note.id,
        title: note.title,
        lastUpdated: note.updatedAt,
        daysSinceUpdate,
        hasUnfinishedTasks,
      });
    });

  // ---- Find unusual connections ----

  // Look for notes that share concepts but are otherwise different
  for (let i = 0; i < Math.min(notes.length, 50); i++) {
    for (let j = i + 1; j < Math.min(notes.length, 50); j++) {
      const noteA = notes[i];
      const noteB = notes[j];

      // Skip if they share labels (expected connection)
      const sharedLabels = noteA.labelIds.filter((l) => noteB.labelIds.includes(l));
      if (sharedLabels.length > 0) continue;

      // Skip if created close together (expected connection)
      const timeDiff = Math.abs(noteA.createdAt.getTime() - noteB.createdAt.getTime());
      if (timeDiff < 7 * 24 * 60 * 60 * 1000) continue;

      // Find shared keywords
      const keywordsA = extractKeywords(`${noteA.title} ${noteA.body}`);
      const keywordsB = extractKeywords(`${noteB.title} ${noteB.body}`);
      const sharedKeywords = keywordsA.filter((kw) => keywordsB.includes(kw));

      if (sharedKeywords.length >= 2) {
        // This is a surprising connection!
        const surprise = 1 - (sharedLabels.length * 0.3) - (timeDiff < 30 * 24 * 60 * 60 * 1000 ? 0.2 : 0);

        unusualConnections.push({
          noteA: { id: noteA.id, title: noteA.title },
          noteB: { id: noteB.id, title: noteB.title },
          sharedConcept: sharedKeywords[0],
          surprise: Math.max(0, surprise),
        });
      }
    }
  }

  // Sort by surprise factor
  unusualConnections.sort((a, b) => b.surprise - a.surprise);
  unusualConnections.splice(5); // Keep top 5

  // ---- Generate recommendations ----

  if (forgottenNotes.length > 3) {
    const withTasks = forgottenNotes.filter((n) => n.hasUnfinishedTasks).length;
    if (withTasks > 0) {
      recommendations.push(
        `You have ${withTasks} old notes with unfinished tasks - consider reviewing them`
      );
    } else {
      recommendations.push(
        `Consider archiving or updating ${forgottenNotes.length} notes you haven't touched in over a month`
      );
    }
  }

  if (unusualConnections.length > 0) {
    recommendations.push(
      `Found ${unusualConnections.length} unexpected connections between your notes - these might inspire new ideas!`
    );
  }

  if (labels.length === 0 && notes.length > 5) {
    recommendations.push(
      'Create some labels to organize your notes by topic or project'
    );
  }

  const { clusters } = await getTopicClusters(userId, spaceId, 3);
  if (clusters.length > 0) {
    const unlabeledCluster = clusters.find((c) => c.suggestedLabel);
    if (unlabeledCluster) {
      recommendations.push(
        `Consider creating a "${unlabeledCluster.suggestedLabel}" label for ${unlabeledCluster.noteCount} related notes`
      );
    }
  }

  return {
    patterns,
    forgottenNotes,
    unusualConnections,
    recommendations,
  };
}
