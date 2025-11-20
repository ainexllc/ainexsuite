# Stripe Webhook Processing Flow

## Architecture Overview

```
┌─────────────┐
│   Stripe    │
│  Dashboard  │
└──────┬──────┘
       │ Webhook Event
       │ (signed with secret)
       ▼
┌─────────────────────────────────────┐
│  /api/webhooks/stripe (Next.js API) │
└──────────┬──────────────────────────┘
           │
           ▼
    ┌──────────────┐
    │ Verify       │
    │ Signature    │
    └──────┬───────┘
           │ Valid ✓
           ▼
    ┌──────────────────┐
    │ Check Idempotency│
    │ webhook_events   │
    └──────┬───────────┘
           │
           ├─ Already Processed → Return { received: true }
           │
           └─ New Event ▼
              ┌────────────────┐
              │ Store Event    │
              │ (processed:    │
              │  false)        │
              └────────┬───────┘
                       │
                       ▼
              ┌────────────────┐
              │ Process Event  │
              │ (switch by     │
              │  event.type)   │
              └────────┬───────┘
                       │
       ┌───────────────┼───────────────┐
       │               │               │
       ▼               ▼               ▼
  Subscription    Invoice         Invoice
    Events       Payment         Payment
                Succeeded        Failed
       │               │               │
       └───────────────┴───────────────┘
                       │
                       ▼
              ┌────────────────────┐
              │ Atomic Transaction │
              │ (Firestore)        │
              └────────┬───────────┘
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
       ┌─────────────┐   ┌─────────────┐
       │ Update      │   │ Update      │
       │ users       │   │ subscriptions│
       │ collection  │   │ collection  │
       └─────────────┘   └─────────────┘
                       │
                       ▼
              ┌────────────────┐
              │ Mark as        │
              │ Processed      │
              │ (processed:    │
              │  true)         │
              └────────┬───────┘
                       │
                       ▼
              ┌────────────────┐
              │ Return         │
              │ { received:    │
              │   true }       │
              └────────────────┘
```

## Event Handlers

### 1. Subscription Events
```typescript
customer.subscription.created
customer.subscription.updated
  │
  ├─ Extract subscription data
  ├─ Map Stripe status to our status
  ├─ Get tier from price ID
  │
  └─ Atomic Transaction:
      ├─ Update/Create subscriptions/{userId}
      └─ Update users/{userId}
```

### 2. Subscription Deleted
```typescript
customer.subscription.deleted
  │
  └─ Atomic Transaction:
      ├─ Update subscriptions/{userId}
      │   └─ status: 'expired'
      └─ Update users/{userId}
          └─ subscriptionStatus: 'expired'
```

### 3. Payment Succeeded
```typescript
invoice.payment_succeeded
  │
  ├─ Get subscription from invoice
  ├─ Extract userId from metadata
  │
  └─ Update users/{userId}:
      ├─ lastPaymentDate
      └─ lastPaymentAmount
```

### 4. Payment Failed
```typescript
invoice.payment_failed
  │
  ├─ Get subscription from invoice
  ├─ Extract userId from metadata
  │
  └─ Atomic Transaction:
      ├─ Update subscriptions/{userId}
      │   └─ status: 'past_due'
      └─ Update users/{userId}
          └─ subscriptionStatus: 'past_due'
```

## Idempotency Guarantee

```typescript
webhook_events/{eventId}
{
  id: "evt_xxxxx",
  type: "customer.subscription.created",
  data: { ... },
  processed: false,  // → true after processing
  createdAt: 1234567890,
  processedAt: 1234567890,  // Added when processed
  error?: "Error message"    // If processing failed
}
```

### Why Idempotency Matters:
1. **Stripe retries failed webhooks** - Same event may arrive multiple times
2. **Network issues** - Request may timeout but succeed
3. **Race conditions** - Multiple servers might process same event

### How It Works:
1. Check if `webhook_events/{eventId}` exists
2. If exists → Skip processing, return success
3. If not exists → Create document, process, mark as processed
4. If processing fails → Log error but keep `processed: false` for retry

## Error Handling

```typescript
Try {
  // Verify signature
  // Check idempotency
  // Process event
  // Mark as processed
  return { received: true }
}
Catch (ProcessingError) {
  // Log error in webhook_events
  // Don't mark as processed
  // Return 500 (Stripe will retry)
}
Catch (SignatureError) {
  // Invalid signature
  // Return 400 (Stripe won't retry)
}
```

## Firestore Transaction Flow

```typescript
db.runTransaction(async (transaction) => {
  // 1. Read phase (all reads first)
  const userDoc = await transaction.get(userRef);
  const subDoc = await transaction.get(subscriptionRef);
  
  // 2. Write phase (all writes after reads)
  if (subDoc.exists) {
    transaction.update(subscriptionRef, {...});
  } else {
    transaction.set(subscriptionRef, {...});
  }
  
  transaction.update(userRef, {...});
});

// If any step fails, entire transaction rolls back
// This ensures data consistency
```

## Security Measures

1. **Signature Verification**
   - Every webhook verified with `STRIPE_WEBHOOK_SECRET`
   - Prevents unauthorized requests

2. **Idempotency**
   - Prevents duplicate processing
   - Safe for retries

3. **Atomic Transactions**
   - All-or-nothing updates
   - Data consistency guaranteed

4. **Error Logging**
   - All errors logged to webhook_events
   - Easy to debug failed webhooks

5. **Metadata Validation**
   - Check for required userId
   - Fail fast if metadata missing

## Monitoring & Debugging

### Check Webhook Status:
```typescript
// Firestore Console
webhook_events/{eventId}
  - processed: true/false
  - error: "Error message" (if failed)
  - processedAt: timestamp
```

### Common Issues:

1. **Missing metadata.userId**
   - Ensure checkout session includes userId in metadata
   - Check subscription metadata in Stripe Dashboard

2. **Transaction failures**
   - Check Firestore permissions
   - Verify user document exists

3. **Signature verification fails**
   - Wrong STRIPE_WEBHOOK_SECRET
   - Using test secret with live webhooks

4. **Duplicate processing**
   - Idempotency should prevent this
   - Check webhook_events collection

### Testing Locally:
```bash
# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger specific events
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded

# Check logs
# Terminal shows webhook delivery
# Check webhook_events in Firestore Console
```

## Production Monitoring

1. **Stripe Dashboard**
   - Webhooks → View delivery attempts
   - Failed webhooks show errors

2. **Firestore Console**
   - Query webhook_events where processed = false
   - Check for error field

3. **Application Logs**
   - Console logs in webhook handler
   - Track processing time

4. **Alerts**
   - Set up alerts for failed webhooks
   - Monitor webhook_events collection for errors

