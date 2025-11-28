import { useState } from "react";
import { X, Copy, Check, Mail, MessageCircle, Euro, TrendingUp, Gift, Users, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
      <DialogContent className="max-w-[800px] p-0 overflow-hidden">
        {/* Burgundy Header */}
        <div className="bg-gradient-to-r from-burgundy to-burgundy-dark text-white p-6">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Euro className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl text-white mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Earn {userType === 'hiker' ? 'Vouchers' : 'Credits'} by Inviting Friends
                </DialogTitle>
                <p className="text-white/90 text-sm">€25 per hiker • €50 per guide</p>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="share" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-cream/50 rounded-none border-b">
            <TabsTrigger value="share" className="data-[state=active]:bg-white data-[state=active]:text-burgundy">
              Share & Invite
            </TabsTrigger>
            <TabsTrigger value="track" className="data-[state=active]:bg-white data-[state=active]:text-burgundy">
              Track Referrals
            </TabsTrigger>
            <TabsTrigger value="how" className="data-[state=active]:bg-white data-[state=active]:text-burgundy">
              How It Works
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Share & Invite */}
          <TabsContent value="share" className="p-6 space-y-6">
            {/* Callout Box */}
            <div className="bg-cream rounded-lg p-4 border-2 border-burgundy/20">
              <div className="flex items-center gap-2 text-burgundy mb-1">
                <Gift className="w-5 h-5" />
                <span className="font-semibold">They also get €10 welcome discount!</span>
              </div>
              <p className="text-sm text-charcoal/70">
                Your friends receive €10 off their first adventure when they sign up through your link.
              </p>
            </div>

            {/* Invite Hikers Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-charcoal" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Invite Hikers - Earn €25
                </h3>
                <Badge className="bg-burgundy text-white">Most Popular</Badge>
              </div>
              
              <div className="bg-white border border-burgundy/20 rounded-lg p-4 space-y-3">
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={links?.hikerLink || ''}
                    className="flex-1 bg-cream/50"
                  />
                  <Button
                    size="icon"
                    onClick={() => handleCopy(links?.hikerLink || '', 'hiker')}
                    className="bg-burgundy hover:bg-burgundy-dark text-white"
                  >
                    {copiedHiker ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                    onClick={() => handleShareWhatsApp('hiker')}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                    onClick={() => {
                      setInviteType('hiker');
                      document.getElementById('email-input')?.focus();
                    }}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>
            </div>

            {/* Invite Guides Section */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-charcoal" style={{ fontFamily: 'Playfair Display, serif' }}>
                Invite Guides - Earn €50
              </h3>
              
              <div className="bg-white border border-burgundy/20 rounded-lg p-4 space-y-3">
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={links?.guideLink || ''}
                    className="flex-1 bg-cream/50"
                  />
                  <Button
                    size="icon"
                    onClick={() => handleCopy(links?.guideLink || '', 'guide')}
                    className="bg-burgundy hover:bg-burgundy-dark text-white"
                  >
                    {copiedGuide ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                    onClick={() => handleShareWhatsApp('guide')}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                    onClick={() => {
                      setInviteType('guide');
                      document.getElementById('email-input')?.focus();
                    }}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>
            </div>

            {/* Email Invitation Form */}
            <div className="bg-cream/50 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-charcoal">Send Personal Invitation</h4>
              <div className="space-y-2">
                <Input
                  id="email-input"
                  type="email"
                  placeholder="Friend's email address"
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
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-charcoal/70">Inviting as:</span>
                  <div className="flex gap-2">
                    <Badge
                      variant={inviteType === 'hiker' ? 'default' : 'outline'}
                      className={inviteType === 'hiker' ? 'bg-burgundy cursor-pointer' : 'cursor-pointer'}
                      onClick={() => setInviteType('hiker')}
                    >
                      Hiker (€25)
                    </Badge>
                    <Badge
                      variant={inviteType === 'guide' ? 'default' : 'outline'}
                      className={inviteType === 'guide' ? 'bg-burgundy cursor-pointer' : 'cursor-pointer'}
                      onClick={() => setInviteType('guide')}
                    >
                      Guide (€50)
                    </Badge>
                  </div>
                </div>
                <Button
                  onClick={handleSendInvite}
                  disabled={isSending}
                  className="w-full bg-burgundy hover:bg-burgundy-dark text-white"
                >
                  {isSending ? 'Sending...' : 'Send Invitation'}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Track Referrals */}
          <TabsContent value="track" className="p-6 space-y-6">
            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-burgundy/10 to-burgundy/20 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-burgundy mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {stats?.totalReferrals || 0}
                </div>
                <div className="text-sm text-charcoal/70">Total Invited</div>
              </div>
              <div className="bg-gradient-to-br from-sage/10 to-sage/20 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-sage mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {stats?.completedReferrals || 0}
                </div>
                <div className="text-sm text-charcoal/70">Completed</div>
              </div>
              <div className="bg-gradient-to-br from-gold/10 to-gold/20 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-gold mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {stats?.pendingReferrals || 0}
                </div>
                <div className="text-sm text-charcoal/70">In Progress</div>
              </div>
            </div>

            {/* 3-Step Progress */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-charcoal" style={{ fontFamily: 'Playfair Display, serif' }}>
                How Your Referrals Work
              </h3>
              
              <div className="space-y-3">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-burgundy flex items-center justify-center text-white font-bold shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-charcoal mb-1">Friend Signs Up</h4>
                    <p className="text-sm text-charcoal/70">
                      They click your link and create an account
                    </p>
                    <Badge variant="outline" className="mt-2">
                      {stats?.totalReferrals || 0} signed up
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-burgundy flex items-center justify-center text-white font-bold shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-charcoal mb-1">They Book & Complete Tour</h4>
                    <p className="text-sm text-charcoal/70">
                      Your friend books and completes their first adventure
                    </p>
                    <Badge variant="outline" className="mt-2 border-gold text-gold">
                      {stats?.pendingReferrals || 0} in progress
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-sage flex items-center justify-center text-white shrink-0">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-charcoal mb-1">You Get {userType === 'hiker' ? 'Voucher' : 'Credits'}!</h4>
                    <p className="text-sm text-charcoal/70">
                      {userType === 'hiker' 
                        ? 'Receive a discount voucher for your next tour'
                        : 'Credits are added to your account automatically'
                      }
                    </p>
                    <Badge variant="outline" className="mt-2 border-sage text-sage">
                      {stats?.completedReferrals || 0} completed
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Balance/Vouchers */}
            {userType === 'hiker' ? (
              <div className="bg-burgundy text-white rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-semibold">Available Vouchers</span>
                  <Gift className="w-6 h-6" />
                </div>
                <div className="text-4xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {stats?.availableVouchersCount || 0}
                </div>
                <div className="text-sm opacity-90">
                  Total value: €{stats?.availableVouchersValue || 0}
                </div>
              </div>
            ) : (
              <div className="bg-burgundy text-white rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-semibold">Available Credits</span>
                  <Euro className="w-6 h-6" />
                </div>
                <div className="text-4xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
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
                <div className="bg-cream/50 rounded-lg p-4">
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
                </div>

                <div className="bg-cream/50 rounded-lg p-4">
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
                </div>
              </div>

              <div className="bg-white border border-burgundy/20 rounded-lg p-5">
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
                  {userType === 'hiker' && (
                    <li className="flex items-start gap-2">
                      <span className="text-burgundy shrink-0">•</span>
                      <span>Vouchers can be combined with other discounts up to 50% total</span>
                    </li>
                  )}
                </ul>
              </div>

              <div className="text-center">
                <Button
                  onClick={() => {
                    // Switch to Share tab
                    const shareTab = document.querySelector('[value="share"]') as HTMLElement;
                    shareTab?.click();
                  }}
                  className="bg-burgundy hover:bg-burgundy-dark text-white"
                >
                  Start Inviting Friends
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
