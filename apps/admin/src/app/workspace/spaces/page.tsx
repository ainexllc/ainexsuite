'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';
import {
  Layers, Users, Search, Filter, ChevronDown, User, Heart, Briefcase,
  Dumbbell, Folder, RefreshCw, Settings, Save, Palette, Eye,
  CheckCircle2, AlertCircle, X, LayoutGrid, Sparkles
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
  dropdownStyle: 'minimal' | 'detailed' | 'compact' | 'modern' | 'pill' | 'block';
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  { name: 'Cyan', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.2)' },
  { name: 'Purple', color: '#a855f7', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.2)' },
  { name: 'Pink', color: '#ec4899', bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.2)' },
  { name: 'Blue', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)' },
  { name: 'Orange', color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.2)' },
  { name: 'Emerald', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
  { name: 'Indigo', color: '#6366f1', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)' },
  { name: 'Rose', color: '#f43f5e', bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.2)' },
];

const DEFAULT_SPACE_TYPES: SpaceTypeConfig[] = [
  { id: 'personal', label: 'Personal', description: 'Your private space', icon: 'user', color: '#06b6d4', bgColor: 'rgba(6,182,212,0.1)', borderColor: 'rgba(6,182,212,0.2)', enabled: true },
  { id: 'family', label: 'Family', description: 'Share with family members', icon: 'users', color: '#a855f7', bgColor: 'rgba(168,85,247,0.1)', borderColor: 'rgba(168,85,247,0.2)', enabled: true },
  { id: 'work', label: 'Work', description: 'Team collaboration', icon: 'briefcase', color: '#3b82f6', bgColor: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.2)', enabled: true },
  { id: 'couple', label: 'Couple', description: 'Share with your partner', icon: 'heart', color: '#ec4899', bgColor: 'rgba(236,72,153,0.1)', borderColor: 'rgba(236,72,153,0.2)', enabled: true },
  { id: 'buddy', label: 'Buddy', description: 'Accountability partner', icon: 'sparkles', color: '#f97316', bgColor: 'rgba(249,115,22,0.1)', borderColor: 'rgba(249,115,22,0.2)', enabled: true },
  { id: 'squad', label: 'Team', description: 'Team collaboration', icon: 'users', color: '#10b981', bgColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.2)', enabled: true },
  { id: 'project', label: 'Project', description: 'Dedicated project space', icon: 'folder', color: '#6366f1', bgColor: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.2)', enabled: true },
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showTypeFilter, setShowTypeFilter] = useState(false);

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
      <div className="flex h-[50vh] items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Render helper for different dropdown styles in preview
  const renderPreviewDropdown = () => {
    const style = uiConfig.dropdownStyle;
    const typeConfig = spaceTypes[0]; // Use first type for preview
    const Icon = SPACE_TYPE_ICONS[typeConfig?.icon || 'user'] || User;

    // Base container with SOLID background
    const containerBase = "flex items-center gap-2 border transition-all cursor-pointer shadow-lg";
    const solidBg = "bg-surface-elevated"; // Enforce solid background

    if (style === 'minimal') {
      return (
        <div className={`${containerBase} ${solidBg} border-border rounded-lg p-2`}>
          {uiConfig.showTypeIcons && <Icon className="h-4 w-4 text-muted-foreground" />}
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      );
    }

    if (style === 'compact') {
      return (
        <div className={`${containerBase} ${solidBg} border-border rounded-md px-3 py-1.5`}>
          {uiConfig.showTypeIcons && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
          <span className="text-sm font-medium text-foreground">{uiConfig.defaultSpaceLabel}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      );
    }

    if (style === 'modern') {
      return (
        <div className={`${containerBase} ${solidBg} border-transparent rounded-2xl px-4 py-3 shadow-xl ring-1 ring-border`}>
          {uiConfig.showTypeIcons && (
            <div className="p-1.5 rounded-full bg-indigo-500/10 text-indigo-400">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground leading-none">{uiConfig.defaultSpaceLabel}</span>
            {uiConfig.showMemberCount && <span className="text-[10px] text-muted-foreground mt-0.5 font-medium">Personal Workspace</span>}
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground ml-2" />
        </div>
      );
    }

    if (style === 'pill') {
      return (
        <div className={`${containerBase} ${solidBg} border-border rounded-full pl-2 pr-4 py-1.5`}>
          {uiConfig.showTypeIcons && (
            <div className="w-6 h-6 rounded-full bg-surface-elevated flex items-center justify-center">
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          )}
          <span className="text-sm font-medium text-foreground">{uiConfig.defaultSpaceLabel}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      );
    }

    if (style === 'block') {
      return (
        <div className={`${containerBase} ${solidBg} border-b border-border rounded-none px-4 py-4 w-full justify-between`}>
          <div className="flex items-center gap-3">
            {uiConfig.showTypeIcons && <Icon className="h-5 w-5 text-muted-foreground" />}
            <span className="text-base font-bold text-foreground tracking-tight">{uiConfig.defaultSpaceLabel}</span>
          </div>
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </div>
      );
    }

    // Default / Detailed
    return (
      <div className={`${containerBase} ${solidBg} border-border rounded-xl p-3`}>
        {uiConfig.showTypeIcons && (
          <div className="p-2 rounded-lg" style={{ backgroundColor: typeConfig?.bgColor, color: typeConfig?.color }}>
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div className="flex flex-col">
          <p className="text-foreground font-medium text-sm">{uiConfig.defaultSpaceLabel}</p>
          {uiConfig.showMemberCount && (
            <p className="text-xs text-muted-foreground">1 member</p>
          )}
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground ml-2" />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-indigo-400" />
            Space Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configure workspace types and view all active spaces.
          </p>
        </div>
        <button
          onClick={fetchAllSpaces}
          className="flex items-center gap-2 px-4 py-2 bg-foreground/5 hover:bg-foreground/10 border border-border rounded-lg text-sm font-medium text-foreground/90 hover:text-foreground transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-elevated/50 border border-border rounded-lg w-fit">
        {[
          { id: 'overview', label: 'Overview', icon: Layers },
          { id: 'types', label: 'Space Types', icon: Palette },
          { id: 'ui', label: 'UI Settings', icon: Eye },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'overview' | 'types' | 'ui')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-surface-elevated text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground/90'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {success}
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-xl">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Spaces</p>
              <p className="text-2xl font-bold text-foreground">{totalSpaces}</p>
            </div>
            <div className="glass-card p-5 rounded-xl">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Members</p>
              <p className="text-2xl font-bold text-foreground">{totalMembers}</p>
            </div>
            <div className="glass-card p-5 rounded-xl">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Active Apps</p>
              <p className="text-2xl font-bold text-foreground">
                {spacesByApp.filter((a) => a.count > 0).length}
              </p>
            </div>
            <div className="glass-card p-5 rounded-xl">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Types Used</p>
              <p className="text-2xl font-bold text-foreground">{usedSpaceTypes.length}</p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search spaces..."
                className="w-full pl-9 pr-4 py-2.5 bg-surface-elevated/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowTypeFilter(!showTypeFilter)}
                className="px-4 py-2.5 bg-surface-elevated/50 border border-border rounded-lg flex items-center gap-2 text-sm text-foreground/90 hover:text-foreground transition-colors min-w-[160px] justify-between"
              >
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedType ? selectedType.charAt(0).toUpperCase() + selectedType.slice(1) : 'All Types'}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
              {showTypeFilter && (
                <div className="absolute top-full mt-1 right-0 bg-surface-elevated border border-border rounded-lg shadow-xl z-20 min-w-[160px] py-1">
                  <button
                    onClick={() => { setSelectedType(null); setShowTypeFilter(false); }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-foreground/5 text-foreground/90 hover:text-foreground"
                  >
                    All Types
                  </button>
                  {usedSpaceTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => { setSelectedType(type); setShowTypeFilter(false); }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-foreground/5 text-foreground/90 hover:text-foreground capitalize"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSpaces.slice(0, 12).map((space) => {
              const app = APP_CONFIGS.find((a) => a.id === space.app);
              const typeConfig = spaceTypes.find(t => t.id === space.type) || spaceTypes[0];
              const Icon = SPACE_TYPE_ICONS[typeConfig?.icon || 'user'] || User;

              return (
                <div key={`${space.app}-${space.id}`} className="glass-card rounded-xl p-5 flex flex-col gap-4 group hover:bg-foreground/[0.02]">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2.5 rounded-lg border bg-opacity-10"
                        style={{
                          backgroundColor: typeConfig?.bgColor,
                          borderColor: typeConfig?.borderColor,
                          color: typeConfig?.color
                        }}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{space.name}</h3>
                        <p className="text-xs text-muted-foreground">{app?.name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-4 border-t border-border">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      <span>{space.memberCount} members</span>
                    </div>
                    <span>{new Date(space.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Types Tab */}
      {activeTab === 'types' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Space Types</h2>
            <button
              onClick={saveSpaceTypes}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors shadow-lg shadow-indigo-500/20"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {spaceTypes.map((type) => {
              const Icon = SPACE_TYPE_ICONS[type.icon] || User;
              const isEditing = editingType === type.id;

              return (
                <div
                  key={type.id}
                  className={`glass-card rounded-xl p-5 border transition-all ${isEditing ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-border'}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2.5 rounded-lg border"
                        style={{ backgroundColor: type.bgColor, borderColor: type.borderColor, color: type.color }}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{type.label}</h3>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button
                        onClick={() => updateSpaceType(type.id, { enabled: !type.enabled })}
                        className={`text-xs px-2 py-1 rounded border ${type.enabled ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-muted/10 border-border/50 text-muted-foreground'}`}
                      >
                        {type.enabled ? 'Active' : 'Disabled'}
                      </button>
                      <button
                        onClick={() => setEditingType(isEditing ? null : type.id)}
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-lg transition-colors"
                      >
                        {isEditing ? <X className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="space-y-4 pt-4 border-t border-border animate-in fade-in slide-in-from-top-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Label</label>
                          <input
                            type="text"
                            value={type.label}
                            onChange={(e) => updateSpaceType(type.id, { label: e.target.value })}
                            className="w-full px-3 py-2 bg-background/20 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500/50"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
                          <input
                            type="text"
                            value={type.description}
                            onChange={(e) => updateSpaceType(type.id, { description: e.target.value })}
                            className="w-full px-3 py-2 bg-background/20 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500/50"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Color Theme</label>
                         <div className="flex flex-wrap gap-2">
                            {COLOR_PRESETS.map((preset) => (
                              <button
                                key={preset.name}
                                onClick={() => updateSpaceType(type.id, {
                                  color: preset.color,
                                  bgColor: preset.bg,
                                  borderColor: preset.border,
                                })}
                                className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 ${type.color === preset.color ? 'ring-2 ring-offset-2 ring-offset-black ring-white' : 'border-transparent'}`}
                                style={{ backgroundColor: preset.color }}
                                title={preset.name}
                              />
                            ))}
                          </div>
                      </div>
                    </div>
                  )}
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
            <h2 className="text-lg font-semibold text-white">Interface Settings</h2>
            <button
              onClick={saveUIConfig}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors shadow-lg shadow-indigo-500/20"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>

          <div className="glass-card rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-medium text-white mb-4">Display Options</h3>
                <div className="space-y-3">
                  {[
                    { key: 'showTypeIcons', label: 'Show Type Icons' },
                    { key: 'showMemberCount', label: 'Show Member Count' },
                    { key: 'showCreateButton', label: 'Show Create Button' },
                    { key: 'animateTransitions', label: 'Animate Transitions' },
                  ].map((opt) => (
                    <label key={opt.key} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                      <span className="text-sm text-foreground/90">{opt.label}</span>
                      <input
                        type="checkbox"
                        checked={uiConfig[opt.key as keyof SpacesUIConfig] as boolean}
                        onChange={() => setUiConfig(prev => ({ ...prev, [opt.key]: !prev[opt.key as keyof SpacesUIConfig] }))}
                        className="accent-indigo-500 h-4 w-4 rounded"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div>
                 <h3 className="text-sm font-medium text-white mb-4">Dropdown Style</h3>
                 <div className="grid grid-cols-3 gap-3 mb-6">
                    {(['minimal', 'detailed', 'compact', 'modern', 'pill', 'block'] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => setUiConfig(prev => ({ ...prev, dropdownStyle: style }))}
                        className={`p-2 rounded-lg text-xs font-medium border transition-all capitalize ${
                          uiConfig.dropdownStyle === style
                            ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                            : 'bg-surface-elevated/50 border-white/10 text-muted-foreground hover:text-foreground/90'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                 </div>

                 <label className="block">
                    <span className="text-sm font-medium text-muted-foreground mb-2 block">Default Space Label</span>
                    <input
                      type="text"
                      value={uiConfig.defaultSpaceLabel}
                      onChange={(e) => setUiConfig(prev => ({ ...prev, defaultSpaceLabel: e.target.value }))}
                      className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    />
                 </label>
              </div>
            </div>

            {/* Live Preview */}
            <div className="mt-8 pt-8 border-t border-white/5">
              <h3 className="text-sm font-medium text-white mb-4">Live Preview</h3>
              <div className="p-8 bg-black rounded-xl border border-white/10 flex items-center justify-center min-h-[160px] relative overflow-hidden">
                {/* Grid Pattern Background for Preview */}
                <div className="absolute inset-0 opacity-20 pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(#4f4f4f 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
                />
                
                {/* The Preview Component */}
                <div className="relative z-10">
                  {renderPreviewDropdown()}
                </div>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-3 font-mono">
                Style: {uiConfig.dropdownStyle} | Animations: {uiConfig.animateTransitions ? 'On' : 'Off'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}