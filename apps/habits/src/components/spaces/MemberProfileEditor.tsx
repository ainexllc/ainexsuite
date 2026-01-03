'use client';

import { useState } from 'react';
import { X, Sparkles, Upload, Loader2, RefreshCw, Check, Wand2, ImageIcon } from 'lucide-react';
import { Member } from '../../types/models';
import { cn } from '../../lib/utils';

// Unified styles for both generation and transformation (12 fun styles)
const AVATAR_STYLES = [
  { id: 'pixar', label: 'Pixar 3D', emoji: '🎬' },
  { id: 'disney', label: 'Disney', emoji: '🏰' },
  { id: 'lego', label: 'LEGO', emoji: '🧱' },
  { id: 'wool', label: 'Wool', emoji: '🧶' },
  { id: 'cyberpunk', label: 'Cyberpunk', emoji: '🌆' },
  { id: 'anime', label: 'Anime', emoji: '🎌' },
  { id: 'claymation', label: 'Clay', emoji: '🗿' },
  { id: 'cartoon', label: 'Cartoon', emoji: '🎨' },
  { id: 'pixel', label: 'Pixel Art', emoji: '👾' },
  { id: 'superhero', label: 'Superhero', emoji: '🦸' },
  { id: 'watercolor', label: 'Watercolor', emoji: '💧' },
  { id: 'pop-art', label: 'Pop Art', emoji: '🎯' },
] as const;

type AvatarStyleId = (typeof AVATAR_STYLES)[number]['id'];
type Mode = 'generate' | 'transform';

interface MemberProfileEditorProps {
  member: Member;
  isOpen: boolean;
  onClose: () => void;
  onSave: (photoURL: string) => Promise<void>;
}

export function MemberProfileEditor({ member, isOpen, onClose, onSave }: MemberProfileEditorProps) {
  const [mode, setMode] = useState<Mode>('generate');
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<AvatarStyleId>('pixar');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isChild = member.ageGroup === 'child';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setUploadedImage(result);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (mode === 'generate' && !prompt.trim()) {
      setError('Please enter a description');
      return;
    }

    if (mode === 'transform' && !uploadedImage) {
      setError('Please upload an image first');
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const body = mode === 'generate'
        ? { mode: 'generate', prompt: prompt.trim(), style: selectedStyle }
        : { mode: 'transform', style: selectedStyle, sourceImage: uploadedImage };

      const response = await fetch('/api/generate-profile-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setGeneratedImage(data.imageData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedImage) return;

    setSaving(true);
    setError(null);

    try {
      await onSave(generatedImage);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save image');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setGeneratedImage(null);
    setUploadedImage(null);
    setPrompt('');
    setError(null);
    setMode('generate');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md max-h-[90vh] bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">
                {isChild ? 'Create Banner' : 'Edit Profile Banner'}
              </h3>
              <p className="text-xs text-white/50">for {member.displayName}</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-white/50 hover:text-white p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Current Banner Preview */}
          <div className="w-full">
            {member.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={member.photoURL}
                alt={member.displayName}
                className="w-full h-20 rounded-xl object-cover ring-2 ring-white/20"
              />
            ) : (
              <div className="w-full h-20 rounded-xl bg-gradient-to-r from-indigo-500/30 to-purple-600/30 flex items-center justify-center text-2xl font-bold text-white/60 ring-2 ring-white/20">
                {member.displayName.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          {/* Mode Selector */}
          <div className="flex gap-1 p-1 rounded-xl bg-white/5">
            <button
              type="button"
              onClick={() => setMode('generate')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all',
                mode === 'generate'
                  ? 'bg-indigo-500 text-white'
                  : 'text-white/50 hover:text-white'
              )}
            >
              <Wand2 className="h-4 w-4" />
              Create
            </button>
            <button
              type="button"
              onClick={() => setMode('transform')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all',
                mode === 'transform'
                  ? 'bg-indigo-500 text-white'
                  : 'text-white/50 hover:text-white'
              )}
            >
              <ImageIcon className="h-4 w-4" />
              Transform
            </button>
          </div>

          {/* Generate Mode - Prompt Input */}
          {mode === 'generate' && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/60">
                Describe the avatar
              </label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={isChild ? "e.g., magical forest, underwater world..." : "e.g., cosmic galaxy, mountain sunset..."}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Transform Mode - Image Upload */}
          {mode === 'transform' && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/60">
                Upload a photo
              </label>
              <label className={cn(
                'flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed cursor-pointer transition-colors',
                uploadedImage
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-white/20 hover:border-white/40'
              )}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {uploadedImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-white/40 mb-2" />
                    <span className="text-xs text-white/40">Click to upload</span>
                  </>
                )}
              </label>
            </div>
          )}

          {/* Style Selector - Same for both modes */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/60">
              Fun Style {isChild && '✨'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {AVATAR_STYLES.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setSelectedStyle(style.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-xl border transition-all',
                    selectedStyle === style.id
                      ? 'border-indigo-500 bg-indigo-500/20 text-white'
                      : 'border-white/10 hover:border-white/30 text-white/50'
                  )}
                >
                  <span className="text-lg">{style.emoji}</span>
                  <span className="text-[10px] font-medium truncate w-full text-center">{style.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Generated Preview */}
          {generatedImage && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/60">Preview</label>
              <div className="p-3 bg-white/5 rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={generatedImage}
                  alt="Generated banner"
                  className="w-full h-24 rounded-lg object-cover ring-2 ring-indigo-500/30"
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex gap-2">
          {generatedImage ? (
            <>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading || saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
                Try Again
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Use This
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading || (mode === 'generate' && !prompt.trim()) || (mode === 'transform' && !uploadedImage)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
