import { useState } from "react";
import { Gift, Copy, Check, Share2, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
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

  return (
    <Card className="p-6 bg-gradient-to-br from-burgundy via-burgundy-dark to-burgundy text-white shadow-lg relative overflow-hidden">
      {/* Decorative background gift icon */}
      <div className="absolute top-0 right-0 w-48 h-48 opacity-10 pointer-events-none">
        <Gift className="w-full h-full" />
      </div>

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                Refer & Earn €25
              </h3>
              <p className="text-sm text-white/80">
                Share the adventure with friends
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onViewFullDashboard}
            className="text-white hover:bg-white/20"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="text-2xl mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
              {stats?.totalInvites || 0}
            </div>
            <div className="text-xs text-white/70">Send</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="text-2xl mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
              {stats?.completedReferrals || 0}
            </div>
            <div className="text-xs text-white/70">Completed</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="text-2xl mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
              €{stats?.totalEarned || 0}
            </div>
            <div className="text-xs text-white/70">Earned (in Euro)</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            className="flex-1 bg-white hover:bg-white/90 text-burgundy font-medium"
            onClick={onViewFullDashboard}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Link
          </Button>
          <Button 
            variant="secondary"
            size="icon"
            onClick={handleCopyLink}
            className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </Card>
  );
}
