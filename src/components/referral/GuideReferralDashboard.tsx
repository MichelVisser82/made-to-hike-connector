import { useState } from "react";
import { 
  Users, 
  Copy, 
  Mail, 
  MessageCircle, 
  CheckCircle2,
  Gift,
  TrendingUp,
  Check,
  Linkedin,
  Twitter,
  DollarSign
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import { useReferralStats } from "@/hooks/useReferralStats";
import { useReferralLinks } from "@/hooks/useReferralLinks";
import { useSendInvitation } from "@/hooks/useSendInvitation";
import { useRequestWithdrawal } from "@/hooks/useRequestWithdrawal";

export const GuideReferralDashboard = ({ userId }: { userId: string }) => {
  const { profile } = useProfile();
  const { data: stats } = useReferralStats(userId);
  const { data: links } = useReferralLinks(userId, 'guide', profile?.name?.split(' ')[0] || 'Guide');
  const { sendInvitation } = useSendInvitation();
  const { requestWithdrawal } = useRequestWithdrawal();
  
  const [copiedGuide, setCopiedGuide] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");

  const handleCopyLink = (type: "guide") => {
    const link = links?.guideLink;
    if (link) {
      navigator.clipboard.writeText(link);
      setCopiedGuide(true);
      setTimeout(() => setCopiedGuide(false), 2000);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleShareWhatsApp = (type: "guide") => {
    const link = links?.guideLink;
    if (!link) return;
    
    const message = `Hey fellow guide! Join Made to Hike where you keep 95% of your earnings. No marketplace fees. ${link}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShareLinkedIn = (type: "guide") => {
    const link = links?.guideLink;
    if (!link) return;
    
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`;
    window.open(linkedinUrl, '_blank', 'width=600,height=400');
  };

  const handleShareTwitter = (type: "guide") => {
    const link = links?.guideLink;
    if (!link) return;
    
    const text = "Join Made to Hike - the guide-first platform where you keep 95% of your earnings";
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const handleSendEmail = async () => {
    try {
      await sendInvitation(userId, emailAddress, "guide", personalMessage);
      setEmailModalOpen(false);
      setEmailAddress("");
      setPersonalMessage("");
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleWithdrawal = async () => {
    const amount = stats?.availableCredits || 0;
    if (amount >= 100) {
      const result = await requestWithdrawal(amount);
      if (result.success) {
        window.location.reload();
      }
    }
  };

  const availableCredits = stats?.availableCredits || 0;
  const canWithdraw = availableCredits >= 100;

  return (
    <div className="min-h-screen bg-cream p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl text-charcoal mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Referral Program
          </h1>
          <p className="text-charcoal/70">
            Invite fellow guides to earn €50 credits per successful referral.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-burgundy/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-burgundy" />
                <TrendingUp className="w-5 h-5 text-burgundy/50" />
              </div>
              <div className="text-3xl text-charcoal mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                {stats?.totalReferrals || 0}
              </div>
              <div className="text-sm text-charcoal/60">Total Invites Sent</div>
            </CardContent>
          </Card>

          <Card className="border-burgundy/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="w-8 h-8 text-burgundy" />
              </div>
              <div className="text-3xl text-charcoal mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                {stats?.acceptedInvites || 0}
              </div>
              <div className="text-sm text-charcoal/60">Accepted Invites</div>
            </CardContent>
          </Card>

          <Card className="border-burgundy/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Gift className="w-8 h-8 text-burgundy" />
              </div>
              <div className="text-3xl text-charcoal mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                {stats?.completedReferrals || 0}
              </div>
              <div className="text-sm text-charcoal/60">Rewards Earned</div>
            </CardContent>
          </Card>

          <Card className="border-burgundy/10 bg-burgundy/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-full bg-burgundy flex items-center justify-center text-white">€</div>
              </div>
              <div className="text-3xl text-burgundy mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                €{stats?.totalCredits || 0}
              </div>
              <div className="text-sm text-charcoal/60">Total Credits Earned</div>
              {(stats?.pendingCredits || 0) > 0 && (
                <div className="text-xs text-burgundy/70 mt-2">
                  +€{stats?.pendingCredits} pending
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Credit Balance & Withdrawal */}
        <Card className="border-burgundy/20 bg-gradient-to-br from-burgundy/5 to-burgundy/10 mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-charcoal/70 mb-2">Available Credits</div>
                <div className="text-4xl text-burgundy mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                  €{availableCredits}
                </div>
                <div className="text-sm text-charcoal/60">
                  Can be used to offset platform fees or withdrawn (min. €100)
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleWithdrawal}
                  className="bg-burgundy hover:bg-burgundy-dark text-white"
                  disabled={!canWithdraw}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Request Withdrawal
                </Button>
                <Button variant="outline" className="border-burgundy/30 text-burgundy">
                  Use on Next Booking
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral Links */}
        <div className="max-w-2xl mx-auto mb-8">
          {/* Invite Guides */}
          <Card className="border-burgundy/20">
            <CardHeader className="bg-burgundy/10">
              <CardTitle className="flex items-center gap-2 text-charcoal">
                <Users className="w-5 h-5 text-burgundy" />
                Invite Fellow Guides
              </CardTitle>
              <p className="text-sm text-charcoal/70">Earn €50 when they complete their first tour</p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-4">
                <label className="text-sm text-charcoal/70 mb-2 block">Your Referral Link</label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={links?.guideLink || ''}
                    className="text-sm bg-cream border-burgundy/20"
                  />
                  <Button
                    onClick={() => handleCopyLink("guide")}
                    className="bg-burgundy hover:bg-burgundy-dark text-white"
                  >
                    {copiedGuide ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-burgundy/30 text-burgundy hover:bg-burgundy/10">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Invite a Fellow Guide</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-charcoal/70 mb-2 block">Email Address</label>
                        <Input
                          type="email"
                          placeholder="guide@example.com"
                          value={emailAddress}
                          onChange={(e) => setEmailAddress(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-charcoal/70 mb-2 block">Personal Message (Optional)</label>
                        <Textarea
                          placeholder="You should join Made to Hike - keep 95% of your earnings..."
                          rows={4}
                          value={personalMessage}
                          onChange={(e) => setPersonalMessage(e.target.value)}
                        />
                      </div>
                      <Button 
                        onClick={handleSendEmail}
                        className="w-full bg-burgundy hover:bg-burgundy-dark text-white"
                      >
                        Send Invitation
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  className="border-burgundy/30 text-burgundy hover:bg-burgundy/10"
                  onClick={() => handleShareWhatsApp("guide")}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>

                <Button
                  variant="outline"
                  className="border-burgundy/30 text-burgundy hover:bg-burgundy/10"
                  onClick={() => handleShareLinkedIn("guide")}
                >
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                </Button>

                <Button
                  variant="outline"
                  className="border-burgundy/30 text-burgundy hover:bg-burgundy/10"
                  onClick={() => handleShareTwitter("guide")}
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="border-burgundy/20">
          <CardHeader className="bg-burgundy/5">
            <CardTitle className="text-charcoal">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-burgundy mb-3">Earn Credits</h4>
                <p className="text-sm text-charcoal/70 mb-3">
                  Invite fellow guides (€50 each). Track their progress through verification, first tour publication, and completion.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-burgundy mb-3">Use Your Credits</h4>
                <ul className="space-y-2 text-sm text-charcoal/70">
                  <li className="flex gap-2">
                    <span className="text-burgundy">•</span>
                    <span><strong>Offset platform fees:</strong> Apply credits to reduce your 5% commission</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-burgundy">•</span>
                    <span><strong>Withdraw cash:</strong> Request payout once you reach €100</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
