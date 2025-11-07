-- Reset Stripe account for guide@madetohike.com to allow US reconnection
UPDATE guide_profiles 
SET 
  stripe_account_id = NULL,
  stripe_kyc_status = 'pending',
  bank_account_last4 = NULL,
  updated_at = NOW()
WHERE user_id = 'fff8cf91-e3e2-4dbd-b54f-bb3fa822542b';