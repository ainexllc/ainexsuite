'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import {
  Loader2,
  Plus,
  Trash2,
  Edit2,
  X,
  Upload,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Video,
  Copy,
  Check,
  Play,
  Image as ImageIcon,
  Clock,
  Zap,
} from 'lucide-react';
import {
  uploadVideoBackground,
  updateVideoBackground,
  deleteVideoBackground,
  subscribeToVideoBackgrounds,
  formatFileSize,
  isVideoProcessed,
  isVideoProcessing,
  isVideoProcessingFailed,
  type VideoBackgroundDoc,
  type VideoBackgroundCreateInput,
  type VideoVariant,
} from '@ainexsuite/firebase';
import { useAuth } from '@ainexsuite/auth';

const APP_OPTIONS = [
  { value: '', label: 'Not Assigned' },
  { value: 'main', label: 'Main' },
  { value: 'notes', label: 'Notes' },
  { value: 'journal', label: 'Journal' },
  { value: 'todo', label: 'Todo' },
  { value: 'health', label: 'Health' },
  { value: 'album', label: 'Album' },
  { value: 'habits', label: 'Habits' },
  { value: 'hub', label: 'Hub' },
  { value: 'fit', label: 'Fit' },
  { value: 'projects', label: 'Projects' },
  { value: 'workflow', label: 'Workflow' },
  { value: 'calendar', label: 'Calendar' },
];

/**
 * Processing status badge component
 */
function ProcessingBadge({ video }: { video: VideoBackgroundDoc }) {
  if (isVideoProcessed(video)) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-400">
        <Zap className="h-3 w-3" />
        Optimized
      </span>
    );
  }

  if (isVideoProcessing(video)) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-400">
        <Loader2 className="h-3 w-3 animate-spin" />
        Processing
      </span>
    );
  }

  if (isVideoProcessingFailed(video)) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400 cursor-help"
        title={video.processingStatus?.error || 'Processing failed'}
      >
        <AlertCircle className="h-3 w-3" />
        Failed
      </span>
    );
  }

  // No processing status - video was uploaded before transcoding was enabled
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
      <Clock className="h-3 w-3" />
      Pending
    </span>
  );
}

/**
 * Variant info display component
 */
function VariantInfo({ variants }: { variants?: VideoVariant[] }) {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {variants.map((v) => (
        <span
          key={`${v.quality}-${v.format}`}
          className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-muted-foreground"
        >
          {v.quality} {v.format.toUpperCase()} ({formatFileSize(v.fileSize)})
        </span>
      ))}
    </div>
  );
}

