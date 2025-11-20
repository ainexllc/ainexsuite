'use client';

import { useState, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import { X, Upload, Link, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadFile } from '@/lib/firebase/storage';
import { useAuth } from '@ainexsuite/auth';
import { v4 as uuidv4 } from 'uuid';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (imageUrl: string, altText?: string) => void;
  entryId?: string;
}

type UploadTab = 'upload' | 'url';

export function ImageUploadModal({ isOpen, onClose, onInsert, entryId }: ImageUploadModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<UploadTab>('upload');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setImageUrl('');
    setAltText('');
    setPreviewUrl(null);
    setError(null);
    setUploadProgress(0);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 2,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      return file; // Return original if compression fails
    }
  };

  const uploadImage = async (file: File) => {
    if (!user) {
      setError('You must be logged in to upload images');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setUploadProgress(10);

      // Compress image
      const compressedFile = await compressImage(file);
      setUploadProgress(30);

      // Upload to Firebase
      const tempEntryId = entryId || `temp-${uuidv4()}`;
      const result = await uploadFile(user.uid, tempEntryId, compressedFile);
      setUploadProgress(90);

      // Set preview
      setPreviewUrl(result.url);
      setAltText(file.name.split('.')[0]); // Default alt text from filename
      setUploadProgress(100);

      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      setError('Failed to upload image. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/')) {
      await uploadImage(file);
    } else {
      setError('Please upload a valid image file');
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    disabled: uploading,
    noClick: false,
    noKeyboard: false
  });

  const handleUrlSubmit = () => {
    if (imageUrl) {
      // Validate URL
      try {
        new URL(imageUrl);
        setPreviewUrl(imageUrl);
        setError(null);
      } catch {
        setError('Please enter a valid URL');
      }
    }
  };

  const handleInsert = () => {
    if (previewUrl) {
      onInsert(previewUrl, altText);
      handleClose();
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden z-50">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-gray-50">
                Insert Image
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('upload')}
                className={cn(
                  'flex-1 py-2 px-4 rounded-lg font-medium transition-colors',
                  activeTab === 'upload'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                <Upload className="w-4 h-4 inline-block mr-2" />
                Upload
              </button>
              <button
                onClick={() => setActiveTab('url')}
                className={cn(
                  'flex-1 py-2 px-4 rounded-lg font-medium transition-colors',
                  activeTab === 'url'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                <Link className="w-4 h-4 inline-block mr-2" />
                URL
              </button>
            </div>

            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div className="space-y-4">
                <div
                  {...getRootProps()}
                  className={cn(
                    'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                    isDragActive
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/50'
                      : 'border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500',
                    uploading && 'cursor-not-allowed opacity-60'
                  )}
                >
                  <input {...getInputProps()} />
                  {uploading ? (
                    <div className="space-y-4">
                      <Loader2 className="w-12 h-12 mx-auto text-orange-500 animate-spin" />
                      <p className="text-gray-600 dark:text-gray-300">Uploading image...</p>
                      <div className="w-full max-w-xs mx-auto bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-orange-500 h-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : isDragActive ? (
                    <>
                      <ImageIcon className="w-12 h-12 mx-auto text-orange-500 mb-4" />
                      <p className="text-gray-700 dark:text-gray-200 font-medium">
                        Drop your image here
                      </p>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-700 dark:text-gray-200 font-medium mb-2">
                        Drag & drop an image here
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        or
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          open();
                        }}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        Choose File
                      </button>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                        Supports: JPG, PNG, GIF, WebP (max 10MB)
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* URL Tab */}
            {activeTab === 'url' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Image URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleUrlSubmit}
                      disabled={!imageUrl}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Section */}
            {previewUrl && (
              <div className="mt-6 space-y-4">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt={altText || 'Preview'}
                    className="max-w-full h-auto max-h-64 mx-auto rounded"
                    onError={() => setError('Failed to load image')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Alt Text (for accessibility)
                  </label>
                  <input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Describe this image..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInsert}
                disabled={!previewUrl || uploading}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Insert Image
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
