import { createClient } from '@/lib/supabase/client';
import type { 
  BeatSheet, 
  BeatSheetInsert, 
  BeatSheetUpdate,
  Beat,
  BeatInsert,
  BeatUpdate,
  BeatSheetTemplate
} from '@/lib/database.types';

export interface BeatSheetWithBeats extends BeatSheet {
  beats: Beat[];
}

// Default beat templates for romance novels
export const ROMANCE_BEAT_TEMPLATES: Record<BeatSheetTemplate, { name: string; beats: Omit<BeatInsert, 'beat_sheet_id'>[] }> = {
  'romancing-the-beat': {
    name: 'Romancing the Beat',
    beats: [
      { name: 'Setup', beat_type: 'setup', description: 'Introduce protagonist in their ordinary world', beat_order: 1, target_word_count: 5000 },
      { name: 'Meet Cute', beat_type: 'meet-cute', description: 'The first meeting between romantic leads', beat_order: 2, target_word_count: 3000 },
      { name: 'First Spark', beat_type: 'first-spark', description: 'Initial attraction or intrigue', beat_order: 3, target_word_count: 3000 },
      { name: 'Resistance', beat_type: 'resistance', description: 'Why this romance can never work', beat_order: 4, target_word_count: 5000 },
      { name: 'Deepening Desire', beat_type: 'deepening', description: 'Growing attraction despite resistance', beat_order: 5, target_word_count: 8000 },
      { name: 'First Kiss', beat_type: 'first-kiss', description: 'The pivotal romantic moment', beat_order: 6, target_word_count: 3000 },
      { name: 'False Victory', beat_type: 'false-victory', description: 'Things seem to be going well', beat_order: 7, target_word_count: 5000 },
      { name: 'Black Moment', beat_type: 'black-moment', description: 'All seems lost for the relationship', beat_order: 8, target_word_count: 5000 },
      { name: 'Grand Gesture', beat_type: 'grand-gesture', description: 'The moment of realization and action', beat_order: 9, target_word_count: 3000 },
      { name: 'HEA', beat_type: 'hea', description: 'Happily Ever After resolution', beat_order: 10, target_word_count: 3000 },
    ],
  },
  'save-the-cat-romance': {
    name: 'Save the Cat Romance',
    beats: [
      { name: 'Opening Image', beat_type: 'setup', description: 'Before snapshot of the protagonist', beat_order: 1, target_word_count: 2000 },
      { name: 'Setup', beat_type: 'setup', description: 'Establish the world and character', beat_order: 2, target_word_count: 8000 },
      { name: 'Meet Cute', beat_type: 'meet-cute', description: 'Love interest introduction', beat_order: 3, target_word_count: 3000 },
      { name: 'Debate', beat_type: 'resistance', description: 'Should they pursue this?', beat_order: 4, target_word_count: 5000 },
      { name: 'Break Into Two', beat_type: 'deepening', description: 'Decision to explore the relationship', beat_order: 5, target_word_count: 3000 },
      { name: 'Fun & Games', beat_type: 'deepening', description: 'The promise of the premise - romance blooms', beat_order: 6, target_word_count: 15000 },
      { name: 'Midpoint', beat_type: 'first-kiss', description: 'Stakes are raised', beat_order: 7, target_word_count: 3000 },
      { name: 'Bad Guys Close In', beat_type: 'resistance', description: 'External/internal pressures mount', beat_order: 8, target_word_count: 10000 },
      { name: 'All Is Lost', beat_type: 'black-moment', description: 'The breakup or major conflict', beat_order: 9, target_word_count: 3000 },
      { name: 'Dark Night', beat_type: 'black-moment', description: 'Reflection and realization', beat_order: 10, target_word_count: 3000 },
      { name: 'Finale', beat_type: 'grand-gesture', description: 'Fighting for love', beat_order: 11, target_word_count: 8000 },
      { name: 'Final Image', beat_type: 'hea', description: 'After snapshot - transformed by love', beat_order: 12, target_word_count: 2000 },
    ],
  },
  'dark-romance-arc': {
    name: 'Dark Romance Arc',
    beats: [
      { name: 'Wounded Setup', beat_type: 'setup', description: 'Establish the darkness in the protagonist', beat_order: 1, target_word_count: 5000 },
      { name: 'Collision', beat_type: 'meet-cute', description: 'Intense, charged first meeting', beat_order: 2, target_word_count: 4000 },
      { name: 'Push and Pull', beat_type: 'resistance', description: 'Toxic attraction begins', beat_order: 3, target_word_count: 8000 },
      { name: 'Surrender', beat_type: 'deepening', description: 'Giving in to the darkness', beat_order: 4, target_word_count: 10000 },
      { name: 'Possession', beat_type: 'first-kiss', description: 'Claiming and being claimed', beat_order: 5, target_word_count: 5000 },
      { name: 'Revelation', beat_type: 'false-victory', description: 'True selves revealed', beat_order: 6, target_word_count: 5000 },
      { name: 'Betrayal', beat_type: 'black-moment', description: 'Trust shattered', beat_order: 7, target_word_count: 5000 },
      { name: 'Reckoning', beat_type: 'grand-gesture', description: 'Confronting the darkness', beat_order: 8, target_word_count: 5000 },
      { name: 'Redemption', beat_type: 'hea', description: 'Finding light together', beat_order: 9, target_word_count: 5000 },
    ],
  },
  'epic-fantasy-romance': {
    name: 'Epic Fantasy Romance',
    beats: [
      { name: 'World Awakening', beat_type: 'setup', description: 'Establish the fantasy world and hero', beat_order: 1, target_word_count: 8000 },
      { name: 'Fateful Meeting', beat_type: 'meet-cute', description: 'Destined encounter', beat_order: 2, target_word_count: 5000 },
      { name: 'Alliance Formed', beat_type: 'first-spark', description: 'Forced proximity or partnership', beat_order: 3, target_word_count: 8000 },
      { name: 'Quest Begins', beat_type: 'deepening', description: 'Journey together deepens bond', beat_order: 4, target_word_count: 15000 },
      { name: 'Forbidden Feelings', beat_type: 'resistance', description: 'Duty vs desire conflict', beat_order: 5, target_word_count: 8000 },
      { name: 'Bond Tested', beat_type: 'first-kiss', description: 'Major setback brings them closer', beat_order: 6, target_word_count: 5000 },
      { name: 'Triumph', beat_type: 'false-victory', description: 'Victory but at what cost?', beat_order: 7, target_word_count: 5000 },
      { name: 'Sacrifice', beat_type: 'black-moment', description: 'Love seems impossible', beat_order: 8, target_word_count: 8000 },
      { name: 'Final Battle', beat_type: 'grand-gesture', description: 'Fighting for love and world', beat_order: 9, target_word_count: 8000 },
      { name: 'New Dawn', beat_type: 'hea', description: 'Love conquers all', beat_order: 10, target_word_count: 5000 },
    ],
  },
  'custom': {
    name: 'Custom',
    beats: [],
  },
};

