import { createClient } from '@/lib/supabase/client';
import type { 
  VoiceProfile, 
  VoiceProfileInsert, 
  VoiceProfileUpdate 
} from '@/lib/database.types';

/**
 * Voice Profiles Service - Supabase CRUD operations for voice profiles
 */
export const voiceProfilesService = {
  /**
   * Get all voice profiles for a project
   */
  async getByProject(projectId: string): Promise<VoiceProfile[]> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('voice_profiles')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch voice profiles: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Get the active voice profile for a project
   */
  async getActive(projectId: string): Promise<VoiceProfile | null> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('voice_profiles')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch active voice profile: ${error.message}`);
    }

    return data;
  },

  /**
   * Get a voice profile by ID
   */
  async getById(id: string): Promise<VoiceProfile> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('voice_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch voice profile: ${error.message}`);
    }

    return data;
  },

  /**
   * Create a new voice profile
   */
  async create(data: VoiceProfileInsert): Promise<VoiceProfile> {
    const supabase = createClient();

    // If this should be active, deactivate others first
    if (data.is_active) {
      await supabase
        .from('voice_profiles')
        .update({ is_active: false })
        .eq('project_id', data.project_id);
    }

    const { data: profile, error } = await supabase
      .from('voice_profiles')
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create voice profile: ${error.message}`);
    }

    return profile;
  },

  /**
   * Update a voice profile
   */
  async update(id: string, data: VoiceProfileUpdate): Promise<VoiceProfile> {
    const supabase = createClient();
    
    const { data: profile, error } = await supabase
      .from('voice_profiles')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update voice profile: ${error.message}`);
    }

    return profile;
  },

  /**
   * Set a voice profile as active
   */
  async setActive(id: string, projectId: string): Promise<VoiceProfile> {
    const supabase = createClient();
    
    // Deactivate all profiles for this project
    await supabase
      .from('voice_profiles')
      .update({ is_active: false })
      .eq('project_id', projectId);

    // Activate the selected profile
    return this.update(id, { is_active: true });
  },

  /**
   * Delete a voice profile
   */
  async delete(id: string): Promise<void> {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('voice_profiles')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete voice profile: ${error.message}`);
    }
  },

  /**
   * Update voice profile after analysis
   */
  async updateFromAnalysis(
    id: string, 
    metrics: VoiceProfile['metrics'],
    patterns: VoiceProfile['patterns'],
    sampleWordCount: number,
    confidenceScore: number
  ): Promise<VoiceProfile> {
    return this.update(id, {
      metrics,
      patterns,
      sample_word_count: sampleWordCount,
      confidence_score: confidenceScore,
      last_analyzed_at: new Date().toISOString(),
    });
  },
};
