import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/profile - Get current user's profile
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      // Profile might not exist yet, return basic user info
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          profile: {
            id: user.id,
            email: user.email,
            display_name: user.user_metadata?.display_name || user.email?.split('@')[0],
            avatar_url: user.user_metadata?.avatar_url,
            created_at: user.created_at,
          }
        });
      }
      console.error('Error fetching profile:', error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/profile - Update current user's profile
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      display_name, 
      bio, 
      avatar_url, 
      website, 
      twitter_handle,
      default_heat_level,
      theme_preference,
      editor_preferences,
      notification_settings 
    } = body;

    // First check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    const profileData = {
      display_name,
      bio,
      avatar_url,
      website,
      twitter_handle,
      default_heat_level,
      theme_preference,
      editor_preferences,
      notification_settings,
      updated_at: new Date().toISOString(),
    };

    // Remove undefined values
    Object.keys(profileData).forEach(key => {
      if (profileData[key as keyof typeof profileData] === undefined) {
        delete profileData[key as keyof typeof profileData];
      }
    });

    let profile;
    let error;

    if (existingProfile) {
      // Update existing profile
      const result = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();
      profile = result.data;
      error = result.error;
    } else {
      // Create new profile
      const result = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          ...profileData,
        })
        .select()
        .single();
      profile = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    // Also update Supabase auth metadata if display_name or avatar changed
    if (display_name || avatar_url) {
      const metadataUpdate: Record<string, string> = {};
      if (display_name) metadataUpdate.display_name = display_name;
      if (avatar_url) metadataUpdate.avatar_url = avatar_url;

      await supabase.auth.updateUser({
        data: metadataUpdate
      });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/profile - Create profile (for new users)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { display_name, bio, avatar_url } = body;

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (existingProfile) {
      return NextResponse.json({ error: 'Profile already exists' }, { status: 409 });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        display_name: display_name || user.user_metadata?.display_name || user.email?.split('@')[0],
        bio: bio || null,
        avatar_url: avatar_url || user.user_metadata?.avatar_url || null,
        subscription_tier: 'free',
        subscription_status: 'active',
        default_heat_level: 3,
        theme_preference: 'system',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
    }

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    console.error('Create profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
