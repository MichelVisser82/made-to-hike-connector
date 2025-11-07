# Comprehensive Stripe Integration Implementation Plan

## Overview
Complete implementation plan for Stripe Connect, payments, KYC verification, payouts, and financial reporting for the MadeToHike platform.

---

## 🎯 Phase 1: Stripe Connect Account Setup (CRITICAL)
**Timeline: Days 1-2**
**Status: NOT STARTED**

### Edge Functions to Create

#### 1.1 `create-stripe-connected-account`
**Purpose:** Creates Stripe Express Connected Account for guides

**Implementation:**
```typescript
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe with secret key
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);

// Create connected account
const account = await stripe.accounts.create({
  type: 'express',
  country: guideCountry, // From guide_profiles
  email: guideEmail,
  capabilities: {
    card_payments: { requested: true },
    transfers: { requested: true },
  },
  business_type: 'individual',
  metadata: {
    guide_user_id: userId,
    platform: 'madetohike',
  },
});

// Store in database
await supabase
  .from('guide_profiles')
  .update({
    stripe_account_id: account.id,
    stripe_kyc_status: 'pending',
  })
  .eq('user_id', userId);
```

**Database Updates:**
- ✅ Already has `stripe_account_id` column
- ✅ Already has `stripe_kyc_status` column

**Frontend Integration:**
- Update `PaymentSettings.tsx` to call this function
- Show "Create Stripe Account" button if no account exists
- Handle loading and error states

---

#### 1.2 `create-stripe-account-link`
**Purpose:** Generates onboarding URL for KYC verification

**Implementation:**
```typescript
const accountLink = await stripe.accountLinks.create({
  account: stripeAccountId,
  refresh_url: `${origin}/settings/payment?refresh=true`,
  return_url: `${origin}/settings/payment?success=true`,
  type: 'account_onboarding',
});

return { url: accountLink.url };
```

**Frontend Integration:**
- Call after account creation
- Open in new window: `window.open(url, '_blank')`
- Show "Complete Verification" button for existing unverified accounts
- Handle return URL parameters (success, refresh)

---

#### 1.3 `get-stripe-account-status`
**Purpose:** Fetches real-time account status from Stripe

**Implementation:**
```typescript
const account = await stripe.accounts.retrieve(stripeAccountId);

const status = {
  charges_enabled: account.charges_enabled,
  payouts_enabled: account.payouts_enabled,
  details_submitted: account.details_submitted,
  requirements: account.requirements,
  capabilities: account.capabilities,
};

// Update database
await supabase
  .from('guide_profiles')
  .update({
    stripe_kyc_status: account.charges_enabled ? 'verified' : 'pending',
    payout_schedule: account.settings?.payouts?.schedule?.interval || 'weekly',
    bank_account_last4: account.external_accounts?.data[0]?.last4 || null,
  })
  .eq('user_id', userId);

return status;
```

**Frontend Integration:**
- Call on mount in `PaymentSettings.tsx`
- Call after return from Stripe onboarding
- Show KYC status badges (Pending, Verified, Restricted)
- Display missing requirements if incomplete

---

### Testing Checklist Phase 1:
- [ ] Guide can create Stripe account
- [ ] Onboarding link opens correctly
- [ ] KYC status updates after verification
- [ ] Error handling for failed account creation
- [ ] Bank account info displays correctly

---

## 💰 Phase 2: Split Payments with Platform Fees (CRITICAL)
**Timeline: Days 3-4**
**Status: NOT STARTED**

### Edge Function Updates

#### 2.1 Update `create-payment-intent`
**Current Status:** Exists but doesn't handle split payments

