'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import type { Moment } from '@ainexsuite/types';
import { createMoment, updateMoment, deleteMoment, uploadPhoto } from '@/lib/moments';
import { X, Trash2, Upload, MapPin, Tag as TagIcon, Image as ImageIcon } from 'lucide-react';

interface PhotoEditorProps {
  moment: Moment | null;
  onClose: () => void;
  onSave: () => void;
}

export function PhotoEditor({ moment, onClose, onSave }: PhotoEditorProps) {
  const [title, setTitle] = useState(moment?.title || '');
  const [caption, setCaption] = useState(moment?.caption || '');
  const [location, setLocation] = useState(moment?.location || '');
  const [tags, setTags] = useState<string[]>(moment?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(moment?.photoUrl || null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (!trimmedTag) return;
    if (tags.includes(trimmedTag)) {
      alert('Tag already exists');
      return;
    }
    setTags([...tags, trimmedTag]);
    setNewTag('');
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSave = async () => {
    if (!photoPreview && !moment) {
      alert('Please select a photo');
      return;
    }

    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    setSaving(true);
    try {
      let photoUrl = moment?.photoUrl || '';

      if (photoFile) {
        setUploading(true);
        photoUrl = await uploadPhoto(photoFile);
        setUploading(false);
      }

      if (moment) {
        // Update existing moment
        await updateMoment(moment.id, {
          title,
          caption: caption.trim() || '',
          location: location.trim() || '',
          tags: tags.length > 0 ? tags : [],
        });
      } else {
        // Create new moment
        await createMoment({
          title,
          caption: caption.trim() || '',
          location: location.trim() || '',
          tags: tags.length > 0 ? tags : [],
          photoUrl,
          date: Date.now(),
          collectionId: null,
        });
      }

      onSave();
    } catch (error) {
      alert('Failed to save moment');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!moment) return;
    if (!confirm('Are you sure you want to delete this moment?')) return;

    try {
      await deleteMoment(moment.id);
      onSave();
    } catch (error) {
      alert('Failed to delete moment');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl surface-card rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-surface-hover sticky top-0 surface-card">
          <h2 className="text-xl font-semibold">
            {moment ? 'Edit Moment' : 'New Moment'}
          </h2>

          <div className="flex items-center gap-2">
            {moment && (
              <button
                onClick={handleDelete}
                className="p-2 hover:bg-surface-hover rounded-lg text-red-400"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              className="px-4 py-2 bg-accent-500 hover:bg-accent-600 rounded-lg font-medium disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-surface-hover rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Photo</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />

            {photoPreview ? (
              <div className="relative w-full h-64">
                <Image
                  src={photoPreview}
                  alt="Preview"
                  fill
                  sizes="(min-width: 768px) 400px, 100vw"
                  className="object-cover rounded-lg"
                  unoptimized
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute top-2 right-2 px-3 py-2 bg-surface-card/90 backdrop-blur rounded-lg text-sm font-medium hover:bg-surface-hover"
                >
                  <Upload className="h-4 w-4 inline mr-2" />
                  Change Photo
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-64 surface-elevated rounded-lg border-2 border-dashed border-surface-hover hover:border-accent-500 flex flex-col items-center justify-center gap-3 transition-colors"
              >
                <ImageIcon className="h-12 w-12 text-ink-600" />
                <div className="text-center">
                  <p className="font-medium">Click to upload photo</p>
                  <p className="text-sm text-ink-600 mt-1">
                    JPG, PNG, GIF up to 10MB
                  </p>
                </div>
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              placeholder="Give this moment a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 surface-elevated rounded-lg border border-surface-hover focus:border-accent-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Caption</label>
            <textarea
              placeholder="Describe this moment..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 surface-elevated rounded-lg border border-surface-hover focus:border-accent-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-600" />
              <input
                type="text"
                placeholder="Where was this taken?"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-3 py-2 surface-elevated rounded-lg border border-surface-hover focus:border-accent-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-600" />
                <input
                  type="text"
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="w-full pl-10 pr-3 py-2 surface-elevated rounded-lg border border-surface-hover focus:border-accent-500 focus:outline-none"
                />
              </div>
              <button
                onClick={handleAddTag}
                className="px-4 py-2 bg-surface-hover hover:bg-surface-card rounded-lg font-medium transition-colors"
              >
                Add
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 surface-elevated rounded-full text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
