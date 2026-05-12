import { createClient } from '@/lib/supabase/client';
import type { 
  Project, 
  ProjectInsert, 
  ProjectUpdate,
  Chapter
} from '@/lib/database.types';

export interface ProjectWithChapters extends Project {
  chapters: Chapter[];
}

/**
 * Projects Service - Supabase CRUD operations for projects
 */
export const projectsService = {
  /**
   * Get all projects for the current user
   */
  async getAll(): Promise<Project[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Get a single project by ID
   */
  async getById(id: string): Promise<Project> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch project: ${error.message}`);
    }

    return data;
  },

  /**
   * Get a project with its chapters
   */
  async getWithChapters(id: string): Promise<ProjectWithChapters> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        chapters (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch project with chapters: ${error.message}`);
    }

    return data as ProjectWithChapters;
  },

  /**
   * Create a new project
   */
  async create(data: Omit<ProjectInsert, 'user_id'>): Promise<Project> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const projectData: ProjectInsert = {
      ...data,
      user_id: user.id,
    };

    const { data: project, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }

    return project;
  },

  /**
   * Update an existing project
   */
  async update(id: string, data: ProjectUpdate): Promise<Project> {
    const supabase = createClient();
    
    const { data: project, error } = await supabase
      .from('projects')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update project: ${error.message}`);
    }

    return project;
  },

  /**
   * Delete a project
   */
  async delete(id: string): Promise<void> {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  },

  /**
   * Update word count for a project
   */
  async updateWordCount(id: string, wordCount: number): Promise<Project> {
    return this.update(id, { current_word_count: wordCount });
  },

  /**
   * Subscribe to project changes
   */
  subscribeToChanges(
    userId: string,
    callback: (payload: { 
      eventType: 'INSERT' | 'UPDATE' | 'DELETE';
      new: Project | null;
      old: Project | null;
    }) => void
  ): () => void {
    const supabase = createClient();
    
    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback({
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new as Project | null,
            old: payload.old as Project | null,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
