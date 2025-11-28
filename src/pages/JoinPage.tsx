import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CustomSignup } from '@/components/CustomSignup';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Gift, Check } from 'lucide-react';

export const JoinPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const refCode = searchParams.get('ref');
  const [referrerName, setReferrerName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateReferral = async () => {
      if (!refCode) {
        setLoading(false);
        return;
      }

      try {
        // Track click first
        await supabase.functions.invoke('manage-referrals', {
          body: {
            action: 'track_click',
            referralCode: refCode
          }
        });

        const { data, error } = await supabase
          .from('referrals')
          .select(`
            referrer_id,
            referrer_type,
            status,
            expires_at
          `)
          .eq('referral_code', refCode)
          .single();

        if (error || !data) {
          console.error('Invalid referral code');
          setLoading(false);
          return;
        }

        // Check if expired
        if (new Date(data.expires_at) < new Date()) {
          console.error('Referral code expired');
          setLoading(false);
          return;
        }

        // Get referrer name
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', data.referrer_id)
          .single();

        if (profile) {
          setReferrerName(profile.name);
        }
      } catch (err) {
        console.error('Error validating referral:', err);
      } finally {
        setLoading(false);
      }
    };

    validateReferral();
  }, [refCode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-sage/20 py-12 px-4">
      <div className="container max-w-6xl mx-auto">
        {refCode && referrerName && (
          <Card className="mb-8 p-6 bg-gradient-to-r from-burgundy/10 to-sage/10 border-burgundy/20">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-burgundy/10">
                <Gift className="w-6 h-6 text-burgundy" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-serif font-bold text-burgundy mb-2">
                  You've Been Invited by {referrerName}!
                </h2>
                <p className="text-charcoal/80 mb-4">
                  Create your account and start your hiking adventure. Complete your first tour and you'll both earn rewards!
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-sage mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-charcoal">€15 Welcome Voucher</p>
                      <p className="text-sm text-charcoal/70">After completing your first tour</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-sage mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-charcoal">Join the Community</p>
                      <p className="text-sm text-charcoal/70">Connect with certified mountain guides</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        <CustomSignup />
      </div>
    </div>
  );
};
