'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, MapPin, Calendar, Tag, X, Loader2, Smile, Users, Cloud } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@ainexsuite/auth';
import { useAppColors } from '@ainexsuite/theme';
import { createMoment, uploadPhoto } from '@/lib/moments';
import { useMomentsStore } from '@/lib/store';

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);

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
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(null);
    setPhotoPreview(null);
  }, [photoPreview]);

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
          className="flex w-full items-center justify-between rounded-2xl border border-border bg-foreground/5 px-5 py-4 text-left text-sm text-muted-foreground shadow-sm transition hover:bg-foreground/10 hover:border-border focus-visible:outline-none focus-visible:ring-2 backdrop-blur-sm"
          style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
          onClick={() => setExpanded(true)}
        >
          <span>Capture a moment...</span>
          <span className="flex items-center gap-3 text-muted-foreground">
            <Camera className="h-5 w-5" />
            <MapPin className="h-5 w-5" />
          </span>
        </button>
      ) : (
        <div
          ref={composerRef}
          className="w-full rounded-2xl shadow-xl bg-surface-card border border-border backdrop-blur-xl transition-all overflow-hidden"
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
            {/* Caption */}
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              rows={2}
              className="w-full resize-none bg-transparent text-base text-foreground/90 placeholder:text-muted-foreground focus:outline-none leading-relaxed"
            />

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
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  title="Change photo"
                >
                  <Camera className="h-5 w-5" />
                </button>

                {/* Add People Button */}
                <div className="relative">
                  <button
                    type="button"
                    className={clsx(
                      "p-2 rounded-full transition-colors",
                      showPeopleInput ? "" : "text-muted-foreground hover:text-foreground hover:bg-foreground/10"
                    )}
                    style={showPeopleInput ? {
                      color: primaryColor,
                      backgroundColor: `${primaryColor}1a`
                    } : undefined}
                    onClick={() => {
                      setShowPeopleInput(!showPeopleInput);
                      setShowTagInput(false);
                    }}
                    title="Add people"
                  >
                    <Users className="h-5 w-5" />
                  </button>

                  {showPeopleInput && (
                    <div className="absolute bottom-12 left-0 z-30 w-64 p-3 rounded-xl bg-surface-elevated border border-border shadow-2xl">
                      <div className="flex gap-2">
                        <input
                          value={peopleInput}
                          onChange={(e) => setPeopleInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddPerson();
                            }
                          }}
                          placeholder="Who's with you?"
                          className="flex-1 bg-background/20 border border-border rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                          style={{ '--tw-border-opacity': '1', borderColor: primaryColor } as React.CSSProperties}
                          onFocus={(e) => e.target.style.borderColor = primaryColor}
                          onBlur={(e) => e.target.style.borderColor = ''}
                          autoFocus
                        />
                        <button
                          onClick={handleAddPerson}
                          className="px-3 py-1.5 text-foreground rounded-lg text-xs font-medium transition-colors"
                          style={{
                            backgroundColor: primaryColor,
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Add Tags Button */}
                <div className="relative">
                  <button
                    type="button"
                    className={clsx(
                      "p-2 rounded-full transition-colors",
                      showTagInput ? "" : "text-muted-foreground hover:text-foreground hover:bg-foreground/10"
                    )}
                    style={showTagInput ? {
                      color: primaryColor,
                      backgroundColor: `${primaryColor}1a`
                    } : undefined}
                    onClick={() => {
                      setShowTagInput(!showTagInput);
                      setShowPeopleInput(false);
                    }}
                    title="Add tags"
                  >
                    <Tag className="h-5 w-5" />
                  </button>

                  {showTagInput && (
                    <div className="absolute bottom-12 left-0 z-30 w-64 p-3 rounded-xl bg-surface-elevated border border-border shadow-2xl">
                      <div className="flex gap-2">
                        <input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                          placeholder="Add a tag..."
                          className="flex-1 bg-background/20 border border-border rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                          style={{ '--tw-border-opacity': '1', borderColor: primaryColor } as React.CSSProperties}
                          onFocus={(e) => e.target.style.borderColor = primaryColor}
                          onBlur={(e) => e.target.style.borderColor = ''}
                          autoFocus
                        />
                        <button
                          onClick={handleAddTag}
                          className="px-3 py-1.5 text-foreground rounded-lg text-xs font-medium transition-colors"
                          style={{
                            backgroundColor: primaryColor,
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={resetState}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !canSave}
                  className="rounded-full px-6 py-2 text-sm font-semibold text-foreground shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center gap-2"
                  style={{
                    backgroundColor: primaryColor,
                    boxShadow: `0 10px 15px -3px ${primaryColor}33`
                  }}
                  onMouseEnter={(e) => !isSubmitting && !canSave ? null : e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Moment'
                  )}
                </button>
              </div>
            </div>
          </div>
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
