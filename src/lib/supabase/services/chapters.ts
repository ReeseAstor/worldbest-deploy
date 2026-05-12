import { createClient } from '@/lib/supabase/client';
import type { 
  Chapter, 
  ChapterInsert, 
  ChapterUpdate 
} from '@/lib/database.types';

/**
 * Chapters Service - Supabase CRUD operations for chapters
 */
export const chaptersService = {
  /**
   * Get all chapters for a project
   */
  async getByProject(projectId: string): Promise<Chapter[]> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('project_id', projectId)
      .order('chapter_number', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch chapters: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Get a single chapter by ID
   */
  async getById(id: string): Promise<Chapter> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch chapter: ${error.message}`);
    }

    return data;
  },

  /**
   * Get a chapter with full content
   */
  async getWithContent(id: string): Promise<Chapter> {
    return this.getById(id);
  },

  /**
   * Create a new chapter
   */
  async create(data: ChapterInsert): Promise<Chapter> {
    const supabase = createClient();

    const { data: chapter, error } = await supabase
      .from('chapters')
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create chapter: ${error.message}`);
    }

    return chapter;
  },

  /**
   * Update an existing chapter
   */
  async update(id: string, data: ChapterUpdate): Promise<Chapter> {
    const supabase = createClient();
    
    const { data: chapter, error } = await supabase
      .from('chapters')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update chapter: ${error.message}`);
    }

    return chapter;
  },

  /**
   * Update chapter content (with word count)
   */
  async updateContent(id: string, content: string, contentHtml: string): Promise<Chapter> {
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    
    return this.update(id, {
      content,
      content_html: contentHtml,
      word_count: wordCount,
    });
  },

  /**
   * Delete a chapter
   */
  async delete(id: string): Promise<void> {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('chapters')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete chapter: ${error.message}`);
    }
  },

  /**
   * Reorder chapters
   */
  async reorder(projectId: string, chapterOrders: { id: string; chapter_number: number }[]): Promise<void> {
    const supabase = createClient();
    
    const updates = chapterOrders.map(({ id, chapter_number }) =>
      supabase
        .from('chapters')
        .update({ chapter_number })
        .eq('id', id)
        .eq('project_id', projectId)
    );

    await Promise.all(updates);
  },

  /**
   * Get next chapter number for a project
   */
  async getNextChapterNumber(projectId: string): Promise<number> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('chapters')
      .select('chapter_number')
      .eq('project_id', projectId)
      .order('chapter_number', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get next chapter number: ${error.message}`);
    }

    return (data?.chapter_number || 0) + 1;
  },

  /**
   * Subscribe to chapter changes for a project
   */
  subscribeToChanges(
    projectId: string,
    callback: (payload: { 
      eventType: 'INSERT' | 'UPDATE' | 'DELETE';
      new: Chapter | null;
      old: Chapter | null;
    }) => void
  ): () => void {
    const supabase = createClient();
    
    const channel = supabase
      .channel(`chapters-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chapters',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          callback({
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new as Chapter | null,
            old: payload.old as Chapter | null,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
