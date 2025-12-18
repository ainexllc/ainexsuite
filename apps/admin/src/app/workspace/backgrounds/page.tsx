'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Loader2,
  Plus,
  Trash2,
  Edit2,
  X,
  Upload,
  Sun,
  Moon,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Sparkles,
  Layers,
} from 'lucide-react';
import {
  uploadBackground,
  updateBackground,
  deleteBackground,
  subscribeToBackgrounds,
} from '@ainexsuite/firebase';
import { useAuth } from '@ainexsuite/auth';
import type {
  BackgroundDoc,
  BackgroundCreateInput,
  BackgroundCategory,
  BackgroundAccessLevel,
  BackgroundBrightness,
  BackgroundDocWithVariants,
} from '@ainexsuite/types';
import { GenerateTab } from './_components/generate-tab';

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

type ActiveTab = 'library' | 'generate';

export default function BackgroundsManagement() {
  const { user } = useAuth();
  const [backgrounds, setBackgrounds] = useState<BackgroundDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('library');

  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<BackgroundDoc | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<BackgroundDoc | null>(null);

  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadBrightness, setUploadBrightness] = useState<BackgroundBrightness>('dark');
  const [uploadCategory, setUploadCategory] = useState<BackgroundCategory>('other');
  const [uploadAccessLevel, setUploadAccessLevel] = useState<BackgroundAccessLevel>('free');
  const [uploadTags, setUploadTags] = useState('');
  const [uploading, setUploading] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editBrightness, setEditBrightness] = useState<BackgroundBrightness>('dark');
  const [editCategory, setEditCategory] = useState<BackgroundCategory>('other');
  const [editAccessLevel, setEditAccessLevel] = useState<BackgroundAccessLevel>('free');
  const [editTags, setEditTags] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Deleting state
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [filterCategory, setFilterCategory] = useState<BackgroundCategory | 'all'>('all');
  const [filterAccess, setFilterAccess] = useState<BackgroundAccessLevel | 'all'>('all');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to backgrounds
  useEffect(() => {
    const unsubscribe = subscribeToBackgrounds((bgs) => {
      setBackgrounds(bgs);
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
      const metadata: BackgroundCreateInput = {
        name: uploadName.trim() || 'Untitled Background',
        brightness: uploadBrightness,
        category: uploadCategory,
        accessLevel: uploadAccessLevel,
        tags: uploadTags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      await uploadBackground(uploadFile, metadata, user.uid);
      setSuccess('Background uploaded successfully!');
      resetUploadForm();
      setShowUploadModal(false);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload background. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Reset upload form
  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadPreview(null);
    setUploadName('');
    setUploadBrightness('dark');
    setUploadCategory('other');
    setUploadAccessLevel('free');
    setUploadTags('');
  };

  // Open edit modal
  const openEditModal = (bg: BackgroundDoc) => {
    setShowEditModal(bg);
    setEditName(bg.name);
    setEditBrightness(bg.brightness);
    setEditCategory(bg.category);
    setEditAccessLevel(bg.accessLevel);
    setEditTags(bg.tags.join(', '));
    setEditActive(bg.active);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!showEditModal) return;

    setSaving(true);
    setError(null);

    try {
      await updateBackground(showEditModal.id, {
        name: editName.trim() || 'Untitled Background',
        brightness: editBrightness,
        category: editCategory,
        accessLevel: editAccessLevel,
        tags: editTags.split(',').map((t) => t.trim()).filter(Boolean),
        active: editActive,
      });
      setSuccess('Background updated successfully!');
      setShowEditModal(null);
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update background. Please try again.');
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
      await deleteBackground(showDeleteConfirm.id);
      setSuccess('Background deleted successfully!');
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete background. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Filter backgrounds
  const filteredBackgrounds = backgrounds.filter((bg) => {
    if (filterCategory !== 'all' && bg.category !== filterCategory) return false;
    if (filterAccess !== 'all' && bg.accessLevel !== filterAccess) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
          <p className="text-muted-foreground text-sm">Loading backgrounds...</p>
        </div>
      </div>
    );
  }

  // Handler for when a background is generated successfully
  const handleGenerationSuccess = (_background: BackgroundDocWithVariants) => {
    setSuccess('Background generated and saved with 16 responsive variants!');
    setActiveTab('library');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ImageIcon className="h-7 w-7" />
            Backgrounds
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage background images available across all apps
          </p>
        </div>
        {activeTab === 'library' && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <Plus className="h-4 w-4" />
            Upload Background
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
              onChange={(e) => setFilterCategory(e.target.value as BackgroundCategory | 'all')}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={filterAccess}
              onChange={(e) => setFilterAccess(e.target.value as BackgroundAccessLevel | 'all')}
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
              {filteredBackgrounds.length} background{filteredBackgrounds.length !== 1 ? 's' : ''}
            </div>
          </div>

      {/* Backgrounds Grid */}
      {filteredBackgrounds.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No backgrounds found</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="mt-4 text-sm text-white/70 hover:text-white transition-colors"
          >
            Upload your first background
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredBackgrounds.map((bg) => (
            <div
              key={bg.id}
              className="glass-card rounded-xl overflow-hidden group relative"
            >
              {/* Image */}
              <div className="aspect-[4/3] relative">
                <img
                  src={bg.downloadURL}
                  alt={bg.name}
                  className="w-full h-full object-cover"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => openEditModal(bg)}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(bg)}
                    className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {/* Inactive overlay */}
                {!bg.active && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <EyeOff className="h-6 w-6 text-white/50" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white truncate">{bg.name}</span>
                  {bg.brightness === 'dark' ? (
                    <Moon className="h-4 w-4 text-blue-400" />
                  ) : (
                    <Sun className="h-4 w-4 text-amber-400" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-muted-foreground">
                    {bg.category}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full text-white ${
                      ACCESS_LEVELS.find((l) => l.value === bg.accessLevel)?.color || 'bg-gray-500'
                    }`}
                  >
                    {ACCESS_LEVELS.find((l) => l.value === bg.accessLevel)?.label}
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
              <h2 className="text-lg font-semibold text-white">Upload Background</h2>
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
                    <img
                      src={uploadPreview}
                      alt="Preview"
                      className="max-h-40 mx-auto rounded-lg"
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
                      Max 5MB, JPG/PNG/WebP
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
                    onClick={() => setUploadBrightness('dark')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                      uploadBrightness === 'dark'
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                        : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                    }`}
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadBrightness('light')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                      uploadBrightness === 'light'
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
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as BackgroundCategory)}
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
                  value={uploadAccessLevel}
                  onChange={(e) => setUploadAccessLevel(e.target.value as BackgroundAccessLevel)}
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
                  placeholder="winter, festive, nature"
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
              <h2 className="text-lg font-semibold text-white">Edit Background</h2>
              <button
                onClick={() => setShowEditModal(null)}
                className="p-1 rounded-full hover:bg-white/10 text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Preview */}
              <div className="rounded-xl overflow-hidden">
                <img
                  src={showEditModal.downloadURL}
                  alt={showEditModal.name}
                  className="w-full h-40 object-cover"
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

              {/* Brightness */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Brightness
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditBrightness('dark')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                      editBrightness === 'dark'
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                        : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                    }`}
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditBrightness('light')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                      editBrightness === 'light'
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
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as BackgroundCategory)}
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
                  value={editAccessLevel}
                  onChange={(e) => setEditAccessLevel(e.target.value as BackgroundAccessLevel)}
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
                <h2 className="text-lg font-semibold text-white mb-2">Delete Background?</h2>
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
