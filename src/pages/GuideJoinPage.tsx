import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Check } from 'lucide-react';

export const GuideJoinPage = () => {
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
            target_type,
            status,
            expires_at
          `)
          .eq('referral_code', refCode)
          .single();

        if (error || !data || data.target_type !== 'guide') {
          console.error('Invalid guide referral code');
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
                  Join the Guide Community
                </h2>
                <p className="text-charcoal/80 mb-4">
                  {referrerName} has invited you to become a guide on MadeToHike. Create your profile and help {referrerName} earn €50 in platform credits when you complete your first tour!
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-sage mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-charcoal">Reach More Hikers</p>
                      <p className="text-sm text-charcoal/70">Connect with adventurers worldwide</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-sage mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-charcoal">Flexible Scheduling</p>
                      <p className="text-sm text-charcoal/70">Manage your tours your way</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-8">
          <div className="text-center">
            <h2 className="text-2xl font-serif font-bold text-burgundy mb-4">
              Join MadeToHike Guides
            </h2>
            <p className="text-charcoal/80 mb-6">
              Create your guide profile and start connecting with hikers worldwide
            </p>
            <Button
              onClick={() => navigate(`/guide/signup${refCode ? `?ref=${refCode}` : ''}`)}
              size="lg"
              className="w-full sm:w-auto"
            >
              Create Guide Account
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
