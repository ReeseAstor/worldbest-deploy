import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createPortalSession, isStripeServerConfigured } from '@/lib/stripe/server';

export interface PortalResponse {
  portalUrl?: string;
  error?: string;
}

/**
 * POST /api/portal
 * Creates a Stripe Customer Portal session for subscription management
 * 
 * Allows users to:
 * - Update payment method
 * - View invoices
 * - Cancel subscription
 * - Update billing info
 */
export async function POST(request: NextRequest): Promise<NextResponse<PortalResponse>> {
  // Check if Stripe is configured
  if (!isStripeServerConfigured()) {
    return NextResponse.json(
      { error: 'Payment system is not configured' },
      { status: 503 }
    );
  }

  // Get the authenticated user
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Get user's Stripe customer ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json(
      { error: 'No subscription found. Please subscribe first.' },
      { status: 400 }
    );
  }

  // Create portal session
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const returnUrl = `${appUrl}/settings/billing`;

  const session = await createPortalSession(
    profile.stripe_customer_id,
    returnUrl
  );

  if (!session) {
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }

  return NextResponse.json({ portalUrl: session.portalUrl });
}
