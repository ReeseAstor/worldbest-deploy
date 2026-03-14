import { createClient } from '@/lib/supabase/client';
import type { 
  Location, 
  LocationInsert, 
  LocationUpdate 
} from '@/lib/database.types';

/**
 * Locations Service - Supabase CRUD operations for world-building locations
 */
export const locationsService = {
  /**
   * Get all locations for a project
   */
  async getByProject(projectId: string): Promise<Location[]> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('project_id', projectId)
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch locations: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Get a single location by ID
   */
  async getById(id: string): Promise<Location> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch location: ${error.message}`);
    }

    return data;
  },

  /**
   * Get locations by type
   */
  async getByType(projectId: string, locationType: Location['location_type']): Promise<Location[]> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('project_id', projectId)
      .eq('location_type', locationType);

    if (error) {
      throw new Error(`Failed to fetch locations by type: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Create a new location
   */
  async create(data: LocationInsert): Promise<Location> {
    const supabase = createClient();

    const { data: location, error } = await supabase
      .from('locations')
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create location: ${error.message}`);
    }

    return location;
  },

  /**
   * Update an existing location
   */
  async update(id: string, data: LocationUpdate): Promise<Location> {
    const supabase = createClient();
    
    const { data: location, error } = await supabase
      .from('locations')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update location: ${error.message}`);
    }

    return location;
  },

  /**
   * Delete a location
   */
  async delete(id: string): Promise<void> {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete location: ${error.message}`);
    }
  },

  /**
   * Connect characters to a location
   */
  async connectCharacters(id: string, characterIds: string[]): Promise<Location> {
    return this.update(id, { connected_characters: characterIds });
  },
};
