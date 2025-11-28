'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  type: 'app' | 'video';
  status: 'active' | 'paused' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  notes: string[];
}

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  ideaNote?: {
    content: string;
    type: 'app' | 'video';
  };
}

export function ProjectModal({ isOpen, onClose, onCreateProject, ideaNote }: ProjectModalProps) {
  const [name, setName] = useState(ideaNote?.content || '');
  const [type, setType] = useState<'app' | 'video'>(ideaNote?.type || 'app');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateProject({
        name: name.trim(),
        type,
        status: 'active',
        notes: ideaNote ? [ideaNote.content] : []
      });
      setName('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-background bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-foreground rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Project</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter project name..."
              autoFocus
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'app' | 'video')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="app">App</option>
              <option value="video">Video</option>
            </select>
          </div>
          
          {ideaNote && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">From idea:</p>
              <p className="text-sm font-medium">{ideaNote.content}</p>
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
