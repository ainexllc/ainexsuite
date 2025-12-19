'use client';

import { useState, useCallback, useRef } from 'react';
import {
  Sparkles,
  Loader2,
  Check,
  X,
  RefreshCw,
  Upload,
  Sun,
  Moon,
  AlertCircle,
  Image as ImageIcon,
  Wand2,
  Trash2,
} from 'lucide-react';
import { uploadBackgroundWithVariants } from '@ainexsuite/firebase';
import type {
  BackgroundCategory,
  BackgroundAccessLevel,
  BackgroundBrightness,
  BackgroundGenerationStyle,
  BackgroundDocWithVariants,
} from '@ainexsuite/types';
import { generateVariants, dataURLtoBlob } from '@/lib/image-utils';

const CATEGORIES: BackgroundCategory[] = [
  'seasonal',
  'abstract',
  'nature',
  'minimal',
  'gradient',
  'festive',
  'other',
];

const ACCESS_LEVELS: { value: BackgroundAccessLevel; label: string; color: string }[] = [
  { value: 'free', label: 'Free', color: 'bg-emerald-500' },
  { value: 'premium', label: 'Premium', color: 'bg-amber-500' },
  { value: 'restricted', label: 'Enterprise', color: 'bg-purple-500' },
];

const STYLES: { value: BackgroundGenerationStyle; label: string; description: string }[] = [
  { value: 'photorealistic', label: 'Photorealistic', description: 'High-resolution photography style' },
  { value: 'artistic', label: 'Artistic', description: 'Painterly, creative interpretation' },
  { value: 'abstract', label: 'Abstract', description: 'Geometric shapes, modern art' },
  { value: 'minimal', label: 'Minimal', description: 'Clean, simple composition' },
  { value: 'gradient', label: 'Gradient', description: 'Smooth color transitions' },
  { value: 'watercolor', label: 'Watercolor', description: 'Soft washes, bleeding edges' },
  { value: '3d-render', label: '3D Render', description: 'Volumetric lighting, ray-traced' },
  { value: 'cinematic', label: 'Cinematic', description: 'Dramatic lighting, film grain' },
  { value: 'neon', label: 'Neon', description: 'Glowing lights, synthwave vibes' },
  { value: 'vintage', label: 'Vintage', description: 'Retro color grading, nostalgic' },
  { value: 'geometric', label: 'Geometric', description: 'Mathematical patterns, tessellations' },
  { value: 'bokeh', label: 'Bokeh', description: 'Soft focus, dreamy blur' },
  { value: 'ethereal', label: 'Ethereal', description: 'Mystical, heavenly quality' },
  { value: 'cyberpunk', label: 'Cyberpunk', description: 'Futuristic, holographic elements' },
  { value: 'texture', label: 'Texture', description: 'Rich tactile surfaces' },
  { value: 'oil-painting', label: 'Oil Painting', description: 'Classical art, thick brushwork' },
  { value: 'digital-art', label: 'Digital Art', description: 'Modern illustration, clean vectors' },
  { value: 'dreamy', label: 'Dreamy', description: 'Surreal, magical realism' },
  { value: 'noir', label: 'Noir', description: 'High contrast, moody shadows' },
  { value: 'wool', label: 'Wool', description: 'Felted wool, cozy texture' },
  { value: 'lego', label: 'Lego', description: 'Plastic bricks, playful 3D' },
  { value: 'low-poly', label: 'Low Poly', description: 'Faceted geometric 3D art' },
  { value: 'clay', label: 'Clay', description: 'Claymation, sculpted look' },
  { value: 'pixel-art', label: 'Pixel Art', description: '8-bit retro gaming style' },
  { value: 'paper-craft', label: 'Paper Craft', description: 'Origami, layered cutouts' },
  { value: 'glass', label: 'Glass', description: 'Transparent, refractive effects' },
  { value: 'marble', label: 'Marble', description: 'Veined stone, polished surface' },
];

type GenerationStep = 'idle' | 'generating' | 'preview' | 'processing' | 'uploading';
type SourceMode = 'generate' | 'upload';

interface GenerateTabProps {
  userId: string;
  onSuccess: (background: BackgroundDocWithVariants) => void;
}