/**
 * Beat Sheets Service - Supabase CRUD operations for beat sheets and beats
 */
export const beatSheetsService = {
  /**
   * Get beat sheet for a project (there should be one active per project)
   */
  async getByProject(projectId: string): Promise<BeatSheetWithBeats | null> {
    const supabase = createClient();
    
    const { data: beatSheet, error: sheetError } = await supabase
      .from('beat_sheets')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_active', true)
      .single();

    if (sheetError && sheetError.code !== 'PGRST116') {
      throw new Error(`Failed to fetch beat sheet: ${sheetError.message}`);
    }

    if (!beatSheet) {
      return null;
    }

    const { data: beats, error: beatsError } = await supabase
      .from('beats')
      .select('*')
      .eq('beat_sheet_id', beatSheet.id)
      .order('beat_order', { ascending: true });

    if (beatsError) {
      throw new Error(`Failed to fetch beats: ${beatsError.message}`);
    }

    return {
      ...beatSheet,
      beats: beats || [],
    };
  },

  /**
   * Get a beat sheet by ID with its beats
   */
  async getById(id: string): Promise<BeatSheetWithBeats> {
    const supabase = createClient();
    
    const { data: beatSheet, error: sheetError } = await supabase
      .from('beat_sheets')
      .select('*')
      .eq('id', id)
      .single();

    if (sheetError) {
      throw new Error(`Failed to fetch beat sheet: ${sheetError.message}`);
    }

    const { data: beats, error: beatsError } = await supabase
      .from('beats')
      .select('*')
      .eq('beat_sheet_id', id)
      .order('beat_order', { ascending: true });

    if (beatsError) {
      throw new Error(`Failed to fetch beats: ${beatsError.message}`);
    }

    return {
      ...beatSheet,
      beats: beats || [],
    };
  },

  /**
   * Create a new beat sheet from a template
   */
  async createFromTemplate(
    projectId: string, 
    templateType: BeatSheetTemplate,
    customName?: string
  ): Promise<BeatSheetWithBeats> {
    const supabase = createClient();
    const template = ROMANCE_BEAT_TEMPLATES[templateType];

    // Deactivate existing beat sheets
    await supabase
      .from('beat_sheets')
      .update({ is_active: false })
      .eq('project_id', projectId);

    // Create new beat sheet
    const { data: beatSheet, error: sheetError } = await supabase
      .from('beat_sheets')
      .insert({
        project_id: projectId,
        template_type: templateType,
        name: customName || template.name,
        is_active: true,
      })
      .select()
      .single();

    if (sheetError) {
      throw new Error(`Failed to create beat sheet: ${sheetError.message}`);
    }

    // Create beats from template
    const beatsToInsert = template.beats.map((beat) => ({
      ...beat,
      beat_sheet_id: beatSheet.id,
      actual_word_count: 0,
      status: 'pending' as const,
    }));

    const { data: beats, error: beatsError } = await supabase
      .from('beats')
      .insert(beatsToInsert)
      .select();

    if (beatsError) {
      throw new Error(`Failed to create beats: ${beatsError.message}`);
    }

    return {
      ...beatSheet,
      beats: beats || [],
    };
  },

  /**
   * Create a custom beat sheet
   */
  async create(data: BeatSheetInsert): Promise<BeatSheet> {
    const supabase = createClient();

    const { data: beatSheet, error } = await supabase
      .from('beat_sheets')
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create beat sheet: ${error.message}`);
    }

    return beatSheet;
  },

  /**
   * Update a beat sheet
   */
  async update(id: string, data: BeatSheetUpdate): Promise<BeatSheet> {
    const supabase = createClient();
    
    const { data: beatSheet, error } = await supabase
      .from('beat_sheets')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update beat sheet: ${error.message}`);
    }

    return beatSheet;
  },

  /**
   * Delete a beat sheet and its beats
   */
  async delete(id: string): Promise<void> {
    const supabase = createClient();
    
    // Delete beats first
    await supabase.from('beats').delete().eq('beat_sheet_id', id);

    const { error } = await supabase
      .from('beat_sheets')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete beat sheet: ${error.message}`);
    }
  },

  // ============================================
  // INDIVIDUAL BEATS
  // ============================================

  /**
   * Create a new beat
   */
  async createBeat(data: BeatInsert): Promise<Beat> {
    const supabase = createClient();

    const { data: beat, error } = await supabase
      .from('beats')
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create beat: ${error.message}`);
    }

    return beat;
  },

  /**
   * Update a beat
   */
  async updateBeat(id: string, data: BeatUpdate): Promise<Beat> {
    const supabase = createClient();
    
    const { data: beat, error } = await supabase
      .from('beats')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update beat: ${error.message}`);
    }

    return beat;
  },

  /**
   * Delete a beat
   */
  async deleteBeat(id: string): Promise<void> {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('beats')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete beat: ${error.message}`);
    }
  },

  /**
   * Reorder beats
   */
  async reorderBeats(beatSheetId: string, beatOrders: { id: string; beat_order: number }[]): Promise<void> {
    const supabase = createClient();
    
    const updates = beatOrders.map(({ id, beat_order }) =>
      supabase
        .from('beats')
        .update({ beat_order })
        .eq('id', id)
        .eq('beat_sheet_id', beatSheetId)
    );

    await Promise.all(updates);
  },

  /**
   * Link a beat to a chapter
   */
  async linkBeatToChapter(beatId: string, chapterId: string): Promise<Beat> {
    return this.updateBeat(beatId, { chapter_id: chapterId });
  },
};
