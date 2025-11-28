import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Share2, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useReferralStats } from '@/hooks/useReferralStats';
import { useReferralLinks } from '@/hooks/useReferralLinks';

interface ReferralWidgetProps {
  userId: string;
  userType: 'hiker' | 'guide';
  userName: string;
}

export const ReferralWidget = ({ userId, userType, userName }: ReferralWidgetProps) => {
  const { data: stats, isLoading: statsLoading } = useReferralStats(userId);
  const { data: links, isLoading: linksLoading } = useReferralLinks(
    userId,
    userType,
    userName.split(' ')[0] || 'Friend'
  );

  const rewardAmount = userType === 'guide' ? '€50' : '€25';
  const subtitle = userType === 'guide' 
    ? 'Share the adventure with fellow guides' 
    : 'Share the adventure with friends';

  const referralLink = userType === 'guide' ? links?.guideLink : links?.hikerLink;

  const copyToClipboard = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      toast.success('Link copied to clipboard!');
    }
  };

  const shareLink = () => {
    if (referralLink) {
      if (navigator.share) {
        navigator.share({
          title: 'Join MadeToHike',
          text: `Join me on MadeToHike and get ${userType === 'guide' ? '€50' : '€15'} off your first ${userType === 'guide' ? 'tour' : 'adventure'}!`,
          url: referralLink,
        }).catch(() => {
          copyToClipboard();
        });
      } else {
        copyToClipboard();
      }
    }
  };

  if (statsLoading || linksLoading) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-burgundy via-burgundy-dark to-burgundy text-white p-8 rounded-xl border-0 shadow-lg overflow-hidden relative">
      {/* Background decorative elements */}
      <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute right-12 bottom-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-white/10">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-playfair font-bold">
                Refer & Earn {rewardAmount}
              </h3>
              <p className="text-white/80 text-sm mt-0.5">{subtitle}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.open(`/dashboard?section=referrals`, '_self')}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ExternalLink className="w-5 h-5" />
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-3xl font-bold mb-1">{stats?.completedInvites || 0}</p>
            <p className="text-white/70 text-sm">Successful</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-3xl font-bold mb-1">{stats?.pendingInvites || 0}</p>
            <p className="text-white/70 text-sm">Pending</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-3xl font-bold mb-1">
              {userType === 'guide' 
                ? `€${stats?.totalCredits || 0}` 
                : `€${stats?.totalVouchersValue || 0}`
              }
            </p>
            <p className="text-white/70 text-sm">Total Earned</p>
          </div>
        </div>

        {/* Share Link */}
        <div className="flex gap-2">
          <Button
            onClick={shareLink}
            variant="secondary"
            className="flex-1 bg-white hover:bg-white/90 text-burgundy font-medium"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Link
          </Button>
          <Button
            onClick={copyToClipboard}
            variant="secondary"
            size="icon"
            className="bg-white hover:bg-white/90 text-burgundy"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
