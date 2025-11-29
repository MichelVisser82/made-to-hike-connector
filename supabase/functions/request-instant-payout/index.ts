import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[REQUEST-INSTANT-PAYOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Get guide's Stripe account
    const { data: guideProfile, error: profileError } = await supabaseClient
      .from('guide_profiles')
      .select('stripe_account_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !guideProfile) {
      throw new Error("Guide profile not found");
    }

    if (!guideProfile.stripe_account_id) {
      throw new Error("Stripe account not connected. Please complete your payment setup.");
    }

    logStep("Guide profile found", { stripeAccountId: guideProfile.stripe_account_id });

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check account capabilities for instant payouts
    const account = await stripe.accounts.retrieve(guideProfile.stripe_account_id);
    logStep("Checking account capabilities", { accountId: account.id });

    const supportsInstantPayouts = account.capabilities?.card_payments === 'active' && 
                                     account.capabilities?.transfers === 'active';
    
    // Get account balance
    const balance = await stripe.balance.retrieve({
      stripeAccount: guideProfile.stripe_account_id,
    });

    logStep("Balance retrieved", { balance });

    // Check available balance (in cents)
    const availableBalance = balance.available.find(b => b.currency === 'eur');
    if (!availableBalance || availableBalance.amount < 10000) { // Minimum €100
      throw new Error("Insufficient balance for payout. Minimum €100 required.");
    }

    const amountInCents = availableBalance.amount;
    
    // Determine payout method based on account capabilities
    const payoutMethod = supportsInstantPayouts ? 'instant' : 'standard';
    logStep("Creating payout", { amountInCents, method: payoutMethod });

    // Create payout (instant if supported, standard otherwise)
    const payout = await stripe.payouts.create(
      {
        amount: amountInCents,
        currency: 'eur',
        method: payoutMethod,
      },
      {
        stripeAccount: guideProfile.stripe_account_id,
      }
    );

    logStep("Payout created successfully", { 
      payoutId: payout.id, 
      amount: payout.amount,
      status: payout.status 
    });

    return new Response(
      JSON.stringify({
        success: true,
        payout: {
          id: payout.id,
          amount: payout.amount / 100, // Convert to euros
          currency: payout.currency,
          arrival_date: payout.arrival_date,
          status: payout.status,
          method: payout.method,
          isInstant: payout.method === 'instant',
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    logStep('ERROR', { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
