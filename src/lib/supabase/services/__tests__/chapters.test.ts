import { describe, it, expect, vi, beforeEach } from 'vitest';
import { chaptersService } from '../chapters';

function createMockQueryBuilder(resolvedValue: { data: any; error: any }) {
  const builder: any = {};
  const methods = ['select', 'insert', 'update', 'delete', 'eq', 'single', 'order', 'limit', 'filter', 'or'];
  for (const method of methods) {
    builder[method] = vi.fn(() => builder);
  }
  builder.single.mockResolvedValue(resolvedValue);
  // Make order both chainable AND thenable (for when it's the terminal call)
  builder.order.mockImplementation(() => {
    const chainable: any = { ...builder };
    // Copy all mock functions to the chainable object
    for (const method of methods) {
      chainable[method] = builder[method];
    }
    // Also make it a thenable that resolves with data
    chainable.then = (resolve: any) => resolve(resolvedValue);
    return chainable;
  });
  return builder;
}

let mockQueryBuilder: any;

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: vi.fn(() => mockQueryBuilder),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
  }),
}));

describe('chaptersService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryBuilder = createMockQueryBuilder({ data: null, error: null });
  });

  describe('getByProject', () => {
    it('returns chapters ordered by chapter number', async () => {
      const mockChapters = [
        { id: 'ch-1', chapter_number: 1, title: 'Chapter 1' },
        { id: 'ch-2', chapter_number: 2, title: 'Chapter 2' },
      ];
      mockQueryBuilder.order.mockResolvedValue({ data: mockChapters, error: null });

      const result = await chaptersService.getByProject('proj-1');
      expect(result).toEqual(mockChapters);
    });

    it('returns empty array when no chapters exist', async () => {
      mockQueryBuilder.order.mockResolvedValue({ data: null, error: null });
      const result = await chaptersService.getByProject('proj-1');
      expect(result).toEqual([]);
    });

    it('throws on database error', async () => {
      mockQueryBuilder.order.mockResolvedValue({ data: null, error: { message: 'Query failed' } });
      await expect(chaptersService.getByProject('proj-1')).rejects.toThrow('Failed to fetch chapters');
    });
  });

  describe('getById', () => {
    it('returns a chapter by ID', async () => {
      const mockChapter = { id: 'ch-1', title: 'Chapter 1', content: 'Once upon a time' };
      mockQueryBuilder.single.mockResolvedValue({ data: mockChapter, error: null });

      const result = await chaptersService.getById('ch-1');
      expect(result).toEqual(mockChapter);
    });

    it('throws when chapter not found', async () => {
      mockQueryBuilder.single.mockResolvedValue({ data: null, error: { message: 'Not found' } });
      await expect(chaptersService.getById('nonexistent')).rejects.toThrow('Failed to fetch chapter');
    });
  });

  describe('getWithContent', () => {
    it('delegates to getById', async () => {
      const mockChapter = { id: 'ch-1', content: 'Content here' };
      mockQueryBuilder.single.mockResolvedValue({ data: mockChapter, error: null });

      const result = await chaptersService.getWithContent('ch-1');
      expect(result).toEqual(mockChapter);
    });
  });

  describe('create', () => {
    it('creates a chapter', async () => {
      const newChapter = { id: 'ch-new', title: 'New Chapter', project_id: 'proj-1' };
      mockQueryBuilder.single.mockResolvedValue({ data: newChapter, error: null });

      const result = await chaptersService.create({
        title: 'New Chapter',
        project_id: 'proj-1',
      } as any);
      expect(result).toEqual(newChapter);
    });

    it('throws on creation error', async () => {
      mockQueryBuilder.single.mockResolvedValue({ data: null, error: { message: 'Insert failed' } });
      await expect(
        chaptersService.create({ title: 'Fail' } as any)
      ).rejects.toThrow('Failed to create chapter');
    });
  });

  describe('update', () => {
    it('updates a chapter with timestamp', async () => {
      const updated = { id: 'ch-1', title: 'Updated' };
      mockQueryBuilder.single.mockResolvedValue({ data: updated, error: null });

      const result = await chaptersService.update('ch-1', { title: 'Updated' } as any);
      expect(result).toEqual(updated);
    });
  });

  describe('updateContent', () => {
    it('calculates word count from content', async () => {
      const updatedChapter = { id: 'ch-1', word_count: 4 };
      mockQueryBuilder.single.mockResolvedValue({ data: updatedChapter, error: null });

      const result = await chaptersService.updateContent(
        'ch-1',
        'Once upon a time',
        '<p>Once upon a time</p>'
      );
      expect(result).toEqual(updatedChapter);
    });

    it('handles empty content', async () => {
      const updatedChapter = { id: 'ch-1', word_count: 0 };
      mockQueryBuilder.single.mockResolvedValue({ data: updatedChapter, error: null });

      const result = await chaptersService.updateContent('ch-1', '', '');
      expect(result).toEqual(updatedChapter);
    });
  });

  describe('delete', () => {
    it('deletes without error', async () => {
      mockQueryBuilder.eq.mockResolvedValue({ error: null });
      await expect(chaptersService.delete('ch-1')).resolves.not.toThrow();
    });

    it('throws on deletion error', async () => {
      mockQueryBuilder.eq.mockResolvedValue({ error: { message: 'Delete failed' } });
      await expect(chaptersService.delete('ch-1')).rejects.toThrow('Failed to delete chapter');
    });
  });

  describe('getNextChapterNumber', () => {
    it('returns next number after existing chapters', async () => {
      mockQueryBuilder.single.mockResolvedValue({ data: { chapter_number: 5 }, error: null });

      const result = await chaptersService.getNextChapterNumber('proj-1');
      expect(result).toBe(6);
    });

    it('returns 1 when no chapters exist', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows' },
      });

      const result = await chaptersService.getNextChapterNumber('proj-1');
      expect(result).toBe(1);
    });

    it('throws on non-PGRST116 errors', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { code: 'INTERNAL', message: 'Server error' },
      });

      await expect(chaptersService.getNextChapterNumber('proj-1')).rejects.toThrow(
        'Failed to get next chapter number'
      );
    });
  });

  describe('subscribeToChanges', () => {
    it('returns an unsubscribe function', () => {
      const unsubscribe = chaptersService.subscribeToChanges('proj-1', vi.fn());
      expect(typeof unsubscribe).toBe('function');
    });
  });
});
