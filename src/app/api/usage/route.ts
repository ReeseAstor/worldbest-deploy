import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/usage - Get usage statistics for the current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // day, week, month, year
    
    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get AI generation usage
    const { data: generations, error: genError } = await supabase
      .from('ai_generations')
      .select('id, tokens_used, model, generation_type, created_at')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (genError) {
      console.error('Error fetching AI generations:', genError);
    }

    // Calculate usage stats
    const totalGenerations = generations?.length || 0;
    const totalTokens = generations?.reduce((sum, gen) => sum + (gen.tokens_used || 0), 0) || 0;
    
    // Group by generation type
    const byType = generations?.reduce((acc, gen) => {
      const type = gen.generation_type || 'other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Group by model
    const byModel = generations?.reduce((acc, gen) => {
      const model = gen.model || 'unknown';
      acc[model] = (acc[model] || 0) + (gen.tokens_used || 0);
      return acc;
    }, {} as Record<string, number>) || {};

    // Get user's subscription info for limits
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status')
      .eq('id', user.id)
      .single();

    // Define limits based on subscription tier
    const limits = {
      free: { daily: 10, monthly: 100, tokens: 50000 },
      starter: { daily: 50, monthly: 1000, tokens: 500000 },
      pro: { daily: 200, monthly: 5000, tokens: 2000000 },
      enterprise: { daily: Infinity, monthly: Infinity, tokens: Infinity },
    };

    const tier = (profile?.subscription_tier as keyof typeof limits) || 'free';
    const userLimits = limits[tier] || limits.free;

    return NextResponse.json({
      usage: {
        period,
        startDate: startDate.toISOString(),
        totalGenerations,
        totalTokens,
        byType,
        byModel,
      },
      limits: userLimits,
      subscription: {
        tier,
        status: profile?.subscription_status || 'inactive',
      },
    });
  } catch (error) {
    console.error('Usage API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/usage - Record a new usage entry (for AI generations)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      project_id, 
      chapter_id, 
      generation_type, 
      model, 
      tokens_used, 
      prompt, 
      response 
    } = body;

    if (!generation_type || !model) {
      return NextResponse.json({ error: 'Generation type and model are required' }, { status: 400 });
    }

    const { data: generation, error } = await supabase
      .from('ai_generations')
      .insert({
        user_id: user.id,
        project_id: project_id || null,
        chapter_id: chapter_id || null,
        generation_type,
        model,
        tokens_used: tokens_used || 0,
        prompt: prompt || null,
        response: response || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error recording usage:', error);
      return NextResponse.json({ error: 'Failed to record usage' }, { status: 500 });
    }

    return NextResponse.json({ generation }, { status: 201 });
  } catch (error) {
    console.error('Record usage error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
