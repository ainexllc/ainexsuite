'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
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
  BookOpen,
  Sparkles,
  Layers,
  Crown,
} from 'lucide-react';
import {
  uploadCover,
  updateCover,
  deleteCover,
  subscribeToCovers,
} from '@ainexsuite/firebase';
import { useAuth } from '@ainexsuite/auth';
import type {
  CoverDoc,
  CoverCreateInput,
  CoverCategory,
  CoverAccessLevel,
  CoverSourceType,
} from '@ainexsuite/types';
import { GenerateTab } from './_components/generate-tab';
import { loadImage, canvasToBlob, blobToDataURL } from '@/lib/image-utils';

const CATEGORIES: { value: CoverCategory; label: string }[] = [
  { value: 'leather', label: 'Leather' },
  { value: 'fabric', label: 'Fabric' },
  { value: 'paper', label: 'Paper' },
  { value: 'wood', label: 'Wood' },
  { value: 'artistic', label: 'Artistic' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'pattern', label: 'Pattern' },
  { value: 'other', label: 'Other' },
];

const ACCESS_LEVELS: { value: CoverAccessLevel; label: string; color: string }[] = [
  { value: 'free', label: 'Free', color: 'bg-emerald-500' },
  { value: 'premium', label: 'Premium', color: 'bg-amber-500' },
];

type ActiveTab = 'library' | 'generate';

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

