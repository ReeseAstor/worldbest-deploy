import Stripe from 'stripe';
import { getPlanByPriceId, getIntervalByPriceId, type PlanName } from './config';

// Initialize Stripe with the secret key
// Use null if not configured to prevent crashes
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

let stripe: Stripe | null = null;

if (stripeSecretKey) {
  stripe = new Stripe(stripeSecretKey, {
    // Let the SDK use its default API version
    typescript: true,
  });
}

/**
 * Get the Stripe instance
 * Returns null if Stripe is not configured
 */
export function getStripeServer(): Stripe | null {
  return stripe;
}

/**
 * Check if Stripe server is configured
 */
export function isStripeServerConfigured(): boolean {
  return Boolean(stripeSecretKey);
}

/**
 * Create or retrieve a Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string,
  existingCustomerId?: string | null
): Promise<string | null> {
  if (!stripe) {
    console.warn('Stripe not configured');
    return null;
  }

  // If we already have a customer ID, verify it exists
  if (existingCustomerId) {
    try {
      const customer = await stripe.customers.retrieve(existingCustomerId);
      if (!customer.deleted) {
        return existingCustomerId;
      }
    } catch (error) {
      console.error('Failed to retrieve existing customer:', error);
      // Customer doesn't exist, create a new one
    }
  }

  // Create a new customer
  try {
    const customer = await stripe.customers.create({
      email,
      name: name || undefined,
      metadata: {
        userId,
      },
    });
    return customer.id;
  } catch (error) {
    console.error('Failed to create Stripe customer:', error);
    return null;
  }
}

/**
 * Create a Stripe Checkout session for subscription
 */
export async function createCheckoutSession(
  userId: string,
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ sessionId: string; sessionUrl: string } | null> {
  if (!stripe) {
    console.warn('Stripe not configured');
    return null;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        metadata: {
          userId,
        },
      },
      metadata: {
        userId,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    });

    return {
      sessionId: session.id,
      sessionUrl: session.url!,
    };
  } catch (error) {
    console.error('Failed to create checkout session:', error);
    return null;
  }
}

/**
 * Create a Stripe Customer Portal session
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<{ portalUrl: string } | null> {
  if (!stripe) {
    console.warn('Stripe not configured');
    return null;
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return {
      portalUrl: session.url,
    };
  } catch (error) {
    console.error('Failed to create portal session:', error);
    return null;
  }
}

/**
 * Get a subscription by ID
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  if (!stripe) {
    console.warn('Stripe not configured');
    return null;
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['latest_invoice', 'default_payment_method'],
    });
    return subscription;
  } catch (error) {
    console.error('Failed to retrieve subscription:', error);
    return null;
  }
}

/**
 * Cancel a subscription at period end
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelImmediately = false
): Promise<Stripe.Subscription | null> {
  if (!stripe) {
    console.warn('Stripe not configured');
    return null;
  }

  try {
    if (cancelImmediately) {
      return await stripe.subscriptions.cancel(subscriptionId);
    } else {
      return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    return null;
  }
}

/**
 * Reactivate a subscription that was scheduled for cancellation
 */
export async function reactivateSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  if (!stripe) {
    console.warn('Stripe not configured');
    return null;
  }

  try {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  } catch (error) {
    console.error('Failed to reactivate subscription:', error);
    return null;
  }
}

/**
 * Update a subscription to a new price
 */
export async function updateSubscriptionPrice(
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription | null> {
  if (!stripe) {
    console.warn('Stripe not configured');
    return null;
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    return await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    });
  } catch (error) {
    console.error('Failed to update subscription price:', error);
    return null;
  }
}

/**
 * Construct and verify a Stripe webhook event
 */
export function constructWebhookEvent(
  payload: string,
  signature: string,
  webhookSecret: string
): Stripe.Event | null {
  if (!stripe) {
    console.warn('Stripe not configured');
    return null;
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return null;
  }
}

/**
 * Parse subscription details from a Stripe subscription object
 */
export interface ParsedSubscription {
  subscriptionId: string;
  customerId: string;
  status: Stripe.Subscription.Status;
  planName: PlanName | null;
  priceId: string;
  interval: 'monthly' | 'annual' | null;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt: Date | null;
}

export function parseSubscription(subscription: Stripe.Subscription): ParsedSubscription {
  const priceId = subscription.items.data[0]?.price?.id || '';
  
  // Use type assertion to access subscription properties that may vary by API version
  const sub = subscription as Stripe.Subscription & {
    current_period_start?: number;
    current_period_end?: number;
    cancel_at_period_end?: boolean;
    canceled_at?: number | null;
  };
  
  return {
    subscriptionId: subscription.id,
    customerId: typeof subscription.customer === 'string' 
      ? subscription.customer 
      : subscription.customer.id,
    status: subscription.status,
    planName: getPlanByPriceId(priceId),
    priceId,
    interval: getIntervalByPriceId(priceId),
    currentPeriodStart: new Date((sub.current_period_start || 0) * 1000),
    currentPeriodEnd: new Date((sub.current_period_end || 0) * 1000),
    cancelAtPeriodEnd: sub.cancel_at_period_end || false,
    canceledAt: sub.canceled_at 
      ? new Date(sub.canceled_at * 1000) 
      : null,
  };
}

export { stripe };
export type { Stripe };