export function GenerateTab({ userId, onSuccess }: GenerateTabProps) {
  // Source mode
  const [sourceMode, setSourceMode] = useState<SourceMode>('generate');

  // Generation state
  const [step, setStep] = useState<GenerationStep>('idle');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 16, currentKey: '' });

  // AI Generation inputs
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<BackgroundGenerationStyle>('photorealistic');
  const [colorHint, setColorHint] = useState('');

  // Upload inputs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview state
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Metadata form
  const [name, setName] = useState('');
  const [brightness, setBrightness] = useState<BackgroundBrightness>('dark');
  const [category, setCategory] = useState<BackgroundCategory>('other');
  const [accessLevel, setAccessLevel] = useState<BackgroundAccessLevel>('free');
  const [tags, setTags] = useState('');

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
      const response = await fetch('/api/generate-background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style,
          category, // Pass category for mood/atmosphere guidance
          brightness, // Pass brightness for text readability optimization
          colorHint: colorHint.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!data.success || !data.imageData) {
        throw new Error(data.error || 'Generation failed');
      }

      setPreviewImage(data.imageData);
      // Auto-fill name from prompt
      setName(prompt.slice(0, 50));
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

  // Approve and process variants
  const handleApprove = async () => {
    if (!previewImage) return;

    setStep('processing');
    setProgress({ current: 0, total: 16, currentKey: '' });
    setError(null);

    try {
      // Generate all 16 responsive variants
      const variants = await generateVariants(previewImage, (current, total, currentKey) => {
        setProgress({ current, total, currentKey });
      });

      setStep('uploading');

      // Convert preview image to blob
      const originalBlob = dataURLtoBlob(previewImage);

      // Upload to Firebase with all variants
      const result = await uploadBackgroundWithVariants(
        originalBlob,
        variants,
        {
          name: name.trim() || 'AI Generated Background',
          brightness,
          category,
          accessLevel,
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          sourceType: sourceMode === 'generate' ? 'ai-generated' : 'uploaded',
          generationMeta:
            sourceMode === 'generate'
              ? {
                  prompt: prompt.trim(),
                  model: 'gemini-2.0-flash-preview-image-generation',
                  generatedAt: new Date(),
                  provider: 'gemini',
                  baseImagePath: '',
                }
              : undefined,
        },
        userId
      );

      onSuccess(result);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save background');
      setStep('preview');
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setStep('idle');
    setPreviewImage(null);
    setPrompt('');
    setStyle('photorealistic');
    setColorHint('');
    setName('');
    setBrightness('dark');
    setCategory('other');
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
                <h3 className="text-lg font-medium text-white">Generate with AI</h3>
              </div>

              {/* Prompt */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Describe the background you want
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A serene mountain landscape at sunset with warm orange and purple tones..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground resize-none"
                />
              </div>

              {/* Style Selection */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Style
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2">
                  {STYLES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setStyle(s.value)}
                      className={`px-2 py-2 rounded-lg border text-xs transition-colors ${
                        style === s.value
                          ? 'bg-white/10 border-white/30 text-white'
                          : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                      }`}
                      title={s.description}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category (for mood/atmosphere) */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Category (affects mood)
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as BackgroundCategory)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brightness (critical for text readability) */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Brightness (for text overlay)
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBrightness('dark')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                      brightness === 'dark'
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                        : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                    }`}
                  >
                    <Moon className="h-4 w-4" />
                    Dark (light text)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrightness('light')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                      brightness === 'light'
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                        : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                    }`}
                  >
                    <Sun className="h-4 w-4" />
                    Light (dark text)
                  </button>
                </div>
              </div>

              {/* Color Hint (Optional) */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Color hint (optional)
                </label>
                <input
                  type="text"
                  value={colorHint}
                  onChange={(e) => setColorHint(e.target.value)}
                  placeholder="e.g., blue and purple, warm earth tones, monochrome"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim()}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="h-4 w-4" />
                Generate Background
              </button>
            </div>
          )}

          {/* Upload Form */}
          {sourceMode === 'upload' && (
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-medium text-white">Upload Existing Image</h3>
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
                  The image will be resized into 16 responsive variants
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
          <h3 className="text-lg font-medium text-white mb-2">Generating Background</h3>
          <p className="text-muted-foreground">This may take a moment...</p>
        </div>
      )}

      {/* Step: Preview */}
      {step === 'preview' && previewImage && (
        <div className="space-y-6">
          {/* Preview Image */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="aspect-video relative">
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-full object-cover"
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
            <h3 className="text-lg font-medium text-white">Background Details</h3>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Background name"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground"
              />
            </div>

            {/* Brightness */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Brightness
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setBrightness('dark')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                    brightness === 'dark'
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                      : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                  }`}
                >
                  <Moon className="h-4 w-4" />
                  Dark
                </button>
                <button
                  type="button"
                  onClick={() => setBrightness('light')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                    brightness === 'light'
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                      : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                  }`}
                >
                  <Sun className="h-4 w-4" />
                  Light
                </button>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BackgroundCategory)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Access Level */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Access Level
              </label>
              <select
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value as BackgroundAccessLevel)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
              >
                {ACCESS_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
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
                placeholder="nature, sunset, mountains"
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
                Save Background (16 Responsive Variants)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step: Processing Variants */}
      {step === 'processing' && (
        <div className="glass-card rounded-xl p-12 text-center">
          <Loader2 className="h-12 w-12 text-blue-400 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Generating Responsive Variants</h3>
          <p className="text-muted-foreground mb-4">
            Creating {progress.total} optimized versions...
          </p>
          <div className="max-w-xs mx-auto">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {progress.current} / {progress.total}
              {progress.currentKey && ` - ${progress.currentKey}`}
            </p>
          </div>
        </div>
      )}

      {/* Step: Uploading */}
      {step === 'uploading' && (
        <div className="glass-card rounded-xl p-12 text-center">
          <Loader2 className="h-12 w-12 text-emerald-400 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Saving to Library</h3>
          <p className="text-muted-foreground">Uploading all variants to storage...</p>
        </div>
      )}
    </div>
  );
}