**Required Changes:**
```typescript
// Fetch guide's Stripe account and fee structure
const { data: guide } = await supabase
  .from('guide_profiles')
  .select('stripe_account_id, uses_custom_fees, custom_guide_fee_percentage, custom_hiker_fee_percentage')
  .eq('user_id', guideId)
  .single();

// Fetch platform settings for default fees
const { data: platformSettings } = await supabase
  .from('platform_settings')
  .select('setting_value')
  .eq('setting_key', 'platform_fees')
  .single();

const fees = platformSettings.setting_value;
const guideFeePercent = guide.uses_custom_fees 
  ? guide.custom_guide_fee_percentage 
  : fees.guide_fee_percentage;
const hikerFeePercent = guide.uses_custom_fees
  ? guide.custom_hiker_fee_percentage
  : fees.hiker_fee_percentage;

// Calculate fees
const subtotal = tourPrice * participants;
const guideFee = Math.round(subtotal * (guideFeePercent / 100));
const hikerFee = Math.round(subtotal * (hikerFeePercent / 100));
const totalAmount = subtotal + hikerFee;
const platformFee = guideFee + hikerFee;

// Create checkout session with split payment
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [
    {
      price_data: {
        currency: 'eur',
        product_data: {
          name: tourTitle,
          description: tourDescription,
        },
        unit_amount: Math.round(tourPrice * 100), // Base price in cents
      },
      quantity: participants,
    },
    {
      price_data: {
        currency: 'eur',
        product_data: {
          name: 'Service Fee',
          description: 'Platform service fee',
        },
        unit_amount: Math.round(hikerFee / participants * 100),
      },
      quantity: participants,
    },
  ],
  mode: 'payment',
  payment_intent_data: {
    application_fee_amount: platformFee, // Platform keeps this
    transfer_data: {
      destination: guide.stripe_account_id, // Guide receives rest
    },
    metadata: {
      guide_id: guideId,
      tour_id: tourId,
      booking_id: bookingId,
      guide_fee: guideFee,
      hiker_fee: hikerFee,
      platform_fee: platformFee,
    },
  },
  success_url: `${origin}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${origin}/tours/${tourSlug}/book`,
  metadata: {
    booking_id: bookingId,
    tour_id: tourId,
    guide_id: guideId,
  },
});
```

**Database Updates:**
```sql
-- Add transfer tracking to bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS stripe_transfer_id text,
ADD COLUMN IF NOT EXISTS guide_fee_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS hiker_fee_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_to_guide numeric DEFAULT 0;
```

**Frontend Updates:**
- Update booking flow to show fee breakdown
- Display: Subtotal, Service Fee, Total
- Show "What you'll pay" vs "Guide receives" breakdown

---

### Testing Checklist Phase 2:
- [ ] Fees calculated correctly (global settings)
- [ ] Custom fees applied for special guides
- [ ] Split payment creates transfer to guide
- [ ] Platform fee deducted correctly
- [ ] Booking records all fee amounts
- [ ] Test with different currencies

---

## 🔔 Phase 3: Webhook Handler (HIGH PRIORITY)
**Timeline: Days 5-6**
**Status: NOT STARTED**

### Edge Function to Create

#### 3.1 `stripe-webhook`
**Purpose:** Handle real-time Stripe events

**Implementation:**
```typescript
import Stripe from 'stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

// Verify webhook signature
const sig = req.headers.get('stripe-signature')!;
const event = stripe.webhooks.constructEvent(
  await req.text(),
  sig,
  webhookSecret
);

// Handle events
switch (event.type) {
  case 'payment_intent.succeeded':
    const paymentIntent = event.data.object;
    await handlePaymentSuccess(paymentIntent);
    break;

  case 'payment_intent.payment_failed':
    await handlePaymentFailed(event.data.object);
    break;

  case 'account.updated':
    await syncAccountStatus(event.data.object);
    break;

  case 'payout.paid':
    await recordPayout(event.data.object);
    break;

  case 'payout.failed':
    await handlePayoutFailed(event.data.object);
    break;

  case 'charge.refunded':
    await handleRefund(event.data.object);
    break;

  case 'transfer.created':
    await recordTransfer(event.data.object);
    break;
}
```

**Handler Functions:**

```typescript
async function handlePaymentSuccess(paymentIntent) {
  const bookingId = paymentIntent.metadata.booking_id;
  
  await supabase
    .from('bookings')
    .update({
      payment_status: 'succeeded',
      stripe_payment_intent_id: paymentIntent.id,
      status: 'confirmed',
    })
    .eq('id', bookingId);
  
  // Send confirmation email to hiker and guide
  await supabase.functions.invoke('send-email', {
    body: {
      type: 'booking_confirmed',
      booking_id: bookingId,
    },
  });
}

async function syncAccountStatus(account) {
  await supabase
    .from('guide_profiles')
    .update({
      stripe_kyc_status: account.charges_enabled ? 'verified' : 'pending',
      payout_schedule: account.settings?.payouts?.schedule?.interval,
      bank_account_last4: account.external_accounts?.data[0]?.last4,
    })
    .eq('stripe_account_id', account.id);
}

async function recordPayout(payout) {
  // Create payout record
  await supabase
    .from('stripe_payouts')
    .insert({
      guide_id: payout.metadata.guide_id,
      stripe_payout_id: payout.id,
      amount: payout.amount / 100,
      currency: payout.currency,
      arrival_date: new Date(payout.arrival_date * 1000).toISOString(),
      status: 'paid',
    });
}

async function recordTransfer(transfer) {
  const bookingId = transfer.metadata.booking_id;
  
  await supabase
    .from('bookings')
    .update({
      stripe_transfer_id: transfer.id,
      net_to_guide: transfer.amount / 100,
    })
    .eq('id', bookingId);
}
```

