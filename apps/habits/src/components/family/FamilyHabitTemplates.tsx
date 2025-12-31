'use client';

import { useState } from 'react';
import { Check, Plus, Baby, UserCircle, Users2 } from 'lucide-react';
import { useAuth } from '@ainexsuite/auth';
import { useGrowStore } from '@/lib/store';
import { Habit, Schedule, MemberAgeGroup } from '@/types/models';
import {
  FAMILY_TEMPLATE_CATEGORIES,
  FamilyHabitTemplate,
  FamilyTemplateCategory,
} from '@/data/family-templates';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'child' | 'adult';

const ASSIGNEE_FILTERS: { value: FilterType; label: string; icon: typeof Users2 }[] = [
  { value: 'all', label: 'All', icon: Users2 },
  { value: 'child', label: 'Kids', icon: Baby },
  { value: 'adult', label: 'Adults', icon: UserCircle },
];

interface FamilyHabitTemplatesProps {
  onClose?: () => void;
  /** Filter to only show templates for specific age group */
  filterAgeGroup?: MemberAgeGroup;
  /** Optional callback when habits are added */
  onHabitsAdded?: (count: number) => void;
}

export function FamilyHabitTemplates({
  onClose: _onClose,
  filterAgeGroup,
  onHabitsAdded,
}: FamilyHabitTemplatesProps) {
  const { user } = useAuth();
  const { getCurrentSpace, addHabit } = useGrowStore();
  const currentSpace = getCurrentSpace();

  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<FilterType>('all');
  const [addedTemplates, setAddedTemplates] = useState<Set<string>>(new Set());
  const [isAdding, setIsAdding] = useState<string | null>(null);

  if (!currentSpace || !user) return null;

  // Filter categories based on selections
  const getFilteredCategories = (): FamilyTemplateCategory[] => {
    let categories = [...FAMILY_TEMPLATE_CATEGORIES];

    // Filter by category
    if (selectedCategory !== 'all') {
      categories = categories.filter((cat) => cat.id === selectedCategory);
    }

    // Filter templates within categories
    categories = categories.map((cat) => ({
      ...cat,
      templates: cat.templates.filter((template) => {
        // Filter by age group (from prop)
        if (filterAgeGroup && !template.ageAppropriate.includes(filterAgeGroup)) {
          return false;
        }
        // Filter by suggested assignee
        if (selectedAssignee !== 'all') {
          if (
            template.suggestedAssignee !== selectedAssignee &&
            template.suggestedAssignee !== 'all'
          ) {
            return false;
          }
        }
        return true;
      }),
    }));

    // Remove empty categories
    return categories.filter((cat) => cat.templates.length > 0);
  };

  const filteredCategories = getFilteredCategories();

  const handleAddTemplate = async (template: FamilyHabitTemplate) => {
    if (!currentSpace || !user) return;

    setIsAdding(template.id);

    try {
      const habit: Habit = {
        id: `habit_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        spaceId: currentSpace.id,
        title: `${template.emoji} ${template.title}`,
        description: template.description,
        schedule: {
          type: template.schedule.type,
          daysOfWeek: template.schedule.daysOfWeek,
          timesPerWeek: template.schedule.timesPerWeek,
        } as Schedule,
        assigneeIds: [user.uid], // Start with creator, they can assign others later
        targetValue: template.targetValue,
        targetUnit: template.targetUnit,
        category: template.category,
        currentStreak: 0,
        bestStreak: 0,
        isFrozen: false,
        createdAt: new Date().toISOString(),
        createdBy: user.uid,
      };

      await addHabit(habit);
      setAddedTemplates((prev) => new Set([...prev, template.id]));
      onHabitsAdded?.(1);
    } catch (error) {
      console.error('Failed to add habit from template:', error);
    } finally {
      setIsAdding(null);
    }
  };

  const handleAddAllFromCategory = async (category: FamilyTemplateCategory) => {
    if (!currentSpace || !user) return;

    const templatesToAdd = category.templates.filter(
      (t) => !addedTemplates.has(t.id)
    );

    for (const template of templatesToAdd) {
      await handleAddTemplate(template);
      // Small delay to ensure unique IDs
      await new Promise((r) => setTimeout(r, 50));
    }
  };

  const totalTemplates = FAMILY_TEMPLATE_CATEGORIES.reduce(
    (acc, cat) => acc + cat.templates.length,
    0
  );

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory('all')}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
            selectedCategory === 'all'
              ? 'bg-amber-500 text-white'
              : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
          )}
        >
          All Categories
        </button>
        {FAMILY_TEMPLATE_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5',
              selectedCategory === category.id
                ? 'text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            )}
            style={{
              backgroundColor:
                selectedCategory === category.id ? category.color : undefined,
            }}
          >
            <span>{category.emoji}</span>
            {category.name}
          </button>
        ))}
      </div>

      {/* Assignee Filter */}
      <div className="flex gap-2">
        {ASSIGNEE_FILTERS.map((filter) => {
          const Icon = filter.icon;
          return (
            <button
              key={filter.value}
              onClick={() => setSelectedAssignee(filter.value)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                selectedAssignee === filter.value
                  ? 'bg-foreground/10 text-foreground border border-foreground/20'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Template Categories */}
      <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-1">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No templates match your filters
            </p>
          </div>
        ) : (
          filteredCategories.map((category) => {
            const allAdded = category.templates.every((t) =>
              addedTemplates.has(t.id)
            );

            return (
              <div key={category.id} className="space-y-3">
                {/* Category Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-2xl p-2 rounded-lg"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      {category.emoji}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {category.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  {!allAdded && (
                    <button
                      onClick={() => handleAddAllFromCategory(category)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add All
                    </button>
                  )}
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {category.templates.map((template) => {
                    const isAdded = addedTemplates.has(template.id);
                    const isCurrentlyAdding = isAdding === template.id;

                    return (
                      <div
                        key={template.id}
                        className={cn(
                          'group relative flex items-center gap-3 p-3 rounded-xl border transition-all',
                          isAdded
                            ? 'border-emerald-500/30 bg-emerald-500/5'
                            : 'border-border bg-card hover:border-border hover:shadow-sm'
                        )}
                      >
                        {/* Emoji */}
                        <span className="text-xl flex-shrink-0">{template.emoji}</span>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-foreground truncate">
                            {template.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            {template.targetValue && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                {template.targetValue} {template.targetUnit}
                              </span>
                            )}
                            <span className="text-[10px] text-muted-foreground">
                              {template.schedule.type === 'daily'
                                ? 'Daily'
                                : template.schedule.type === 'weekly'
                                ? `${template.schedule.timesPerWeek}x/week`
                                : template.schedule.type === 'specific_days'
                                ? 'Weekdays'
                                : 'Custom'}
                            </span>
                          </div>
                        </div>

                        {/* Add Button */}
                        {isAdded ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-500">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAddTemplate(template)}
                            disabled={isCurrentlyAdding}
                            className={cn(
                              'flex-shrink-0 p-1.5 rounded-lg transition-all',
                              isCurrentlyAdding
                                ? 'bg-muted text-muted-foreground'
                                : 'bg-amber-500 hover:bg-amber-600 text-white opacity-0 group-hover:opacity-100'
                            )}
                          >
                            {isCurrentlyAdding ? (
                              <span className="h-4 w-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin block" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          {FAMILY_TEMPLATE_CATEGORIES.length} categories &bull; {totalTemplates} templates
          {addedTemplates.size > 0 && (
            <span className="text-emerald-500 ml-2">
              &bull; {addedTemplates.size} added
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
