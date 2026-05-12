import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/chapters - List chapters for a project
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
    }

    const { data: chapters, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('project_id', projectId)
      .order('chapter_number', { ascending: true });

    if (error) {
      console.error('Error fetching chapters:', error);
      return NextResponse.json({ error: 'Failed to fetch chapters' }, { status: 500 });
    }

    return NextResponse.json({ chapters });
  } catch (error) {
    console.error('Chapters API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/chapters - Create a new chapter
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { project_id, title, content, chapter_number, status } = body;

    if (!project_id || !title) {
      return NextResponse.json({ error: 'Project ID and title are required' }, { status: 400 });
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

    // Get next chapter_number if not provided
    let nextChapterNumber = chapter_number;
    if (nextChapterNumber === undefined) {
      const { data: existingChapters } = await supabase
        .from('chapters')
        .select('chapter_number')
        .eq('project_id', project_id)
        .order('chapter_number', { ascending: false })
        .limit(1);

      nextChapterNumber = existingChapters && existingChapters.length > 0 
        ? existingChapters[0].chapter_number + 1 
        : 1;
    }

    const { data: chapter, error } = await supabase
      .from('chapters')
      .insert({
        project_id,
        title,
        content: content || '',
        chapter_number: nextChapterNumber,
        status: status || 'draft',
        word_count: content ? content.split(/\s+/).filter(Boolean).length : 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating chapter:', error);
      return NextResponse.json({ error: 'Failed to create chapter' }, { status: 500 });
    }

    return NextResponse.json({ chapter }, { status: 201 });
  } catch (error) {
    console.error('Create chapter error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/chapters - Update a chapter
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, created_at: _, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Chapter ID is required' }, { status: 400 });
    }

    // Verify chapter belongs to user's project
    const { data: existingChapter, error: chapterError } = await supabase
      .from('chapters')
      .select('project_id')
      .eq('id', id)
      .single();

    if (chapterError || !existingChapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', existingChapter.project_id)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Calculate word count if content is updated
    if (updateData.content !== undefined) {
      updateData.word_count = updateData.content.split(/\s+/).filter(Boolean).length;
    }

    const { data: chapter, error } = await supabase
      .from('chapters')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating chapter:', error);
      return NextResponse.json({ error: 'Failed to update chapter' }, { status: 500 });
    }

    return NextResponse.json({ chapter });
  } catch (error) {
    console.error('Update chapter error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/chapters - Delete a chapter
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
      return NextResponse.json({ error: 'Chapter ID is required' }, { status: 400 });
    }

    // Verify chapter belongs to user's project
    const { data: existingChapter, error: chapterError } = await supabase
      .from('chapters')
      .select('project_id')
      .eq('id', id)
      .single();

    if (chapterError || !existingChapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', existingChapter.project_id)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { error } = await supabase
      .from('chapters')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting chapter:', error);
      return NextResponse.json({ error: 'Failed to delete chapter' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete chapter error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
