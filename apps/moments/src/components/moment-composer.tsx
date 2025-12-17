'use client';

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Camera, MapPin, Calendar, Tag, X, Smile, Users, Cloud, Palette, Pin, PinOff, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@ainexsuite/auth';
import { useAppColors } from '@ainexsuite/theme';
import { createMoment, uploadPhoto } from '@/lib/moments';
import { useMomentsStore } from '@/lib/store';
import { MOMENT_COLORS, type MomentColor } from '@/lib/constants/moment-colors';

interface MomentComposerProps {
  spaceId?: string;
  onMomentCreated?: () => void;
}

const MOODS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '🥰', label: 'Loved' },
  { emoji: '🎉', label: 'Excited' },
  { emoji: '😌', label: 'Chill' },
  { emoji: '😔', label: 'Sad' },
  { emoji: '😴', label: 'Tired' },
];

const WEATHER_OPTIONS = ['Sunny', 'Cloudy', 'Rainy', 'Snowy', 'Windy', 'Foggy'];

export function MomentComposer({ spaceId, onMomentCreated }: MomentComposerProps) {
  const { user } = useAuth();
  const { fetchMoments } = useMomentsStore();
  const { primary: primaryColor } = useAppColors();
  const [expanded, setExpanded] = useState(false);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  
  // New Fields
  const [mood, setMood] = useState('');
  const [weather, setWeather] = useState('');
  const [people, setPeople] = useState<string[]>([]);
  const [peopleInput, setPeopleInput] = useState('');
  const [showPeopleInput, setShowPeopleInput] = useState(false);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Notes-style features
  const [color, setColor] = useState<MomentColor>('default');
  const [pinned, setPinned] = useState(false);
  const [showPalette, setShowPalette] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);

  // Filter tags based on search input
  const filteredTags = useMemo(() => {
    if (!tagInput.trim()) return tags;
    return tags.filter(tag =>
      tag.toLowerCase().includes(tagInput.trim().toLowerCase())
    );
  }, [tags, tagInput]);

  // Filter people based on search input
  const filteredPeople = useMemo(() => {
    if (!peopleInput.trim()) return people;
    return people.filter(person =>
      person.toLowerCase().includes(peopleInput.trim().toLowerCase())
    );
  }, [people, peopleInput]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const resetState = useCallback(() => {
    setExpanded(false);
    setCaption('');
    setLocation('');
    setDate(new Date().toISOString().split('T')[0]);
    setTags([]);
    setTagInput('');
    setShowTagInput(false);
    setMood('');
    setWeather('');
    setPeople([]);
    setPeopleInput('');
    setShowPeopleInput(false);
    setColor('default');
    setPinned(false);
    setShowPalette(false);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(null);
    setPhotoPreview(null);
  }, [photoPreview]);

  // Get the color config for the current selection
  const colorConfig = MOMENT_COLORS.find(c => c.id === color) || MOMENT_COLORS[0];

  const handleFileSelect = (files: FileList | null) => {
    if (!files || !files[0]) return;

    const file = files[0];
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleAddPerson = () => {
    const trimmed = peopleInput.trim();
    if (trimmed && !people.includes(trimmed)) {
      setPeople([...people, trimmed]);
      setPeopleInput('');
    }
  };

  const handleRemovePerson = (personToRemove: string) => {
    setPeople(people.filter(p => p !== personToRemove));
  };

  const canSave = photoFile || caption.trim();

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || !user?.uid || !canSave) return;

    try {
      setIsSubmitting(true);

      // Upload photo to Firebase Storage if one was selected
      let photoUrl: string | undefined;
      if (photoFile) {
        photoUrl = await uploadPhoto(user.uid, photoFile);
      }

      // Create the moment (photo is optional)
      await createMoment(user.uid, {
        title: caption.trim() || 'Untitled Moment',
        caption: caption.trim(),
        location: location.trim(),
        date: new Date(date).getTime(),
        tags: tags,
        people: people,
        mood: mood,
        weather: weather,
        photoUrl: photoUrl,
        collectionId: null,
        spaceId: spaceId || undefined,
      });

      // Refresh moments list
      await fetchMoments(user.uid, spaceId);
      onMomentCreated?.();
      resetState();
    } catch (error) {
      console.error('Failed to create moment:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, user?.uid, canSave, photoFile, caption, location, date, tags, people, mood, weather, spaceId, fetchMoments, onMomentCreated, resetState]);

  // Handle click outside to close if empty
  useEffect(() => {
    if (!expanded) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!composerRef.current) return;
      if (composerRef.current.contains(event.target as Node)) return;

      if (!photoFile && !caption.trim()) {
        resetState();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [expanded, photoFile, caption, resetState]);

  return (
    <section className="w-full mb-8">
      {!expanded ? (
        <button
          type="button"
          className="flex w-full items-center rounded-2xl border px-5 py-4 text-left text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
          onClick={() => setExpanded(true)}
        >
          <span>Capture a moment...</span>
        </button>
      ) : (
        <div
          ref={composerRef}
          className={clsx(
            "w-full rounded-2xl shadow-lg border transition-all overflow-hidden",
            color === 'default'
              ? "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              : colorConfig.cardClass
          )}
        >
          {/* Photo Preview/Upload Area */}
          <div
            className={clsx(
              "relative cursor-pointer transition-all",
              photoPreview ? "h-64" : "h-40 flex items-center justify-center bg-foreground/5 hover:bg-foreground/10"
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            {photoPreview ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (photoPreview) URL.revokeObjectURL(photoPreview);
                    setPhotoFile(null);
                    setPhotoPreview(null);
                  }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-background/60 text-foreground hover:bg-background/80 backdrop-blur-sm"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Camera className="h-10 w-10" />
                <span className="text-sm">Click to add a photo</span>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="flex flex-col gap-4 px-5 py-4">
            {/* Caption with Pin Button */}
            <div className="flex items-start gap-3">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="What's this moment about?..."
                rows={3}
                className="flex-1 resize-none bg-transparent text-[15px] focus:outline-none leading-7 tracking-[-0.01em] text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
              />
              <button
                type="button"
                onClick={() => setPinned((prev) => !prev)}
                className={clsx(
                  "p-2 rounded-full transition-colors",
                  pinned
                    ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10"
                    : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                )}
                aria-label={pinned ? "Unpin moment" : "Pin moment"}
              >
                {pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
              </button>
            </div>

            {/* Meta Row 1: Date & Location */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[150px]">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="flex-1 bg-foreground/5 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none"
                  style={{ '--tw-border-opacity': '1', borderColor: primaryColor } as React.CSSProperties}
                  onFocus={(e) => e.target.style.borderColor = primaryColor}
                  onBlur={(e) => e.target.style.borderColor = ''}
                />
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-[150px]">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Add location..."
                  className="flex-1 bg-foreground/5 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  style={{ '--tw-border-opacity': '1', borderColor: primaryColor } as React.CSSProperties}
                  onFocus={(e) => e.target.style.borderColor = primaryColor}
                  onBlur={(e) => e.target.style.borderColor = ''}
                />
              </div>
            </div>

            {/* Meta Row 2: Weather & Mood */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[150px]">
                <Cloud className="h-4 w-4 text-muted-foreground" />
                <select
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  className="flex-1 bg-foreground/5 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none"
                  style={{ '--tw-border-opacity': '1', borderColor: primaryColor } as React.CSSProperties}
                  onFocus={(e) => e.target.style.borderColor = primaryColor}
                  onBlur={(e) => e.target.style.borderColor = ''}
                >
                  <option value="" className="text-background">Weather...</option>
                  {WEATHER_OPTIONS.map(w => (
                    <option key={w} value={w} className="text-background">{w}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 flex-[2] min-w-[200px] overflow-x-auto pb-1">
                <Smile className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex items-center gap-1">
                  {MOODS.map((m) => (
                    <button
                      key={m.label}
                      type="button"
                      onClick={() => setMood(mood === m.label ? '' : m.label)}
                      className={clsx(
                        "p-1.5 rounded-lg text-lg transition-colors hover:bg-foreground/10",
                        mood === m.label ? "ring-1" : "opacity-60 hover:opacity-100"
                      )}
                      style={mood === m.label ? {
                        backgroundColor: `${primaryColor}33`,
                        borderColor: primaryColor,
                        '--tw-ring-color': primaryColor
                      } as React.CSSProperties : undefined}
                      title={m.label}
                    >
                      {m.emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tags & People Lists */}
            {(tags.length > 0 || people.length > 0) && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {people.map((person) => (
                  <span
                    key={person}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: `${primaryColor}33`,
                      color: primaryColor
                    }}
                  >
                    <Users className="h-3 w-3" />
                    {person}
                    <button
                      type="button"
                      onClick={() => handleRemovePerson(person)}
                      className="ml-0.5 opacity-60 hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: `${primaryColor}33`,
                      color: primaryColor
                    }}
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-0.5 opacity-60 hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="p-2 rounded-full transition-colors text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  onClick={() => fileInputRef.current?.click()}
                  title="Add photo"
                >
                  <Camera className="h-5 w-5" />
                </button>

                {/* Color Palette Button */}
                <div className="relative">
                  <button
                    type="button"
                    className={clsx(
                      "p-2 rounded-full transition-colors",
                      showPalette
                        ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10"
                        : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    )}
                    onClick={() => {
                      setShowPalette(!showPalette);
                      setShowPeopleInput(false);
                      setShowTagInput(false);
                    }}
                    title="Choose color"
                  >
                    <Palette className="h-5 w-5" />
                  </button>

                  {showPalette && (
                    <div className="absolute bottom-12 left-1/2 z-30 flex -translate-x-1/2 gap-2 rounded-2xl bg-surface-elevated/95 p-3 shadow-floating backdrop-blur-xl border border-zinc-200 dark:border-zinc-700">
                      {MOMENT_COLORS.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setColor(option.id);
                            setShowPalette(false);
                          }}
                          className={clsx(
                            "h-8 w-8 rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)]",
                            option.swatchClass,
                            option.id === color && "ring-2 ring-[var(--color-primary)]",
                          )}
                          title={option.label}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Add People Button */}
                <button
                  type="button"
                  className={clsx(
                    "p-2 rounded-full transition-colors",
                    showPeopleInput
                      ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10"
                      : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  )}
                  onClick={() => {
                    setShowPeopleInput(!showPeopleInput);
                    setShowTagInput(false);
                    setShowPalette(false);
                  }}
                  title="Add people"
                >
                  <Users className="h-5 w-5" />
                </button>

                {/* Add Tags Button */}
                <button
                  type="button"
                  className={clsx(
                    "p-2 rounded-full transition-colors",
                    showTagInput
                      ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10"
                      : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  )}
                  onClick={() => {
                    setShowTagInput(!showTagInput);
                    setShowPeopleInput(false);
                    setShowPalette(false);
                  }}
                  title="Add tags"
                >
                  <Tag className="h-5 w-5" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="text-sm font-medium transition-colors text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  onClick={resetState}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !canSave}
                  className="rounded-full bg-[var(--color-primary)] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[var(--color-primary)]/20 transition hover:brightness-110 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>

          {/* Expandable Tags Panel */}
          {showTagInput && (
            <div className="border-t border-zinc-200 dark:border-zinc-800 px-5 py-3 space-y-3">
              {/* New tag input */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Search or create a tag..."
                    className="w-full rounded-full border px-4 py-2 text-sm focus:outline-none bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-zinc-300 dark:focus:border-zinc-600"
                    autoFocus
                  />
                </div>
                {tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase()) && (
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create
                  </button>
                )}
              </div>

              {/* Existing tags */}
              <div className="flex flex-wrap gap-2">
                {filteredTags.length > 0 ? (
                  filteredTags.map((tag) => {
                    const isSelected = tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            handleRemoveTag(tag);
                          } else {
                            setTags([...tags, tag]);
                          }
                        }}
                        className={clsx(
                          "flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition",
                          isSelected
                            ? "border-zinc-400 dark:border-zinc-500 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                            : "border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-200",
                        )}
                      >
                        #{tag}
                      </button>
                    );
                  })
                ) : tagInput.trim() ? (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    No matching tags. Press Enter or click Create to add &quot;{tagInput.trim()}&quot;.
                  </p>
                ) : (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    No tags yet. Type above to create your first tag.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Expandable People Panel */}
          {showPeopleInput && (
            <div className="border-t border-zinc-200 dark:border-zinc-800 px-5 py-3 space-y-3">
              {/* New person input */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={peopleInput}
                    onChange={(e) => setPeopleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddPerson();
                      }
                    }}
                    placeholder="Who's with you?"
                    className="w-full rounded-full border px-4 py-2 text-sm focus:outline-none bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-zinc-300 dark:focus:border-zinc-600"
                    autoFocus
                  />
                </div>
                {peopleInput.trim() && !people.includes(peopleInput.trim()) && (
                  <button
                    type="button"
                    onClick={handleAddPerson}
                    className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </button>
                )}
              </div>

              {/* Existing people */}
              <div className="flex flex-wrap gap-2">
                {filteredPeople.length > 0 ? (
                  filteredPeople.map((person) => {
                    const isSelected = people.includes(person);
                    return (
                      <button
                        key={person}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            handleRemovePerson(person);
                          } else {
                            setPeople([...people, person]);
                          }
                        }}
                        className={clsx(
                          "flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition",
                          isSelected
                            ? "border-zinc-400 dark:border-zinc-500 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                            : "border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-200",
                        )}
                      >
                        <Users className="h-3 w-3" />
                        {person}
                      </button>
                    );
                  })
                ) : peopleInput.trim() ? (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    Press Enter or click Add to add &quot;{peopleInput.trim()}&quot;.
                  </p>
                ) : (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    No people added yet. Type a name above.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
      />
    </section>
  );
}
