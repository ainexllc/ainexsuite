'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';
import {
  Layers, Users, Search, Filter, ChevronDown, User, Heart, Briefcase,
  Dumbbell, Folder, RefreshCw, Settings, Save, Palette, Eye,
  CheckCircle2, AlertCircle, X, Sparkles
} from 'lucide-react';

interface SpaceData {
  id: string;
  app: string;
  name: string;
  type: string;
  memberCount: number;
  createdBy: string;
  createdAt: string;
}

interface SpaceTypeConfig {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  enabled: boolean;
}

interface SpacesUIConfig {
  dropdownStyle: 'minimal' | 'detailed' | 'compact';
  showTypeIcons: boolean;
  showMemberCount: boolean;
  showCreateButton: boolean;
  animateTransitions: boolean;
  defaultSpaceLabel: string;
}

const APP_CONFIGS = [
  { id: 'notes', name: 'Notes', collection: 'notes_spaces', color: '#3b82f6' },
  { id: 'todo', name: 'Todo', collection: 'task_spaces', color: '#f59e0b' },
  { id: 'moments', name: 'Moments', collection: 'moments_spaces', color: '#ec4899' },
  { id: 'grow', name: 'Grow', collection: 'grow_spaces', color: '#8b5cf6' },
  { id: 'fit', name: 'Fit', collection: 'fit_spaces', color: '#22c55e' },
  { id: 'pulse', name: 'Pulse', collection: 'pulse_spaces', color: '#ef4444' },
  { id: 'projects', name: 'Projects', collection: 'project_spaces', color: '#6366f1' },
  { id: 'workflow', name: 'Workflow', collection: 'workflow_spaces', color: '#10b981' },
];

const ICON_OPTIONS = [
  { value: 'user', label: 'User', Icon: User },
  { value: 'users', label: 'Users', Icon: Users },
  { value: 'heart', label: 'Heart', Icon: Heart },
  { value: 'briefcase', label: 'Briefcase', Icon: Briefcase },
  { value: 'dumbbell', label: 'Dumbbell', Icon: Dumbbell },
  { value: 'folder', label: 'Folder', Icon: Folder },
  { value: 'sparkles', label: 'Sparkles', Icon: Sparkles },
];

const COLOR_PRESETS = [
  { name: 'Cyan', color: '#06b6d4', bg: 'rgba(6,182,212,0.2)', border: 'rgba(6,182,212,0.3)' },
  { name: 'Purple', color: '#a855f7', bg: 'rgba(168,85,247,0.2)', border: 'rgba(168,85,247,0.3)' },
  { name: 'Pink', color: '#ec4899', bg: 'rgba(236,72,153,0.2)', border: 'rgba(236,72,153,0.3)' },
  { name: 'Blue', color: '#3b82f6', bg: 'rgba(59,130,246,0.2)', border: 'rgba(59,130,246,0.3)' },
  { name: 'Orange', color: '#f97316', bg: 'rgba(249,115,22,0.2)', border: 'rgba(249,115,22,0.3)' },
  { name: 'Emerald', color: '#10b981', bg: 'rgba(16,185,129,0.2)', border: 'rgba(16,185,129,0.3)' },
  { name: 'Indigo', color: '#6366f1', bg: 'rgba(99,102,241,0.2)', border: 'rgba(99,102,241,0.3)' },
  { name: 'Rose', color: '#f43f5e', bg: 'rgba(244,63,94,0.2)', border: 'rgba(244,63,94,0.3)' },
];

const DEFAULT_SPACE_TYPES: SpaceTypeConfig[] = [
  { id: 'personal', label: 'Personal', description: 'Your private space', icon: 'user', color: '#06b6d4', bgColor: 'rgba(6,182,212,0.2)', borderColor: 'rgba(6,182,212,0.3)', enabled: true },
  { id: 'family', label: 'Family', description: 'Share with family members', icon: 'users', color: '#a855f7', bgColor: 'rgba(168,85,247,0.2)', borderColor: 'rgba(168,85,247,0.3)', enabled: true },
  { id: 'work', label: 'Work', description: 'Team collaboration', icon: 'briefcase', color: '#3b82f6', bgColor: 'rgba(59,130,246,0.2)', borderColor: 'rgba(59,130,246,0.3)', enabled: true },
  { id: 'couple', label: 'Couple', description: 'Share with your partner', icon: 'heart', color: '#ec4899', bgColor: 'rgba(236,72,153,0.2)', borderColor: 'rgba(236,72,153,0.3)', enabled: true },
  { id: 'buddy', label: 'Buddy', description: 'Partner up with a friend', icon: 'dumbbell', color: '#f97316', bgColor: 'rgba(249,115,22,0.2)', borderColor: 'rgba(249,115,22,0.3)', enabled: true },
  { id: 'squad', label: 'Squad', description: 'Team accountability', icon: 'users', color: '#10b981', bgColor: 'rgba(16,185,129,0.2)', borderColor: 'rgba(16,185,129,0.3)', enabled: true },
  { id: 'project', label: 'Project', description: 'Dedicated project space', icon: 'folder', color: '#6366f1', bgColor: 'rgba(99,102,241,0.2)', borderColor: 'rgba(99,102,241,0.3)', enabled: true },
];

