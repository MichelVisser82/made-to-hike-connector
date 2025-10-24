import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, CheckCircle, FileText, ExternalLink } from 'lucide-react';
import { useStripeConnect } from '@/hooks/useStripeConnect';
import { toast } from 'sonner';

export function PaymentSettings() {
  const { data, loading, createConnectedAccount, createAccountLink, updatePayoutSchedule } = useStripeConnect();

  const handleConnectStripe = async () => {
    const result = await createConnectedAccount();
    if (result) {
      // After creating account, redirect to KYC
      const url = await createAccountLink();
      if (url) {
        window.location.href = url;
      }
    }
  };

  const handleCompleteKYC = async () => {
    const url = await createAccountLink();
    if (url) {
      window.location.href = url;
    }
  };

  const handleManageBankDetails = () => {
    toast.info('Opening Stripe Dashboard...');
    // This would open the Stripe Express Dashboard
    window.open('https://connect.stripe.com/express_login', '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-burgundy" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-burgundy/10 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-playfair text-charcoal">Stripe Connect Account</CardTitle>
          <CardDescription>
            Manage your payment account for receiving tour earnings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!data?.stripe_account_id ? (
            <>
              <Alert className="border-burgundy/20 bg-burgundy/5">
                <AlertCircle className="h-4 w-4 text-burgundy" />
                <AlertDescription className="text-charcoal">
                  Connect your Stripe account to start receiving payments for your tours
                </AlertDescription>
              </Alert>
              <Button 
                onClick={handleConnectStripe} 
                className="w-full bg-burgundy hover:bg-burgundy-dark text-white"
              >
                Connect Stripe Account
              </Button>
            </>
          ) : (
            <>
              {/* KYC Status */}
              <div className="flex items-center justify-between p-4 bg-cream/50 rounded-lg">
                <div>
                  <p className="font-medium text-charcoal">Verification Status</p>
                  <p className="text-sm text-charcoal/60">
                    {data.stripe_kyc_status === 'verified' 
                      ? 'Fully verified' 
                      : 'Complete verification to receive payouts'}
                  </p>
                </div>
                {data.stripe_kyc_status === 'verified' ? (
                  <Badge className="bg-sage/10 text-sage border-sage/20">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Button 
                    onClick={handleCompleteKYC} 
                    variant="outline" 
                    size="sm"
                    className="border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                  >
                    Complete Verification
                  </Button>
                )}
              </div>

              {/* Payout Schedule */}
              <div className="space-y-2">
                <Label htmlFor="payout-schedule">Payout Schedule</Label>
                <Select 
                  value={data.payout_schedule || 'weekly'} 
                  onValueChange={updatePayoutSchedule}
                >
                  <SelectTrigger 
                    id="payout-schedule"
                    className="border-burgundy/20 focus:border-burgundy focus:ring-burgundy/20"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily (next business day)</SelectItem>
                    <SelectItem value="weekly">Weekly (every Monday)</SelectItem>
                    <SelectItem value="monthly">Monthly (1st of month)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-charcoal/60">
                  Choose how often you want to receive payouts
                </p>
              </div>

              {/* Bank Details */}
              <div className="p-4 bg-cream/50 rounded-lg space-y-2">
                <p className="text-sm font-medium text-charcoal">Bank Account</p>
                <p className="text-sm text-charcoal/60">
                  {data.bank_account_last4 
                    ? `****${data.bank_account_last4}` 
                    : 'No bank account connected'}
                </p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-burgundy"
                  onClick={handleManageBankDetails}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Manage via Stripe Dashboard
                </Button>
              </div>

              {/* Tax Information */}
              <Alert className="border-burgundy/10">
                <FileText className="h-4 w-4" />
                <AlertDescription className="text-charcoal/70">
                  Tax documents are available in the{' '}
                  <Link to="/dashboard?section=money" className="underline text-burgundy">
                    Money section
                  </Link>
                </AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment History Link */}
      <Card className="border-burgundy/10 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-playfair text-charcoal">Payment History</CardTitle>
          <CardDescription>View your earnings and transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => window.location.href = '/dashboard?section=money'}
            variant="outline"
            className="w-full border-burgundy/30 text-burgundy hover:bg-burgundy/5"
          >
            View Money Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
