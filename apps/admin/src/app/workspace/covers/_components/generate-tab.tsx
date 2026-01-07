'use client';

import { useState, useCallback, useRef } from 'react';
import {
  Sparkles,
  Loader2,
  Check,
  X,
  RefreshCw,
  Upload,
  AlertCircle,
  Image as ImageIcon,
  Wand2,
  Trash2,
  Crown,
} from 'lucide-react';
import { uploadCover } from '@ainexsuite/firebase';
import {
  COVER_STYLE_GUIDES,
  COVER_CATEGORY_STYLES,
  type CoverCategory,
  type CoverAccessLevel,
  type CoverGenerationStyle,
  type CoverDoc,
  type CoverSourceType,
} from '@ainexsuite/types';
import { loadImage, canvasToBlob, blobToDataURL, dataURLtoBlob } from '@/lib/image-utils';

const CATEGORIES: { value: CoverCategory; label: string }[] = [
  { value: 'leather', label: 'Leather' },
  { value: 'fabric', label: 'Fabric' },
  { value: 'paper', label: 'Paper' },
  { value: 'wood', label: 'Wood' },
  { value: 'artistic', label: 'Artistic' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'pattern', label: 'Pattern' },
];

const ACCESS_LEVELS: { value: CoverAccessLevel; label: string; color: string }[] = [
  { value: 'free', label: 'Free', color: 'bg-emerald-500' },
  { value: 'premium', label: 'Premium', color: 'bg-amber-500' },
];

type GenerationStep = 'idle' | 'generating' | 'preview' | 'uploading';
type SourceMode = 'generate' | 'upload';

interface GenerateTabProps {
  userId: string;
  onSuccess: (cover: CoverDoc) => void;
}

/**
 * Generate a thumbnail from an image (200x300 for cover cards)
 */
async function generateCoverThumbnail(imageSource: string | Blob): Promise<Blob> {
  let imageSrc: string;
  if (imageSource instanceof Blob) {
    imageSrc = await blobToDataURL(imageSource);
  } else {
    imageSrc = imageSource;
  }

  const img = await loadImage(imageSrc);

  // Cover thumbnail dimensions (portrait ratio for cards)
  const targetWidth = 200;
  const targetHeight = 300;

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // Calculate cover-style scaling
  const imgAspect = img.width / img.height;
  const canvasAspect = targetWidth / targetHeight;

  let drawWidth: number;
  let drawHeight: number;
  let offsetX: number;
  let offsetY: number;

  if (imgAspect > canvasAspect) {
    drawHeight = targetHeight;
    drawWidth = img.width * (targetHeight / img.height);
    offsetX = (targetWidth - drawWidth) / 2;
    offsetY = 0;
  } else {
    drawWidth = targetWidth;
    drawHeight = img.height * (targetWidth / img.width);
    offsetX = 0;
    offsetY = (targetHeight - drawHeight) / 2;
  }

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

  return canvasToBlob(canvas, 'image/png', 0.9);
}

