import { useState } from "react";
import { X, Copy, Check, Mail, MessageCircle, Euro, Gift, Users, CheckCircle, TrendingUp, Award, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useReferralStats } from "@/hooks/useReferralStats";
import { useReferralLinks } from "@/hooks/useReferralLinks";
import { useSendInvitation } from "@/hooks/useSendInvitation";

interface ReferralModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  userType: 'hiker' | 'guide';
}

export default function ReferralModal({
  open,
  onOpenChange,
  userId,
  userName,
  userType,
}: ReferralModalProps) {
  const [copiedHiker, setCopiedHiker] = useState(false);
  const [copiedGuide, setCopiedGuide] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteType, setInviteType] = useState<'hiker' | 'guide'>('hiker');

  const { data: stats } = useReferralStats(userId);
  const { data: links } = useReferralLinks(userId, userType, userName.split(' ')[0]);
  const { sendInvitation, isLoading: isSending } = useSendInvitation();

  const rewardAmount = userType === 'hiker' ? '€25' : '€50';
  const primaryLink = userType === 'hiker' ? links?.hikerLink : links?.guideLink;

  const handleCopy = (link: string, type: 'hiker' | 'guide') => {
    navigator.clipboard.writeText(link);
    if (type === 'hiker') {
      setCopiedHiker(true);
      setTimeout(() => setCopiedHiker(false), 2000);
    } else {
      setCopiedGuide(true);
      setTimeout(() => setCopiedGuide(false), 2000);
    }
    toast.success("Link copied to clipboard!");
  };

  const handleSendInvite = async () => {
    if (!inviteEmail) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      await sendInvitation(userId, inviteEmail, inviteType, inviteMessage || undefined);
      setInviteEmail("");
      setInviteMessage("");
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleShareWhatsApp = (type: 'hiker' | 'guide') => {
    const link = type === 'hiker' ? links?.hikerLink : links?.guideLink;
    const reward = type === 'hiker' ? '€25' : '€50';
    const message = `Join MadeToHike and get €10 off your first adventure! I'll earn ${reward} when you complete your first tour. ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px] p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-start gap-3">
            <Gift className="w-6 h-6 text-burgundy flex-shrink-0 mt-1" />
            <div>
              <DialogTitle className="text-2xl text-charcoal mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                Referral Program
              </DialogTitle>
              <DialogDescription className="text-charcoal/60">
                Earn rewards by inviting friends to Made to Hike
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <Tabs defaultValue="share" className="w-full">
          <TabsList className="w-full grid grid-cols-3 rounded-none border-b border-t bg-transparent h-auto p-0">
            <TabsTrigger 
              value="share" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-burgundy data-[state=active]:bg-transparent py-3"
            >
              Share & Invite
            </TabsTrigger>
            <TabsTrigger 
              value="track" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-burgundy data-[state=active]:bg-transparent py-3"
            >
              Track Referrals
            </TabsTrigger>
            <TabsTrigger 
              value="how" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-burgundy data-[state=active]:bg-transparent py-3"
            >
              How It Works
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Share & Invite */}
          <TabsContent value="share" className="p-6 space-y-6">
            {/* Reward Highlight */}
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-sage flex items-center justify-center mx-auto mb-4">
                <Euro className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-4xl mb-3 text-charcoal" style={{ fontFamily: 'Playfair Display, serif' }}>
                Earn {rewardAmount}
              </h3>
              <p className="text-charcoal/70">
                For each friend who joins and when they book their first tour
              </p>
            </div>

            {/* Callout Box */}
            <div className="bg-burgundy/10 border-2 border-burgundy/20 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Gift className="w-5 h-5 text-burgundy flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-charcoal mb-1">They also get €10 welcome discount!</p>
                  <p className="text-sm text-charcoal/70">
                    It's a win-win. Your friends get a great discount, and you earn rewards.
                  </p>
                </div>
              </div>
            </div>

            {/* Referral Link */}
            <div>
              <h4 className="font-medium text-charcoal mb-3">Your Personal Referral Link</h4>
              <div className="flex gap-2">
                <Input 
                  value={primaryLink || ''}
                  readOnly
                  className="bg-cream/50 border-burgundy/20 font-mono text-sm"
                />
                <Button 
                  onClick={() => handleCopy(primaryLink || '', userType)}
                  className="bg-burgundy hover:bg-burgundy-dark text-white px-6"
                >
                  {(userType === 'hiker' ? copiedHiker : copiedGuide) ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-charcoal/60 mt-2">
                Share this unique link to track your referrals automatically
              </p>
            </div>

            {/* Quick Share Options */}
            <div>
              <h4 className="font-medium text-charcoal mb-3">Quick Share</h4>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                  onClick={() => handleShareWhatsApp(userType)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                  onClick={() => {
                    document.getElementById('email-input')?.focus();
                  }}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              </div>
            </div>

            {/* Email Invitation */}
            <div className="bg-cream/30 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-charcoal text-sm">Send Personal Invitation</h4>
              <Input
                id="email-input"
                type="email"
                placeholder="friend@email.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="bg-white"
              />
              <Textarea
                placeholder="Add a personal message (optional)"
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                className="bg-white resize-none"
                rows={3}
              />
              <Button
                onClick={handleSendInvite}
                disabled={isSending || !inviteEmail}
                className="w-full bg-burgundy hover:bg-burgundy-dark text-white"
              >
                {isSending ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </TabsContent>

          {/* Tab 2: Track Referrals */}
          <TabsContent value="track" className="p-6 space-y-6">
            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 text-center bg-white border-burgundy/10">
                <div className="text-3xl font-bold text-burgundy mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {stats?.totalReferrals || 0}
                </div>
                <div className="text-xs text-charcoal/70">Total Invited</div>
              </Card>
              <Card className="p-4 text-center bg-white border-sage/20">
                <div className="text-3xl font-bold text-sage mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {stats?.completedReferrals || 0}
                </div>
                <div className="text-xs text-charcoal/70">Completed</div>
              </Card>
              <Card className="p-4 text-center bg-white border-gold/20">
                <div className="text-3xl font-bold text-gold mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {stats?.pendingReferrals || 0}
                </div>
                <div className="text-xs text-charcoal/70">In Progress</div>
              </Card>
            </div>

            {/* Progress Steps */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-charcoal" style={{ fontFamily: 'Playfair Display, serif' }}>
                How Your Referrals Work
              </h3>
              
              <div className="space-y-3">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-burgundy flex items-center justify-center text-white font-bold shrink-0">
                    1
                  </div>
                  <div className="flex-1 pt-2">
                    <h4 className="font-semibold text-charcoal mb-1">Friend Signs Up</h4>
                    <p className="text-sm text-charcoal/70">They click your link and create an account</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-burgundy flex items-center justify-center text-white font-bold shrink-0">
                    2
                  </div>
                  <div className="flex-1 pt-2">
                    <h4 className="font-semibold text-charcoal mb-1">They Complete First Tour</h4>
                    <p className="text-sm text-charcoal/70">Your friend books and completes their first adventure</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-sage flex items-center justify-center text-white shrink-0">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1 pt-2">
                    <h4 className="font-semibold text-charcoal mb-1">You Get Rewarded!</h4>
                    <p className="text-sm text-charcoal/70">
                      {userType === 'hiker' 
                        ? 'Receive a discount voucher for your next tour'
                        : 'Credits are added to your account automatically'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Balance */}
            {userType === 'hiker' ? (
              <div className="bg-burgundy text-white rounded-lg p-6 text-center">
                <div className="text-sm mb-2 opacity-90">Available Vouchers</div>
                <div className="text-5xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {stats?.availableVouchersCount || 0}
                </div>
                <div className="text-sm opacity-90">
                  Total value: €{stats?.availableVouchersValue || 0}
                </div>
              </div>
            ) : (
              <div className="bg-burgundy text-white rounded-lg p-6 text-center">
                <div className="text-sm mb-2 opacity-90">Available Credits</div>
                <div className="text-5xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  €{stats?.availableCredits || 0}
                </div>
                <div className="text-sm opacity-90">
                  {stats?.availableCredits && stats.availableCredits >= 100
                    ? '✓ Ready to withdraw'
                    : `€${100 - (stats?.availableCredits || 0)} until withdrawal`
                  }
                </div>
              </div>
            )}
          </TabsContent>

          {/* Tab 3: How It Works */}
          <TabsContent value="how" className="p-6 space-y-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-charcoal mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Referral Program Details
                </h3>
                <p className="text-charcoal/70">
                  Share the joy of outdoor adventures and get rewarded when your friends join MadeToHike!
                </p>
              </div>

              <div className="space-y-4">
                <Card className="p-4 bg-cream/30 border-burgundy/10">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-burgundy flex items-center justify-center text-white shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-charcoal mb-1">Invite Hikers</h4>
                      <p className="text-sm text-charcoal/70 mb-2">
                        Earn €25 when someone signs up as a hiker and completes their first tour.
                      </p>
                      <p className="text-xs text-charcoal/60">
                        Your friend also gets €10 off their first booking!
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-cream/30 border-burgundy/10">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-burgundy flex items-center justify-center text-white shrink-0">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-charcoal mb-1">Invite Guides</h4>
                      <p className="text-sm text-charcoal/70 mb-2">
                        Earn €50 when a guide signs up and completes their profile with at least one tour.
                      </p>
                      <p className="text-xs text-charcoal/60">
                        Help grow our community of certified mountain guides!
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="p-5 bg-white border-burgundy/20">
                <h4 className="font-semibold text-charcoal mb-3">Important Terms</h4>
                <ul className="space-y-2 text-sm text-charcoal/70">
                  <li className="flex items-start gap-2">
                    <span className="text-burgundy shrink-0">•</span>
                    <span>No limit on the number of people you can refer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-burgundy shrink-0">•</span>
                    <span>
                      {userType === 'hiker' 
                        ? 'Vouchers are valid for 12 months from issue date'
                        : 'Credits never expire and can be withdrawn when balance reaches €100'
                      }
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-burgundy shrink-0">•</span>
                    <span>Referral must be a new user to MadeToHike</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-burgundy shrink-0">•</span>
                    <span>Rewards are issued after referred user completes required action</span>
                  </li>
                </ul>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
