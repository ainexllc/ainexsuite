'use client';

import { useState } from 'react';
import { X, User, Heart, Users, Home, Check, Sparkles, ArrowRight, SkipForward } from 'lucide-react';
import { useAuth } from '@ainexsuite/auth';
import { useSpaces } from '@/components/providers/spaces-provider';
import { SpaceType, MemberAgeGroup, HabitCreationPolicy } from '@/types/models';
import { FamilyHabitTemplates } from '@/components/family/FamilyHabitTemplates';
import { cn } from '@/lib/utils';

interface SpaceCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const spaceTypes: {
  type: SpaceType;
  icon: typeof User;
  title: string;
  description: string;
  features: string[];
  color: string;
}[] = [
  {
    type: 'personal',
    icon: User,
    title: 'Personal',
    description: 'Just you, focused on your goals',
    features: ['Private habits', 'Personal analytics', 'Self-paced progress'],
    color: 'from-indigo-500 to-purple-500',
  },
  {
    type: 'couple',
    icon: Heart,
    title: 'Couple',
    description: 'Share habits with your partner',
    features: ['Shared habits', 'Wagers & bets', 'Nudge reminders', 'Joint quests'],
    color: 'from-pink-500 to-rose-500',
  },
  {
    type: 'family',
    icon: Home,
    title: 'Family',
    description: 'Build healthy habits together as a family',
    features: ['Family goals', 'Kid-friendly', 'Shared progress', 'Encouragement'],
    color: 'from-amber-500 to-orange-500',
  },
  {
    type: 'squad',
    icon: Users,
    title: 'Squad',
    description: 'Team accountability with friends',
    features: ['Team challenges', 'Leaderboards', 'Group quests', 'Activity feed'],
    color: 'from-emerald-500 to-teal-500',
  },
];

