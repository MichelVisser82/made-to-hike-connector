import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { AccountSettings } from '@/components/settings/AccountSettings';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { PaymentSettings } from '@/components/settings/PaymentSettings';
import { PrivacySettings } from '@/components/settings/PrivacySettings';
import { AvailabilitySettings } from '@/components/settings/AvailabilitySettings';
import { LanguageSettings } from '@/components/settings/LanguageSettings';
import { Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-burgundy" />
      </div>
    );
  }

  if (!user || !profile) return null;

  const userRole = profile.role === 'guide' ? 'guide' : 'hiker';

  return (
    <SettingsLayout userRole={userRole}>
      <Routes>
        <Route path="/" element={<Navigate to="/settings/account" replace />} />
        <Route path="/account" element={<AccountSettings />} />
        <Route path="/profile" element={<ProfileSettings userRole={userRole} />} />
        <Route path="/notifications" element={<NotificationSettings userRole={userRole} />} />
        {userRole === 'guide' && (
          <>
            <Route path="/payment" element={<PaymentSettings />} />
            <Route path="/availability" element={<AvailabilitySettings />} />
          </>
        )}
        <Route path="/privacy" element={<PrivacySettings />} />
        <Route path="/language" element={<LanguageSettings />} />
      </Routes>
    </SettingsLayout>
  );
}
