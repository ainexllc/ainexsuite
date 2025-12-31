// Family habit templates for quick setup

import type { HabitCategory, FrequencyType, MemberAgeGroup } from '@/types/models';

export interface FamilyHabitTemplate {
  id: string;
  title: string;
  description?: string;
  emoji: string;
  category: HabitCategory;
  schedule: {
    type: FrequencyType;
    daysOfWeek?: number[];
    timesPerWeek?: number;
  };
  targetValue?: number;
  targetUnit?: string;
  suggestedAssignee: 'adult' | 'child' | 'all';
  ageAppropriate: MemberAgeGroup[];
}

export interface FamilyTemplateCategory {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
  templates: FamilyHabitTemplate[];
}

export const FAMILY_TEMPLATE_CATEGORIES: FamilyTemplateCategory[] = [
  {
    id: 'morning-routine',
    name: 'Morning Routine',
    emoji: '🌅',
    color: '#f59e0b',
    description: 'Start the day right with consistent morning habits',
    templates: [
      {
        id: 'make-bed',
        title: 'Make My Bed',
        description: 'Start the day with a small win',
        emoji: '🛏️',
        category: 'self-care',
        schedule: { type: 'daily' },
        suggestedAssignee: 'child',
        ageAppropriate: ['child', 'adult'],
      },
      {
        id: 'brush-teeth-morning',
        title: 'Brush Teeth (Morning)',
        description: 'Brush for 2 minutes',
        emoji: '🦷',
        category: 'health',
        schedule: { type: 'daily' },
        targetValue: 2,
        targetUnit: 'mins',
        suggestedAssignee: 'all',
        ageAppropriate: ['child', 'adult'],
      },
      {
        id: 'get-dressed',
        title: 'Get Dressed',
        description: 'Pick out clothes and get ready',
        emoji: '👕',
        category: 'self-care',
        schedule: { type: 'daily' },
        suggestedAssignee: 'child',
        ageAppropriate: ['child'],
      },
      {
        id: 'healthy-breakfast',
        title: 'Eat a Healthy Breakfast',
        emoji: '🥣',
        category: 'health',
        schedule: { type: 'daily' },
        suggestedAssignee: 'all',
        ageAppropriate: ['child', 'adult'],
      },
      {
        id: 'pack-backpack',
        title: 'Pack Backpack',
        description: 'Check for all school supplies',
        emoji: '🎒',
        category: 'productivity',
        schedule: { type: 'specific_days', daysOfWeek: [1, 2, 3, 4, 5] },
        suggestedAssignee: 'child',
        ageAppropriate: ['child'],
      },
    ],
  },
  {
    id: 'chores',
    name: 'Chores',
    emoji: '🧹',
    color: '#10b981',
    description: 'Keep the home tidy with shared responsibilities',
    templates: [
      {
        id: 'clean-room',
        title: 'Clean My Room',
        description: 'Tidy up toys and belongings',
        emoji: '🧸',
        category: 'productivity',
        schedule: { type: 'daily' },
        suggestedAssignee: 'child',
        ageAppropriate: ['child', 'adult'],
      },
      {
        id: 'set-table',
        title: 'Set the Table',
        emoji: '🍽️',
        category: 'productivity',
        schedule: { type: 'daily' },
        suggestedAssignee: 'child',
        ageAppropriate: ['child', 'adult'],
      },
      {
        id: 'clear-dishes',
        title: 'Clear My Dishes',
        description: 'Take dishes to the sink after meals',
        emoji: '🥄',
        category: 'productivity',
        schedule: { type: 'daily' },
        suggestedAssignee: 'child',
        ageAppropriate: ['child', 'adult'],
      },
      {
        id: 'feed-pet',
        title: 'Feed the Pet',
        emoji: '🐕',
        category: 'productivity',
        schedule: { type: 'daily' },
        suggestedAssignee: 'child',
        ageAppropriate: ['child', 'adult'],
      },
      {
        id: 'take-out-trash',
        title: 'Take Out Trash',
        emoji: '🗑️',
        category: 'productivity',
        schedule: { type: 'weekly', timesPerWeek: 2 },
        suggestedAssignee: 'all',
        ageAppropriate: ['child', 'adult'],
      },
      {
        id: 'water-plants',
        title: 'Water the Plants',
        emoji: '🌱',
        category: 'productivity',
        schedule: { type: 'weekly', timesPerWeek: 2 },
        suggestedAssignee: 'child',
        ageAppropriate: ['child', 'adult'],
      },
      {
        id: 'laundry-away',
        title: 'Put Laundry Away',
        description: 'Fold and store clean clothes',
        emoji: '🧺',
        category: 'productivity',
        schedule: { type: 'weekly', timesPerWeek: 2 },
        suggestedAssignee: 'all',
        ageAppropriate: ['child', 'adult'],
      },
    ],
  },
  {
    id: 'homework',
    name: 'Homework & Learning',
    emoji: '📚',
    color: '#3b82f6',
    description: 'Build strong study habits',
    templates: [
      {
        id: 'homework-time',
        title: 'Homework Time',
        description: 'Focus on school assignments',
        emoji: '✏️',
        category: 'learning',
        schedule: { type: 'specific_days', daysOfWeek: [1, 2, 3, 4, 5] },
        targetValue: 30,
        targetUnit: 'mins',
        suggestedAssignee: 'child',
        ageAppropriate: ['child'],
      },
      {
        id: 'reading-time',
        title: 'Reading Time',
        description: 'Read for fun or learning',
        emoji: '📖',
        category: 'learning',
        schedule: { type: 'daily' },
        targetValue: 20,
        targetUnit: 'mins',
        suggestedAssignee: 'child',
        ageAppropriate: ['child', 'adult'],
      },
      {
        id: 'practice-instrument',
        title: 'Practice Instrument',
        emoji: '🎹',
        category: 'creativity',
        schedule: { type: 'daily' },
        targetValue: 15,
        targetUnit: 'mins',
        suggestedAssignee: 'child',
        ageAppropriate: ['child', 'adult'],
      },
      {
        id: 'practice-sport',
        title: 'Practice Sport/Skill',
        emoji: '⚽',
        category: 'fitness',
        schedule: { type: 'weekly', timesPerWeek: 3 },
        targetValue: 30,
        targetUnit: 'mins',
        suggestedAssignee: 'child',
        ageAppropriate: ['child', 'adult'],
      },
      {
        id: 'educational-game',
        title: 'Educational Game Time',
        description: 'Learn while having fun',
        emoji: '🧩',
        category: 'learning',
        schedule: { type: 'weekly', timesPerWeek: 3 },
        targetValue: 20,
        targetUnit: 'mins',
        suggestedAssignee: 'child',
        ageAppropriate: ['child'],
      },
    ],
  },
  {
    id: 'bedtime',
    name: 'Bedtime Routine',
    emoji: '🌙',
    color: '#8b5cf6',
    description: 'Wind down and prepare for restful sleep',
    templates: [
      {
        id: 'brush-teeth-night',
        title: 'Brush Teeth (Night)',
        emoji: '🦷',
        category: 'health',
        schedule: { type: 'daily' },
        targetValue: 2,
        targetUnit: 'mins',
        suggestedAssignee: 'all',
        ageAppropriate: ['child', 'adult'],
      },
      {
        id: 'pajamas-on',
        title: 'Put On Pajamas',
        emoji: '🩷',
        category: 'self-care',
        schedule: { type: 'daily' },
        suggestedAssignee: 'child',
        ageAppropriate: ['child'],
      },
      {
        id: 'screen-free',
        title: 'Screen-Free Time',
        description: 'No screens 30 mins before bed',
        emoji: '📵',
        category: 'health',
        schedule: { type: 'daily' },
        targetValue: 30,
        targetUnit: 'mins',
        suggestedAssignee: 'all',
        ageAppropriate: ['child', 'adult'],
      },
      {
        id: 'bedtime-story',
        title: 'Bedtime Story',
        description: 'Read together before sleep',
        emoji: '📚',
        category: 'relationships',
        schedule: { type: 'daily' },
        suggestedAssignee: 'all',
        ageAppropriate: ['child', 'adult'],
      },
      {
        id: 'gratitude-share',
        title: 'Share 3 Good Things',
        description: 'Talk about the best parts of the day',
        emoji: '🙏',
        category: 'mindfulness',
        schedule: { type: 'daily' },
        suggestedAssignee: 'all',
        ageAppropriate: ['child', 'adult'],
      },
      {
        id: 'lights-out',
        title: 'Lights Out on Time',
        emoji: '💤',
        category: 'health',
        schedule: { type: 'daily' },
        suggestedAssignee: 'child',
        ageAppropriate: ['child'],
      },
    ],
  },
  {
    id: 'health',
    name: 'Health & Wellness',
    emoji: '💚',
    color: '#22c55e',
    description: 'Stay healthy and active as a family',
    templates: [
      {
        id: 'drink-water',
        title: 'Drink Water',
        description: 'Stay hydrated throughout the day',
        emoji: '💧',
        category: 'health',
        schedule: { type: 'daily' },
        targetValue: 6,
        targetUnit: 'glasses',
        suggestedAssignee: 'all',
        ageAppropriate: ['child', 'adult'],
      },
      {
        id: 'eat-vegetables',
        title: 'Eat Vegetables',
        description: 'Include veggies in meals',
        emoji: '🥦',
        category: 'health',
        schedule: { type: 'daily' },
        suggestedAssignee: 'all',
        ageAppropriate: ['child', 'adult'],
      },
      {
        id: 'outdoor-play',
        title: 'Outdoor Play Time',
        emoji: '🌳',
        category: 'fitness',
        schedule: { type: 'daily' },
        targetValue: 30,
        targetUnit: 'mins',
        suggestedAssignee: 'child',
        ageAppropriate: ['child'],
      },
      {
        id: 'family-walk',
        title: 'Family Walk',
        emoji: '🚶',
        category: 'fitness',
        schedule: { type: 'weekly', timesPerWeek: 3 },
        targetValue: 20,
        targetUnit: 'mins',
        suggestedAssignee: 'all',
        ageAppropriate: ['child', 'adult'],
      },
      {
        id: 'stretch-together',
        title: 'Stretch Together',
        emoji: '🧘',
        category: 'fitness',
        schedule: { type: 'daily' },
        targetValue: 5,
        targetUnit: 'mins',
        suggestedAssignee: 'all',
        ageAppropriate: ['child', 'adult'],
      },
      {
        id: 'vitamins',
        title: 'Take Vitamins',
        emoji: '💊',
        category: 'health',
        schedule: { type: 'daily' },
        suggestedAssignee: 'all',
        ageAppropriate: ['child', 'adult'],
      },
      {
        id: 'wash-hands',
        title: 'Wash Hands Properly',
        description: 'Wash for 20 seconds with soap',
        emoji: '🧼',
        category: 'health',
        schedule: { type: 'daily' },
        suggestedAssignee: 'child',
        ageAppropriate: ['child'],
      },
    ],
  },
  {
    id: 'fun-bonding',
    name: 'Fun & Bonding',
    emoji: '🎉',
    color: '#ec4899',
    description: 'Quality time and family connection',
    templates: [
      {
        id: 'family-game-night',
        title: 'Family Game Night',
        description: 'Board games or card games together',
        emoji: '🎲',
        category: 'relationships',
        schedule: { type: 'weekly', timesPerWeek: 1 },
        suggestedAssignee: 'all',
        ageAppropriate: ['child', 'adult'],
      },
      {
        id: 'cook-together',
        title: 'Cook Together',
        description: 'Prepare a meal as a family',
        emoji: '👨‍🍳',
        category: 'relationships',
        schedule: { type: 'weekly', timesPerWeek: 1 },
        suggestedAssignee: 'all',
        ageAppropriate: ['child', 'adult'],
      },
      {
        id: 'movie-night',
        title: 'Family Movie Night',
        emoji: '🎬',
        category: 'relationships',
        schedule: { type: 'weekly', timesPerWeek: 1 },
        suggestedAssignee: 'all',
        ageAppropriate: ['child', 'adult'],
      },
      {
        id: 'arts-crafts',
        title: 'Arts & Crafts Time',
        emoji: '🎨',
        category: 'creativity',
        schedule: { type: 'weekly', timesPerWeek: 1 },
        targetValue: 30,
        targetUnit: 'mins',
        suggestedAssignee: 'child',
        ageAppropriate: ['child'],
      },
      {
        id: 'outdoor-adventure',
        title: 'Outdoor Adventure',
        description: 'Park, hike, or nature exploration',
        emoji: '🏕️',
        category: 'relationships',
        schedule: { type: 'weekly', timesPerWeek: 1 },
        suggestedAssignee: 'all',
        ageAppropriate: ['child', 'adult'],
      },
      {
        id: 'one-on-one-time',
        title: 'One-on-One Time',
        description: 'Special time with each child',
        emoji: '💕',
        category: 'relationships',
        schedule: { type: 'weekly', timesPerWeek: 1 },
        targetValue: 15,
        targetUnit: 'mins',
        suggestedAssignee: 'adult',
        ageAppropriate: ['adult'],
      },
      {
        id: 'family-meeting',
        title: 'Family Meeting',
        description: 'Check in on how everyone is doing',
        emoji: '🗣️',
        category: 'relationships',
        schedule: { type: 'weekly', timesPerWeek: 1 },
        suggestedAssignee: 'all',
        ageAppropriate: ['child', 'adult'],
      },
      {
        id: 'random-act-kindness',
        title: 'Random Act of Kindness',
        description: 'Do something nice for someone',
        emoji: '🤗',
        category: 'relationships',
        schedule: { type: 'weekly', timesPerWeek: 1 },
        suggestedAssignee: 'all',
        ageAppropriate: ['child', 'adult'],
      },
    ],
  },
];

// Helper to get all templates flat
export function getAllFamilyTemplates(): FamilyHabitTemplate[] {
  return FAMILY_TEMPLATE_CATEGORIES.flatMap((cat) => cat.templates);
}

// Helper to get templates by age group
export function getTemplatesByAgeGroup(ageGroup: MemberAgeGroup): FamilyHabitTemplate[] {
  return getAllFamilyTemplates().filter((t) => t.ageAppropriate.includes(ageGroup));
}

// Helper to get templates by suggested assignee
export function getTemplatesBySuggestedAssignee(
  assignee: 'adult' | 'child' | 'all'
): FamilyHabitTemplate[] {
  return getAllFamilyTemplates().filter(
    (t) => t.suggestedAssignee === assignee || t.suggestedAssignee === 'all'
  );
}

// Helper to get a specific category
export function getTemplateCategory(categoryId: string): FamilyTemplateCategory | undefined {
  return FAMILY_TEMPLATE_CATEGORIES.find((cat) => cat.id === categoryId);
}
