import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/characters - List characters (optionally filtered by project)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    let query = supabase
      .from('characters')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data: characters, error } = await query;

    if (error) {
      console.error('Error fetching characters:', error);
      return NextResponse.json({ error: 'Failed to fetch characters' }, { status: 500 });
    }

    return NextResponse.json({ characters });
  } catch (error) {
    console.error('Characters API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/characters - Create a new character
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
      name, 
      role, 
      description, 
      backstory, 
      personality_traits, 
      goals, 
      conflicts,
      relationships,
      image_url 
    } = body;

    if (!project_id || !name) {
      return NextResponse.json({ error: 'Project ID and name are required' }, { status: 400 });
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', project_id)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
    }

    const { data: character, error } = await supabase
      .from('characters')
      .insert({
        user_id: user.id,
        project_id,
        name,
        role: role || 'supporting',
        description: description || null,
        backstory: backstory || null,
        personality_traits: personality_traits || [],
        goals: goals || [],
        conflicts: conflicts || [],
        relationships: relationships || [],
        image_url: image_url || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating character:', error);
      return NextResponse.json({ error: 'Failed to create character' }, { status: 500 });
    }

    return NextResponse.json({ character }, { status: 201 });
  } catch (error) {
    console.error('Create character error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/characters - Update a character (id passed in body)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, user_id: _, created_at: __, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Character ID is required' }, { status: 400 });
    }

    const { data: character, error } = await supabase
      .from('characters')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating character:', error);
      return NextResponse.json({ error: 'Failed to update character' }, { status: 500 });
    }

    return NextResponse.json({ character });
  } catch (error) {
    console.error('Update character error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/characters - Delete a character (id passed as query param)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Character ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('characters')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting character:', error);
      return NextResponse.json({ error: 'Failed to delete character' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete character error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
