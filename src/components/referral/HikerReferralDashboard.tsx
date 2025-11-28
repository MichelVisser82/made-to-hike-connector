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
  Ticket
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

export const HikerReferralDashboard = ({ userId }: { userId: string }) => {
  const { profile } = useProfile();
  const { data: stats } = useReferralStats(userId);
  const { data: links } = useReferralLinks(userId, 'hiker', profile?.name?.split(' ')[0] || 'Hiker');
  const { sendInvitation } = useSendInvitation();
  
  const [copiedHiker, setCopiedHiker] = useState(false);
  const [copiedGuide, setCopiedGuide] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [inviteType, setInviteType] = useState<"hiker" | "guide">("hiker");
  const [emailAddress, setEmailAddress] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");

  const handleCopyLink = (type: "hiker" | "guide") => {
    const link = type === "hiker" ? links?.hikerLink : links?.guideLink;
    if (link) {
      navigator.clipboard.writeText(link);
      
      if (type === "hiker") {
        setCopiedHiker(true);
        setTimeout(() => setCopiedHiker(false), 2000);
      } else {
        setCopiedGuide(true);
        setTimeout(() => setCopiedGuide(false), 2000);
      }
      
      toast.success("Link copied to clipboard!");
    }
  };

  const handleShareWhatsApp = (type: "hiker" | "guide") => {
    const link = type === "hiker" ? links?.hikerLink : links?.guideLink;
    if (!link) return;
    
    const message = type === "hiker"
      ? `Hey! I've been using Made to Hike to explore the Alps with certified guides. You should check it out: ${link}`
      : `Hey! Are you a certified mountain guide? You should join Made to Hike - you keep 95% of earnings: ${link}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSendEmail = async () => {
    try {
      await sendInvitation(userId, emailAddress, inviteType, personalMessage);
      setEmailModalOpen(false);
      setEmailAddress("");
      setPersonalMessage("");
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="min-h-screen bg-cream p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl text-charcoal mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Referral Program
          </h1>
          <p className="text-charcoal/70">
            Invite hikers and guides to earn discount vouchers. €25 per hiker, €50 per guide.
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
                <Ticket className="w-8 h-8 text-burgundy" />
              </div>
              <div className="text-3xl text-charcoal mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                {stats?.availableVouchersCount || 0}
              </div>
              <div className="text-sm text-charcoal/60">Available Vouchers</div>
            </CardContent>
          </Card>

          <Card className="border-burgundy/10 bg-burgundy/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Gift className="w-8 h-8 text-burgundy" />
              </div>
              <div className="text-3xl text-burgundy mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                €{stats?.availableVouchersValue || 0}
              </div>
              <div className="text-sm text-charcoal/60">Total Value Available</div>
              {(stats?.pendingVouchersValue || 0) > 0 && (
                <div className="text-xs text-burgundy/70 mt-2">
                  +€{stats?.pendingVouchersValue} pending
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* My Vouchers Section */}
        <Card className="border-burgundy/20 mb-8">
          <CardHeader className="bg-burgundy/5">
            <CardTitle className="flex items-center gap-2 text-charcoal">
              <Ticket className="w-5 h-5 text-burgundy" />
              My Vouchers
            </CardTitle>
            <p className="text-sm text-charcoal/70">Use these discount codes at checkout</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Ticket className="w-16 h-16 text-charcoal/20 mx-auto mb-4" />
              <p className="text-charcoal/60">No available vouchers yet</p>
              <p className="text-sm text-charcoal/50 mt-2">Complete referrals to earn discount vouchers!</p>
            </div>
          </CardContent>
        </Card>

        {/* Referral Links */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Invite Hikers */}
          <Card className="border-burgundy/20">
            <CardHeader className="bg-burgundy/5">
              <CardTitle className="flex items-center gap-2 text-charcoal">
                <Users className="w-5 h-5 text-burgundy" />
                Invite Hikers
              </CardTitle>
              <p className="text-sm text-charcoal/70">Earn €25 when they complete their first tour</p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-4">
                <label className="text-sm text-charcoal/70 mb-2 block">Your Referral Link</label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={links?.hikerLink || ''}
                    className="text-sm bg-cream border-burgundy/20"
                  />
                  <Button
                    onClick={() => handleCopyLink("hiker")}
                    className="bg-burgundy hover:bg-burgundy-dark text-white"
                  >
                    {copiedHiker ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Dialog open={emailModalOpen && inviteType === "hiker"} onOpenChange={(open) => {
                  setEmailModalOpen(open);
                  if (open) setInviteType("hiker");
                }}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-burgundy/30 text-burgundy hover:bg-burgundy/10">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Invite a Hiker</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-charcoal/70 mb-2 block">Email Address</label>
                        <Input
                          type="email"
                          placeholder="hiker@example.com"
                          value={emailAddress}
                          onChange={(e) => setEmailAddress(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-charcoal/70 mb-2 block">Personal Message (Optional)</label>
                        <Textarea
                          placeholder="I thought you'd love exploring the Alps with certified guides..."
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
                  onClick={() => handleShareWhatsApp("hiker")}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Invite Guides */}
          <Card className="border-burgundy/20">
            <CardHeader className="bg-burgundy/10">
              <CardTitle className="flex items-center gap-2 text-charcoal">
                <Users className="w-5 h-5 text-burgundy" />
                Invite Guides
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
                <Dialog open={emailModalOpen && inviteType === "guide"} onOpenChange={(open) => {
                  setEmailModalOpen(open);
                  if (open) setInviteType("guide");
                }}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-burgundy/30 text-burgundy hover:bg-burgundy/10">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Invite a Guide</DialogTitle>
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
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-burgundy mb-3">Inviting Hikers (€25)</h4>
                <ol className="space-y-2 text-sm text-charcoal/70">
                  <li className="flex gap-2">
                    <span className="font-bold text-burgundy">1.</span>
                    <span>Share your referral link with friends</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-burgundy">2.</span>
                    <span>They create an account and book a tour</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-burgundy">3.</span>
                    <span>After completing their first tour, you both get €25 vouchers!</span>
                  </li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold text-burgundy mb-3">Inviting Guides (€50)</h4>
                <ol className="space-y-2 text-sm text-charcoal/70">
                  <li className="flex gap-2">
                    <span className="font-bold text-burgundy">1.</span>
                    <span>Share your guide referral link</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-burgundy">2.</span>
                    <span>They complete verification and publish a tour</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-burgundy">3.</span>
                    <span>After completing their first tour, you get a €50 voucher!</span>
                  </li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