export function GenerateTab({ userId, onSuccess }: GenerateTabProps) {
  // Source mode
  const [sourceMode, setSourceMode] = useState<SourceMode>('generate');

  // Generation state
  const [step, setStep] = useState<GenerationStep>('idle');
  const [error, setError] = useState<string | null>(null);

  // AI Generation inputs
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<CoverGenerationStyle>('leather-aged');
  const [category, setCategory] = useState<CoverCategory>('leather');

  // Upload inputs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview state
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Metadata form
  const [name, setName] = useState('');
  const [accessLevel, setAccessLevel] = useState<CoverAccessLevel>('free');
  const [tags, setTags] = useState('');

  // Get styles for selected category
  const availableStyles = COVER_CATEGORY_STYLES[category] || [];

  // Handle category change - reset style if not available
  const handleCategoryChange = (newCategory: CoverCategory) => {
    setCategory(newCategory);
    const newStyles = COVER_CATEGORY_STYLES[newCategory] || [];
    if (newStyles.length > 0 && !newStyles.includes(style)) {
      setStyle(newStyles[0]);
    }
  };

  // Handle file selection for upload mode
  const handleFileSelect = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewImage(result);
      // Auto-fill name from filename
      const nameFromFile = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setName(nameFromFile.charAt(0).toUpperCase() + nameFromFile.slice(1));
      setStep('preview');
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  // Generate image via AI
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setStep('generating');
    setError(null);

    try {
      const response = await fetch('/api/generate-cover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style,
          category,
        }),
      });

      const data = await response.json();

      if (!data.success || !data.imageData) {
        throw new Error(data.error || 'Generation failed');
      }

      setPreviewImage(data.imageData);
      // Auto-fill name from style
      const styleName = style.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      setName(`${styleName} Cover`);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
      setStep('idle');
    }
  };

  // Regenerate (for AI mode)
  const handleRegenerate = () => {
    setPreviewImage(null);
    handleGenerate();
  };

  // Approve and save
  const handleApprove = async () => {
    if (!previewImage) return;

    setStep('uploading');
    setError(null);

    try {
      // Convert preview image to blob
      const originalBlob = dataURLtoBlob(previewImage);

      // Generate thumbnail
      const thumbnailBlob = await generateCoverThumbnail(previewImage);

      // Upload to Firebase
      const result = await uploadCover(
        originalBlob,
        thumbnailBlob,
        {
          name: name.trim() || 'AI Generated Cover',
          category,
          accessLevel,
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          sourceType: (sourceMode === 'generate' ? 'ai-generated' : 'uploaded') as CoverSourceType,
          generationMeta:
            sourceMode === 'generate'
              ? {
                  prompt: prompt.trim(),
                  style,
                  model: 'gemini-2.0-flash-preview-image-generation',
                  generatedAt: new Date(),
                }
              : undefined,
        },
        userId
      );

      onSuccess(result);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save cover');
      setStep('preview');
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setStep('idle');
    setPreviewImage(null);
    setPrompt('');
    setStyle('leather-aged');
    setCategory('leather');
    setName('');
    setAccessLevel('free');
    setTags('');
    setError(null);
  };

  // Discard current generation but keep inputs
  const handleDiscard = () => {
    setStep('idle');
    setPreviewImage(null);
    setError(null);
  };

  // Cancel and go back
  const handleCancel = () => {
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-white/10 rounded">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Step: Idle - Show source mode selection and input form */}
      {step === 'idle' && (
        <>
          {/* Source Mode Toggle */}
          <div className="flex gap-2 p-1 bg-white/5 rounded-lg w-fit">
            <button
              onClick={() => setSourceMode('generate')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                sourceMode === 'generate'
                  ? 'bg-white/10 text-white'
                  : 'text-muted-foreground hover:text-white'
              }`}
            >
              <Wand2 className="h-4 w-4" />
              AI Generate
            </button>
            <button
              onClick={() => setSourceMode('upload')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                sourceMode === 'upload'
                  ? 'bg-white/10 text-white'
                  : 'text-muted-foreground hover:text-white'
              }`}
            >
              <Upload className="h-4 w-4" />
              Upload Image
            </button>
          </div>

          {/* AI Generation Form */}
          {sourceMode === 'generate' && (
            <div className="glass-card rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <h3 className="text-lg font-medium text-white">Generate Cover with AI</h3>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Cover Category
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => handleCategoryChange(cat.value)}
                      className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                        category === cat.value
                          ? 'bg-white/10 border-white/30 text-white'
                          : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Selection */}
              {availableStyles.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Style
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {availableStyles.map((s) => {
                      const styleName = s.split('-').slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                      return (
                        <button
                          key={s}
                          onClick={() => setStyle(s)}
                          className={`px-3 py-2 rounded-lg border text-sm transition-colors text-left ${
                            style === s
                              ? 'bg-white/10 border-white/30 text-white'
                              : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                          }`}
                          title={COVER_STYLE_GUIDES[s]}
                        >
                          {styleName}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {COVER_STYLE_GUIDES[style]}
                  </p>
                </div>
              )}

              {/* Custom Prompt */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Additional details (optional)
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Add any specific details you want, like color preferences or patterns..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground resize-none"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-medium transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                Generate Cover
              </button>
            </div>
          )}

          {/* Upload Form */}
          {sourceMode === 'upload' && (
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-medium text-white">Upload Cover Image</h3>
              </div>

              {/* Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 hover:border-white/40 rounded-xl p-8 text-center cursor-pointer transition-colors"
              >
                <ImageIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-1">
                  Drag and drop an image, or click to select
                </p>
                <p className="text-xs text-muted-foreground">
                  Best size: 400x600px (2:3 portrait ratio)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  className="hidden"
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Step: Generating */}
      {step === 'generating' && (
        <div className="glass-card rounded-xl p-12 text-center">
          <Loader2 className="h-12 w-12 text-amber-400 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Generating Cover</h3>
          <p className="text-muted-foreground">Creating your {category} cover texture...</p>
        </div>
      )}

      {/* Step: Preview */}
      {step === 'preview' && previewImage && (
        <div className="space-y-6">
          {/* Preview Image */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="aspect-[2/3] max-h-[400px] relative flex justify-center bg-black/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImage}
                alt="Preview"
                className="h-full object-contain"
              />
            </div>
            <div className="p-4 flex items-center justify-between border-t border-white/10">
              <span className="text-sm text-muted-foreground">
                {sourceMode === 'generate' ? 'AI Generated' : 'Uploaded Image'}
              </span>
              <div className="flex gap-2">
                {sourceMode === 'generate' && (
                  <button
                    onClick={handleRegenerate}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors text-sm"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Regenerate
                  </button>
                )}
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors text-sm"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </div>
          </div>

          {/* Metadata Form */}
          <div className="glass-card rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-medium text-white">Cover Details</h3>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Cover name"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CoverCategory)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Access Level */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Access Level
              </label>
              <div className="flex gap-2">
                {ACCESS_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setAccessLevel(level.value)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                      accessLevel === level.value
                        ? level.value === 'premium'
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                          : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                        : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                    }`}
                  >
                    {level.value === 'premium' && <Crown className="h-4 w-4" />}
                    {level.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="vintage, brown, elegant"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground"
              />
            </div>

            {/* Save Button */}
            <div className="flex gap-3">
              <button
                onClick={handleDiscard}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-medium transition-colors"
              >
                <Check className="h-4 w-4" />
                Save Cover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step: Uploading */}
      {step === 'uploading' && (
        <div className="glass-card rounded-xl p-12 text-center">
          <Loader2 className="h-12 w-12 text-emerald-400 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Saving Cover</h3>
          <p className="text-muted-foreground">Uploading to library...</p>
        </div>
      )}
    </div>
  );
}
