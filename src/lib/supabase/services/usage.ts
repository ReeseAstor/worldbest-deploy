import { createClient } from '@/lib/supabase/client';
import type { 
  AIGeneration, 
  AIGenerationInsert,
  Subscription,
  SUBSCRIPTION_LIMITS 
} from '@/lib/database.types';

export interface UsageStats {
  wordsGenerated: number;
  wordsLimit: number;
  wordsRemaining: number;
  percentUsed: number;
  generationsCount: number;
  acceptedCount: number;
  acceptanceRate: number;
  currentStreak: number;
  lastGenerationAt: string | null;
}

export interface DailyUsage {
  date: string;
  wordsGenerated: number;
  generationsCount: number;
}

/**
 * Usage Service - AI usage tracking and subscription limits
 */
export const usageService = {
  /**
   * Get current user's usage stats
   */
  async getCurrentStats(): Promise<UsageStats> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get subscription limits
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (subError && subError.code !== 'PGRST116') {
      throw new Error(`Failed to fetch subscription: ${subError.message}`);
    }

    const wordsLimit = subscription?.monthly_ai_words_limit || 5000;
    const wordsUsed = subscription?.monthly_ai_words_used || 0;

    // Get generation stats for current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: generations, error: genError } = await supabase
      .from('ai_generations')
      .select('output_tokens, was_accepted, created_at')
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString());

    if (genError) {
      throw new Error(`Failed to fetch generations: ${genError.message}`);
    }

    const gens = generations || [];
    const generationsCount = gens.length;
    const acceptedCount = gens.filter(g => g.was_accepted).length;
    const acceptanceRate = generationsCount > 0 
      ? Math.round((acceptedCount / generationsCount) * 100) 
      : 0;

    // Calculate writing streak
    const streak = await this.calculateStreak(user.id);

    const lastGen = gens.length > 0 
      ? gens.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
      : null;

    return {
      wordsGenerated: wordsUsed,
      wordsLimit,
      wordsRemaining: Math.max(0, wordsLimit - wordsUsed),
      percentUsed: Math.round((wordsUsed / wordsLimit) * 100),
      generationsCount,
      acceptedCount,
      acceptanceRate,
      currentStreak: streak,
      lastGenerationAt: lastGen?.created_at || null,
    };
  },

  /**
   * Calculate writing streak (consecutive days with generations)
   */
  async calculateStreak(userId: string): Promise<number> {
    const supabase = createClient();
    
    // Get generations from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: generations, error } = await supabase
      .from('ai_generations')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (error || !generations?.length) {
      return 0;
    }

    // Get unique dates
    const uniqueDates = new Set(
      generations.map(g => new Date(g.created_at).toISOString().split('T')[0])
    );
    const sortedDates = Array.from(uniqueDates).sort().reverse();

    // Count consecutive days from today
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let expectedDate = today;

    for (const date of sortedDates) {
      if (date === expectedDate) {
        streak++;
        // Move to previous day
        const prev = new Date(expectedDate);
        prev.setDate(prev.getDate() - 1);
        expectedDate = prev.toISOString().split('T')[0];
      } else if (date < expectedDate) {
        break;
      }
    }

    return streak;
  },

  /**
   * Get daily usage for the current month
   */
  async getDailyUsage(): Promise<DailyUsage[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: generations, error } = await supabase
      .from('ai_generations')
      .select('output_tokens, created_at')
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString());

    if (error) {
      throw new Error(`Failed to fetch daily usage: ${error.message}`);
    }

    // Group by date
    const dailyMap = new Map<string, DailyUsage>();
    
    for (const gen of generations || []) {
      const date = new Date(gen.created_at).toISOString().split('T')[0];
      const existing = dailyMap.get(date) || { date, wordsGenerated: 0, generationsCount: 0 };
      existing.wordsGenerated += gen.output_tokens || 0;
      existing.generationsCount += 1;
      dailyMap.set(date, existing);
    }

    return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  },

  /**
   * Log an AI generation
   */
  async logGeneration(data: AIGenerationInsert): Promise<AIGeneration> {
    const supabase = createClient();

    const { data: generation, error } = await supabase
      .from('ai_generations')
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to log generation: ${error.message}`);
    }

    // Update subscription usage
    if (data.output_tokens) {
      await this.incrementUsage(data.user_id, data.output_tokens);
    }

    return generation;
  },

  /**
   * Increment AI usage for a user
   * First tries RPC function, falls back to direct update if RPC doesn't exist
   */
  async incrementUsage(userId: string, words: number): Promise<void> {
    const supabase = createClient();

    try {
      // Try RPC function first
      const { error: rpcError } = await supabase.rpc('increment_ai_usage', {
        p_user_id: userId,
        p_words: words,
      });

      // If RPC doesn't exist, use direct update
      if (rpcError?.code === '42883' || rpcError?.message?.includes('function')) {
        await this.incrementUsageDirectly(userId, words);
        return;
      }

      if (rpcError) {
        console.warn('RPC increment_ai_usage failed:', rpcError.message);
        // Fall back to direct update
        await this.incrementUsageDirectly(userId, words);
      }
    } catch (error) {
      // Fall back to direct update on any error
      await this.incrementUsageDirectly(userId, words);
    }
  },

  /**
   * Directly update subscription usage (fallback method)
   */
  async incrementUsageDirectly(userId: string, words: number): Promise<void> {
    const supabase = createClient();

    // Get current usage
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('monthly_ai_words_used')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(`Failed to fetch subscription: ${fetchError.message}`);
    }

    const currentUsage = subscription?.monthly_ai_words_used || 0;
    const newUsage = currentUsage + words;

    // Update usage
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ monthly_ai_words_used: newUsage })
      .eq('user_id', userId);

    if (updateError) {
      throw new Error(`Failed to update usage: ${updateError.message}`);
    }
  },

  /**
   * Mark a generation as accepted/rejected
   */
  async updateGenerationAcceptance(id: string, wasAccepted: boolean, userEdits?: string): Promise<void> {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('ai_generations')
      .update({ 
        was_accepted: wasAccepted,
        user_edits: userEdits,
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update generation: ${error.message}`);
    }
  },

  /**
   * Check if user has remaining quota
   */
  async hasRemainingQuota(): Promise<boolean> {
    const stats = await this.getCurrentStats();
    return stats.wordsRemaining > 0;
  },

  /**
   * Get user's subscription tier limits
   */
  async getSubscriptionLimits(): Promise<Subscription | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch subscription: ${error.message}`);
    }

    return data;
  },

  /**
   * Reset monthly usage (called by cron job)
   */
  async resetMonthlyUsage(userId: string): Promise<void> {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('subscriptions')
      .update({ 
        monthly_ai_words_used: 0,
        current_period_start: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to reset usage: ${error.message}`);
    }
  },
};
