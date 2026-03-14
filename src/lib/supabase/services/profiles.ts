import { createClient } from '@/lib/supabase/client';
import type { 
  Profile, 
  ProfileInsert, 
  ProfileUpdate 
} from '@/lib/database.types';

/**
 * Profiles Service - Supabase CRUD operations for user profiles
 */
export const profilesService = {
  /**
   * Get the current user's profile
   */
  async getCurrentProfile(): Promise<Profile | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }

    return data;
  },

  /**
   * Get a profile by user ID
   */
  async getById(userId: string): Promise<Profile> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }

    return data;
  },

  /**
   * Create a new profile (usually called after auth signup)
   */
  async create(data: ProfileInsert): Promise<Profile> {
    const supabase = createClient();

    const { data: profile, error } = await supabase
      .from('profiles')
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create profile: ${error.message}`);
    }

    return profile;
  },

  /**
   * Update the current user's profile
   */
  async update(data: ProfileUpdate): Promise<Profile> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return profile;
  },

  /**
   * Update a specific profile by ID (admin use)
   */
  async updateById(userId: string, data: ProfileUpdate): Promise<Profile> {
    const supabase = createClient();
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return profile;
  },

  /**
   * Ensure a profile exists for the current user
   */
  async ensureProfile(): Promise<Profile> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Try to get existing profile
    const existing = await this.getCurrentProfile();
    if (existing) {
      return existing;
    }

    // Create new profile
    return this.create({
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || null,
      subscription_tier: 'free',
      subscription_status: 'active',
    });
  },
};
