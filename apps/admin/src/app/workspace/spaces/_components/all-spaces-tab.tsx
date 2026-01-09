'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Users,
  User,
  Heart,
  Briefcase,
  Folder,
  Sparkles,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';
import type { SpaceType, SpaceRole } from '@ainexsuite/types';

interface SpaceData {
  id: string;
  app: string;
  name: string;
  type: SpaceType;
  memberCount: number;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  lastActive?: string;
  description?: string;
  ownerId?: string;
  members?: Array<{
    uid: string;
    displayName?: string;
    email?: string;
    photoURL?: string;
    role: SpaceRole;
    joinedAt: number;
  }>;
}

interface AllSpacesTabProps {
  spaces: SpaceData[];
  onViewSpace: (space: SpaceData) => void;
  onEditSpace: (space: SpaceData) => void;
  onDeleteSpace: (space: SpaceData) => void;
  onBulkDelete: (spaceIds: string[]) => void;
}

const SPACE_TYPE_ICONS: Record<string, typeof User> = {
  personal: User,
  family: Users,
  work: Briefcase,
  couple: Heart,
  buddy: Sparkles,
  squad: Users,
  project: Folder,
};

const SPACE_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  personal: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  family: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  work: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  couple: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
  buddy: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  squad: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  project: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
};

type SortField = 'name' | 'type' | 'memberCount' | 'createdAt' | 'lastActive';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;