const DEFAULT_UI_CONFIG: SpacesUIConfig = {
  dropdownStyle: 'detailed',
  showTypeIcons: true,
  showMemberCount: true,
  showCreateButton: true,
  animateTransitions: true,
  defaultSpaceLabel: 'My Space',
};

const SPACE_TYPE_ICONS: Record<string, typeof User> = {
  user: User,
  users: Users,
  heart: Heart,
  briefcase: Briefcase,
  dumbbell: Dumbbell,
  folder: Folder,
  sparkles: Sparkles,
};

export default function SpacesManagement() {
  const [activeTab, setActiveTab] = useState<'overview' | 'types' | 'ui'>('overview');
  const [spaces, setSpaces] = useState<SpaceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showTypeFilter, setShowTypeFilter] = useState(false);

  // Config state
  const [spaceTypes, setSpaceTypes] = useState<SpaceTypeConfig[]>(DEFAULT_SPACE_TYPES);
  const [uiConfig, setUiConfig] = useState<SpacesUIConfig>(DEFAULT_UI_CONFIG);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<string | null>(null);

  const fetchAllSpaces = async () => {
    setLoading(true);
    const allSpaces: SpaceData[] = [];

    try {
      for (const app of APP_CONFIGS) {
        try {
          const spacesRef = collection(db, app.collection);
          const q = query(spacesRef, orderBy('createdAt', 'desc'));
          const snapshot = await getDocs(q);

          snapshot.docs.forEach((docSnap) => {
            const data = docSnap.data();
            allSpaces.push({
              id: docSnap.id,
              app: app.id,
              name: data.name || 'Unnamed Space',
              type: data.type || 'personal',
              memberCount: data.memberUids?.length || data.members?.length || 1,
              createdBy: data.createdBy || 'Unknown',
              createdAt: data.createdAt || new Date().toISOString(),
            });
          });
        } catch {
          // Collection might not exist yet
        }
      }

      allSpaces.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setSpaces(allSpaces);
    } catch {
      setError('Failed to fetch spaces');
    } finally {
      setLoading(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const typesDoc = await getDoc(doc(db, 'config', 'space_types'));
      if (typesDoc.exists()) {
        setSpaceTypes(typesDoc.data().types || DEFAULT_SPACE_TYPES);
      }

      const uiDoc = await getDoc(doc(db, 'config', 'spaces_ui'));
      if (uiDoc.exists()) {
        setUiConfig({ ...DEFAULT_UI_CONFIG, ...uiDoc.data() });
      }
    } catch {
      // Use defaults
    }
  };

  const saveSpaceTypes = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'config', 'space_types'), { types: spaceTypes, updatedAt: new Date().toISOString() });
      setSuccess('Space types saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError('Failed to save space types');
      setTimeout(() => setError(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const saveUIConfig = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'config', 'spaces_ui'), { ...uiConfig, updatedAt: new Date().toISOString() });
      setSuccess('UI settings saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError('Failed to save UI settings');
      setTimeout(() => setError(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchAllSpaces();
    fetchConfig();
  }, []);

  const filteredSpaces = spaces.filter((space) => {
    const matchesSearch =
      space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      space.createdBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesApp = !selectedApp || space.app === selectedApp;
    const matchesType = !selectedType || space.type === selectedType;
    return matchesSearch && matchesApp && matchesType;
  });

  const totalSpaces = spaces.length;
  const totalMembers = spaces.reduce((acc, s) => acc + s.memberCount, 0);
  const spacesByApp = APP_CONFIGS.map((app) => ({
    ...app,
    count: spaces.filter((s) => s.app === app.id).length,
  }));
  const usedSpaceTypes = [...new Set(spaces.map((s) => s.type))];

  const updateSpaceType = (id: string, updates: Partial<SpaceTypeConfig>) => {
    setSpaceTypes(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
              <Layers className="h-8 w-8 text-cyan-400 animate-pulse" />
            </div>
            <div className="absolute -inset-2 rounded-3xl border border-cyan-500/20 animate-ping" />
          </div>
          <p className="text-cyan-400 text-sm font-mono animate-pulse">Loading spaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                <Layers className="h-7 w-7 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-4xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 tracking-wider">
                  SPACE MATRIX
                </h1>
                <p className="text-zinc-500 font-mono text-sm uppercase tracking-[0.2em] mt-1">
                  Spaces Configuration & Management
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={fetchAllSpaces}
            className="px-5 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-500/50 rounded-xl flex items-center gap-3 transition-all group"
          >
            <RefreshCw className="h-4 w-4 text-cyan-400 group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-sm font-mono text-cyan-400 uppercase tracking-wider">Refresh</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3 backdrop-blur-sm">
          <AlertCircle className="h-5 w-5" />
          <span className="font-mono text-sm">{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 backdrop-blur-sm">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-mono text-sm">{success}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-black/50 border border-white/10 rounded-xl w-fit">
        {[
          { id: 'overview', label: 'Overview', icon: Layers },
          { id: 'types', label: 'Space Types', icon: Palette },
          { id: 'ui', label: 'UI Settings', icon: Eye },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'overview' | 'types' | 'ui')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-mono text-sm uppercase tracking-wider transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-zinc-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 bg-black/50 border border-white/10 rounded-2xl">
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">Total Spaces</p>
              <p className="text-3xl font-orbitron font-bold text-cyan-400">{totalSpaces}</p>
            </div>
            <div className="p-5 bg-black/50 border border-white/10 rounded-2xl">
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">Total Members</p>
              <p className="text-3xl font-orbitron font-bold text-purple-400">{totalMembers}</p>
            </div>
            <div className="p-5 bg-black/50 border border-white/10 rounded-2xl">
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">Active Apps</p>
              <p className="text-3xl font-orbitron font-bold text-emerald-400">
                {spacesByApp.filter((a) => a.count > 0).length}
              </p>
            </div>
            <div className="p-5 bg-black/50 border border-white/10 rounded-2xl">
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">Space Types</p>
              <p className="text-3xl font-orbitron font-bold text-pink-400">{usedSpaceTypes.length}</p>
            </div>
          </div>

          {/* App Distribution */}
          <div className="p-5 bg-black/50 border border-white/10 rounded-2xl">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4">Spaces by App</p>
            <div className="flex flex-wrap gap-3">
              {spacesByApp.map((app) => (
                <button
                  key={app.id}
                  onClick={() => setSelectedApp(selectedApp === app.id ? null : app.id)}
                  className={`px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${
                    selectedApp === app.id
                      ? 'bg-white/10 border-white/30'
                      : 'bg-black/30 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: app.color }} />
                  <span className="text-sm font-mono text-white">{app.name}</span>
                  <span className="text-xs font-mono text-zinc-500">({app.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search spaces by name or creator..."
                className="w-full pl-12 pr-4 py-3.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-colors font-mono"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowTypeFilter(!showTypeFilter)}
                className="px-5 py-3.5 bg-black/50 border border-white/10 hover:border-white/20 rounded-xl flex items-center gap-3 transition-colors"
              >
                <Filter className="h-4 w-4 text-zinc-500" />
                <span className="text-sm font-mono text-white">
                  {selectedType ? selectedType.charAt(0).toUpperCase() + selectedType.slice(1) : 'All Types'}
                </span>
                <ChevronDown className="h-4 w-4 text-zinc-500" />
              </button>
              {showTypeFilter && (
                <div className="absolute top-full mt-2 right-0 bg-[#0c0c14] border border-white/10 rounded-xl overflow-hidden z-20 min-w-[200px]">
                  <button
                    onClick={() => { setSelectedType(null); setShowTypeFilter(false); }}
                    className={`w-full px-4 py-3 text-left text-sm font-mono hover:bg-white/5 transition-colors ${!selectedType ? 'text-cyan-400' : 'text-white'}`}
                  >
                    All Types
                  </button>
                  {usedSpaceTypes.map((type) => {
                    const typeConfig = spaceTypes.find(t => t.id === type);
                    const Icon = SPACE_TYPE_ICONS[typeConfig?.icon || 'user'] || User;
                    return (
                      <button
                        key={type}
                        onClick={() => { setSelectedType(type); setShowTypeFilter(false); }}
                        className={`w-full px-4 py-3 text-left text-sm font-mono hover:bg-white/5 transition-colors flex items-center gap-3 ${selectedType === type ? 'text-cyan-400' : 'text-white'}`}
                      >
                        <Icon className="h-4 w-4" />
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Spaces Grid */}
          <div className="space-y-3">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
              Showing {filteredSpaces.length} of {totalSpaces} spaces
            </p>
            {filteredSpaces.length === 0 ? (
              <div className="p-12 bg-black/50 border border-white/10 rounded-2xl text-center">
                <Layers className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-500 font-mono">No spaces found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSpaces.slice(0, 12).map((space) => {
                  const app = APP_CONFIGS.find((a) => a.id === space.app);
                  const typeConfig = spaceTypes.find(t => t.id === space.type) || spaceTypes[0];
                  const Icon = SPACE_TYPE_ICONS[typeConfig?.icon || 'user'] || User;

                  return (
                    <div
                      key={`${space.app}-${space.id}`}
                      className="group relative bg-black/50 backdrop-blur-xl border border-white/10 hover:border-cyan-500/40 transition-all duration-300 rounded-2xl overflow-hidden"
                    >
                      <div className="h-1 w-full" style={{ backgroundColor: app?.color }} />
                      <div className="p-5 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="p-2.5 rounded-xl border"
                              style={{ backgroundColor: typeConfig?.bgColor, borderColor: typeConfig?.borderColor, color: typeConfig?.color }}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-orbitron font-bold text-white text-lg leading-tight">{space.name}</h3>
                              <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider mt-0.5">{app?.name || space.app}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5" />
                            <span>{space.memberCount} members</span>
                          </div>
                          <span
                            className="px-2 py-0.5 rounded border"
                            style={{ backgroundColor: typeConfig?.bgColor, borderColor: typeConfig?.borderColor, color: typeConfig?.color }}
                          >
                            {space.type}
                          </span>
                        </div>
                        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-zinc-600">
                          <span>Created: {new Date(space.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Space Types Tab */}
      {activeTab === 'types' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-orbitron font-bold text-white">Space Type Configuration</h2>
              <p className="text-sm text-zinc-500 font-mono mt-1">Customize how space types appear across all apps</p>
            </div>
            <button
              onClick={saveSpaceTypes}
              disabled={saving}
              className="px-5 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 hover:border-cyan-500/60 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Save className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-mono text-cyan-400 uppercase tracking-wider">
                {saving ? 'Saving...' : 'Save Changes'}
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {spaceTypes.map((type) => {
              const Icon = SPACE_TYPE_ICONS[type.icon] || User;
              const isEditing = editingType === type.id;

              return (
                <div
                  key={type.id}
                  className={`relative bg-black/50 border rounded-2xl overflow-hidden transition-all ${
                    isEditing ? 'border-cyan-500/50' : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Color bar */}
                  <div className="h-1 w-full" style={{ backgroundColor: type.color }} />

                  <div className="p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="p-3 rounded-xl border"
                          style={{ backgroundColor: type.bgColor, borderColor: type.borderColor, color: type.color }}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-orbitron font-bold text-white text-lg">{type.label}</h3>
                          <p className="text-xs font-mono text-zinc-500 uppercase">{type.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateSpaceType(type.id, { enabled: !type.enabled })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider border transition-all ${
                            type.enabled
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
                          }`}
                        >
                          {type.enabled ? 'Enabled' : 'Disabled'}
                        </button>
                        <button
                          onClick={() => setEditingType(isEditing ? null : type.id)}
                          className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                        >
                          {isEditing ? <X className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Edit Panel */}
                    {isEditing && (
                      <div className="space-y-4 pt-4 border-t border-white/10">
                        {/* Label & Description */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2 block">Label</label>
                            <input
                              type="text"
                              value={type.label}
                              onChange={(e) => updateSpaceType(type.id, { label: e.target.value })}
                              className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500/50"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2 block">Description</label>
                            <input
                              type="text"
                              value={type.description}
                              onChange={(e) => updateSpaceType(type.id, { description: e.target.value })}
                              className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500/50"
                            />
                          </div>
                        </div>

                        {/* Icon Selection */}
                        <div>
                          <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2 block">Icon</label>
                          <div className="flex flex-wrap gap-2">
                            {ICON_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => updateSpaceType(type.id, { icon: opt.value })}
                                className={`p-3 rounded-xl border transition-all ${
                                  type.icon === opt.value
                                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                                    : 'bg-black/30 border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                                }`}
                              >
                                <opt.Icon className="h-5 w-5" />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Color Selection */}
                        <div>
                          <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2 block">Color Theme</label>
                          <div className="flex flex-wrap gap-2">
                            {COLOR_PRESETS.map((preset) => (
                              <button
                                key={preset.name}
                                onClick={() => updateSpaceType(type.id, {
                                  color: preset.color,
                                  bgColor: preset.bg,
                                  borderColor: preset.border,
                                })}
                                className={`px-4 py-2 rounded-xl border flex items-center gap-2 transition-all ${
                                  type.color === preset.color
                                    ? 'border-white/40 bg-white/10'
                                    : 'border-white/10 hover:border-white/20'
                                }`}
                              >
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.color }} />
                                <span className="text-xs font-mono text-white">{preset.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* UI Settings Tab */}
      {activeTab === 'ui' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-orbitron font-bold text-white">SpaceSwitcher UI Settings</h2>
              <p className="text-sm text-zinc-500 font-mono mt-1">Configure the appearance and behavior of the space switcher component</p>
            </div>
            <button
              onClick={saveUIConfig}
              disabled={saving}
              className="px-5 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 hover:border-cyan-500/60 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Save className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-mono text-cyan-400 uppercase tracking-wider">
                {saving ? 'Saving...' : 'Save Changes'}
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dropdown Style */}
            <div className="p-5 bg-black/50 border border-white/10 rounded-2xl space-y-4">
              <h3 className="font-orbitron font-bold text-white">Dropdown Style</h3>
              <div className="grid grid-cols-3 gap-3">
                {(['minimal', 'detailed', 'compact'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => setUiConfig(prev => ({ ...prev, dropdownStyle: style }))}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      uiConfig.dropdownStyle === style
                        ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                        : 'bg-black/30 border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <span className="text-sm font-mono uppercase tracking-wider">{style}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Default Space Label */}
            <div className="p-5 bg-black/50 border border-white/10 rounded-2xl space-y-4">
              <h3 className="font-orbitron font-bold text-white">Default Space Label</h3>
              <input
                type="text"
                value={uiConfig.defaultSpaceLabel}
                onChange={(e) => setUiConfig(prev => ({ ...prev, defaultSpaceLabel: e.target.value }))}
                placeholder="e.g., My Space, Personal, Default"
                className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500/50"
              />
              <p className="text-xs text-zinc-500 font-mono">Shown when no custom spaces exist</p>
            </div>

            {/* Toggle Options */}
            <div className="p-5 bg-black/50 border border-white/10 rounded-2xl space-y-4 lg:col-span-2">
              <h3 className="font-orbitron font-bold text-white mb-4">Display Options</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { key: 'showTypeIcons', label: 'Show Type Icons' },
                  { key: 'showMemberCount', label: 'Show Member Count' },
                  { key: 'showCreateButton', label: 'Show Create Button' },
                  { key: 'animateTransitions', label: 'Animate Transitions' },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setUiConfig(prev => ({ ...prev, [opt.key]: !prev[opt.key as keyof SpacesUIConfig] }))}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      uiConfig[opt.key as keyof SpacesUIConfig]
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-black/30 border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-mono ${uiConfig[opt.key as keyof SpacesUIConfig] ? 'text-emerald-400' : 'text-zinc-400'}`}>
                        {opt.label}
                      </span>
                      <div className={`w-10 h-5 rounded-full transition-colors ${uiConfig[opt.key as keyof SpacesUIConfig] ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white mt-0.5 transition-transform ${uiConfig[opt.key as keyof SpacesUIConfig] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="p-5 bg-black/50 border border-white/10 rounded-2xl space-y-4 lg:col-span-2">
              <h3 className="font-orbitron font-bold text-white">Live Preview</h3>
              <div className="p-6 bg-[#0a0a0f] rounded-xl border border-white/5">
                <div className="flex items-center gap-3 p-3 bg-black/50 border border-white/10 rounded-xl w-fit">
                  {uiConfig.showTypeIcons && (
                    <div className="p-2 rounded-lg" style={{ backgroundColor: spaceTypes[0]?.bgColor, color: spaceTypes[0]?.color }}>
                      <User className="h-4 w-4" />
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">{uiConfig.defaultSpaceLabel}</p>
                    {uiConfig.showMemberCount && (
                      <p className="text-xs text-zinc-500">1 member</p>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 text-zinc-500 ml-2" />
                </div>
                <p className="text-xs text-zinc-600 font-mono mt-4">
                  Style: {uiConfig.dropdownStyle} | Animations: {uiConfig.animateTransitions ? 'On' : 'Off'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