export function SpaceCreatorModal({ isOpen, onClose }: SpaceCreatorModalProps) {
  const { user } = useAuth();
  const { createSpace, updateSpace } = useSpaces();

  const [step, setStep] = useState<'type' | 'details' | 'templates'>('type');
  const [selectedType, setSelectedType] = useState<SpaceType | null>(null);
  const [spaceName, setSpaceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [habitsAdded, setHabitsAdded] = useState(0);

  const handleSelectType = (type: SpaceType) => {
    setSelectedType(type);
    setStep('details');

    // Set default name based on type
    if (type === 'personal') {
      setSpaceName('My Growth');
    } else if (type === 'couple') {
      setSpaceName('Our Journey');
    } else if (type === 'family') {
      setSpaceName('Family Habits');
    } else {
      setSpaceName('Team Goals');
    }
  };

  const handleCreate = async () => {
    if (!selectedType || !spaceName.trim() || !user) {
      setError('Please enter a space name');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Set ageGroup for family spaces (creator is always adult)
      const memberAgeGroup: MemberAgeGroup | undefined = selectedType === 'family' ? 'adult' : undefined;

      // Set habit creation policy for squad spaces (default to 'anyone' for backwards compatibility)
      const habitPolicy: HabitCreationPolicy | undefined = selectedType === 'squad' ? 'anyone' : undefined;

      // Create space with basic info - the provider will generate the rest
      const spaceId = await createSpace({
        name: spaceName.trim(),
        type: selectedType,
      });

      // Update with habits-specific fields if needed
      if (habitPolicy || memberAgeGroup) {
        const updates: Record<string, unknown> = {};
        if (habitPolicy) updates.habitCreationPolicy = habitPolicy;
        // Note: memberAgeGroup would need to be set on the member, not the space
        await updateSpace(spaceId, updates);
      }

      // For family spaces, go to templates step
      if (selectedType === 'family') {
        setStep('templates');
        setIsCreating(false);
        return;
      }

      // Reset and close for other space types
      resetAndClose();
    } catch (err) {
      setError('Failed to create space. Please try again.');
      console.error('Space creation error:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const resetAndClose = () => {
    setStep('type');
    setSelectedType(null);
    setSpaceName('');
    setHabitsAdded(0);
    onClose();
  };

  const handleClose = () => {
    setStep('type');
    setSelectedType(null);
    setSpaceName('');
    setHabitsAdded(0);
    setError(null);
    onClose();
  };

  const handleBack = () => {
    if (step === 'templates') {
      // From templates, just close since space is already created
      resetAndClose();
      return;
    }
    setStep('type');
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-lg bg-foreground border border-border rounded-2xl shadow-2xl overflow-hidden"
        role="dialog"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <h2 id="modal-title" className="text-lg font-semibold text-foreground">
              {step === 'type'
                ? 'Create New Space'
                : step === 'details'
                ? 'Name Your Space'
                : 'Add Family Habits'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {step === 'type' ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                Choose how you want to track your habits:
              </p>

              {spaceTypes.map((spaceType) => {
                const Icon = spaceType.icon;
                return (
                  <button
                    key={spaceType.type}
                    onClick={() => handleSelectType(spaceType.type)}
                    className="w-full p-4 rounded-xl border border-border bg-foreground/5 hover:bg-foreground/10 hover:border-border transition-all text-left group"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          'h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0',
                          spaceType.color
                        )}
                      >
                        <Icon className="h-6 w-6 text-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-medium text-foreground group-hover:text-foreground">
                          {spaceType.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {spaceType.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {spaceType.features.map((feature) => (
                            <span
                              key={feature}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-foreground/10 text-muted-foreground"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : step === 'details' ? (
            <div className="space-y-4">
              {/* Selected type preview */}
              {selectedType && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-foreground/5 border border-border">
                  {(() => {
                    const typeInfo = spaceTypes.find((t) => t.type === selectedType);
                    if (!typeInfo) return null;
                    const Icon = typeInfo.icon;
                    return (
                      <>
                        <div
                          className={cn(
                            'h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center',
                            typeInfo.color
                          )}
                        >
                          <Icon className="h-5 w-5 text-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{typeInfo.title}</p>
                          <p className="text-xs text-muted-foreground">{typeInfo.description}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Name input */}
              <div>
                <label
                  htmlFor="space-name"
                  className="block text-sm font-medium text-muted-foreground mb-2"
                >
                  Space Name
                </label>
                <input
                  id="space-name"
                  type="text"
                  value={spaceName}
                  onChange={(e) => setSpaceName(e.target.value)}
                  placeholder="Enter a name..."
                  maxLength={50}
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-foreground/5 border border-border text-foreground placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                />
                <p className="text-xs text-foreground/30 mt-1.5">
                  {spaceName.length}/50 characters
                </p>
              </div>

              {/* Error message */}
              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}

              {/* Info for couple/squad */}
              {selectedType !== 'personal' && (
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <p className="text-xs text-indigo-300">
                    You can invite members after creating the space.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Templates step for family spaces */
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4">
                <p className="text-sm text-amber-300 font-medium">
                  Your family space is ready!
                </p>
                <p className="text-xs text-amber-300/70 mt-1">
                  Get started quickly by adding some pre-made habits below, or skip to set up your own later.
                </p>
              </div>
              <FamilyHabitTemplates
                onHabitsAdded={(count) => setHabitsAdded((prev) => prev + count)}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-foreground/5">
          {step === 'type' ? (
            <div className="w-full text-center">
              <p className="text-xs text-foreground/40">
                Select a space type to continue
              </p>
            </div>
          ) : step === 'details' ? (
            <>
              <button
                onClick={handleBack}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={!spaceName.trim() || isCreating}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all',
                  spaceName.trim() && !isCreating
                    ? 'bg-indigo-500 hover:bg-indigo-600 text-foreground shadow-lg shadow-indigo-500/20'
                    : 'bg-foreground/10 text-foreground/30 cursor-not-allowed'
                )}
              >
                {isCreating ? (
                  <>
                    <span className="h-4 w-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                    Creating...
                  </>
                ) : selectedType === 'family' ? (
                  <>
                    <ArrowRight className="h-4 w-4" />
                    Continue
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Create Space
                  </>
                )}
              </button>
            </>
          ) : (
            /* Templates step footer */
            <>
              <button
                onClick={resetAndClose}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <SkipForward className="h-4 w-4" />
                Skip for now
              </button>
              <button
                onClick={resetAndClose}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 transition-all"
              >
                <Check className="h-4 w-4" />
                Done{habitsAdded > 0 && ` (${habitsAdded} added)`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
