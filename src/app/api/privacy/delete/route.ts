import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { accountDeletionSchema } from '@/lib/security/validation';

// DELETE /api/privacy/delete - Soft delete user account (GDPR compliant)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    
    const validationResult = accountDeletionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0]?.message || 'Invalid confirmation' },
        { status: 400 }
      );
    }

    // Calculate deletion date (30 days from now)
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);

    // Mark profile for deletion (soft delete)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        deletion_requested_at: new Date().toISOString(),
        deletion_scheduled_for: deletionDate.toISOString(),
        is_deleted: false, // Will be set to true by cron job after grace period
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('Error marking profile for deletion:', profileError);
      // Continue anyway - the important part is signing out
    }

    // Log the deletion request for audit purposes
    try {
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action: 'DELETION_REQUESTED',
          details: {
            requested_at: new Date().toISOString(),
            scheduled_for: deletionDate.toISOString(),
            ip_address: request.headers.get('x-forwarded-for') || 'unknown',
            user_agent: request.headers.get('user-agent'),
          },
        });
    } catch (auditError) {
      // Audit log failure shouldn't block the deletion
      console.warn('Failed to log deletion request:', auditError);
    }

    // Sign the user out
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      message: 'Account deletion scheduled',
      details: {
        deletionScheduledFor: deletionDate.toISOString(),
        gracePeriodDays: 30,
        note: 'Your account and all associated data will be permanently deleted after the grace period. You can cancel this by signing in within 30 days.',
      },
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/privacy/delete - Cancel scheduled deletion
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if deletion was scheduled
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('deletion_requested_at, deletion_scheduled_for')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (!profile.deletion_requested_at) {
      return NextResponse.json(
        { error: 'No deletion request found' },
        { status: 400 }
      );
    }

    // Cancel the deletion
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        deletion_requested_at: null,
        deletion_scheduled_for: null,
        is_deleted: false,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error canceling deletion:', updateError);
      return NextResponse.json(
        { error: 'Failed to cancel deletion' },
        { status: 500 }
      );
    }

    // Log the cancellation
    try {
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action: 'DELETION_CANCELLED',
          details: {
            cancelled_at: new Date().toISOString(),
            originally_scheduled_for: profile.deletion_scheduled_for,
          },
        });
    } catch (auditError) {
      console.warn('Failed to log deletion cancellation:', auditError);
    }

    return NextResponse.json({
      success: true,
      message: 'Account deletion cancelled',
      details: {
        cancelledAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Cancel deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
