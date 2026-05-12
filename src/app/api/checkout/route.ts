import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  createCheckoutSession, 
  getOrCreateStripeCustomer,
  isStripeServerConfigured 
} from '@/lib/stripe/server';
import { PLANS, getPriceId, type PlanName, type BillingInterval } from '@/lib/stripe/config';

export interface CheckoutRequestBody {
  priceId?: string;
  planName?: PlanName;
  interval?: BillingInterval;
}

export interface CheckoutResponse {
  sessionUrl?: string;
  error?: string;
}

/**
 * POST /api/checkout
 * Creates a Stripe Checkout session for subscription
 * 
 * Body: { priceId?: string, planName?: string, interval?: 'monthly' | 'annual' }
 * - Either provide priceId directly, or planName + interval to look it up
 */
export async function POST(request: NextRequest): Promise<NextResponse<CheckoutResponse>> {
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

  // Parse request body
  let body: CheckoutRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  // Determine the price ID
  let priceId: string | null | undefined = body.priceId;
  
  if (!priceId && body.planName && body.interval) {
    priceId = getPriceId(body.planName, body.interval);
  }

  if (!priceId) {
    return NextResponse.json(
      { error: 'Missing priceId or planName/interval' },
      { status: 400 }
    );
  }

  // Validate that this is a valid price ID
  const plan = Object.values(PLANS).find(
    p => p.priceIds.monthly === priceId || p.priceIds.annual === priceId
  );

  if (!plan) {
    return NextResponse.json(
      { error: 'Invalid price ID' },
      { status: 400 }
    );
  }

  // Get user profile to check for existing Stripe customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, display_name')
    .eq('id', user.id)
    .single();

  // Create or get Stripe customer
  const customerId = await getOrCreateStripeCustomer(
    user.id,
    user.email || '',
    profile?.display_name || user.user_metadata?.full_name || undefined,
    profile?.stripe_customer_id
  );

  if (!customerId) {
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }

  // Save customer ID to profile if it's new
  if (!profile?.stripe_customer_id) {
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id);
  }

  // Create checkout session
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const successUrl = `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${appUrl}/checkout/cancel`;

  const session = await createCheckoutSession(
    user.id,
    customerId,
    priceId,
    successUrl,
    cancelUrl
  );

  if (!session) {
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }

  return NextResponse.json({ sessionUrl: session.sessionUrl });
}
