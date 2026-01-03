"use client";

import * as React from "react";
import { clsx } from "clsx";
import {
  Sparkles,
  Loader2,
  RefreshCw,
  Check,
  X,
  Play,
  Pause,
} from "lucide-react";

// Avatar actions - things the avatar can do
const AVATAR_ACTIONS = [
  { id: "wave", label: "Wave", emoji: "👋", description: "Friendly wave hello" },
  { id: "wink", label: "Wink", emoji: "😉", description: "Playful wink with a smile" },
  { id: "thumbsup", label: "Thumbs Up", emoji: "👍", description: "Approving thumbs up gesture" },
  { id: "peace", label: "Peace", emoji: "✌️", description: "Peace sign with a grin" },
  { id: "dance", label: "Dance", emoji: "💃", description: "Fun dance moves" },
  { id: "laugh", label: "Laugh", emoji: "😂", description: "Hearty laugh with joy" },
  { id: "nod", label: "Nod", emoji: "🙂", description: "Approving nod with smile" },
  { id: "blowkiss", label: "Blow Kiss", emoji: "😘", description: "Blow a sweet kiss" },
  { id: "shrug", label: "Shrug", emoji: "🤷", description: "Casual shrug gesture" },
  { id: "clap", label: "Clap", emoji: "👏", description: "Excited applause" },
  { id: "salute", label: "Salute", emoji: "🫡", description: "Respectful salute" },
  { id: "flex", label: "Flex", emoji: "💪", description: "Show off those muscles" },
] as const;

export type AvatarActionId = (typeof AVATAR_ACTIONS)[number]["id"];

export interface AnimateAvatarModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Source image URL to animate */
  sourceImage: string;
  /** Current avatar action (auto-select if available) */
  currentAction?: string;
  /** Callback to generate animation */
  onGenerate: (action: AvatarActionId) => Promise<{ success: boolean; videoData?: string; error?: string; pending?: boolean; operationId?: string }>;
  /** Callback to save the generated video */
  onSave: (videoData: string, action: AvatarActionId) => Promise<{ success: boolean; error?: string }>;
  /** Poll for operation status (for long-running generation) */
  onPollStatus?: (operationId: string) => Promise<{ success: boolean; done: boolean; videoData?: string; error?: string }>;
  /** API endpoint for animation generation */
  apiEndpoint?: string;
}

export function AnimateAvatarModal({
  isOpen,
  onClose,
  sourceImage,
  currentAction,
  onGenerate,
  onSave,
  onPollStatus,
  apiEndpoint = "/api/animate-avatar",
}: AnimateAvatarModalProps) {
  const [selectedAction, setSelectedAction] = React.useState<AvatarActionId>(
    (currentAction as AvatarActionId) || "wave"
  );
  const [generatedVideo, setGeneratedVideo] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState<string | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const pollIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setGeneratedVideo(null);
      setError(null);
      setProgress(null);
      setLoading(false);
      setSaving(false);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
  }, [isOpen]);

  // Auto-play/pause video
  React.useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, generatedVideo]);

  const pollOperation = React.useCallback(async (operationId: string) => {
    if (!onPollStatus) return;

    const checkStatus = async () => {
      try {
        const result = await onPollStatus(operationId);

        if (result.done) {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }

          if (result.success && result.videoData) {
            setGeneratedVideo(result.videoData);
            setLoading(false);
            setProgress(null);
          } else {
            setError(result.error || "Video generation failed");
            setLoading(false);
            setProgress(null);
          }
        }
      } catch (err) {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        setError(err instanceof Error ? err.message : "Failed to check status");
        setLoading(false);
        setProgress(null);
      }
    };

    // Poll every 2 seconds
    pollIntervalRef.current = setInterval(checkStatus, 2000);
    // Initial check
    await checkStatus();
  }, [onPollStatus]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setGeneratedVideo(null);
    setProgress("Starting animation generation...");

    try {
      // Use custom onGenerate if provided, otherwise call API directly
      if (onGenerate) {
        const result = await onGenerate(selectedAction);

        if (result.pending && result.operationId) {
          setProgress("Generating animation... This may take 10-30 seconds");
          await pollOperation(result.operationId);
        } else if (result.success && result.videoData) {
          setGeneratedVideo(result.videoData);
          setLoading(false);
          setProgress(null);
        } else {
          throw new Error(result.error || "Failed to generate animation");
        }
      } else {
        // Direct API call
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceImage,
            action: selectedAction,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to generate animation");
        }

        if (data.pending && data.operationId && onPollStatus) {
          setProgress("Generating animation... This may take 10-30 seconds");
          await pollOperation(data.operationId);
        } else if (data.videoData) {
          setGeneratedVideo(data.videoData);
          setLoading(false);
          setProgress(null);
        } else {
          throw new Error("No video data in response");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate animation");
      setLoading(false);
      setProgress(null);
    }
  };

  const handleSave = async () => {
    if (!generatedVideo) return;

    setSaving(true);
    setError(null);

    try {
      const result = await onSave(generatedVideo, selectedAction);

      if (!result.success) {
        throw new Error(result.error || "Failed to save animation");
      }

      // Success - close modal
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save animation");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    onClose();
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-background/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={loading ? undefined : handleClose}
      />
      <div className="relative z-[201] w-full max-w-2xl rounded-2xl bg-popover border border-border shadow-xl animate-in zoom-in-95 fade-in duration-200 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Avatar Animation
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Source Image Preview */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <p className="text-xs font-medium text-muted-foreground mb-2">Source</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sourceImage}
                alt="Source avatar"
                className="w-24 h-24 rounded-xl object-cover ring-2 ring-border"
              />
            </div>

            {/* Generated Video Preview */}
            {generatedVideo && (
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground mb-2">Generated Animation</p>
                <div className="relative">
                  <video
                    ref={videoRef}
                    src={generatedVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-auto max-h-48 rounded-xl object-cover ring-2 ring-primary shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={togglePlayPause}
                    className="absolute bottom-2 right-2 p-2 rounded-full bg-background/80 backdrop-blur-sm text-foreground hover:bg-background transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && !generatedVideo && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 bg-muted/30 rounded-xl">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                <p className="text-sm text-muted-foreground text-center">
                  {progress || "Generating animation..."}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  This may take 10-30 seconds
                </p>
              </div>
            )}
          </div>

          {/* Action Selector - Compact chips */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Choose an Action
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVATAR_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => setSelectedAction(action.id)}
                  disabled={loading}
                  className={clsx(
                    "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                    selectedAction === action.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                    loading && "opacity-50 cursor-not-allowed"
                  )}
                  title={action.description}
                >
                  <span className="text-sm">{action.emoji}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
            {selectedAction && (
              <p className="text-xs text-muted-foreground mt-1">
                {AVATAR_ACTIONS.find(a => a.id === selectedAction)?.description}
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex gap-2">
          {generatedVideo ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setGeneratedVideo(null);
                  handleGenerate();
                }}
                disabled={loading || saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-muted text-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={clsx("h-4 w-4", loading && "animate-spin")} />
                Try Again
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
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
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Animation
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
