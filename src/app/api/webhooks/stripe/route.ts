import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent, parseSubscription } from '@/lib/stripe/server';
import { getPlanByPriceId } from '@/lib/stripe/config';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Get the return type of createClient, excluding null
type SupabaseAdmin = NonNullable<ReturnType<typeof getSupabaseAdmin>>;

// Create a Supabase admin client for database operations
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase configuration missing');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Stripe Webhook Handler
 * 
 * This endpoint receives webhook events from Stripe and updates the database accordingly.
 * It handles subscription lifecycle events like creation, updates, and cancellation.
 * 
 * IMPORTANT: This route must be public (no auth middleware) and uses raw body for signature verification.
 */
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('Stripe webhook secret not configured');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  // Get the raw body as text for signature verification
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('No Stripe signature found in request');
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  // Verify the webhook signature
  const event = constructWebhookEvent(payload, signature, webhookSecret);

  if (!event) {
    console.error('Failed to verify webhook signature');
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  console.log(`[Stripe Webhook] Received event: ${event.type}`);

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Database configuration error' },
      { status: 500 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session, supabase);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription, supabase);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice, supabase);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice, supabase);
        break;

      case 'customer.updated':
        await handleCustomerUpdated(event.data.object as Stripe.Customer, supabase);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`[Stripe Webhook] Error handling ${event.type}:`, error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle checkout.session.completed
 * Creates or updates the user's subscription record
 */
async function handleCheckoutComplete(
  session: Stripe.Checkout.Session,
  supabase: SupabaseAdmin
) {
  console.log('[Stripe Webhook] Processing checkout.session.completed');
  
  const userId = session.metadata?.userId;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!userId) {
    console.error('[Stripe Webhook] No userId in checkout session metadata');
    return;
  }

  // Update user metadata with Stripe customer ID
  const { error: userError } = await supabase
    .from('profiles')
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (userError) {
    console.error('[Stripe Webhook] Failed to update user profile:', userError);
  } else {
    console.log(`[Stripe Webhook] Updated user ${userId} with Stripe customer ${customerId}`);
  }
}

/**
 * Handle customer.subscription.created and customer.subscription.updated
 * Updates the user's subscription status and plan
 */
async function handleSubscriptionUpdate(
  subscription: Stripe.Subscription,
  supabase: SupabaseAdmin
) {
  console.log(`[Stripe Webhook] Processing subscription update: ${subscription.id}`);
  
  const parsed = parseSubscription(subscription);
  const userId = subscription.metadata?.userId;

  if (!userId) {
    // Try to find user by customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', parsed.customerId)
      .single();
    
    if (!profile) {
      console.error('[Stripe Webhook] Could not find user for subscription');
      return;
    }
    
    await updateUserSubscription(profile.id, parsed, supabase);
  } else {
    await updateUserSubscription(userId, parsed, supabase);
  }
}

/**
 * Handle customer.subscription.deleted
 * Marks the subscription as cancelled and reverts to free tier
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: SupabaseAdmin
) {
  console.log(`[Stripe Webhook] Processing subscription deletion: ${subscription.id}`);
  
  const customerId = typeof subscription.customer === 'string' 
    ? subscription.customer 
    : subscription.customer.id;

  // Find user by customer ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!profile) {
    console.error('[Stripe Webhook] Could not find user for cancelled subscription');
    return;
  }

  // Update user to free tier
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'cancelled',
      subscription_plan: 'spark',
      stripe_subscription_id: null,
      subscription_ended_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id);

  if (error) {
    console.error('[Stripe Webhook] Failed to update cancelled subscription:', error);
  } else {
    console.log(`[Stripe Webhook] Cancelled subscription for user ${profile.id}`);
  }
}

/**
 * Handle invoice.payment_succeeded
 * Updates the last payment date
 */
async function handlePaymentSucceeded(
  invoice: Stripe.Invoice,
  supabase: SupabaseAdmin
) {
  console.log(`[Stripe Webhook] Processing payment success: ${invoice.id}`);
  
  const customerId = typeof invoice.customer === 'string' 
    ? invoice.customer 
    : invoice.customer?.id;

  if (!customerId) return;

  // Find user and update last payment
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!profile) return;

  const { error } = await supabase
    .from('profiles')
    .update({
      last_payment_date: new Date().toISOString(),
      payment_failed: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id);

  if (error) {
    console.error('[Stripe Webhook] Failed to update payment success:', error);
  }
}

/**
 * Handle invoice.payment_failed
 * Flags the account for payment issues
 */
async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  supabase: SupabaseAdmin
) {
  console.log(`[Stripe Webhook] Processing payment failure: ${invoice.id}`);
  
  const customerId = typeof invoice.customer === 'string' 
    ? invoice.customer 
    : invoice.customer?.id;

  if (!customerId) return;

  // Find user and flag payment issue
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!profile) return;

  const { error } = await supabase
    .from('profiles')
    .update({
      payment_failed: true,
      payment_failed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id);

  if (error) {
    console.error('[Stripe Webhook] Failed to flag payment failure:', error);
  } else {
    console.log(`[Stripe Webhook] Flagged payment failure for user ${profile.id}`);
    // TODO: Trigger dunning email here
  }
}

/**
 * Handle customer.updated
 * Syncs customer info changes
 */
async function handleCustomerUpdated(
  customer: Stripe.Customer,
  supabase: SupabaseAdmin
) {
  console.log(`[Stripe Webhook] Processing customer update: ${customer.id}`);
  
  // Find user by customer ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customer.id)
    .single();

  if (!profile) return;

  // Update any relevant customer info
  // This could sync email, name, etc. if needed
  console.log(`[Stripe Webhook] Customer ${customer.id} updated for user ${profile.id}`);
}

/**
 * Helper to update user subscription details
 */
async function updateUserSubscription(
  userId: string,
  subscription: ReturnType<typeof parseSubscription>,
  supabase: SupabaseAdmin
) {
  const isActive = ['active', 'trialing'].includes(subscription.status);
  
  const { error } = await supabase
    .from('profiles')
    .update({
      stripe_subscription_id: subscription.subscriptionId,
      subscription_status: subscription.status,
      subscription_plan: subscription.planName || 'spark',
      subscription_interval: subscription.interval,
      subscription_current_period_start: subscription.currentPeriodStart.toISOString(),
      subscription_current_period_end: subscription.currentPeriodEnd.toISOString(),
      subscription_cancel_at_period_end: subscription.cancelAtPeriodEnd,
      is_pro: isActive && subscription.planName !== 'spark',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('[Stripe Webhook] Failed to update user subscription:', error);
  } else {
    console.log(`[Stripe Webhook] Updated subscription for user ${userId}: ${subscription.planName} (${subscription.status})`);
  }
}

// Disable body parsing for this route - we need the raw body for signature verification
export const dynamic = 'force-dynamic';