export default function CoversManagement() {
  const { user } = useAuth();
  const [covers, setCovers] = useState<CoverDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('library');

  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<CoverDoc | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<CoverDoc | null>(null);

  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState<CoverCategory>('leather');
  const [uploadAccessLevel, setUploadAccessLevel] = useState<CoverAccessLevel>('free');
  const [uploadTags, setUploadTags] = useState('');
  const [uploading, setUploading] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<CoverCategory>('leather');
  const [editAccessLevel, setEditAccessLevel] = useState<CoverAccessLevel>('free');
  const [editTags, setEditTags] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Deleting state
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [filterCategory, setFilterCategory] = useState<CoverCategory | 'all'>('all');
  const [filterAccess, setFilterAccess] = useState<CoverAccessLevel | 'all'>('all');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to covers
  useEffect(() => {
    const unsubscribe = subscribeToCovers((cvs) => {
      setCovers(cvs);
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

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    setUploadFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Auto-fill name from filename
    const nameFromFile = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setUploadName(nameFromFile.charAt(0).toUpperCase() + nameFromFile.slice(1));
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Handle upload
  const handleUpload = async () => {
    if (!uploadFile || !user?.uid) return;

    setUploading(true);
    setError(null);

    try {
      // Generate thumbnail
      const thumbnailBlob = await generateCoverThumbnail(uploadFile);

      const metadata: CoverCreateInput = {
        name: uploadName.trim() || 'Untitled Cover',
        category: uploadCategory,
        accessLevel: uploadAccessLevel,
        tags: uploadTags.split(',').map((t) => t.trim()).filter(Boolean),
        sourceType: 'uploaded' as CoverSourceType,
      };

      await uploadCover(uploadFile, thumbnailBlob, metadata, user.uid);
      setSuccess('Cover uploaded successfully!');
      resetUploadForm();
      setShowUploadModal(false);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload cover. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Reset upload form
  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadPreview(null);
    setUploadName('');
    setUploadCategory('leather');
    setUploadAccessLevel('free');
    setUploadTags('');
  };

  // Open edit modal
  const openEditModal = (cover: CoverDoc) => {
    setShowEditModal(cover);
    setEditName(cover.name);
    setEditCategory(cover.category);
    setEditAccessLevel(cover.accessLevel);
    setEditTags(cover.tags.join(', '));
    setEditActive(cover.active);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!showEditModal) return;

    setSaving(true);
    setError(null);

    try {
      await updateCover(showEditModal.id, {
        name: editName.trim() || 'Untitled Cover',
        category: editCategory,
        accessLevel: editAccessLevel,
        tags: editTags.split(',').map((t) => t.trim()).filter(Boolean),
        active: editActive,
      });
      setSuccess('Cover updated successfully!');
      setShowEditModal(null);
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update cover. Please try again.');
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
      await deleteCover(showDeleteConfirm.id);
      setSuccess('Cover deleted successfully!');
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete cover. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Filter covers
  const filteredCovers = covers.filter((cover) => {
    if (filterCategory !== 'all' && cover.category !== filterCategory) return false;
    if (filterAccess !== 'all' && cover.accessLevel !== filterAccess) return false;
    return true;
  });

  // Handler for when a cover is generated successfully
  const handleGenerationSuccess = (_cover: CoverDoc) => {
    setSuccess('Cover generated and saved!');
    setActiveTab('library');
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
          <p className="text-muted-foreground text-sm">Loading covers...</p>
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
            <BookOpen className="h-7 w-7" />
            Journal Covers
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage cover images for journal entry cards
          </p>
        </div>
        {activeTab === 'library' && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <Plus className="h-4 w-4" />
            Upload Cover
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10">
        <button
          onClick={() => setActiveTab('library')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'library'
              ? 'text-white border-white'
              : 'text-muted-foreground hover:text-white border-transparent'
          }`}
        >
          <Layers className="h-4 w-4" />
          Library
        </button>
        <button
          onClick={() => setActiveTab('generate')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'generate'
              ? 'text-white border-white'
              : 'text-muted-foreground hover:text-white border-transparent'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Generate
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

      {/* Tab Content */}
      {activeTab === 'generate' ? (
        <GenerateTab userId={user?.uid || ''} onSuccess={handleGenerationSuccess} />
      ) : (
        <>
          {/* Filters */}
          <div className="flex gap-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as CoverCategory | 'all')}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            <select
              value={filterAccess}
              onChange={(e) => setFilterAccess(e.target.value as CoverAccessLevel | 'all')}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
            >
              <option value="all">All Access Levels</option>
              {ACCESS_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>

            <div className="ml-auto text-muted-foreground text-sm">
              {filteredCovers.length} cover{filteredCovers.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Covers Grid */}
          {filteredCovers.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No covers found</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="mt-4 text-sm text-white/70 hover:text-white transition-colors"
              >
                Upload your first cover
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredCovers.map((cover) => (
                <div
                  key={cover.id}
                  className="glass-card rounded-xl overflow-hidden group relative"
                >
                  {/* Image - portrait ratio for covers */}
                  <div className="aspect-[2/3] relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cover.thumbnailURL || cover.downloadURL}
                      alt={cover.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditModal(cover)}
                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(cover)}
                        className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {/* Inactive overlay */}
                    {!cover.active && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <EyeOff className="h-6 w-6 text-white/50" />
                      </div>
                    )}
                    {/* AI Generated badge */}
                    {cover.sourceType === 'ai-generated' && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-purple-500/80 text-white text-[10px] font-medium flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        AI
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white truncate text-sm">{cover.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-muted-foreground">
                        {cover.category}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full text-white flex items-center gap-1 ${
                          ACCESS_LEVELS.find((l) => l.value === cover.accessLevel)?.color || 'bg-gray-500'
                        }`}
                      >
                        {cover.accessLevel === 'premium' && <Crown className="h-3 w-3" />}
                        {ACCESS_LEVELS.find((l) => l.value === cover.accessLevel)?.label}
                      </span>
                    </div>
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
                  <h2 className="text-lg font-semibold text-white">Upload Cover</h2>
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
                  {/* Drop Zone */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                      uploadPreview
                        ? 'border-emerald-500/50 bg-emerald-500/5'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    {uploadPreview ? (
                      <div className="space-y-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={uploadPreview}
                          alt="Preview"
                          className="max-h-48 mx-auto rounded-lg"
                        />
                        <p className="text-sm text-muted-foreground">
                          Click or drag to replace
                        </p>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">
                          Drag and drop an image, or click to select
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Best size: 400x600px (2:3 ratio) PNG/JPG
                        </p>
                      </>
                    )}
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

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={uploadName}
                      onChange={(e) => setUploadName(e.target.value)}
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
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value as CoverCategory)}
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
                    <select
                      value={uploadAccessLevel}
                      onChange={(e) => setUploadAccessLevel(e.target.value as CoverAccessLevel)}
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
                      value={uploadTags}
                      onChange={(e) => setUploadTags(e.target.value)}
                      placeholder="vintage, brown, elegant"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground"
                    />
                  </div>

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
                  <h2 className="text-lg font-semibold text-white">Edit Cover</h2>
                  <button
                    onClick={() => setShowEditModal(null)}
                    className="p-1 rounded-full hover:bg-white/10 text-muted-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-4 space-y-4">
                  {/* Preview */}
                  <div className="rounded-xl overflow-hidden flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={showEditModal.downloadURL}
                      alt={showEditModal.name}
                      className="h-48 object-contain rounded-lg"
                    />
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

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Category
                    </label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as CoverCategory)}
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
                    <select
                      value={editAccessLevel}
                      onChange={(e) => setEditAccessLevel(e.target.value as CoverAccessLevel)}
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
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                    />
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-muted-foreground">
                      Active (visible to users)
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

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <div className="glass-card rounded-2xl w-full max-w-md mx-4 p-6">
                <h2 className="text-lg font-semibold text-white mb-2">Delete Cover?</h2>
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
        </>
      )}
    </div>
  );
}
