import { useState } from "react";
import { Users, Gift, ArrowRight, Copy, Check, Ticket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useReferralStats } from "@/hooks/useReferralStats";
import { useReferralLinks } from "@/hooks/useReferralLinks";

interface HikerReferralWidgetProps {
  userId: string;
  userName: string;
  onViewFullDashboard?: () => void;
}

export default function HikerReferralWidget({
  userId,
  userName,
  onViewFullDashboard
}: HikerReferralWidgetProps) {
  const [copied, setCopied] = useState(false);
  const { data: stats, isLoading: statsLoading } = useReferralStats(userId);
  const { data: links, isLoading: linksLoading } = useReferralLinks(
    userId,
    'hiker',
    userName.split(' ')[0] || 'Hiker'
  );

  const handleCopyLink = () => {
    if (links?.hikerLink) {
      navigator.clipboard.writeText(links.hikerLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Referral link copied!");
    }
  };

  if (statsLoading || linksLoading) {
    return null;
  }

  const availableVouchersCount = stats?.availableVouchersCount || 0;
  const availableVouchersValue = stats?.availableVouchersValue || 0;
  const pendingReferrals = stats?.pendingReferrals || 0;

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
                Invite & Earn Vouchers
              </h3>
              <p className="text-sm text-charcoal/70">€25 per hiker • €50 per guide</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-white/60 rounded-lg p-3 text-center">
            <div className="text-2xl text-burgundy mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
              {stats?.totalReferrals || 0}
            </div>
            <div className="text-xs text-charcoal/60">Invited</div>
          </div>

          <div className="bg-white/60 rounded-lg p-3 text-center">
            <div className="text-2xl text-burgundy mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
              {availableVouchersCount}
            </div>
            <div className="text-xs text-charcoal/60">Vouchers</div>
          </div>

          <div className="bg-white/60 rounded-lg p-3 text-center">
            <div className="text-2xl text-burgundy mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
              €{availableVouchersValue}
            </div>
            <div className="text-xs text-charcoal/60">Available</div>
          </div>
        </div>

        {/* Available Vouchers Highlight */}
        {availableVouchersCount > 0 && (
          <div className="bg-burgundy text-white rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5" />
                <div>
                  <div className="text-sm font-medium">
                    {availableVouchersCount} voucher{availableVouchersCount > 1 ? 's' : ''} ready to use!
                  </div>
                  <div className="text-xs text-white/80">€{availableVouchersValue} total value</div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-burgundy"
                onClick={onViewFullDashboard}
              >
                View
              </Button>
            </div>
          </div>
        )}

        {/* Quick Copy Link */}
        <div className="bg-white/80 rounded-lg p-4 mb-4">
          <div className="text-xs text-charcoal/70 mb-2 uppercase tracking-wider">Quick Share</div>
          <div className="flex gap-2">
            <input
              readOnly
              value={links?.hikerLink || ''}
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

        {/* Pending Progress */}
        {pendingReferrals > 0 && (
          <div className="bg-white/60 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-charcoal/80">
              <Users className="w-4 h-4 text-burgundy" />
              <span>
                <strong>{pendingReferrals}</strong> referral{pendingReferrals > 1 ? 's' : ''} in progress
              </span>
            </div>
          </div>
        )}

        {/* CTA */}
        <Button
          onClick={onViewFullDashboard}
          className="w-full bg-burgundy hover:bg-burgundy-dark text-white"
        >
          Go to Referrals Dashboard
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>

        {/* Info */}
        <p className="text-xs text-charcoal/60 text-center mt-3">
          Earn discount vouchers when friends complete their first tour
        </p>
      </CardContent>
    </Card>
  );
}
