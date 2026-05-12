import { describe, it, expect, vi, beforeEach } from 'vitest';
import { projectsService } from '../projects';

// Build a fluent mock chain that mirrors Supabase's query builder
function createMockQueryBuilder(resolvedValue: { data: any; error: any }) {
  const builder: any = {};
  const methods = ['select', 'insert', 'update', 'delete', 'eq', 'single', 'order', 'filter', 'range'];
  for (const method of methods) {
    builder[method] = vi.fn(() => builder);
  }
  // Terminal methods resolve
  builder.single.mockResolvedValue(resolvedValue);
  builder.order.mockResolvedValue(resolvedValue);
  return builder;
}

let mockQueryBuilder: any;
const mockGetUser = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: vi.fn(() => mockQueryBuilder),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
  }),
}));

describe('projectsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryBuilder = createMockQueryBuilder({ data: null, error: null });
  });

  describe('getAll', () => {
    it('throws when user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
      await expect(projectsService.getAll()).rejects.toThrow('User not authenticated');
    });

    it('returns projects for authenticated user', async () => {
      const mockProjects = [
        { id: '1', title: 'Project A' },
        { id: '2', title: 'Project B' },
      ];
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
      mockQueryBuilder.order.mockResolvedValue({ data: mockProjects, error: null });

      const result = await projectsService.getAll();
      expect(result).toEqual(mockProjects);
    });

    it('throws on database error', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
      mockQueryBuilder.order.mockResolvedValue({ data: null, error: { message: 'DB error' } });

      await expect(projectsService.getAll()).rejects.toThrow('Failed to fetch projects');
    });

    it('returns empty array when data is null', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
      mockQueryBuilder.order.mockResolvedValue({ data: null, error: null });

      const result = await projectsService.getAll();
      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('returns a project by ID', async () => {
      const mockProject = { id: 'proj-1', title: 'My Novel' };
      mockQueryBuilder.single.mockResolvedValue({ data: mockProject, error: null });

      const result = await projectsService.getById('proj-1');
      expect(result).toEqual(mockProject);
    });

    it('throws when project not found', async () => {
      mockQueryBuilder.single.mockResolvedValue({ data: null, error: { message: 'Not found' } });
      await expect(projectsService.getById('nonexistent')).rejects.toThrow('Failed to fetch project');
    });
  });

  describe('getWithChapters', () => {
    it('returns a project with chapters', async () => {
      const mockProject = { id: 'proj-1', title: 'My Novel', chapters: [{ id: 'ch-1' }] };
      mockQueryBuilder.single.mockResolvedValue({ data: mockProject, error: null });

      const result = await projectsService.getWithChapters('proj-1');
      expect(result.chapters).toHaveLength(1);
    });

    it('throws on database error', async () => {
      mockQueryBuilder.single.mockResolvedValue({ data: null, error: { message: 'Query failed' } });
      await expect(projectsService.getWithChapters('proj-1')).rejects.toThrow('Failed to fetch project with chapters');
    });
  });

  describe('create', () => {
    it('throws when user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
      await expect(
        projectsService.create({ title: 'New Project' } as any)
      ).rejects.toThrow('User not authenticated');
    });

    it('creates a project with user ID', async () => {
      const mockProject = { id: 'new-1', title: 'New Project', user_id: 'user-1' };
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
      mockQueryBuilder.single.mockResolvedValue({ data: mockProject, error: null });

      const result = await projectsService.create({ title: 'New Project' } as any);
      expect(result).toEqual(mockProject);
    });

    it('throws on creation error', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
      mockQueryBuilder.single.mockResolvedValue({ data: null, error: { message: 'Insert failed' } });

      await expect(
        projectsService.create({ title: 'New Project' } as any)
      ).rejects.toThrow('Failed to create project');
    });
  });

  describe('update', () => {
    it('updates a project', async () => {
      const updated = { id: 'proj-1', title: 'Updated Title' };
      mockQueryBuilder.single.mockResolvedValue({ data: updated, error: null });

      const result = await projectsService.update('proj-1', { title: 'Updated Title' } as any);
      expect(result).toEqual(updated);
    });
  });

  describe('delete', () => {
    it('deletes without error', async () => {
      mockQueryBuilder.eq.mockResolvedValue({ error: null });
      await expect(projectsService.delete('proj-1')).resolves.not.toThrow();
    });

    it('throws on deletion error', async () => {
      mockQueryBuilder.eq.mockResolvedValue({ error: { message: 'Delete failed' } });
      await expect(projectsService.delete('proj-1')).rejects.toThrow('Failed to delete project');
    });
  });

  describe('updateWordCount', () => {
    it('delegates to update with word count', async () => {
      const updated = { id: 'proj-1', current_word_count: 5000 };
      mockQueryBuilder.single.mockResolvedValue({ data: updated, error: null });

      const result = await projectsService.updateWordCount('proj-1', 5000);
      expect(result).toEqual(updated);
    });
  });

  describe('subscribeToChanges', () => {
    it('returns an unsubscribe function', () => {
      const unsubscribe = projectsService.subscribeToChanges('user-1', vi.fn());
      expect(typeof unsubscribe).toBe('function');
    });
  });
});
