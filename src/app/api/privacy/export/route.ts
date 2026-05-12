import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit';

// GET /api/privacy/export - Export user's data (GDPR compliant)
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 1 export per hour
    const rateLimitResult = await checkRateLimit(user.id, 'export');
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. You can request a data export once per hour.',
          resetAt: new Date(rateLimitResult.reset * 1000).toISOString(),
        },
        { 
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Fetch all user data
    const exportData: Record<string, unknown> = {
      exportedAt: new Date().toISOString(),
      exportVersion: '1.0',
      user: {
        id: user.id,
        email: user.email,
        emailConfirmedAt: user.email_confirmed_at,
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at,
        metadata: user.user_metadata,
      },
    };

    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profile) {
      exportData.profile = profile;
    }

    // Fetch projects
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id);
    
    if (projects && projects.length > 0) {
      exportData.projects = projects;

      // Fetch chapters for all projects
      const projectIds = projects.map(p => p.id);
      const { data: chapters } = await supabase
        .from('chapters')
        .select('*')
        .in('project_id', projectIds);
      
      if (chapters) {
        exportData.chapters = chapters;
      }

      // Fetch characters for all projects
      const { data: characters } = await supabase
        .from('characters')
        .select('*')
        .in('project_id', projectIds);
      
      if (characters) {
        exportData.characters = characters;
      }

      // Fetch series bibles
      const { data: seriesBibles } = await supabase
        .from('series_bibles')
        .select('*')
        .in('project_id', projectIds);
      
      if (seriesBibles) {
        exportData.seriesBibles = seriesBibles;
      }
    }

    // Fetch voice profiles
    const { data: voiceProfiles } = await supabase
      .from('voice_profiles')
      .select('*')
      .eq('user_id', user.id);
    
    if (voiceProfiles) {
      exportData.voiceProfiles = voiceProfiles;
    }

    // Fetch subscriptions
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id);
    
    if (subscriptions) {
      exportData.subscriptions = subscriptions;
    }

    // Fetch usage history
    const { data: usageHistory } = await supabase
      .from('usage_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1000);
    
    if (usageHistory) {
      exportData.usageHistory = usageHistory;
    }

    // Create JSON response
    const jsonString = JSON.stringify(exportData, null, 2);
    
    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="ember-data-export-${user.id.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.json"`,
        ...getRateLimitHeaders(rateLimitResult),
      },
    });
  } catch (error) {
    console.error('Data export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
