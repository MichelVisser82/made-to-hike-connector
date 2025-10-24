-- Create notification_preferences table if not exists
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_on_new_message BOOLEAN DEFAULT true,
  email_on_new_booking BOOLEAN DEFAULT true,
  email_on_booking_update BOOLEAN DEFAULT true,
  email_on_review BOOLEAN DEFAULT true,
  email_on_payout BOOLEAN DEFAULT true,
  sms_on_urgent_booking BOOLEAN DEFAULT false,
  push_notifications BOOLEAN DEFAULT true,
  email_digest_frequency VARCHAR DEFAULT 'instant',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on notification_preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists and recreate
DROP POLICY IF EXISTS "Users can manage their own preferences" ON notification_preferences;
CREATE POLICY "Users can manage their own preferences"
  ON notification_preferences FOR ALL
  USING (auth.uid() = user_id);

-- Create user_settings table if not exists
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language VARCHAR DEFAULT 'en',
  timezone VARCHAR DEFAULT 'Europe/London',
  date_format VARCHAR DEFAULT 'DD/MM/YYYY',
  currency_display VARCHAR DEFAULT 'EUR',
  profile_visibility VARCHAR DEFAULT 'public',
  show_email_to_bookings BOOLEAN DEFAULT false,
  show_phone_to_bookings BOOLEAN DEFAULT false,
  analytics_cookies BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists and recreate
DROP POLICY IF EXISTS "Users can manage their own settings" ON user_settings;
CREATE POLICY "Users can manage their own settings"
  ON user_settings FOR ALL
  USING (auth.uid() = user_id);

-- Add Stripe Connect fields to guide_profiles
ALTER TABLE guide_profiles 
  ADD COLUMN IF NOT EXISTS stripe_account_id VARCHAR,
  ADD COLUMN IF NOT EXISTS stripe_kyc_status VARCHAR DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS payout_schedule VARCHAR DEFAULT 'weekly',
  ADD COLUMN IF NOT EXISTS bank_account_last4 VARCHAR;

-- Add triggers to update updated_at (will skip if already exists)
DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON notification_preferences;
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();