**Database Updates:**
```sql
-- Create webhook events log table
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  processed boolean DEFAULT false,
  processed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  event_data jsonb,
  error_message text
);

-- Create payouts tracking table
CREATE TABLE IF NOT EXISTS public.stripe_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id uuid REFERENCES auth.users(id) NOT NULL,
  stripe_payout_id text UNIQUE NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL,
  arrival_date timestamp with time zone NOT NULL,
  status text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_payouts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view webhook events"
ON public.stripe_webhook_events FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Guides can view their payouts"
ON public.stripe_payouts FOR SELECT
USING (auth.uid() = guide_id);
```

**Stripe Dashboard Setup:**
1. Go to Developers → Webhooks
2. Add endpoint: `https://[project-id].supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `account.updated`
   - `payout.paid`
   - `payout.failed`
   - `charge.refunded`
   - `transfer.created`
4. Copy webhook signing secret
5. Add to Supabase secrets: `STRIPE_WEBHOOK_SECRET`

---

### Testing Checklist Phase 3:
- [ ] Webhook endpoint receives events
- [ ] Payment success updates booking status
- [ ] Account status syncs on KYC completion
- [ ] Payouts recorded correctly
- [ ] Refunds update booking status
- [ ] Idempotency prevents duplicate processing

---

## 📊 Phase 4: Real Financial Data Integration (HIGH PRIORITY)
**Timeline: Days 7-8**
**Status: NOT STARTED**

### Edge Functions to Create

#### 4.1 `fetch-stripe-balance`
```typescript
const account = await stripe.accounts.retrieve(stripeAccountId);
const balance = await stripe.balance.retrieve({
  stripeAccount: stripeAccountId,
});

return {
  pending: balance.pending[0]?.amount / 100 || 0,
  available: balance.available[0]?.amount / 100 || 0,
  currency: balance.available[0]?.currency || 'eur',
};
```

#### 4.2 `fetch-stripe-payouts`
```typescript
const payouts = await stripe.payouts.list(
  { limit: 100 },
  { stripeAccount: stripeAccountId }
);

return payouts.data.map(payout => ({
  id: payout.id,
  amount: payout.amount / 100,
  currency: payout.currency,
  arrival_date: new Date(payout.arrival_date * 1000),
  status: payout.status,
}));
```

#### 4.3 `fetch-stripe-transactions`
```typescript
const charges = await stripe.charges.list(
  { limit: 100 },
  { stripeAccount: stripeAccountId }
);

// Fetch bookings to match with charges
const bookingIds = charges.data
  .map(c => c.metadata.booking_id)
  .filter(Boolean);

const { data: bookings } = await supabase
  .from('bookings')
  .select('id, tour_id, tours(title), profiles(name)')
  .in('id', bookingIds);

