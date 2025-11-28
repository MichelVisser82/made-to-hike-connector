import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("[request-credit-withdrawal] Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { amount } = await req.json();

    console.log("[request-credit-withdrawal] Processing withdrawal request:", {
      userId: user.id,
      amount
    });

    // Validate amount
    if (!amount || amount < 100) {
      return new Response(
        JSON.stringify({ error: "Minimum withdrawal amount is €100" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check guide profile and Stripe account
    const { data: guideProfile, error: profileError } = await supabase
      .from("guide_profiles")
      .select("stripe_account_id, stripe_kyc_status, display_name")
      .eq("user_id", user.id)
      .single();

    if (profileError || !guideProfile) {
      console.error("[request-credit-withdrawal] Guide profile not found:", profileError);
      return new Response(
        JSON.stringify({ error: "Guide profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!guideProfile.stripe_account_id || guideProfile.stripe_kyc_status !== "verified") {
      return new Response(
        JSON.stringify({ error: "Stripe account not verified. Please complete your payout setup first." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate current available balance
    const { data: credits, error: creditsError } = await supabase
      .from("user_credits")
      .select("amount, status")
      .eq("user_id", user.id)
      .eq("status", "active");

    if (creditsError) {
      console.error("[request-credit-withdrawal] Error fetching credits:", creditsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch credit balance" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const availableBalance = credits?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;

    if (availableBalance < amount) {
      return new Response(
        JSON.stringify({ 
          error: `Insufficient balance. Available: €${availableBalance.toFixed(2)}` 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create withdrawal record (negative credit entry)
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from("user_credits")
      .insert({
        user_id: user.id,
        amount: -amount,
        currency: "EUR",
        source_type: "withdrawal",
        status: "active",
        withdrawal_amount: amount,
        withdrawn_at: new Date().toISOString(),
        notes: "Credit withdrawal request"
      })
      .select()
      .single();

    if (withdrawalError) {
      console.error("[request-credit-withdrawal] Error creating withdrawal:", withdrawalError);
      return new Response(
        JSON.stringify({ error: "Failed to process withdrawal" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[request-credit-withdrawal] Withdrawal created:", withdrawal.id);

    // Send confirmation email
    try {
      await supabase.functions.invoke("send-email", {
        body: {
          to: user.email,
          subject: "Credit Withdrawal Processed - MadeToHike",
          template: "credit_withdrawal_confirmation",
          data: {
            guideName: guideProfile.display_name,
            amount: amount.toFixed(2),
            currency: "EUR",
            withdrawalId: withdrawal.id,
            processingTime: "3-5 business days"
          }
        }
      });
    } catch (emailError) {
      console.error("[request-credit-withdrawal] Email error:", emailError);
      // Don't fail the withdrawal if email fails
    }

    // TODO: Integrate with Stripe to initiate payout
    // This would use Stripe Connect to transfer funds to the guide's account

    return new Response(
      JSON.stringify({
        success: true,
        withdrawal: {
          id: withdrawal.id,
          amount,
          status: "processing",
          estimatedArrival: "3-5 business days"
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[request-credit-withdrawal] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
