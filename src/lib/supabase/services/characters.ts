import { createClient } from '@/lib/supabase/client';
import type { 
  Character, 
  CharacterInsert, 
  CharacterUpdate,
  Relationship,
  RelationshipInsert,
  RelationshipUpdate
} from '@/lib/database.types';

export interface CharacterWithRelationships extends Character {
  relationships: Relationship[];
}

/**
 * Characters Service - Supabase CRUD operations for characters and relationships
 */
export const charactersService = {
  /**
   * Get all characters for a project
   */
  async getByProject(projectId: string): Promise<Character[]> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('project_id', projectId)
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch characters: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Get a single character by ID
   */
  async getById(id: string): Promise<Character> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch character: ${error.message}`);
    }

    return data;
  },

  /**
   * Get a character with all their relationships
   */
  async getWithRelationships(id: string): Promise<CharacterWithRelationships> {
    const supabase = createClient();
    
    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('*')
      .eq('id', id)
      .single();

    if (charError) {
      throw new Error(`Failed to fetch character: ${charError.message}`);
    }

    const { data: relationships, error: relError } = await supabase
      .from('relationships')
      .select('*')
      .or(`character1_id.eq.${id},character2_id.eq.${id}`);

    if (relError) {
      throw new Error(`Failed to fetch relationships: ${relError.message}`);
    }

    return {
      ...character,
      relationships: relationships || [],
    };
  },

  /**
   * Create a new character
   */
  async create(data: CharacterInsert): Promise<Character> {
    const supabase = createClient();

    const { data: character, error } = await supabase
      .from('characters')
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create character: ${error.message}`);
    }

    return character;
  },

  /**
   * Update an existing character
   */
  async update(id: string, data: CharacterUpdate): Promise<Character> {
    const supabase = createClient();
    
    const { data: character, error } = await supabase
      .from('characters')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update character: ${error.message}`);
    }

    return character;
  },

  /**
   * Delete a character
   */
  async delete(id: string): Promise<void> {
    const supabase = createClient();
    
    // Delete relationships first
    await supabase
      .from('relationships')
      .delete()
      .or(`character1_id.eq.${id},character2_id.eq.${id}`);

    const { error } = await supabase
      .from('characters')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete character: ${error.message}`);
    }
  },

  /**
   * Get characters by role
   */
  async getByRole(projectId: string, role: Character['role']): Promise<Character[]> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('project_id', projectId)
      .eq('role', role);

    if (error) {
      throw new Error(`Failed to fetch characters by role: ${error.message}`);
    }

    return data || [];
  },

  // ============================================
  // RELATIONSHIPS
  // ============================================

  /**
   * Get all relationships for a project
   */
  async getRelationships(projectId: string): Promise<Relationship[]> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('relationships')
      .select('*')
      .eq('project_id', projectId);

    if (error) {
      throw new Error(`Failed to fetch relationships: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Create a relationship between two characters
   */
  async createRelationship(data: RelationshipInsert): Promise<Relationship> {
    const supabase = createClient();

    const { data: relationship, error } = await supabase
      .from('relationships')
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create relationship: ${error.message}`);
    }

    return relationship;
  },

  /**
   * Update an existing relationship
   */
  async updateRelationship(id: string, data: RelationshipUpdate): Promise<Relationship> {
    const supabase = createClient();
    
    const { data: relationship, error } = await supabase
      .from('relationships')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update relationship: ${error.message}`);
    }

    return relationship;
  },

  /**
   * Delete a relationship
   */
  async deleteRelationship(id: string): Promise<void> {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('relationships')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete relationship: ${error.message}`);
    }
  },

  /**
   * Subscribe to character changes for a project
   */
  subscribeToChanges(
    projectId: string,
    callback: (payload: { 
      eventType: 'INSERT' | 'UPDATE' | 'DELETE';
      new: Character | null;
      old: Character | null;
    }) => void
  ): () => void {
    const supabase = createClient();
    
    const channel = supabase
      .channel(`characters-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'characters',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          callback({
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new as Character | null,
            old: payload.old as Character | null,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