return charges.data.map(charge => {
  const booking = bookings?.find(b => b.id === charge.metadata.booking_id);
  
  return {
    id: charge.id,
    booking_id: charge.metadata.booking_id,
    tour_title: booking?.tours?.title || 'Unknown Tour',
    guest_name: booking?.profiles?.name || 'Unknown Guest',
    date: new Date(charge.created * 1000),
    gross_amount: charge.amount / 100,
    platform_fee: charge.application_fee_amount / 100,
    net_amount: (charge.amount - charge.application_fee_amount) / 100,
    currency: charge.currency,
    status: charge.status,
  };
});
```

**Frontend Updates:**

Update `GuideDashboard.tsx` `fetchFinancialData()`:
```typescript
const fetchFinancialData = async () => {
  // Fetch real balance
  const { data: balanceData } = await supabase.functions.invoke(
    'fetch-stripe-balance',
    { body: { guide_id: user.id } }
  );
  
  setBalances({
    pending: balanceData.pending,
    available: balanceData.available,
    lifetime: balanceData.lifetime, // Calculate from transactions
    currency: balanceData.currency,
  });

  // Fetch real transactions
  const { data: transactionsData } = await supabase.functions.invoke(
    'fetch-stripe-transactions',
    { body: { guide_id: user.id } }
  );
  
  setTransactions(transactionsData);

  // Fetch real payouts
  const { data: payoutsData } = await supabase.functions.invoke(
    'fetch-stripe-payouts',
    { body: { guide_id: user.id } }
  );
  
  // Find next scheduled payout
  const upcoming = payoutsData.find(p => 
    p.status === 'pending' || p.status === 'in_transit'
  );
  setNextPayout(upcoming);
};
```

---

### Testing Checklist Phase 4:
- [ ] Balance displays real Stripe data
- [ ] Transactions show actual bookings
- [ ] Payouts list is accurate
- [ ] Currency formatting correct
- [ ] Loading states work
- [ ] Error handling for API failures

---

## 💸 Phase 5: Payout Management (MEDIUM PRIORITY)
**Timeline: Days 9-10**
**STATUS: NOT STARTED**

### Edge Function to Create

#### 5.1 `update-payout-schedule`
```typescript
await stripe.accounts.update(
  stripeAccountId,
  {
    settings: {
      payouts: {
        schedule: {
          interval: schedule, // 'daily' | 'weekly' | 'monthly'
          weekly_anchor: weekday, // if weekly
          monthly_anchor: day, // if monthly
        },
      },
    },
  }
);

await supabase
  .from('guide_profiles')
  .update({ payout_schedule: schedule })
  .eq('user_id', userId);
```

#### 5.2 `request-instant-payout`
```typescript
// Check if eligible (balance > $10)
const balance = await stripe.balance.retrieve({
  stripeAccount: stripeAccountId,
});

if (balance.available[0].amount < 1000) {
  throw new Error('Minimum $10 required for instant payout');
}

// Create instant payout
const payout = await stripe.payouts.create(
  {
    amount: balance.available[0].amount,
    currency: balance.available[0].currency,
    method: 'instant',
  },
  { stripeAccount: stripeAccountId }
);

return payout;
```

**Frontend Updates:**
- Add payout schedule dropdown in `PaymentSettings.tsx`
- Add "Request Instant Payout" button in `MoneySection.tsx`
- Show instant payout fee (1.5%)
- Display eligibility requirements

---

## 📄 Phase 6: Tax Documents & Reporting (MEDIUM PRIORITY)
**Timeline: Days 11-12**
**STATUS: NOT STARTED**

### Edge Functions to Create

#### 6.1 `generate-tax-document`
```typescript
import { jsPDF } from 'jspdf';

// Fetch all transactions for year
const { data: transactions } = await supabase
  .from('bookings')
  .select('*')
  .gte('booking_date', `${year}-01-01`)
  .lte('booking_date', `${year}-12-31`)
  .eq('status', 'completed');

// Calculate totals
const totals = {
  grossIncome: transactions.reduce((sum, t) => sum + t.total_price, 0),
  platformFees: transactions.reduce((sum, t) => sum + t.guide_fee_amount, 0),
  netIncome: transactions.reduce((sum, t) => sum + t.net_to_guide, 0),
  refunds: transactions.filter(t => t.refund_amount).reduce((sum, t) => sum + t.refund_amount, 0),
};

// Generate PDF
const doc = new jsPDF();
doc.text(`${year} Income Summary`, 10, 10);
doc.text(`Gross Income: €${totals.grossIncome}`, 10, 20);
doc.text(`Platform Fees: €${totals.platformFees}`, 10, 30);
doc.text(`Net Income: €${totals.netIncome}`, 10, 40);
doc.text(`Refunds: €${totals.refunds}`, 10, 50);

// Upload to Storage
const pdfBlob = doc.output('blob');
const fileName = `tax-${year}-${guideId}.pdf`;

const { data, error } = await supabase.storage
  .from('tax-documents')
  .upload(fileName, pdfBlob);

// Create record
await supabase
  .from('tax_documents')
  .insert({
    guide_id: guideId,
    year: year,
    file_path: data.path,
    gross_income: totals.grossIncome,
    net_income: totals.netIncome,
  });
```

**Database Updates:**
```sql
CREATE TABLE IF NOT EXISTS public.tax_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id uuid REFERENCES auth.users(id) NOT NULL,
  year integer NOT NULL,
  file_path text NOT NULL,
  gross_income numeric NOT NULL,
  net_income numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE STORAGE BUCKET tax_documents;

