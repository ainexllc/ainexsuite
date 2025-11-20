# Stripe Integration Setup

This document outlines the Stripe API routes created for AinexSuite and how to configure them.

## API Routes Created

### 1. `/api/checkout` - Checkout Session Creation
**File**: `src/app/api/checkout/route.ts`

Creates a Stripe checkout session for subscription signup with a 30-day trial.

**Request**:
```typescript
POST /api/checkout
Headers:
  Authorization: Bearer <firebase-id-token>
Content-Type: application/json

Body:
{
  "priceId": "price_xxxxx",
  "tier": "pro" | "premium"
}
```

**Response**:
```typescript
{
  "sessionId": "cs_xxxxx"
}
```

**Features**:
- ✅ Authenticates user with Firebase ID token
- ✅ Gets or creates Stripe customer ID
- ✅ Creates checkout session with 30-day trial
- ✅ Stores customer ID in Firestore
- ✅ Includes metadata (userId, tier)
- ✅ Proper error handling and logging

### 2. `/api/webhooks/stripe` - Webhook Handler
**File**: `src/app/api/webhooks/stripe/route.ts`

Processes Stripe webhook events with idempotency and atomic Firestore updates.

**Events Handled**:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

**Features**:
- ✅ Verifies webhook signature
- ✅ Idempotency: Checks webhook_events collection before processing
- ✅ Atomic updates: Uses Firestore transactions
- ✅ Logs all webhooks to webhook_events collection
- ✅ Returns `{ received: true }` on success
- ✅ Proper error handling with retry support

**Collections Updated**:
- `webhook_events` - Stores webhook event data for idempotency
- `subscriptions` - Stores subscription details per user
- `users` - Updates user subscription status

### 3. `/api/portal` - Customer Portal
**File**: `src/app/api/portal/route.ts`

Creates a Stripe billing portal session for subscription management.

**Request**:
```typescript
POST /api/portal
Headers:
  Authorization: Bearer <firebase-id-token>
```

**Response**:
```typescript
{
  "url": "https://billing.stripe.com/session/xxxxx"
}
```

**Features**:
- ✅ Authenticates user with Firebase ID token
- ✅ Gets stripeCustomerId from Firestore
- ✅ Creates billing portal session
- ✅ Returns portal URL for redirection
- ✅ Proper error handling

## Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_xxxxx                  # Or sk_live_xxxxx for production
STRIPE_WEBHOOK_SECRET=whsec_xxxxx               # From Stripe webhook settings
NEXT_PUBLIC_MAIN_DOMAIN=http://localhost:3000   # Or production domain

# Price IDs (from Stripe Dashboard)
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_PRO_YEARLY_PRICE_ID=price_xxxxx
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_xxxxx
```

## Firestore Collections

### `users` Collection
Extended with subscription fields:
```typescript
{
  uid: string;
  email: string;
  displayName: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus: 'trial' | 'active' | 'expired' | 'past_due' | 'canceled';
  subscriptionTier?: 'trial' | 'pro' | 'premium';
  subscriptionExpiresAt?: number;
  lastPaymentDate?: number;
  lastPaymentAmount?: number;
  // ... other user fields
}
```

### `subscriptions` Collection
Document ID = userId:
```typescript
{
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  status: SubscriptionStatus;
  tier: SubscriptionTier;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  trialStartDate?: number;
  trialEndDate?: number;
  canceledAt?: number;
  cancelAt?: number;
  currentMonthUsage: {
    queries: number;
    tokens: number;
    cost: number;
    lastReset: number;
  };
  monthlyQueryLimit: number;
  createdAt: number;
  updatedAt: number;
}
```

### `webhook_events` Collection
Document ID = Stripe event ID:
```typescript
{
  id: string;
  type: string;
  data: Record<string, unknown>;
  processed: boolean;
  error?: string;
  createdAt: number;
  processedAt?: number;
}
```

## Webhook Configuration

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook signing secret and add to `.env.local` as `STRIPE_WEBHOOK_SECRET`

## Testing Webhooks Locally

Use Stripe CLI to forward webhooks to localhost:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local endpoint
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
```

## Client-Side Usage Example

```typescript
// Create checkout session
async function handleCheckout(priceId: string, tier: string) {
  const token = await auth.currentUser?.getIdToken();
  
  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ priceId, tier }),
  });
  
  const { sessionId } = await response.json();
  
  // Redirect to Stripe Checkout
  const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  await stripe.redirectToCheckout({ sessionId });
}

// Open billing portal
async function handleManageBilling() {
  const token = await auth.currentUser?.getIdToken();
  
  const response = await fetch('/api/portal', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const { url } = await response.json();
  window.location.href = url;
}
```

## Security Notes

1. **Authentication**: All routes verify Firebase ID tokens
2. **Webhook Verification**: Signature verification prevents unauthorized webhook calls
3. **Idempotency**: Webhook events are logged and checked to prevent duplicate processing
4. **Atomic Updates**: Firestore transactions ensure data consistency
5. **Error Handling**: All routes include try-catch blocks and proper error responses

## Production Checklist

- [ ] Replace test Stripe keys with live keys
- [ ] Update `NEXT_PUBLIC_MAIN_DOMAIN` to production domain
- [ ] Configure webhook endpoint in Stripe Dashboard
- [ ] Set up Firestore indexes for webhook_events collection
- [ ] Test webhook processing with real events
- [ ] Monitor webhook delivery in Stripe Dashboard
- [ ] Set up alerts for failed webhook processing
- [ ] Review Stripe billing portal configuration
- [ ] Test checkout flow end-to-end
- [ ] Verify subscription status updates in Firestore

