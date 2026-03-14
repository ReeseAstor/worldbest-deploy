import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Project UI Store
 * 
 * Manages UI-only state for projects.
 * Actual project data is fetched via TanStack Query hooks.
 */

export type ViewMode = 'grid' | 'list';
export type SortBy = 'updated' | 'title' | 'wordCount' | 'status';
export type SortOrder = 'asc' | 'desc';

interface ProjectUIFilters {
  genre: string | null;
  status: string | null;
  steamLevel: number | null;
  searchQuery: string;
}

interface ProjectUIState {
  // Current selection
  selectedProjectId: string | null;
  
  // View preferences
  viewMode: ViewMode;
  sortBy: SortBy;
  sortOrder: SortOrder;
  
  // Filters
  filters: ProjectUIFilters;
  
  // UI state
  isCreateModalOpen: boolean;
  isDeleteModalOpen: boolean;
  projectToDelete: string | null;
  
  // Actions
  setSelectedProject: (id: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setSortBy: (sortBy: SortBy) => void;
  setSortOrder: (order: SortOrder) => void;
  setFilters: (filters: Partial<ProjectUIFilters>) => void;
  clearFilters: () => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openDeleteModal: (projectId: string) => void;
  closeDeleteModal: () => void;
}

const defaultFilters: ProjectUIFilters = {
  genre: null,
  status: null,
  steamLevel: null,
  searchQuery: '',
};

export const useProjectStore = create<ProjectUIState>()(
  persist(
    (set) => ({
      // Initial state
      selectedProjectId: null,
      viewMode: 'grid',
      sortBy: 'updated',
      sortOrder: 'desc',
      filters: defaultFilters,
      isCreateModalOpen: false,
      isDeleteModalOpen: false,
      projectToDelete: null,

      // Actions
      setSelectedProject: (id) => set({ selectedProjectId: id }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setSortBy: (sortBy) => set({ sortBy }),
      setSortOrder: (order) => set({ sortOrder: order }),
      setFilters: (newFilters) => 
        set((state) => ({ filters: { ...state.filters, ...newFilters } })),
      clearFilters: () => set({ filters: defaultFilters }),
      openCreateModal: () => set({ isCreateModalOpen: true }),
      closeCreateModal: () => set({ isCreateModalOpen: false }),
      openDeleteModal: (projectId) => 
        set({ isDeleteModalOpen: true, projectToDelete: projectId }),
      closeDeleteModal: () => 
        set({ isDeleteModalOpen: false, projectToDelete: null }),
    }),
    {
      name: 'ember-project-ui',
      partialize: (state) => ({
        viewMode: state.viewMode,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      }),
    }
  )
);