export function AllSpacesTab({
  spaces,
  onViewSpace,
  onEditSpace,
  onDeleteSpace,
  onBulkDelete,
}: AllSpacesTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<SpaceType | null>(null);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSpaces, setSelectedSpaces] = useState<Set<string>>(new Set());
  const [showActions, setShowActions] = useState<string | null>(null);

  // Get unique space types from data
  const availableTypes = useMemo(() => {
    const types = new Set(spaces.map((s) => s.type));
    return Array.from(types);
  }, [spaces]);

  // Filter and sort spaces
  const filteredSpaces = useMemo(() => {
    const result = spaces.filter((space) => {
      const matchesSearch =
        space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        space.createdBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (space.createdByName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesType = !selectedType || space.type === selectedType;
      return matchesSearch && matchesType;
    });

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'memberCount':
          comparison = a.memberCount - b.memberCount;
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'lastActive':
          comparison =
            new Date(a.lastActive || a.createdAt).getTime() -
            new Date(b.lastActive || b.createdAt).getTime();
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [spaces, searchQuery, selectedType, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredSpaces.length / ITEMS_PER_PAGE);
  const paginatedSpaces = filteredSpaces.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedSpaces.size === paginatedSpaces.length) {
      setSelectedSpaces(new Set());
    } else {
      setSelectedSpaces(new Set(paginatedSpaces.map((s) => `${s.app}-${s.id}`)));
    }
  };

  const toggleSelectSpace = (spaceKey: string) => {
    const newSelected = new Set(selectedSpaces);
    if (newSelected.has(spaceKey)) {
      newSelected.delete(spaceKey);
    } else {
      newSelected.add(spaceKey);
    }
    setSelectedSpaces(newSelected);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleBulkDelete = () => {
    if (selectedSpaces.size === 0) return;
    const ids = Array.from(selectedSpaces);
    onBulkDelete(ids);
    setSelectedSpaces(new Set());
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const SortableHeader = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {children}
      <ArrowUpDown
        className={`h-3 w-3 ${sortField === field ? 'text-indigo-400' : 'text-muted-foreground'}`}
      />
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name or owner..."
            className="w-full pl-9 pr-4 py-2.5 bg-surface-elevated/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Type Filter */}
          <div className="relative">
            <button
              onClick={() => setShowTypeFilter(!showTypeFilter)}
              className="px-4 py-2.5 bg-surface-elevated/50 border border-border rounded-lg flex items-center gap-2 text-sm text-foreground/90 hover:text-foreground transition-colors min-w-[140px] justify-between"
            >
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="capitalize">
                  {selectedType || 'All Types'}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
            {showTypeFilter && (
              <div className="absolute top-full mt-1 right-0 bg-surface-elevated border border-border rounded-lg shadow-xl z-20 min-w-[160px] py-1">
                <button
                  onClick={() => {
                    setSelectedType(null);
                    setShowTypeFilter(false);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-foreground/5 text-foreground/90 hover:text-foreground"
                >
                  All Types
                </button>
                {availableTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setSelectedType(type);
                      setShowTypeFilter(false);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-foreground/5 text-foreground/90 hover:text-foreground capitalize"
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Results count */}
          <div className="text-xs font-medium text-muted-foreground bg-surface-elevated/50 px-3 py-2 rounded-lg border border-border">
            {filteredSpaces.length} spaces
          </div>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedSpaces.size > 0 && (
        <div className="flex items-center gap-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
          <span className="text-sm text-indigo-400 font-medium">
            {selectedSpaces.size} selected
          </span>
          <div className="h-4 w-px bg-indigo-500/30" />
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete Selected
          </button>
          <button
            onClick={() => setSelectedSpaces(new Set())}
            className="ml-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-surface-elevated/30">
                <th className="px-4 py-4 w-12">
                  <button
                    onClick={toggleSelectAll}
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      selectedSpaces.size === paginatedSpaces.length &&
                      paginatedSpaces.length > 0
                        ? 'bg-indigo-500 border-indigo-500 text-white'
                        : 'border-border hover:border-foreground/50'
                    }`}
                  >
                    {selectedSpaces.size === paginatedSpaces.length &&
                      paginatedSpaces.length > 0 && <Check className="h-3 w-3" />}
                  </button>
                </th>
                <th className="px-4 py-4 text-xs font-medium text-muted-foreground">
                  <SortableHeader field="name">Name</SortableHeader>
                </th>
                <th className="px-4 py-4 text-xs font-medium text-muted-foreground">
                  <SortableHeader field="type">Type</SortableHeader>
                </th>
                <th className="px-4 py-4 text-xs font-medium text-muted-foreground">
                  Owner
                </th>
                <th className="px-4 py-4 text-xs font-medium text-muted-foreground">
                  <SortableHeader field="memberCount">Members</SortableHeader>
                </th>
                <th className="px-4 py-4 text-xs font-medium text-muted-foreground">
                  <SortableHeader field="createdAt">Created</SortableHeader>
                </th>
                <th className="px-4 py-4 text-xs font-medium text-muted-foreground">
                  <SortableHeader field="lastActive">Last Active</SortableHeader>
                </th>
                <th className="px-4 py-4 text-xs font-medium text-muted-foreground text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedSpaces.map((space) => {
                const spaceKey = `${space.app}-${space.id}`;
                const isSelected = selectedSpaces.has(spaceKey);
                const Icon = SPACE_TYPE_ICONS[space.type] || User;
                const colors = SPACE_TYPE_COLORS[space.type] || SPACE_TYPE_COLORS.personal;

                return (
                  <tr
                    key={spaceKey}
                    className={`group hover:bg-foreground/[0.02] transition-colors ${
                      isSelected ? 'bg-indigo-500/5' : ''
                    }`}
                  >
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleSelectSpace(spaceKey)}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-indigo-500 border-indigo-500 text-white'
                            : 'border-border hover:border-foreground/50'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg border ${colors.bg} ${colors.border}`}
                        >
                          <Icon className={`h-4 w-4 ${colors.text}`} />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{space.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {space.app}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${colors.bg} ${colors.text} ${colors.border}`}
                      >
                        {space.type}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-foreground/80">
                        {space.createdByName || space.createdBy}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-foreground/80">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        {space.memberCount}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {formatDate(space.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {space.lastActive ? formatDate(space.lastActive) : '-'}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="relative">
                        <button
                          onClick={() =>
                            setShowActions(showActions === spaceKey ? null : spaceKey)
                          }
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        {showActions === spaceKey && (
                          <div className="absolute right-0 top-full mt-1 bg-surface-elevated border border-border rounded-lg shadow-xl z-20 py-1 min-w-[120px]">
                            <button
                              onClick={() => {
                                onViewSpace(space);
                                setShowActions(null);
                              }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-foreground/5 text-foreground/90 hover:text-foreground flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </button>
                            <button
                              onClick={() => {
                                onEditSpace(space);
                                setShowActions(null);
                              }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-foreground/5 text-foreground/90 hover:text-foreground flex items-center gap-2"
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                onDeleteSpace(space);
                                setShowActions(null);
                              }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-red-500/10 text-red-400 flex items-center gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginatedSpaces.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <p className="text-muted-foreground">No spaces found</p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="mt-2 text-sm text-indigo-400 hover:text-indigo-300"
                      >
                        Clear search
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-surface-elevated/30">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredSpaces.length)} of{' '}
              {filteredSpaces.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-border hover:bg-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-indigo-500 text-white'
                          : 'hover:bg-foreground/5 text-muted-foreground'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-border hover:bg-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
