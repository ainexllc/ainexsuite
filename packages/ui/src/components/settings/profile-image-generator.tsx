"use client";

import * as React from "react";
import { clsx } from "clsx";
import {
  Sparkles,
  Upload,
  Loader2,
  RefreshCw,
  Check,
  X,
  Wand2,
  ImageIcon,
} from "lucide-react";

// Unified styles for both generation and transformation (12 fun styles)
const AVATAR_STYLES = [
  { id: "pixar", label: "Pixar 3D", emoji: "🎬" },
  { id: "disney", label: "Disney", emoji: "🏰" },
  { id: "lego", label: "LEGO", emoji: "🧱" },
  { id: "wool", label: "Wool", emoji: "🧶" },
  { id: "cyberpunk", label: "Cyberpunk", emoji: "🌆" },
  { id: "anime", label: "Anime", emoji: "🎌" },
  { id: "claymation", label: "Clay", emoji: "🗿" },
  { id: "cartoon", label: "Cartoon", emoji: "🎨" },
  { id: "pixel", label: "Pixel Art", emoji: "👾" },
  { id: "superhero", label: "Superhero", emoji: "🦸" },
  { id: "watercolor", label: "Watercolor", emoji: "💧" },
  { id: "pop-art", label: "Pop Art", emoji: "🎯" },
] as const;

type AvatarStyleId = (typeof AVATAR_STYLES)[number]["id"];
type Mode = "generate" | "transform";

export interface ProfileImageGeneratorProps {
  /** Current user photo URL */
  currentPhotoURL?: string | null;
  /** User's display name for fallback */
  displayName?: string | null;
  /** User's email for fallback */
  email?: string | null;
  /** Callback when profile image is updated */
  onUpdateImage: (imageData: string) => Promise<{ success: boolean; error?: string }>;
  /** Callback when profile image is removed */
  onRemoveImage?: () => Promise<boolean>;
  /** API endpoint for generation */
  apiEndpoint?: string;
  /** Whether to show the remove button */
  showRemoveButton?: boolean;
}

export function ProfileImageGenerator({
  currentPhotoURL,
  displayName,
  email,
  onUpdateImage,
  onRemoveImage,
  apiEndpoint = "/api/generate-profile-image",
  showRemoveButton = false,
}: ProfileImageGeneratorProps) {
  const [mode, setMode] = React.useState<Mode>("generate");
  const [isOpen, setIsOpen] = React.useState(false);
  const [prompt, setPrompt] = React.useState("");
  const [selectedStyle, setSelectedStyle] = React.useState<AvatarStyleId>("pixar");
  const [uploadedImage, setUploadedImage] = React.useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const directUploadRef = React.useRef<HTMLInputElement>(null);

  // Get initials for fallback avatar
  const initials = React.useMemo(() => {
    const name = displayName || email || "U";
    return name.charAt(0).toUpperCase();
  }, [displayName, email]);

  // Handle direct upload (no AI, just save the image)
  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 2MB for profile images)
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be less than 2MB");
      return;
    }

    setSaving(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;
      try {
        const saveResult = await onUpdateImage(result);
        if (!saveResult.success) {
          throw new Error(saveResult.error || "Failed to save image");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to upload image");
      } finally {
        setSaving(false);
        // Reset the input so the same file can be selected again
        if (directUploadRef.current) {
          directUploadRef.current.value = "";
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle file upload for transform mode
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
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
    if (mode === "generate" && !prompt.trim()) {
      setError("Please enter a description for your avatar");
      return;
    }

    if (mode === "transform" && !uploadedImage) {
      setError("Please upload an image first");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const body =
        mode === "generate"
          ? {
              mode: "generate",
              prompt: prompt.trim(),
              style: selectedStyle,
            }
          : {
              mode: "transform",
              style: selectedStyle,
              sourceImage: uploadedImage,
            };

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate image");
      }

      setGeneratedImage(data.imageData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate image");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedImage) return;

    setSaving(true);
    setError(null);

    try {
      const result = await onUpdateImage(generatedImage);

      if (!result.success) {
        throw new Error(result.error || "Failed to save image");
      }

      // Success - close modal and reset state
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save image");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setGeneratedImage(null);
    setUploadedImage(null);
    setPrompt("");
    setError(null);
    setMode("generate");
  };

  const handleRemove = async () => {
    if (!onRemoveImage) return;

    setSaving(true);
    try {
      await onRemoveImage();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Current Profile Banner Display */}
      <div className="space-y-3">
        {currentPhotoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentPhotoURL}
            alt={displayName || "Profile"}
            className="w-full h-24 rounded-xl object-cover ring-2 ring-border"
          />
        ) : (
          <div className="w-full h-24 rounded-xl bg-gradient-to-r from-primary/20 to-primary/5 flex items-center justify-center ring-2 ring-border">
            <span className="text-4xl font-bold text-primary/40">{initials}</span>
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-foreground">Profile Banner</p>
          <p className="text-xs text-muted-foreground">
            Create a unique banner for your profile header
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setIsOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          Generate
        </button>
        <input
          ref={directUploadRef}
          type="file"
          accept="image/*"
          onChange={handleDirectUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => directUploadRef.current?.click()}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-muted text-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload
            </>
          )}
        </button>
        {showRemoveButton && currentPhotoURL && onRemoveImage && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {saving ? "Removing..." : "Remove"}
          </button>
        )}
      </div>

      {/* Error display for direct upload */}
      {error && !isOpen && (
        <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Generator Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-background/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleClose}
          />
          <div className="relative z-[201] w-full max-w-lg rounded-2xl bg-popover border border-border shadow-xl animate-in zoom-in-95 fade-in duration-200 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  Generate Banner
                </h3>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Mode Selector */}
              <div className="flex gap-1 p-1 rounded-xl bg-muted">
                <button
                  type="button"
                  onClick={() => setMode("generate")}
                  className={clsx(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
                    mode === "generate"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Wand2 className="h-4 w-4" />
                  Generate
                </button>
                <button
                  type="button"
                  onClick={() => setMode("transform")}
                  className={clsx(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
                    mode === "transform"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <ImageIcon className="h-4 w-4" />
                  Transform
                </button>
              </div>

              {/* Generate Mode - Prompt Input */}
              {mode === "generate" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Describe your avatar
                  </label>
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., cosmic galaxy, mountain sunset, neon city..."
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              )}

              {/* Transform Mode - Image Upload */}
              {mode === "transform" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Upload your photo
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={clsx(
                      "w-full h-32 rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-2",
                      uploadedImage
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {uploadedImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={uploadedImage}
                        alt="Uploaded"
                        className="h-24 w-24 rounded-full object-cover"
                      />
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Click to upload an image
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Style Selector - Same for both modes */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Style
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {AVATAR_STYLES.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setSelectedStyle(style.id)}
                      className={clsx(
                        "flex flex-col items-center gap-1 p-2 rounded-xl border transition-all",
                        selectedStyle === style.id
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span className="text-lg">{style.emoji}</span>
                      <span className="text-[10px] font-medium truncate w-full text-center">
                        {style.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generated Preview */}
              {generatedImage && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Preview
                  </label>
                  <div className="flex justify-center p-4 bg-muted/50 rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={generatedImage}
                      alt="Generated banner"
                      className="w-full max-h-40 rounded-xl object-cover ring-2 ring-background shadow-lg"
                    />
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border flex gap-2">
              {generatedImage ? (
                <>
                  <button
                    type="button"
                    onClick={handleGenerate}
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
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={loading || (mode === "generate" && !prompt.trim()) || (mode === "transform" && !uploadedImage)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
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
      )}
    </div>
  );
}
