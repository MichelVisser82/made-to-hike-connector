import { useState } from 'react';
import { useReferralStats } from '@/hooks/useReferralStats';
import { useReferralLinks } from '@/hooks/useReferralLinks';
import { useSendInvitation } from '@/hooks/useSendInvitation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Gift, Copy, Mail, Users, Ticket, Euro } from 'lucide-react';
import { toast } from 'sonner';
import { useProfile } from '@/hooks/useProfile';

export const HikerReferralDashboard = ({ userId }: { userId: string }) => {
  const { profile } = useProfile();
  const { data: stats, isLoading: statsLoading } = useReferralStats(userId);
  const { data: links, isLoading: linksLoading } = useReferralLinks(
    userId,
    'hiker',
    profile?.name?.split(' ')[0] || 'Friend'
  );
  const { sendInvitation, isLoading: sendingInvitation } = useSendInvitation();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteType, setInviteType] = useState<'hiker' | 'guide'>('hiker');
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
      await sendInvitation(userId, inviteEmail, inviteType, personalMessage);
      setInviteEmail('');
      setPersonalMessage('');
    } catch (error) {
      // Error already handled in hook
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
        <h1 className="text-3xl font-display text-foreground mb-2">Invite & Earn</h1>
        <p className="text-muted-foreground">
          Share your love for hiking and earn rewards when friends join MadeToHike
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
              <Ticket className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats?.vouchers?.filter((v: any) => v.times_used === 0).length || 0}</p>
              <p className="text-sm text-muted-foreground">Available Vouchers</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-sage/10">
              <Euro className="w-6 h-6 text-sage" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">€{stats?.availableVouchersValue || 0}</p>
              <p className="text-sm text-muted-foreground">Total Voucher Value</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Referral Links */}
      <Card className="p-6">
        <h2 className="text-xl font-display text-foreground mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5" />
          Your Referral Links
        </h2>

        <div className="space-y-4">
          {/* Hiker Link */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Invite Friends to Hike
            </label>
            <div className="flex gap-2">
              <Input
                value={links?.hikerLink || ''}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(links?.hikerLink || '')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              You earn €25, they earn €15 after their first completed tour
            </p>
          </div>

          {/* Guide Link */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Invite Mountain Guides
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
              You earn €50 when they complete their first tour
            </p>
          </div>
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
              Email Address
            </label>
            <Input
              type="email"
              placeholder="friend@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Invite as
            </label>
            <div className="flex gap-2">
              <Button
                variant={inviteType === 'hiker' ? 'default' : 'outline'}
                onClick={() => setInviteType('hiker')}
                className="flex-1"
              >
                Hiker
              </Button>
              <Button
                variant={inviteType === 'guide' ? 'default' : 'outline'}
                onClick={() => setInviteType('guide')}
                className="flex-1"
              >
                Guide
              </Button>
            </div>
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

      {/* Active Vouchers */}
      {stats?.vouchers && stats.vouchers.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-display text-foreground mb-4">Your Vouchers</h2>
          <div className="space-y-3">
            {stats.vouchers.map((voucher: any) => (
              <div
                key={voucher.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg"
              >
                <div>
                  <p className="font-medium text-foreground">{voucher.code}</p>
                  <p className="text-sm text-muted-foreground">
                    €{voucher.discount_value} • {voucher.times_used > 0 ? 'Used' : 'Available'}
                  </p>
                </div>
                {voucher.times_used === 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(voucher.code)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
