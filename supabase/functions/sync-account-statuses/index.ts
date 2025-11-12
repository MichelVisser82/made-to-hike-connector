import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2025-08-27.basil',
});

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SYNC-ACCOUNT-STATUSES] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    logStep('Starting account status sync');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all guides with Stripe accounts
    const { data: guides, error: guidesError } = await supabaseClient
      .from('guide_profiles')
      .select('user_id, stripe_account_id, display_name')
      .not('stripe_account_id', 'is', null);

    if (guidesError) throw guidesError;

    logStep('Found guides with Stripe accounts', { count: guides?.length || 0 });

    const results = {
      synced: 0,
      failed: 0,
      changes_detected: 0,
      errors: [] as any[],
    };

    for (const guide of guides || []) {
      try {
        logStep('Syncing account', { guideId: guide.user_id, accountId: guide.stripe_account_id });

        // Retrieve account from Stripe
        const account = await stripe.accounts.retrieve(guide.stripe_account_id);

        const kycStatus = determineKycStatus(account);
        const updates: any = {
          stripe_kyc_status: kycStatus,
          updated_at: new Date().toISOString(),
        };

        // Store comprehensive requirements data
        if (account.requirements) {
          updates.stripe_requirements = {
            currently_due: account.requirements.currently_due || [],
            eventually_due: account.requirements.eventually_due || [],
            past_due: account.requirements.past_due || [],
            pending_verification: account.requirements.pending_verification || [],
            disabled_reason: account.requirements.disabled_reason || null,
            errors: account.requirements.errors || [],
            current_deadline: account.requirements.current_deadline || null,
          };

          // Check if new requirements appeared
          const hasNewRequirements = (account.requirements.currently_due?.length || 0) > 0 ||
                                     (account.requirements.past_due?.length || 0) > 0;
          
          if (hasNewRequirements) {
            results.changes_detected++;
            logStep('New requirements detected', { 
              guideId: guide.user_id,
              currently_due: account.requirements.currently_due,
              past_due: account.requirements.past_due,
            });

            // Send notification to guide
            await supabaseClient.functions.invoke('send-email', {
              body: {
                to: guide.user_id,
                template: 'stripe_verification_required',
                data: {
                  guide_name: guide.display_name,
                  requirements: account.requirements.currently_due || account.requirements.past_due,
                  deadline: account.requirements.current_deadline 
                    ? new Date(account.requirements.current_deadline * 1000).toLocaleDateString()
                    : 'as soon as possible',
                },
              },
            });
          }
        }

        // Extract bank account details
        if (account.external_accounts?.data?.[0]) {
          const bankAccount = account.external_accounts.data[0];
          if (bankAccount.object === 'bank_account') {
            updates.bank_account_last4 = bankAccount.last4;
          }
        }

        // Update guide profile
        const { error: updateError } = await supabaseClient
          .from('guide_profiles')
          .update(updates)
          .eq('stripe_account_id', guide.stripe_account_id);

        if (updateError) throw updateError;

        results.synced++;
        logStep('Account synced', { guideId: guide.user_id, kycStatus });

      } catch (error: any) {
        logStep('Failed to sync account', { guideId: guide.user_id, error: error.message });
        results.failed++;
        results.errors.push({
          guide_id: guide.user_id,
          error: error.message,
        });
      }
    }

    logStep('Sync completed', results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    logStep('ERROR', { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function determineKycStatus(account: any): string {
  if (account.requirements?.disabled_reason) return 'failed';
  if (account.payouts_enabled && account.charges_enabled) return 'verified';
  if (account.requirements?.currently_due?.length > 0) return 'incomplete';
  if (account.requirements?.pending_verification?.length > 0) return 'pending';
  return 'incomplete';
}
