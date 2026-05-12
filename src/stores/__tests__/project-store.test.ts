import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from '../project-store';

describe('useProjectStore', () => {
  beforeEach(() => {
    // Reset store state between tests
    useProjectStore.setState({
      selectedProjectId: null,
      viewMode: 'grid',
      sortBy: 'updated',
      sortOrder: 'desc',
      filters: { genre: null, status: null, steamLevel: null, searchQuery: '' },
      isCreateModalOpen: false,
      isDeleteModalOpen: false,
      projectToDelete: null,
    });
  });

  describe('initial state', () => {
    it('has correct default values', () => {
      const state = useProjectStore.getState();
      expect(state.selectedProjectId).toBeNull();
      expect(state.viewMode).toBe('grid');
      expect(state.sortBy).toBe('updated');
      expect(state.sortOrder).toBe('desc');
      expect(state.filters.searchQuery).toBe('');
      expect(state.isCreateModalOpen).toBe(false);
      expect(state.isDeleteModalOpen).toBe(false);
    });
  });

  describe('setSelectedProject', () => {
    it('sets the selected project ID', () => {
      useProjectStore.getState().setSelectedProject('project-123');
      expect(useProjectStore.getState().selectedProjectId).toBe('project-123');
    });

    it('clears the selected project when null', () => {
      useProjectStore.getState().setSelectedProject('project-123');
      useProjectStore.getState().setSelectedProject(null);
      expect(useProjectStore.getState().selectedProjectId).toBeNull();
    });
  });

  describe('view mode', () => {
    it('changes view mode to list', () => {
      useProjectStore.getState().setViewMode('list');
      expect(useProjectStore.getState().viewMode).toBe('list');
    });

    it('changes view mode back to grid', () => {
      useProjectStore.getState().setViewMode('list');
      useProjectStore.getState().setViewMode('grid');
      expect(useProjectStore.getState().viewMode).toBe('grid');
    });
  });

  describe('sorting', () => {
    it('sets sort by field', () => {
      useProjectStore.getState().setSortBy('title');
      expect(useProjectStore.getState().sortBy).toBe('title');
    });

    it('sets sort order', () => {
      useProjectStore.getState().setSortOrder('asc');
      expect(useProjectStore.getState().sortOrder).toBe('asc');
    });
  });

  describe('filters', () => {
    it('sets partial filters', () => {
      useProjectStore.getState().setFilters({ genre: 'fantasy' });
      const { filters } = useProjectStore.getState();
      expect(filters.genre).toBe('fantasy');
      expect(filters.status).toBeNull(); // other filters unchanged
    });

    it('sets search query', () => {
      useProjectStore.getState().setFilters({ searchQuery: 'my novel' });
      expect(useProjectStore.getState().filters.searchQuery).toBe('my novel');
    });

    it('sets steam level filter', () => {
      useProjectStore.getState().setFilters({ steamLevel: 3 });
      expect(useProjectStore.getState().filters.steamLevel).toBe(3);
    });

    it('clears all filters', () => {
      useProjectStore.getState().setFilters({
        genre: 'fantasy',
        status: 'draft',
        steamLevel: 5,
        searchQuery: 'test',
      });
      useProjectStore.getState().clearFilters();
      const { filters } = useProjectStore.getState();
      expect(filters.genre).toBeNull();
      expect(filters.status).toBeNull();
      expect(filters.steamLevel).toBeNull();
      expect(filters.searchQuery).toBe('');
    });
  });

  describe('create modal', () => {
    it('opens the create modal', () => {
      useProjectStore.getState().openCreateModal();
      expect(useProjectStore.getState().isCreateModalOpen).toBe(true);
    });

    it('closes the create modal', () => {
      useProjectStore.getState().openCreateModal();
      useProjectStore.getState().closeCreateModal();
      expect(useProjectStore.getState().isCreateModalOpen).toBe(false);
    });
  });

  describe('delete modal', () => {
    it('opens the delete modal with a project ID', () => {
      useProjectStore.getState().openDeleteModal('project-456');
      const state = useProjectStore.getState();
      expect(state.isDeleteModalOpen).toBe(true);
      expect(state.projectToDelete).toBe('project-456');
    });

    it('closes the delete modal and clears project ID', () => {
      useProjectStore.getState().openDeleteModal('project-456');
      useProjectStore.getState().closeDeleteModal();
      const state = useProjectStore.getState();
      expect(state.isDeleteModalOpen).toBe(false);
      expect(state.projectToDelete).toBeNull();
    });
  });
});
