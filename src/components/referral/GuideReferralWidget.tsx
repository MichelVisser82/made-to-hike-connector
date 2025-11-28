import { useState } from "react";
import { Users, Gift, Copy, Check, TrendingUp, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useReferralStats } from "@/hooks/useReferralStats";
import { useReferralLinks } from "@/hooks/useReferralLinks";

interface GuideReferralWidgetProps {
  userId: string;
  userName: string;
  onViewFullDashboard?: () => void;
}

export default function GuideReferralWidget({
  userId,
  userName,
  onViewFullDashboard
}: GuideReferralWidgetProps) {
  const [copied, setCopied] = useState(false);
  const { data: stats, isLoading: statsLoading } = useReferralStats(userId);
  const { data: links, isLoading: linksLoading } = useReferralLinks(
    userId,
    'guide',
    userName.split(' ')[0] || 'Guide'
  );

  const handleCopyLink = () => {
    if (links?.guideLink) {
      navigator.clipboard.writeText(links.guideLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Referral link copied!");
    }
  };

  const availableCredits = stats?.availableCredits || 0;
  const canWithdraw = availableCredits >= 100;

  if (statsLoading || linksLoading) {
    return null;
  }

  return (
    <Card className="border-burgundy/20 bg-gradient-to-br from-burgundy/5 to-burgundy/10 overflow-hidden">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-burgundy flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg text-charcoal mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                Invite & Earn Credits
              </h3>
              <p className="text-sm text-charcoal/70">€25 per hiker • €50 per guide</p>
            </div>
          </div>
          <Badge className="bg-burgundy text-white">
            <TrendingUp className="w-3 h-3 mr-1" />
            Active
          </Badge>
        </div>

        {/* Credits Balance - Hero Section */}
        <div className="bg-gradient-to-r from-burgundy to-burgundy-dark text-white rounded-lg p-5 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm opacity-90">Available Credits</div>
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="text-4xl mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            €{availableCredits}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="opacity-80">
              {canWithdraw ? '✓ Ready to withdraw' : `€${100 - availableCredits} until withdrawal`}
            </span>
            {(stats?.pendingCreditsValue || 0) > 0 && (
              <span className="bg-white/20 px-2 py-1 rounded text-xs">
                +€{stats?.pendingCreditsValue} pending
              </span>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white/60 rounded-lg p-3 text-center">
            <div className="text-xl text-burgundy mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
              {stats?.totalReferrals || 0}
            </div>
            <div className="text-xs text-charcoal/60">Total Invited</div>
          </div>

          <div className="bg-white/60 rounded-lg p-3 text-center">
            <div className="text-xl text-burgundy mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
              {stats?.completedReferrals || 0}
            </div>
            <div className="text-xs text-charcoal/60">Completed</div>
          </div>

          <div className="bg-white/60 rounded-lg p-3 text-center">
            <div className="text-xl text-burgundy mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
              {stats?.pendingReferrals || 0}
            </div>
            <div className="text-xs text-charcoal/60">In Progress</div>
          </div>
        </div>

        {/* Quick Copy Link */}
        <div className="bg-white/80 rounded-lg p-4 mb-4">
          <div className="text-xs text-charcoal/70 mb-2 uppercase tracking-wider">Quick Share</div>
          <div className="flex gap-2">
            <input
              readOnly
              value={links?.guideLink || ''}
              className="flex-1 text-sm bg-cream border border-burgundy/20 rounded px-3 py-2 text-charcoal/80"
            />
            <Button
              size="sm"
              onClick={handleCopyLink}
              className="bg-burgundy hover:bg-burgundy-dark text-white"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* How to Use Credits */}
        <div className="bg-white/60 rounded-lg p-3 mb-4">
          <div className="text-xs text-charcoal/70 mb-2 font-medium">Use Your Credits:</div>
          <div className="space-y-1 text-xs text-charcoal/60">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-burgundy"></div>
              <span>Offset your 5% platform fee</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-burgundy"></div>
              <span>Withdraw cash (min. €100)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-burgundy"></div>
              <span>Boost tour visibility (coming soon)</span>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex gap-2">
          {canWithdraw ? (
            <Button
              className="flex-1 bg-white text-burgundy border-2 border-burgundy hover:bg-burgundy hover:text-white"
              onClick={onViewFullDashboard}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Withdraw
            </Button>
          ) : (
            <Button
              className="flex-1 bg-white text-burgundy border border-burgundy/30 hover:bg-burgundy/10"
              onClick={onViewFullDashboard}
            >
              View Details
            </Button>
          )}
          
          <Button
            onClick={onViewFullDashboard}
            className="flex-1 bg-burgundy hover:bg-burgundy-dark text-white"
          >
            <Users className="w-4 h-4 mr-2" />
            Invite More
          </Button>
        </div>

        {/* Info */}
        <p className="text-xs text-charcoal/60 text-center mt-3">
          No limit on referrals • Credits never expire
        </p>
      </CardContent>
    </Card>
  );
}
