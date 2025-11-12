import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, AlertCircle, CheckCircle, FileText, ExternalLink, RefreshCw, Bug } from 'lucide-react';
import { useStripeConnect } from '@/hooks/useStripeConnect';
import { useMyGuideProfile, useRefreshMyGuideProfile, type ProfileError } from '@/hooks/useGuideProfile';
import { ProfileDebugPanel } from '@/components/debug/ProfileDebugPanel';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Stripe-supported countries
const STRIPE_COUNTRIES = [{
  code: 'AT',
  name: 'Austria'
}, {
  code: 'BE',
  name: 'Belgium'
}, {
  code: 'BG',
  name: 'Bulgaria'
}, {
  code: 'HR',
  name: 'Croatia'
}, {
  code: 'CY',
  name: 'Cyprus'
}, {
  code: 'CZ',
  name: 'Czech Republic'
}, {
  code: 'DK',
  name: 'Denmark'
}, {
  code: 'EE',
  name: 'Estonia'
}, {
  code: 'FI',
  name: 'Finland'
}, {
  code: 'FR',
  name: 'France'
}, {
  code: 'DE',
  name: 'Germany'
}, {
  code: 'GR',
  name: 'Greece'
}, {
  code: 'HU',
  name: 'Hungary'
}, {
  code: 'IE',
  name: 'Ireland'
}, {
  code: 'IT',
  name: 'Italy'
}, {
  code: 'LV',
  name: 'Latvia'
}, {
  code: 'LT',
  name: 'Lithuania'
}, {
  code: 'LU',
  name: 'Luxembourg'
}, {
  code: 'MT',
  name: 'Malta'
}, {
  code: 'NL',
  name: 'Netherlands'
}, {
  code: 'NO',
  name: 'Norway'
}, {
  code: 'PL',
  name: 'Poland'
}, {
  code: 'PT',
  name: 'Portugal'
}, {
  code: 'RO',
  name: 'Romania'
}, {
  code: 'SK',
  name: 'Slovakia'
}, {
  code: 'SI',
  name: 'Slovenia'
}, {
  code: 'ES',
  name: 'Spain'
}, {
  code: 'SE',
  name: 'Sweden'
}, {
  code: 'CH',
  name: 'Switzerland'
}, {
  code: 'GB',
  name: 'United Kingdom'
}, {
  code: 'US',
  name: 'United States'
}];
export function PaymentSettings() {
  const {
    user
  } = useAuth();
  const {
    data,
    loading,
    createConnectedAccount,
    createAccountLink,
    updatePayoutSchedule,
    syncAccountStatus,
    disconnectStripe,
    refetch
  } = useStripeConnect();
  const {
    data: guideProfile,
    isLoading: guideLoading,
    error: guideError
  } = useMyGuideProfile();
  const refreshProfile = useRefreshMyGuideProfile();
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [editingCountry, setEditingCountry] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const profileError = guideError as ProfileError | null;
  useEffect(() => {
    if (guideProfile?.country) {
      setSelectedCountry(guideProfile.country);
    }
  }, [guideProfile?.country]);
  const handleSyncStatus = useCallback(async () => {
    setSyncing(true);
    toast.info('Syncing with Stripe...');
    try {
      await syncAccountStatus();
      await refetch();
      refreshProfile();
      toast.success('Status updated');
    } catch (error) {
      console.error('[PaymentSettings] Sync error:', error);
      toast.error('Failed to sync status');
    } finally {
      setSyncing(false);
    }
  }, [syncAccountStatus, refetch, refreshProfile]);

  // Auto-sync when component mounts if verification incomplete
  useEffect(() => {
    if (data?.stripe_account_id && data.stripe_kyc_status !== 'verified') {
      console.log('[PaymentSettings] Component mounted with incomplete verification, syncing...');
      // Small delay to ensure component is fully loaded
      const timer = setTimeout(() => {
        handleSyncStatus();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []); // Only run on mount

  // Auto-sync when user returns from Stripe (window gains focus)
  useEffect(() => {
    const handleFocus = async () => {
      if (data?.stripe_account_id && data.stripe_kyc_status !== 'verified') {
        console.log('[PaymentSettings] Window focused, syncing Stripe status...');
        await handleSyncStatus();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [data?.stripe_account_id, data?.stripe_kyc_status, handleSyncStatus]);
  const handleConnectStripe = async () => {
    const result = await createConnectedAccount();
    if (result) {
      toast.success('Stripe account created successfully');
    }
  };
  const handleCompleteVerification = async () => {
    toast.info('Generating verification link...');
    const url = await createAccountLink();
    if (url) {
      console.log('[PaymentSettings] Opening Stripe verification link:', url);
      // Open in new tab to avoid losing the current page
      const newWindow = window.open(url, '_blank');
      if (!newWindow) {
        toast.error('Pop-up blocked. Please allow pop-ups and try again.');
      } else {
        toast.success('Stripe verification opened in new tab');
      }
    } else {
      toast.error('Failed to create verification link. Please try again.');
    }
  };
  const handlePayoutScheduleChange = async (schedule: string) => {
    await updatePayoutSchedule(schedule);
  };
  const handleManageDashboard = () => {
    window.open('https://connect.stripe.com/express_login', '_blank');
  };
  const handleRefresh = () => {
    console.log('[PaymentSettings] Manual refresh triggered');
    refreshProfile();
    toast.info('Refreshing profile data...');
  };
  const handleCountryUpdate = async () => {
    if (!selectedCountry || !user) return;
    try {
      const {
        error
      } = await supabase.from('guide_profiles').update({
        country: selectedCountry
      }).eq('user_id', user.id);
      if (error) throw error;
      toast.success('Country updated successfully');
      setEditingCountry(false);
      refreshProfile();
    } catch (error) {
      console.error('Error updating country:', error);
      toast.error('Failed to update country');
    }
  };
  const handleDisconnectStripe = async () => {
    try {
      await disconnectStripe();
      setShowDisconnectDialog(false);
      refreshProfile();
      toast.success('Stripe account disconnected. You can reconnect with a different country at any time.');
    } catch (error) {
      console.error('Error disconnecting Stripe:', error);
      toast.error('Failed to disconnect Stripe account. Please try again.');
    }
  };

  // Loading state
  if (loading || guideLoading) {
    return <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-burgundy" />
      </div>;
  }

  // Determine error state
  const errorType = profileError?.type || (guideProfile === null ? 'no_profile' : null);
  return <div className="space-y-6">
      {/* Debug Panel */}
      <ProfileDebugPanel />

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bug className="w-4 h-4" />
                Debug Information
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowDebugInfo(!showDebugInfo)}>
                {showDebugInfo ? 'Hide' : 'Show'}
              </Button>
            </div>
          </CardHeader>
          {showDebugInfo && <CardContent className="text-xs space-y-2">
              <div><strong>User ID:</strong> {user?.id || 'N/A'}</div>
              <div><strong>User Email:</strong> {user?.email || 'N/A'}</div>
              <div><strong>Guide Profile Loaded:</strong> {guideProfile ? 'Yes' : 'No'}</div>
              <div><strong>Guide Profile ID:</strong> {guideProfile?.id || 'N/A'}</div>
              <div><strong>Display Name:</strong> {guideProfile?.display_name || 'N/A'}</div>
              <div><strong>Verified:</strong> {guideProfile?.verified ? 'Yes' : 'No'}</div>
              <div><strong>Stripe Account:</strong> {data?.stripe_account_id ? 'Connected' : 'Not Connected'}</div>
              <div><strong>Error Type:</strong> {errorType || 'None'}</div>
              <div><strong>Error Message:</strong> {profileError?.message || 'None'}</div>
              <Button onClick={handleRefresh} variant="outline" size="sm" className="mt-2">
                <RefreshCw className="w-3 h-3 mr-1" />
                Force Refresh
              </Button>
            </CardContent>}
        </Card>}

      {/* Main Stripe Connect Card */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Account</CardTitle>
          <CardDescription>
            Connect your Stripe account to receive payments from bookings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error State: No Profile */}
          {errorType === 'no_profile' && <Alert className="border-burgundy/20 bg-burgundy/5">
              <AlertCircle className="h-4 w-4 text-burgundy" />
              <AlertDescription className="text-charcoal">
                <div className="space-y-2">
                  <p>No guide profile found. Please complete your guide profile before connecting a payment account.</p>
                  <div className="flex gap-2">
                    <Link to="/profile">
                      <Button variant="outline" size="sm">
                        Complete Profile
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={handleRefresh}>
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Retry
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>}

          {/* Error State: RLS Blocked */}
          {errorType === 'rls_blocked' && <Alert className="border-red-500/20 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-charcoal">
                <div className="space-y-2">
                  <p><strong>Permission Denied</strong></p>
                  <p>Unable to access your guide profile due to a security policy issue. This may be a temporary problem.</p>
                  <p className="text-sm">Try refreshing or logging out and back in.</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleRefresh}>
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Refresh
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
                      Reload Page
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>}

          {/* Error State: Network Error */}
          {errorType === 'network_error' && <Alert className="border-orange-500/20 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-charcoal">
                <div className="space-y-2">
                  <p><strong>Connection Error</strong></p>
                  <p>Unable to load your guide profile. Please check your internet connection and try again.</p>
                  <Button variant="outline" size="sm" onClick={handleRefresh}>
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Retry
                  </Button>
                </div>
              </AlertDescription>
            </Alert>}

          {/* Error State: Auth Error */}
          {errorType === 'auth_error' && <Alert className="border-red-500/20 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-charcoal">
                <div className="space-y-2">
                  <p><strong>Authentication Error</strong></p>
                  <p>Your session may have expired. Please log out and log back in.</p>
                  <Link to="/auth">
                    <Button variant="outline" size="sm">
                      Go to Login
                    </Button>
                  </Link>
                </div>
              </AlertDescription>
            </Alert>}

          {/* Success State: Profile Loaded */}
          {guideProfile && <>
              {/* Not Verified Warning */}
              {!guideProfile.verified && <Alert className="border-yellow-500/20 bg-yellow-50">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-charcoal">
                    Your guide profile is pending verification. You can connect Stripe now, but you won't be able to create tours until your profile is verified.
                  </AlertDescription>
                </Alert>}

              {/* Country Selection */}
              <div className="space-y-2">
                <Label>Payment Account Country *</Label>
                {editingCountry || !guideProfile?.country ? <div className="space-y-2">
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {STRIPE_COUNTRIES.map(country => <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                    {data?.stripe_account_id && <Alert className="border-orange-500/20 bg-orange-50">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-xs">
                          Changing your country will require you to reconnect your Stripe account with the new region.
                        </AlertDescription>
                      </Alert>}
                    {!data?.stripe_account_id && <p className="text-xs text-muted-foreground">
                        This determines which Stripe region your account will be created in.
                      </p>}
                    <div className="flex gap-2">
                      <Button onClick={handleCountryUpdate} disabled={!selectedCountry} size="sm">
                        Save Country
                      </Button>
                      {guideProfile?.country && <Button onClick={() => {
                  setEditingCountry(false);
                  setSelectedCountry(guideProfile.country!);
                }} variant="outline" size="sm">
                          Cancel
                        </Button>}
                    </div>
                  </div> : <div className="flex items-center justify-between p-3 border rounded-lg bg-muted">
                    <span className="text-sm font-medium">
                      {STRIPE_COUNTRIES.find(c => c.code === guideProfile?.country)?.name || guideProfile?.country}
                    </span>
                    <Button onClick={() => setEditingCountry(true)} variant="outline" size="sm">
                      Change
                    </Button>
                  </div>}
              </div>

              {/* Stripe Not Connected */}
              {!data?.stripe_account_id && <>
                  <Alert className="border-burgundy/20 bg-burgundy/5">
                    <AlertCircle className="h-4 w-4 text-burgundy" />
                    <AlertDescription className="text-charcoal">
                      To receive payments from bookings, you need to connect a Stripe account.
                      This is a one-time setup that takes about 5 minutes.
                    </AlertDescription>
                  </Alert>
                  <Button onClick={handleConnectStripe} className="w-full" disabled={!guideProfile?.country}>Create &amp; connect Stripe Account</Button>
                  {!guideProfile?.country && <p className="text-xs text-muted-foreground text-center">
                      Please select your country first
                    </p>}
                </>}

              {/* Stripe Connected but KYC Incomplete or Pending */}
              {data?.stripe_account_id && data.stripe_kyc_status !== 'verified' && <>
                  <Alert className={data.stripe_kyc_status === 'incomplete' ? "border-orange-500/20 bg-orange-50" : data.stripe_kyc_status === 'pending' ? "border-blue-500/20 bg-blue-50" : "border-red-500/20 bg-red-50"}>
                    <AlertCircle className={data.stripe_kyc_status === 'incomplete' ? "h-4 w-4 text-orange-600" : data.stripe_kyc_status === 'pending' ? "h-4 w-4 text-blue-600" : "h-4 w-4 text-red-600"} />
                    <AlertDescription className="text-charcoal">
                      {data.stripe_kyc_status === 'incomplete' && <>
                          <strong>Additional Information Required</strong>
                          <p className="mt-1">Your Stripe account needs more information. Click "Complete Verification" to provide the required details.</p>
                        </>}
                      {data.stripe_kyc_status === 'pending' && <>
                          <strong>Verification In Progress</strong>
                          <p className="mt-1">Stripe is reviewing your account. This usually takes a few minutes to a few hours. You'll receive an email when it's ready.</p>
                        </>}
                      {data.stripe_kyc_status === 'failed' && <>
                          <strong>Verification Failed</strong>
                          <p className="mt-1">There was an issue with your verification. Please review your Stripe dashboard for more details.</p>
                        </>}
                    </AlertDescription>
                  </Alert>
                  <div className="flex gap-2">
                    {data.stripe_kyc_status === 'incomplete' && <Button onClick={handleCompleteVerification} className="flex-1">
                        Complete Verification
                        <ExternalLink className="ml-2 w-4 h-4" />
                      </Button>}
                    {(data.stripe_kyc_status === 'pending' || data.stripe_kyc_status === 'failed') && <Button onClick={handleManageDashboard} variant="outline" className="flex-1">
                        View Stripe Dashboard
                        <ExternalLink className="ml-2 w-4 h-4" />
                      </Button>}
                    <Button onClick={handleSyncStatus} variant="outline" disabled={syncing} className={data.stripe_kyc_status === 'incomplete' ? '' : 'flex-1'}>
                      {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      {data.stripe_kyc_status === 'pending' && <span className="ml-2">Check Status</span>}
                    </Button>
                  </div>
                </>}

              {/* Stripe Fully Connected */}
              {data?.stripe_account_id && data.stripe_kyc_status === 'verified' && <>
                  <Alert className="border-green-500/20 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-charcoal">
                      Your Stripe account is fully connected and verified. You can now receive payments.
                    </AlertDescription>
                  </Alert>

                  {/* Payout Schedule */}
                  <div className="space-y-2">
                    <Label>Payout Schedule</Label>
                    <Select value={data.payout_schedule || 'weekly'} onValueChange={handlePayoutScheduleChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      How often you want to receive payouts to your bank account
                    </p>
                  </div>

                  {/* Bank Account Info */}
                  {data.bank_account_last4 && <div className="space-y-2">
                      <Label>Bank Account</Label>
                      <div className="text-sm text-muted-foreground">
                        •••• {data.bank_account_last4}
                      </div>
                    </div>}

                  {/* Stripe Dashboard Link */}
                  <Button onClick={handleManageDashboard} variant="outline" className="w-full">
                    Manage in Stripe Dashboard
                    <ExternalLink className="ml-2 w-4 h-4" />
                  </Button>

                  {/* Disconnect Stripe */}
                  <div className="pt-4 border-t">
                    <Button onClick={() => setShowDisconnectDialog(true)} variant="destructive" className="w-full">
                      Disconnect Stripe Account
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      This will allow you to change your country and reconnect
                    </p>
                  </div>
                </>}
            </>}
        </CardContent>
      </Card>

      {/* Payment History Link */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            View your earnings, transactions, and payout history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/dashboard?tab=money">
            <Button variant="outline" className="w-full">
              <FileText className="mr-2 w-4 h-4" />
              View Payment History
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Disconnect Confirmation Dialog */}
      <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Stripe Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove your current Stripe connection and allow you to change your country and reconnect.
              <br /><br />
              <strong>Note:</strong> This will not delete your Stripe account or affect past transactions. You can reconnect at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisconnectStripe} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
}