'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  Upload,
  Loader2,
  Sparkles,
  RefreshCw,
  Check,
} from 'lucide-react';
import {
  BOT_AVATAR_STYLE_LABELS,
  BOT_AVATAR_STYLE_DESCRIPTIONS,
  type BotAvatarAnimationStyle,
  type SubscriptionTier,
} from '@ainexsuite/types';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    sourceImageData: string;
    videoData: string;
    name: string;
    description?: string;
    animationStyle: BotAvatarAnimationStyle;
    availableTiers: SubscriptionTier[];
    isDefault: boolean;
    generationPrompt?: string;
  }) => Promise<void>;
}

const ALL_TIERS: SubscriptionTier[] = ['free', 'trial', 'pro', 'premium'];
const ANIMATION_STYLES: BotAvatarAnimationStyle[] = [
  'conversational',
  'listening',
  'thinking',
  'responding',
];

export function CreateModal({ isOpen, onClose, onSave }: CreateModalProps) {
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [animationStyle, setAnimationStyle] = useState<BotAvatarAnimationStyle>('conversational');
  const [selectedTiers, setSelectedTiers] = useState<SubscriptionTier[]>(['free', 'trial', 'pro', 'premium']);
  const [isDefault, setIsDefault] = useState(false);

  // Image state
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceImagePreview, setSourceImagePreview] = useState<string | null>(null);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const [, setGeneratedVideoUrl] = useState<string | null>(null);
  const [optimizedVideoData, setOptimizedVideoData] = useState<string | null>(null);
  const [generationPrompt, setGenerationPrompt] = useState<string>('');

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setDescription('');
      setAnimationStyle('conversational');
      setSelectedTiers(['free', 'trial', 'pro', 'premium']);
      setIsDefault(false);
      setSourceImage(null);
      setSourceImagePreview(null);
      setIsGenerating(false);
      setGenerationStatus('');
      setGeneratedVideoUrl(null);
      setOptimizedVideoData(null);
      setGenerationPrompt('');
      setError(null);
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }
  }, [isOpen]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Read file as base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSourceImage(dataUrl);
      setSourceImagePreview(dataUrl);
      setError(null);
      // Clear previous generation
      setGeneratedVideoUrl(null);
      setOptimizedVideoData(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please drop an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSourceImage(dataUrl);
      setSourceImagePreview(dataUrl);
      setError(null);
      setGeneratedVideoUrl(null);
      setOptimizedVideoData(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleGenerate = async () => {
    if (!sourceImage) {
      setError('Please upload a source image first');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGenerationStatus('Submitting to FAL.ai...');
    setGeneratedVideoUrl(null);
    setOptimizedVideoData(null);

    try {
      // Start generation
      const response = await fetch('/api/bot-avatars/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceImage,
          style: animationStyle,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Generation failed');
      }

      if (!data.pending || !data.operationId) {
        throw new Error('No operation ID returned');
      }

      setGenerationStatus('Generating animation...');
      setGenerationPrompt(BOT_AVATAR_STYLE_DESCRIPTIONS[animationStyle]);

      // Start polling for status
      const operationId = data.operationId;
      pollingRef.current = setInterval(async () => {
        try {
          const statusResponse = await fetch(
            `/api/bot-avatars/generate?operationId=${operationId}`
          );
          const statusData = await statusResponse.json();

          if (statusData.done) {
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }

            if (statusData.videoUrl) {
              setGeneratedVideoUrl(statusData.videoUrl);
              setGenerationStatus('Optimizing video...');

              // Optimize the video to 200x200
              const optimizeResponse = await fetch('/api/bot-avatars/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoUrl: statusData.videoUrl }),
              });

              const optimizeData = await optimizeResponse.json();

              if (optimizeData.success && optimizeData.videoData) {
                setOptimizedVideoData(optimizeData.videoData);
                setGenerationStatus('Ready to save!');
              } else {
                setError('Failed to optimize video');
                setGenerationStatus('');
              }
            } else {
              setError(statusData.error || 'No video generated');
              setGenerationStatus('');
            }
            setIsGenerating(false);
          } else {
            // Still processing
            setGenerationStatus(`Processing... (${statusData.status || 'working'})`);
          }
        } catch (pollError) {
          console.error('Polling error:', pollError);
        }
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
      setGenerationStatus('');
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!sourceImage || !optimizedVideoData) {
      setError('Please generate an animation first');
      return;
    }

    if (!name.trim()) {
      setError('Please enter a name');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave({
        sourceImageData: sourceImage,
        videoData: optimizedVideoData,
        name: name.trim(),
        description: description.trim() || undefined,
        animationStyle,
        availableTiers: selectedTiers,
        isDefault,
        generationPrompt,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTier = (tier: SubscriptionTier) => {
    setSelectedTiers((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Create Bot Avatar</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column - Image & Preview */}
            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Source Image
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className={`relative aspect-square rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                    sourceImagePreview
                      ? 'border-transparent'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  {sourceImagePreview ? (
                    <Image
                      src={sourceImagePreview}
                      alt="Source"
                      fill
                      className="object-cover rounded-xl"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                      <Upload className="h-10 w-10 mb-2" />
                      <span className="text-sm">Drop image or click to upload</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Generated Preview */}
              {optimizedVideoData && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Generated Avatar (200×200)
                  </label>
                  <div className="relative w-[200px] h-[200px] rounded-xl overflow-hidden bg-black/50 mx-auto">
                    <video
                      ref={videoRef}
                      src={optimizedVideoData}
                      loop
                      muted
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Settings */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Friendly Assistant"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:border-white/30"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:border-white/30"
                />
              </div>

              {/* Animation Style */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Animation Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ANIMATION_STYLES.map((style) => (
                    <button
                      key={style}
                      onClick={() => setAnimationStyle(style)}
                      className={`px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                        animationStyle === style
                          ? 'bg-violet-500/20 border-violet-500/50 border text-violet-300'
                          : 'bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10'
                      }`}
                    >
                      <div className="font-medium">{BOT_AVATAR_STYLE_LABELS[style]}</div>
                      <div className="text-[10px] opacity-70 mt-0.5">
                        {BOT_AVATAR_STYLE_DESCRIPTIONS[style].slice(0, 40)}...
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Available Tiers */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Available to Tiers
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_TIERS.map((tier) => (
                    <button
                      key={tier}
                      onClick={() => toggleTier(tier)}
                      className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                        selectedTiers.includes(tier)
                          ? 'bg-white/20 text-white'
                          : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                      }`}
                    >
                      {selectedTiers.includes(tier) && (
                        <Check className="inline h-3 w-3 mr-1" />
                      )}
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              {/* Set as Default */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500"
                />
                <span className="text-sm text-white">Set as default bot avatar</span>
              </label>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!sourceImage || isGenerating}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium transition-colors"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {generationStatus || 'Generating...'}
                  </>
                ) : optimizedVideoData ? (
                  <>
                    <RefreshCw className="h-5 w-5" />
                    Regenerate Animation
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Generate Animation
                  </>
                )}
              </button>

              {/* Status */}
              {generationStatus && !isGenerating && (
                <p className="text-sm text-emerald-400 text-center">
                  {generationStatus}
                </p>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!optimizedVideoData || !name.trim() || isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 disabled:bg-zinc-600 disabled:cursor-not-allowed text-black font-medium transition-colors"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Avatar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