export default function VideoBackgroundsManagement() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoBackgroundDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<VideoBackgroundDoc | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<VideoBackgroundDoc | null>(null);
  const [previewVideo, setPreviewVideo] = useState<VideoBackgroundDoc | null>(null);

  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPosterFile, setUploadPosterFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadOverlay, setUploadOverlay] = useState(0.4);
  const [uploadAssignedApp, setUploadAssignedApp] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editOverlay, setEditOverlay] = useState(0.4);
  const [editAssignedApp, setEditAssignedApp] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Deleting state
  const [deleting, setDeleting] = useState(false);

  // Copy URL state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to videos
  useEffect(() => {
    const unsubscribe = subscribeToVideoBackgrounds((vids) => {
      setVideos(vids);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Clear messages after timeout
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Handle video file selection
  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('video/')) {
      setError('Please select a video file (MP4, WebM, etc.)');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('Video must be under 50MB');
      return;
    }
    setUploadFile(file);
    // Auto-fill name from filename
    const nameFromFile = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setUploadName(nameFromFile.charAt(0).toUpperCase() + nameFromFile.slice(1));
  }, []);

  // Handle poster file selection
  const handlePosterSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file for the poster');
      return;
    }
    setUploadPosterFile(file);
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Handle upload
  const handleUpload = async () => {
    if (!uploadFile || !user?.uid) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const metadata: VideoBackgroundCreateInput = {
        name: uploadName.trim() || 'Untitled Video',
        description: uploadDescription.trim() || undefined, // undefined is OK here - service converts to null
        recommendedOverlay: uploadOverlay,
        assignedApp: uploadAssignedApp || undefined, // undefined is OK here - service converts to null
        tags: uploadTags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      await uploadVideoBackground(
        uploadFile,
        metadata,
        user.uid,
        (progress) => setUploadProgress(progress),
        uploadPosterFile || undefined
      );

      setSuccess('Video background uploaded successfully!');
      resetUploadForm();
      setShowUploadModal(false);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload video. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Reset upload form
  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadPosterFile(null);
    setUploadName('');
    setUploadDescription('');
    setUploadOverlay(0.4);
    setUploadAssignedApp('');
    setUploadTags('');
  };

  // Open edit modal
  const openEditModal = (video: VideoBackgroundDoc) => {
    setShowEditModal(video);
    setEditName(video.name);
    setEditDescription(video.description || '');
    setEditOverlay(video.recommendedOverlay || 0.4);
    setEditAssignedApp(video.assignedApp || '');
    setEditTags(video.tags.join(', '));
    setEditActive(video.active);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!showEditModal) return;

    setSaving(true);
    setError(null);

    try {
      await updateVideoBackground(showEditModal.id, {
        name: editName.trim() || 'Untitled Video',
        description: editDescription.trim() || undefined,
        recommendedOverlay: editOverlay,
        assignedApp: editAssignedApp || undefined,
        tags: editTags.split(',').map((t) => t.trim()).filter(Boolean),
        active: editActive,
      });
      setSuccess('Video background updated successfully!');
      setShowEditModal(null);
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update video. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!showDeleteConfirm) return;

    setDeleting(true);
    setError(null);

    try {
      await deleteVideoBackground(showDeleteConfirm.id);
      setSuccess('Video background deleted successfully!');
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete video. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Copy URL to clipboard
  const copyUrl = async (video: VideoBackgroundDoc) => {
    try {
      await navigator.clipboard.writeText(video.downloadURL);
      setCopiedId(video.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Copy error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
          <p className="text-muted-foreground text-sm">Loading video backgrounds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Video className="h-7 w-7" />
            Video Backgrounds
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage animated video backgrounds for landing pages
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <Plus className="h-4 w-4" />
          Upload Video
        </button>
      </div>

      {/* Status Messages */}
      {success && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Info */}
      <div className="text-muted-foreground text-sm">
        {videos.length} video{videos.length !== 1 ? 's' : ''}
      </div>

      {/* Videos Grid */}
      {videos.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No video backgrounds yet</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="mt-4 text-sm text-white/70 hover:text-white transition-colors"
          >
            Upload your first video
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="glass-card rounded-xl overflow-hidden group relative"
            >
              {/* Video Thumbnail */}
              <div className="aspect-video relative bg-black">
                {video.posterURL ? (
                  <Image
                    src={video.posterURL}
                    alt={video.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/5">
                    <Video className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                {/* Play button overlay */}
                <button
                  onClick={() => setPreviewVideo(video)}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play className="h-6 w-6 text-white ml-1" />
                  </div>
                </button>
                {/* Action buttons */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => copyUrl(video)}
                    className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
                    title="Copy URL"
                  >
                    {copiedId === video.id ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(video)}
                    className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(video)}
                    className="p-2 rounded-full bg-black/60 hover:bg-red-500/80 text-white transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {/* Inactive overlay */}
                {!video.active && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <EyeOff className="h-6 w-6 text-white/50" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-white truncate">{video.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(video.fileSize)}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <ProcessingBadge video={video} />
                  {video.assignedApp && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                      {video.assignedApp}
                    </span>
                  )}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-muted-foreground">
                    {Math.round((video.recommendedOverlay || 0.4) * 100)}% overlay
                  </span>
                  {video.duration && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-muted-foreground">
                      {video.duration.toFixed(1)}s
                    </span>
                  )}
                </div>
                <VariantInfo variants={video.variants} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="glass-card rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Upload Video Background</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  resetUploadForm();
                }}
                className="p-1 rounded-full hover:bg-white/10 text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Video Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  uploadFile
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-white/20 hover:border-white/40'
                }`}
              >
                {uploadFile ? (
                  <div className="space-y-2">
                    <Video className="h-10 w-10 text-emerald-400 mx-auto" />
                    <p className="text-white font-medium">{uploadFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(uploadFile.size)} - Click to replace
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      Drag and drop a video, or click to select
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Max 50MB, MP4/WebM recommended
                    </p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  className="hidden"
                />
              </div>

              {/* Poster Image */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Poster Image (optional)
                </label>
                <button
                  type="button"
                  onClick={() => posterInputRef.current?.click()}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-left text-muted-foreground hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <ImageIcon className="h-4 w-4" />
                  {uploadPosterFile ? uploadPosterFile.name : 'Select poster image...'}
                </button>
                <input
                  ref={posterInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePosterSelect(file);
                  }}
                  className="hidden"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="Video name"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Brief description..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground resize-none"
                />
              </div>

              {/* Overlay Opacity */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Recommended Overlay: {Math.round(uploadOverlay * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={uploadOverlay}
                  onChange={(e) => setUploadOverlay(parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Higher values make text more readable over the video
                </p>
              </div>

              {/* Assigned App */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Assign to App
                </label>
                <select
                  value={uploadAssignedApp}
                  onChange={(e) => setUploadAssignedApp(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                >
                  {APP_OPTIONS.map((app) => (
                    <option key={app.value} value={app.value}>
                      {app.label}
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
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  placeholder="hero, abstract, calm"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground"
                />
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Uploading... {Math.round(uploadProgress)}%
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    resetUploadForm();
                  }}
                  className="px-4 py-2 rounded-lg text-muted-foreground hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!uploadFile || uploading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="glass-card rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Edit Video Background</h2>
              <button
                onClick={() => setShowEditModal(null)}
                className="p-1 rounded-full hover:bg-white/10 text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Preview */}
              <div className="rounded-xl overflow-hidden aspect-video bg-black relative">
                {showEditModal.posterURL ? (
                  <Image
                    src={showEditModal.posterURL}
                    alt={showEditModal.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/5">
                    <Video className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white resize-none"
                />
              </div>

              {/* Overlay Opacity */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Recommended Overlay: {Math.round(editOverlay * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={editOverlay}
                  onChange={(e) => setEditOverlay(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Assigned App */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Assign to App
                </label>
                <select
                  value={editAssignedApp}
                  onChange={(e) => setEditAssignedApp(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                >
                  {APP_OPTIONS.map((app) => (
                    <option key={app.value} value={app.value}>
                      {app.label}
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
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground">
                  Active (visible)
                </label>
                <button
                  type="button"
                  onClick={() => setEditActive(!editActive)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
                    editActive
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                      : 'bg-white/5 border-white/10 text-muted-foreground'
                  }`}
                >
                  {editActive ? (
                    <>
                      <Eye className="h-4 w-4" />
                      Visible
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Hidden
                    </>
                  )}
                </button>
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Video URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={showEditModal.downloadURL}
                    readOnly
                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-muted-foreground text-sm truncate"
                  />
                  <button
                    onClick={() => copyUrl(showEditModal)}
                    className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    {copiedId === showEditModal.id ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowEditModal(null)}
                  className="px-4 py-2 rounded-lg text-muted-foreground hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {previewVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setPreviewVideo(null)}
        >
          <div className="w-full h-full flex flex-col max-w-[95vw] max-h-[95vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h3 className="text-white font-medium">{previewVideo.name}</h3>
              <button
                onClick={() => setPreviewVideo(null)}
                className="p-2 rounded-full hover:bg-white/10 text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 min-h-0 flex items-center justify-center">
              <video
                src={previewVideo.downloadURL}
                poster={previewVideo.posterURL}
                controls
                autoPlay
                loop
                muted
                className="max-w-full max-h-full rounded-xl object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="glass-card rounded-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-white mb-2">Delete Video?</h2>
            <p className="text-muted-foreground mb-4">
              This will permanently delete &quot;{showDeleteConfirm.name}&quot; from storage. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg text-muted-foreground hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
