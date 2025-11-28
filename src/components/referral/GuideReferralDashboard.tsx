import { useState } from 'react';
import { useReferralStats } from '@/hooks/useReferralStats';
import { useReferralLinks } from '@/hooks/useReferralLinks';
import { useSendInvitation } from '@/hooks/useSendInvitation';
import { useRequestWithdrawal } from '@/hooks/useRequestWithdrawal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Gift, Copy, Mail, Users, Euro, TrendingUp, Loader2, Banknote } from 'lucide-react';
import { toast } from 'sonner';
import { useProfile } from '@/hooks/useProfile';

export const GuideReferralDashboard = ({ userId }: { userId: string }) => {
  const { profile } = useProfile();
  const { data: stats, isLoading: statsLoading } = useReferralStats(userId);
  const { data: links, isLoading: linksLoading } = useReferralLinks(
    userId,
    'guide',
    profile?.name?.split(' ')[0] || 'Friend'
  );
  const { sendInvitation, isLoading: sendingInvitation } = useSendInvitation();
  const { requestWithdrawal, isLoading: withdrawalLoading } = useRequestWithdrawal();

  const [inviteEmail, setInviteEmail] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard!');
  };

  const handleSendInvitation = async () => {
    if (!inviteEmail) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      await sendInvitation(userId, inviteEmail, 'guide', personalMessage);
      setInviteEmail('');
      setPersonalMessage('');
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleWithdrawal = async () => {
    if (!stats || stats.availableCredits < 100) {
      toast.error('Minimum withdrawal amount is €100');
      return;
    }
    
    const result = await requestWithdrawal(stats.availableCredits);
    if (result.success) {
      // Refresh stats after withdrawal
      window.location.reload();
    }
  };

  if (statsLoading || linksLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading referral dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display text-foreground mb-2">Guide Referral Program</h1>
        <p className="text-muted-foreground">
          Invite fellow guides and earn €50 credit for each successful referral
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats?.completedInvites || 0}</p>
              <p className="text-sm text-muted-foreground">Successful Referrals</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-accent/10">
              <Euro className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">€{stats?.availableCredits || 0}</p>
              <p className="text-sm text-muted-foreground">Available Credits</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-sage/10">
              <TrendingUp className="w-6 h-6 text-sage" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">€{stats?.totalCredits || 0}</p>
              <p className="text-sm text-muted-foreground">Total Earned</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Credit Balance Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-foreground mb-1">Credit Balance</h3>
            <p className="text-3xl font-bold text-foreground">€{stats?.availableCredits || 0}</p>
            {stats?.pendingCredits > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                +€{stats.pendingCredits} pending from in-progress referrals
              </p>
            )}
          </div>
          <Button
            onClick={handleWithdrawal}
            disabled={(stats?.availableCredits || 0) < 100 || withdrawalLoading}
            variant="default"
          >
            {withdrawalLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Banknote className="mr-2 h-4 w-4" />
                Request Withdrawal
              </>
            )}
          </Button>
        </div>
        {(stats?.availableCredits || 0) < 100 && (
          <p className="text-xs text-muted-foreground mt-3">
            Minimum €100 balance required for withdrawal
          </p>
        )}
      </Card>

      {/* Referral Link */}
      <Card className="p-6">
        <h2 className="text-xl font-display text-foreground mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5" />
          Your Guide Referral Link
        </h2>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Invite Fellow Mountain Guides
          </label>
          <div className="flex gap-2">
            <Input
              value={links?.guideLink || ''}
              readOnly
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(links?.guideLink || '')}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Earn €50 credit when they complete their first tour on MadeToHike
          </p>
        </div>
      </Card>

      {/* Send Email Invitation */}
      <Card className="p-6">
        <h2 className="text-xl font-display text-foreground mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Send Email Invitation
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Guide's Email Address
            </label>
            <Input
              type="email"
              placeholder="guide@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Personal Message (Optional)
            </label>
            <Textarea
              placeholder="Add a personal note to your invitation..."
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={handleSendInvitation}
            disabled={sendingInvitation || !inviteEmail}
            className="w-full"
          >
            {sendingInvitation ? 'Sending...' : 'Send Invitation'}
          </Button>
        </div>
      </Card>

      {/* Referral Progress */}
      {stats?.referrals && stats.referrals.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-display text-foreground mb-4">Referral Progress</h2>
          <div className="space-y-3">
            {stats.referrals.map((referral: any) => (
              <div
                key={referral.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {referral.referee_email || 'Pending signup'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Status: {referral.status.replace('_', ' ')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">€{referral.reward_amount}</p>
                  <p className="text-xs text-muted-foreground">
                    {referral.reward_status === 'issued' ? 'Earned' : 'Pending'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