-- RLS policies
ALTER TABLE public.tax_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guides can view their tax documents"
ON public.tax_documents FOR SELECT
USING (auth.uid() = guide_id);
```

---

## 🎨 Phase 7: Enhanced Dashboard UI (LOW PRIORITY)
**Timeline: Days 13-14**
**STATUS: NOT STARTED**

### Updates to `MoneySection.tsx`

1. **Real-Time Balance Updates:**
   - Auto-refresh every 60 seconds
   - Show "Last updated" timestamp
   - Display pending vs available breakdown

2. **Transaction Details:**
   - Add filters (date range, status, tour)
   - Export to CSV functionality
   - Link to Stripe Dashboard for detailed view

3. **Payout Calendar:**
   - Visual calendar showing payout schedule
   - Estimated arrival dates
   - Historical payout timeline

4. **Fee Breakdown Chart:**
   - Pie chart: Guide earnings vs platform fees
   - Monthly earnings trend line
   - Average booking value

5. **Quick Actions:**
   - "View in Stripe Dashboard" link
   - "Download Statement" button
   - "Update Bank Account" link

---

## 🚨 Phase 8: Error Handling & Edge Cases (CRITICAL)
**Timeline: Days 15-16**
**STATUS: NOT STARTED**

### Account Issues

1. **Restricted Accounts:**
   - Check `account.requirements.disabled_reason`
   - Display clear error message to guide
   - Prevent new bookings if account restricted
   - Link to Stripe Dashboard for resolution

2. **Missing Information:**
   - Show list of required fields
   - Link to complete onboarding
   - Send email reminder after 7 days

3. **Failed Verification:**
   - Display rejection reason
   - Allow resubmission
   - Support contact link

### Payment Failures

1. **Declined Cards:**
   - Show user-friendly error
   - Suggest alternative payment methods
   - Save booking as "payment_pending"

2. **Failed Transfers:**
   - Auto-retry after 24 hours
   - Alert admin if retry fails
   - Manual intervention workflow

### Payout Failures

1. **Invalid Bank Account:**
   - Email guide immediately
   - Show alert in dashboard
   - Link to update bank details

2. **Insufficient Balance:**
   - Prevent payout request
   - Show minimum required
   - Display available balance

---

## ✅ Phase 9: Testing & Validation (CRITICAL)
**Timeline: Days 17-18**
**STATUS: NOT STARTED**

### Test Cases

**Stripe Connect:**
- [ ] Create new connected account
- [ ] Complete KYC onboarding
- [ ] Verify account status updates
- [ ] Test with multiple countries
- [ ] Handle onboarding exit/refresh

**Payments:**
- [ ] Process test payment with split
- [ ] Verify platform fee calculation
- [ ] Check custom fees applied
- [ ] Test refund flow
- [ ] Verify webhook handling

**Payouts:**
- [ ] Automatic payout created
- [ ] Schedule change works
- [ ] Instant payout (if eligible)
- [ ] Payout failure handling

**Dashboard:**
- [ ] Balance displays correctly
- [ ] Transactions list accurate
- [ ] Filters work
- [ ] Export functionality
- [ ] Tax document generation

**Error Scenarios:**
- [ ] Account restricted
- [ ] Payment declined
- [ ] Payout failed
- [ ] Webhook timeout
- [ ] API rate limits

---

## 🚀 Phase 10: Production Deployment (CRITICAL)
**Timeline: Day 19-20**
**STATUS: NOT STARTED**

### Pre-Deployment Checklist

**Environment Setup:**
- [ ] Add `STRIPE_SECRET_KEY` to production secrets
- [ ] Add `STRIPE_WEBHOOK_SECRET` to production secrets
- [ ] Verify Supabase production URL correct
- [ ] Test all edge functions in production

**Stripe Dashboard:**
- [ ] Enable Stripe Connect in production
- [ ] Configure webhook endpoint for production
- [ ] Set platform fee percentage
- [ ] Enable instant payouts (if desired)
- [ ] Add support email
- [ ] Configure payout settings

**Database:**
- [ ] Run all migrations in production
- [ ] Verify RLS policies active
- [ ] Test query performance
- [ ] Set up monitoring

**Frontend:**
- [ ] Update environment variables
- [ ] Test payment flow end-to-end
- [ ] Verify SSL certificates
- [ ] Test on mobile devices

**Monitoring:**
- [ ] Set up error tracking (Sentry)
- [ ] Configure Stripe webhook monitoring
- [ ] Set up balance alerts
- [ ] Enable transaction logging

### Go-Live Steps:

1. **Soft Launch (1 week):**
   - Enable for 5 beta guides
   - Monitor webhook events
   - Check payout processing
   - Gather feedback

2. **Gradual Rollout:**
   - Week 1: 20% of guides
   - Week 2: 50% of guides
   - Week 3: 100% of guides

3. **Post-Launch:**
   - Daily monitoring first week
   - Weekly review first month
   - Monthly financial reconciliation

---

## 📊 Success Metrics

**Week 1:**
- [ ] 90% of guides successfully create Stripe account
- [ ] 80% complete KYC verification
- [ ] 0 payment processing errors
- [ ] All webhooks processed < 1 second

**Month 1:**
- [ ] 95% KYC completion rate
- [ ] < 0.1% payment failure rate
- [ ] 100% successful payouts
- [ ] < 5% support tickets related to payments

**Month 3:**
- [ ] Average time to first payout < 3 days
- [ ] 99% webhook success rate
- [ ] Platform fees collected correctly on all transactions
- [ ] Zero data inconsistencies between Stripe and database

---

## 🔧 Maintenance Plan

**Daily:**
- Monitor webhook processing
- Check for failed payouts
- Review error logs

**Weekly:**
- Reconcile Stripe balance with database
- Review failed payment reports
- Check account restrictions

**Monthly:**
- Generate platform financial report
- Review and optimize fees
- Update tax documents
- Performance review

---

## 📚 Documentation Needed

1. **Guide Onboarding:**
   - How to create Stripe account
   - KYC verification process
   - Payout schedule options
   - Tax documentation

2. **Admin Documentation:**
   - Platform fee management
   - Custom fee assignment
   - Webhook monitoring
   - Financial reporting

3. **Developer Documentation:**
   - API endpoints
   - Webhook events
   - Database schema
   - Error codes

---

## 🎯 Priority Summary

**MUST HAVE (Blocking Launch):**
1. Phase 1: Stripe Connect account creation
2. Phase 2: Split payments with fees
3. Phase 3: Webhook handler
4. Phase 8: Error handling
5. Phase 9: Testing
6. Phase 10: Production deployment

**SHOULD HAVE (Launch Week 2):**
4. Phase 4: Real financial data
5. Phase 5: Payout management

**NICE TO HAVE (Post-Launch):**
6. Phase 6: Tax documents
7. Phase 7: Enhanced dashboard

---

## 🚨 Critical Dependencies

**Before Starting:**
- ✅ Platform fee settings table created
- ✅ Database columns added to guide_profiles
- ✅ Stripe secret keys available
- ⚠️ Need to create webhook secret
- ⚠️ Need to enable Stripe Connect in dashboard

**External Dependencies:**
- Stripe test account for development
- Production Stripe account activated
- Bank account for platform payouts
- Business information verified in Stripe

---

## 💰 Cost Estimates

**Stripe Fees:**
- Card processing: 2.9% + $0.30 per transaction
- Stripe Connect: No additional fee
- Instant payouts: 1.5% fee (optional)
- International transfers: 1% (if applicable)

**Development Time:**
- Phase 1-3: ~40 hours (critical path)
- Phase 4-5: ~20 hours
- Phase 6-7: ~20 hours
- Phase 8-10: ~30 hours
- **Total: ~110 hours**

**Infrastructure Costs:**
- Supabase edge functions: Usage-based
- Storage for tax documents: Minimal
- Webhook processing: Included

---

## 🎬 Next Immediate Actions

1. **Create Phase 1 Edge Functions** (Priority: CRITICAL)
   - create-stripe-connected-account
   - create-stripe-account-link
   - get-stripe-account-status

2. **Update PaymentSettings Component** (Priority: CRITICAL)
   - Integrate with Phase 1 functions
   - Add Stripe Connect UI
   - Handle KYC flow

3. **Add Stripe Webhook Secret** (Priority: CRITICAL)
   - Generate in Stripe Dashboard
   - Add to Supabase secrets

4. **Run Database Migrations** (Priority: HIGH)
   - Add transfer tracking columns
   - Create webhook events table
   - Create payouts table

5. **Begin Phase 2 Implementation** (Priority: CRITICAL)
   - Update create-payment-intent
   - Test split payments
   - Verify fee calculations

---

**RECOMMENDED START:** Phase 1, Task 1.1 - `create-stripe-connected-account` edge function

Would you like me to implement Phase 1 now?
