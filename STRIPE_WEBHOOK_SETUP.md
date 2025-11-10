# Stripe Webhook Configuration for Processing Payments

## Overview
This guide explains how to configure Stripe webhooks to automatically update booking statuses when payments complete, especially for delayed payment methods like SEPA Direct Debit.

## Why Webhooks Are Needed
SEPA payments and other bank transfers take 3-5 business days to complete. Without webhooks:
- Bookings would stay in "processing" status forever
- You'd need to manually check and update each booking
- Customers wouldn't receive confirmation emails when payments complete

With webhooks properly configured:
- Bookings automatically update to "confirmed" when payments succeed
- Customers receive immediate email notifications
- No manual intervention required

## Webhook URL
Your webhook endpoint is:
```
https://ohecxwxumzpfcfsokfkg.supabase.co/functions/v1/stripe-webhook
```

## Events to Listen For
Configure your webhook to listen for these events:

### Payment Events (Critical)
- `payment_intent.processing` - When SEPA/bank payment is initiated
- `payment_intent.succeeded` - When any payment completes successfully
- `payment_intent.payment_failed` - When a payment fails
- `charge.succeeded` - Backup handler for successful charges

### Transfer & Payout Events (Optional but Recommended)
- `transfer.created` - When funds are transferred to guide's account
- `transfer.paid` - When transfer completes
- `payout.created` - When payout is initiated
- `payout.paid` - When payout completes to guide's bank
- `payout.failed` - When payout fails

### Account Events
- `account.updated` - When connected account status changes

## Setup Steps

### 1. Access Stripe Dashboard
1. Go to https://dashboard.stripe.com
2. Navigate to **Developers** → **Webhooks**
3. Click **Add endpoint**

### 2. Configure Endpoint
1. **Endpoint URL**: Enter your webhook URL from above
2. **Description**: "MadeToHike Payment Status Updates"
3. **Events to send**: Select all events listed above
4. Click **Add endpoint**

### 3. Get Signing Secret
1. After creating the endpoint, click on it
2. Copy the **Signing secret** (starts with `whsec_`)
3. This is already stored in your `STRIPE_WEBHOOK_SECRET` environment variable

### 4. Test the Webhook
1. In Stripe Dashboard, go to your webhook endpoint
2. Click **Send test webhook**
3. Select `payment_intent.succeeded`
4. Click **Send test webhook**
5. Check your edge function logs to verify it was received

## Testing with SEPA Payments

### Test Mode SEPA Numbers
Use these test SEPA IBANs in Stripe test mode:

**Successful Payment** (completes after 3 business days):
```
DE89370400440532013000
```

**Failed Payment**:
```
DE62370400440532013001
```

### Testing Flow
1. Make a test booking using SEPA Direct Debit
2. Payment will show as "processing"
3. Booking is created with `payment_status: 'processing'`
4. In test mode, you can manually trigger the webhook:
   - Go to Stripe Dashboard → Events
   - Find the `payment_intent.processing` event
   - Click **Resend webhook**
   - Then create and send a `payment_intent.succeeded` event

## Monitoring

### View Webhook Logs
- **Edge Function Logs**: https://supabase.com/dashboard/project/ohecxwxumzpfcfsokfkg/functions/stripe-webhook/logs
- **Stripe Webhook Dashboard**: Check delivery status and retries in Stripe

### Admin Monitoring Panel
Admins can monitor processing payments at:
**Dashboard** → **Platform** → **Processing Payments**

This panel shows:
- All bookings with processing payment status
- Hiker and tour details
- Ability to manually check payment status
- Real-time updates when payments complete

### Database Monitoring
All webhook events are logged in the `stripe_webhook_events` table:
```sql
SELECT * FROM stripe_webhook_events 
ORDER BY created_at DESC 
LIMIT 20;
```

## Troubleshooting

### Webhook Not Receiving Events
1. Check the endpoint URL is correct
2. Verify the signing secret matches
3. Check edge function logs for errors
4. Test webhook delivery in Stripe Dashboard

### Bookings Stuck in Processing
1. Check Stripe Dashboard for payment status
2. Look for failed webhook deliveries
3. Manually trigger webhook resend if needed
4. Use admin panel "Check Status" button

### SEPA Payments Not Completing
- SEPA test payments don't auto-complete in test mode
- You must manually trigger `payment_intent.succeeded` event
- In production, these complete automatically after 3-5 business days

## Production Considerations

### Security
- ✅ Webhook signature verification is implemented
- ✅ All events are logged to database
- ✅ CORS is properly configured

### Reliability
- ✅ Idempotent webhook processing (won't duplicate updates)
- ✅ Automatic retry by Stripe if webhook fails
- ✅ Events logged even if processing fails

### Monitoring
- Set up alerts for failed webhooks
- Monitor `stripe_webhook_events` table for errors
- Check processing payments panel regularly

## Related Documentation
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [SEPA Direct Debit](https://stripe.com/docs/payments/sepa-debit)
- [Testing SEPA](https://stripe.com/docs/testing#sepa-direct-debit)
