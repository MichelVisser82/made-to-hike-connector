import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Check, Euro, Gift, Users, CheckCircle, Award, Info, Clock, Sparkles, Send, MessageCircle, Facebook, Twitter, Linkedin, MessageSquare, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
interface ReferralItemProps {
  name: string;
  status: 'completed' | 'pending' | 'signed-up';
  date: string;
  reward: string;
  userType: 'hiker' | 'guide';
  progress?: string;
}
function ReferralItem({
  name,
  status,
  date,
  reward,
  userType,
  progress
}: ReferralItemProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  const statusConfig = {
    completed: {
      badge: 'Completed',
      badgeClass: 'bg-sage/10 text-sage border-sage/20',
      icon: CheckCircle,
      iconClass: 'text-sage'
    },
    pending: {
      badge: 'In Progress',
      badgeClass: 'bg-gold/10 text-gold border-gold/20',
      icon: Clock,
      iconClass: 'text-gold'
    },
    'signed-up': {
      badge: 'Awaiting',
      badgeClass: 'bg-burgundy/10 text-burgundy border-burgundy/20',
      icon: Loader2,
      iconClass: 'text-burgundy animate-spin'
    }
  };
  const config = statusConfig[status];
  const Icon = config.icon;
  return <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-burgundy/10 hover:border-burgundy/20 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-burgundy/10 text-burgundy font-semibold">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-charcoal">{name}</span>
            <Badge variant="outline" className={config.badgeClass}>
              {config.badge}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-charcoal/60">
            <span>{date}</span>
            {progress && <>
                <span>•</span>
                <span>{progress}</span>
              </>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-burgundy font-semibold">
        <Icon className={`w-4 h-4 ${config.iconClass}`} />
        <span>{reward}</span>
      </div>
    </div>;
}
export default function ReferralModal({
  open,
  onOpenChange,
  userId,
  userName,
  userType
}: ReferralModalProps) {
  const navigate = useNavigate();
  const [copiedHiker, setCopiedHiker] = useState(false);
  const [copiedGuide, setCopiedGuide] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const {
    data: stats
  } = useReferralStats(userId);
  const {
    data: links
  } = useReferralLinks(userId, userType, userName.split(' ')[0]);
  const {
    sendInvitation,
    isLoading: isSending
  } = useSendInvitation();
  const rewardAmount = userType === 'hiker' ? '€25' : '€50';
  const primaryLink = userType === 'hiker' ? links?.hikerLink : links?.guideLink;
  const shareMessage = userType === 'hiker' ? `Join MadeToHike and get €15 off your first adventure! I'll earn ${rewardAmount} when you complete your first tour. ${primaryLink}` : `Join MadeToHike as a guide! I'll earn ${rewardAmount} when you complete your first tour. ${primaryLink}`;
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
      await sendInvitation(userId, inviteEmail, userType, personalMessage);
      setInviteEmail("");
      setPersonalMessage("");
    } catch (error) {
      // Error already handled in hook
    }
  };
  const handleShareSocial = (platform: 'whatsapp' | 'facebook' | 'twitter' | 'linkedin') => {
    const encodedMessage = encodeURIComponent(shareMessage);
    const encodedUrl = encodeURIComponent(primaryLink || '');
    const urls = {
      whatsapp: `https://wa.me/?text=${encodedMessage}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    };
    window.open(urls[platform], '_blank');
  };

  const referrals = stats?.referrals || [];
  const meaningfulReferrals = referrals.filter((r: any) => r.referee_id || r.referee_email);
  
  // Split by target type
  const hikerReferrals = meaningfulReferrals.filter((r: any) => r.target_type === 'hiker');
  const guideReferrals = meaningfulReferrals.filter((r: any) => r.target_type === 'guide');
  
  // Hiker stats
  const totalHikerReferrals = hikerReferrals.length;
  const completedHikerReferrals = hikerReferrals.filter((r: any) => r.status === 'completed').length;
  const pendingHikerReferrals = totalHikerReferrals - completedHikerReferrals;
  
  // Guide stats
  const totalGuideReferrals = guideReferrals.length;
  const completedGuideReferrals = guideReferrals.filter((r: any) => r.status === 'completed').length;
  const pendingGuideReferrals = totalGuideReferrals - completedGuideReferrals;
  
  // Overall stats
  const totalReferralsDisplay = meaningfulReferrals.length;
  const completedReferralsDisplay = meaningfulReferrals.filter((r: any) => r.status === 'completed').length;
  const pendingReferralsDisplay = totalReferralsDisplay - completedReferralsDisplay;

  const conversionRate = totalReferralsDisplay
    ? Math.round((completedReferralsDisplay / totalReferralsDisplay) * 100)
    : 0;

  const pendingEarnings = pendingReferralsDisplay > 0
    ? pendingReferralsDisplay * (userType === 'hiker' ? 25 : 50)
    : 0;

  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-burgundy/10">
          <div className="flex items-start gap-3">
            <Gift className="w-6 h-6 text-burgundy flex-shrink-0 mt-1" />
            <div>
              <DialogTitle className="text-2xl text-charcoal mb-1" style={{
              fontFamily: 'Playfair Display, serif'
            }}>
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
          <TabsList className="w-full grid grid-cols-3 rounded-none border-b bg-transparent h-auto p-0">
            <TabsTrigger value="share" className="rounded-none border-b-2 border-transparent data-[state=active]:border-burgundy data-[state=active]:bg-transparent py-3">
              Share & Invite
            </TabsTrigger>
            <TabsTrigger value="track" className="rounded-none border-b-2 border-transparent data-[state=active]:border-burgundy data-[state=active]:bg-transparent py-3">
              Track Referrals
            </TabsTrigger>
            <TabsTrigger value="how" className="rounded-none border-b-2 border-transparent data-[state=active]:border-burgundy data-[state=active]:bg-transparent py-3">
              How It Works
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Share & Invite */}
          <TabsContent value="share" className="p-6">
            <Tabs defaultValue={userType === 'hiker' ? 'invite-hikers' : 'invite-guides'} className="w-full">
              {/* Nested tab selector */}
              <TabsList className={`grid w-full mb-6 ${userType === 'hiker' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {userType === 'hiker' && (
                  <TabsTrigger value="invite-hikers">Invite Hikers (€25)</TabsTrigger>
                )}
                <TabsTrigger value="invite-guides">Invite Guides (€50)</TabsTrigger>
              </TabsList>

              {/* Hiker Invites Content */}
              {userType === 'hiker' && (
                <TabsContent value="invite-hikers" className="space-y-6">
                  {/* Reward Highlight */}
                  <Card className="p-6 bg-gradient-to-br from-sage/10 to-sage/5 border-sage/20">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-sage flex items-center justify-center flex-shrink-0">
                        <Euro className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-3xl mb-2 text-charcoal" style={{ fontFamily: 'Playfair Display, serif' }}>
                          Earn €25
                        </h3>
                        <p className="text-charcoal/70 mb-4">For each hiker who joins and completes their first tour</p>
                        <Card className="p-4 bg-white border-burgundy/10">
                          <div className="flex items-start gap-2">
                            <Award className="w-5 h-5 text-burgundy flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-charcoal mb-1">They also get €15 welcome discount!</p>
                              <p className="text-sm text-charcoal/70">
                                It's a win-win. Your friends get a great discount, and you earn rewards.
                              </p>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </Card>

                  {/* Referral Link */}
                  <div>
                    <h4 className="font-semibold text-charcoal mb-3">Your Personal Referral Link</h4>
                    <div className="flex gap-2">
                      <Input value={links?.hikerLink || ''} readOnly className="bg-cream/50 border-burgundy/20 font-mono text-sm flex-1" />
                      <Button onClick={() => handleCopy(links?.hikerLink || '', 'hiker')} className="bg-burgundy hover:bg-burgundy/90 text-white px-6">
                        {copiedHiker ? (
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
                      Share this unique link to track your hiker referrals automatically
                    </p>
                  </div>

                  {/* Email Invitation */}
                  <div>
                    <h4 className="font-semibold text-charcoal mb-3">Invite via Email</h4>
                    <div className="space-y-3">
                      <Input 
                        type="email" 
                        placeholder="friend@email.com" 
                        value={inviteEmail} 
                        onChange={e => setInviteEmail(e.target.value)} 
                        className="bg-white" 
                      />
                      <div>
                        <label className="text-sm text-charcoal/70 mb-2 block">
                          Personal Message (Optional)
                        </label>
                        <Textarea
                          placeholder="I thought you'd love exploring the Alps with certified guides..."
                          value={personalMessage}
                          onChange={e => setPersonalMessage(e.target.value)}
                          className="bg-white resize-none"
                          rows={3}
                        />
                      </div>
                      <Button 
                        onClick={handleSendInvite} 
                        disabled={isSending || !inviteEmail} 
                        className="bg-burgundy hover:bg-burgundy/90 text-white w-full"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {isSending ? 'Sending...' : 'Send Invitation'}
                      </Button>
                    </div>
                    <p className="text-xs text-charcoal/60 mt-2">
                      We'll send them a personalized invitation with your referral link
                    </p>
                  </div>

                  {/* Social Media Sharing */}
                  <div>
                    <h4 className="font-semibold text-charcoal mb-3">Share on Social Media</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Button variant="outline" className="border-burgundy/30 text-burgundy hover:bg-burgundy/5" onClick={() => handleShareSocial('whatsapp')}>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp
                      </Button>
                      <Button variant="outline" className="border-burgundy/30 text-burgundy hover:bg-burgundy/5" onClick={() => handleShareSocial('facebook')}>
                        <Facebook className="w-4 h-4 mr-2" />
                        Facebook
                      </Button>
                      <Button variant="outline" className="border-burgundy/30 text-burgundy hover:bg-burgundy/5" onClick={() => handleShareSocial('twitter')}>
                        <Twitter className="w-4 h-4 mr-2" />
                        Twitter
                      </Button>
                      <Button variant="outline" className="border-burgundy/30 text-burgundy hover:bg-burgundy/5" onClick={() => handleShareSocial('linkedin')}>
                        <Linkedin className="w-4 h-4 mr-2" />
                        LinkedIn
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              )}

              {/* Guide Invites Content */}
              <TabsContent value="invite-guides" className="space-y-6">
                {/* Reward Highlight */}
                <Card className="p-6 bg-gradient-to-br from-sage/10 to-sage/5 border-sage/20">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-sage flex items-center justify-center flex-shrink-0">
                      <Euro className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl mb-2 text-charcoal" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Earn €50
                      </h3>
                      <p className="text-charcoal/70">For each guide who joins and completes their first tour</p>
                    </div>
                  </div>
                </Card>

                {/* Referral Link */}
                <div>
                  <h4 className="font-semibold text-charcoal mb-3">Your Personal Referral Link</h4>
                  <div className="flex gap-2">
                    <Input value={links?.guideLink || ''} readOnly className="bg-cream/50 border-burgundy/20 font-mono text-sm flex-1" />
                    <Button onClick={() => handleCopy(links?.guideLink || '', 'guide')} className="bg-burgundy hover:bg-burgundy/90 text-white px-6">
                      {copiedGuide ? (
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
                    Share this unique link to track your guide referrals automatically
                  </p>
                </div>

                {/* Email Invitation */}
                <div>
                  <h4 className="font-semibold text-charcoal mb-3">Invite via Email</h4>
                  <div className="space-y-3">
                    <Input 
                      type="email" 
                      placeholder="friend@email.com" 
                      value={inviteEmail} 
                      onChange={e => setInviteEmail(e.target.value)} 
                      className="bg-white" 
                    />
                    <div>
                      <label className="text-sm text-charcoal/70 mb-2 block">
                        Personal Message (Optional)
                      </label>
                      <Textarea
                        placeholder="I thought you'd love exploring the Alps with certified guides..."
                        value={personalMessage}
                        onChange={e => setPersonalMessage(e.target.value)}
                        className="bg-white resize-none"
                        rows={3}
                      />
                    </div>
                    <Button 
                      onClick={handleSendInvite} 
                      disabled={isSending || !inviteEmail} 
                      className="bg-burgundy hover:bg-burgundy/90 text-white w-full"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSending ? 'Sending...' : 'Send Invitation'}
                    </Button>
                  </div>
                  <p className="text-xs text-charcoal/60 mt-2">
                    We'll send them a personalized invitation with your referral link
                  </p>
                </div>

                {/* Social Media Sharing */}
                <div>
                  <h4 className="font-semibold text-charcoal mb-3">Share on Social Media</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button variant="outline" className="border-burgundy/30 text-burgundy hover:bg-burgundy/5" onClick={() => handleShareSocial('whatsapp')}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                    <Button variant="outline" className="border-burgundy/30 text-burgundy hover:bg-burgundy/5" onClick={() => handleShareSocial('facebook')}>
                      <Facebook className="w-4 h-4 mr-2" />
                      Facebook
                    </Button>
                    <Button variant="outline" className="border-burgundy/30 text-burgundy hover:bg-burgundy/5" onClick={() => handleShareSocial('twitter')}>
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </Button>
                    <Button variant="outline" className="border-burgundy/30 text-burgundy hover:bg-burgundy/5" onClick={() => handleShareSocial('linkedin')}>
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Tab 2: Track Referrals */}
          <TabsContent value="track" className="p-6 space-y-6">
            {/* Combined Referral Stats */}
            <div>
              <h3 className="text-lg font-semibold text-charcoal mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Your Referrals
              </h3>
              
              {/* Hiker Invites Row */}
              {userType === 'hiker' && totalHikerReferrals > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-charcoal/70 mb-3">Hiker Invites</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-4 text-center bg-white border-burgundy/10">
                      <Users className="w-6 h-6 text-burgundy mx-auto mb-2" />
                      <div className="text-3xl font-bold text-burgundy mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {totalHikerReferrals}
                      </div>
                      <div className="text-xs text-charcoal/70">Total Invites</div>
                    </Card>
                    <Card className="p-4 text-center bg-white border-gold/20">
                      <Clock className="w-6 h-6 text-gold mx-auto mb-2" />
                      <div className="text-3xl font-bold text-gold mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {pendingHikerReferrals}
                      </div>
                      <div className="text-xs text-charcoal/70">Pending</div>
                    </Card>
                    <Card className="p-4 text-center bg-white border-sage/20">
                      <CheckCircle className="w-6 h-6 text-sage mx-auto mb-2" />
                      <div className="text-3xl font-bold text-sage mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {completedHikerReferrals}
                      </div>
                      <div className="text-xs text-charcoal/70">Completed</div>
                    </Card>
                    <Card className="p-4 text-center bg-gradient-to-br from-sage to-sage/80 text-white border-0">
                      <Euro className="w-6 h-6 text-white mx-auto mb-2" />
                      <div className="text-3xl font-bold mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                        €{completedHikerReferrals * 25}
                      </div>
                      <div className="text-xs opacity-90">Earned (€25/hiker)</div>
                    </Card>
                  </div>
                </div>
              )}

              {/* Guide Invites Row */}
              {totalGuideReferrals > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-charcoal/70 mb-3">Guide Invites</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-4 text-center bg-white border-burgundy/10">
                      <Users className="w-6 h-6 text-burgundy mx-auto mb-2" />
                      <div className="text-3xl font-bold text-burgundy mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {totalGuideReferrals}
                      </div>
                      <div className="text-xs text-charcoal/70">Total Invites</div>
                    </Card>
                    <Card className="p-4 text-center bg-white border-gold/20">
                      <Clock className="w-6 h-6 text-gold mx-auto mb-2" />
                      <div className="text-3xl font-bold text-gold mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {pendingGuideReferrals}
                      </div>
                      <div className="text-xs text-charcoal/70">Pending</div>
                    </Card>
                    <Card className="p-4 text-center bg-white border-sage/20">
                      <CheckCircle className="w-6 h-6 text-sage mx-auto mb-2" />
                      <div className="text-3xl font-bold text-sage mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {completedGuideReferrals}
                      </div>
                      <div className="text-xs text-charcoal/70">Completed</div>
                    </Card>
                    <Card className="p-4 text-center bg-gradient-to-br from-sage to-sage/80 text-white border-0">
                      <Euro className="w-6 h-6 text-white mx-auto mb-2" />
                      <div className="text-3xl font-bold mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                        €{completedGuideReferrals * 50}
                      </div>
                      <div className="text-xs opacity-90">Earned (€50/guide)</div>
                    </Card>
                  </div>
                </div>
              )}

              {/* No referrals yet state */}
              {totalHikerReferrals === 0 && totalGuideReferrals === 0 && (
                <Card className="p-8 text-center bg-cream/30 border-burgundy/10">
                  <Users className="w-12 h-12 text-burgundy/40 mx-auto mb-4" />
                  <h4 className="font-semibold text-charcoal mb-2">No referrals yet</h4>
                  <p className="text-sm text-charcoal/60">
                    Share your referral link to start earning rewards!
                  </p>
                </Card>
              )}
            </div>

            {/* Conversion Rate */}
            {totalReferralsDisplay > 0 && (
              <Card className="p-5 bg-white border-burgundy/10">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-charcoal">Conversion Rate</h4>
                  <span
                    className="text-2xl font-bold text-burgundy"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  >
                    {conversionRate}%
                  </span>
                </div>
                <Progress value={conversionRate} className="h-2" />
                <p className="text-xs text-charcoal/60 mt-2">
                  {completedReferralsDisplay} of {totalReferralsDisplay} referrals completed their first tour
                </p>
              </Card>
            )}

            {/* Referral List */}
            <div>
              <h3 className="text-lg font-semibold text-charcoal mb-4" style={{
              fontFamily: 'Playfair Display, serif'
            }}>
                Your Referrals
              </h3>
              
              {stats?.totalReferrals && stats.totalReferrals > 0 ? (
                <Card className="p-8 text-center bg-cream/30 border-burgundy/10">
                  <Users className="w-12 h-12 text-burgundy/40 mx-auto mb-4" />
                  <h4 className="font-semibold text-charcoal mb-2">Referral details</h4>
                  <p className="text-sm text-charcoal/60">
                    Your actual referral activity will appear here once detailed data is available.
                  </p>
                </Card>
              ) : (
                <Card className="p-8 text-center bg-cream/30 border-burgundy/10">
                  <Users className="w-12 h-12 text-burgundy/40 mx-auto mb-4" />
                  <h4 className="font-semibold text-charcoal mb-2">No referrals yet</h4>
                  <p className="text-sm text-charcoal/60">
                    Share your referral link to start earning rewards!
                  </p>
                </Card>
              )}
            </div>

            {/* Current Balance */}
            {userType === 'hiker' ? <div className="bg-burgundy text-white rounded-lg p-6 text-center">
                <div className="text-sm mb-2 opacity-90">Available Vouchers</div>
                <div className="text-5xl font-bold mb-2" style={{
              fontFamily: 'Playfair Display, serif'
            }}>
                  {stats?.availableVouchersCount || 0}
                </div>
                <div className="text-sm opacity-90">
                  Total value: €{stats?.availableVouchersValue || 0}
                </div>
              </div> : <div className="bg-burgundy text-white rounded-lg p-6 text-center">
                <div className="text-sm mb-2 opacity-90">Available Credits</div>
                <div className="text-5xl font-bold mb-2" style={{
              fontFamily: 'Playfair Display, serif'
            }}>
                  €{stats?.availableCredits || 0}
                </div>
                <div className="text-sm opacity-90">
                  {stats?.availableCredits && stats.availableCredits >= 100 ? '✓ Ready to withdraw' : `€${100 - (stats?.availableCredits || 0)} until withdrawal`}
                </div>
              </div>}
          </TabsContent>

          {/* Tab 3: How It Works */}
          <TabsContent value="how" className="p-6 space-y-6">
            {/* Main Process */}
            <Card className="p-6 bg-gradient-to-br from-burgundy/5 to-burgundy/10 border-burgundy/20">
              <h3 className="text-xl font-semibold text-charcoal mb-4" style={{
              fontFamily: 'Playfair Display, serif'
            }}>
                {userType === 'hiker' ? 'Share Adventures, Earn Rewards' : 'Grow Our Guide Community'}
              </h3>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-burgundy flex items-center justify-center text-white font-bold shrink-0">
                    1
                  </div>
                  <div className="flex-1 pt-2">
                    <h4 className="font-semibold text-charcoal mb-1">Share Your Link</h4>
                    <p className="text-sm text-charcoal/70">Send your unique referral link to fellow guides via email, social media, or messaging</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-burgundy flex items-center justify-center text-white font-bold shrink-0">
                    2
                  </div>
                  <div className="flex-1 pt-2">
                    <h4 className="font-semibold text-charcoal mb-1">They Sign Up</h4>
                    <p className="text-sm text-charcoal/70">
                      Your friend creates an account using your referral link
                      {userType === 'hiker' && ' and gets €10 welcome discount'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-burgundy flex items-center justify-center text-white font-bold shrink-0">
                    3
                  </div>
                  <div className="flex-1 pt-2">
                    <h4 className="font-semibold text-charcoal mb-1">They Complete First Action</h4>
                    <p className="text-sm text-charcoal/70">
                      {userType === 'hiker' ? 'Your friend books and completes their first hiking tour' : 'The new guide publishes their first tour and receives a booking'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-sage flex items-center justify-center text-white shrink-0">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1 pt-2">
                    <h4 className="font-semibold text-charcoal mb-1">Get Your Reward!</h4>
                    <p className="text-sm text-charcoal/70">
                      {userType === 'hiker' ? `Receive a ${rewardAmount} voucher for your next adventure` : `Earn ${rewardAmount} in platform credits, withdrawable once you reach €100`}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Benefits & Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-5 bg-white border-sage/20">
                <h4 className="font-semibold text-charcoal mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-sage" />
                  Key Benefits
                </h4>
                <ul className="space-y-2 text-sm text-charcoal/70">
                  <li className="flex items-start gap-2">
                    <span className="text-sage shrink-0">✓</span>
                    <span>No limit on referrals - invite as many friends as you want</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sage shrink-0">✓</span>
                    <span>Automatic tracking and reward processing</span>
                  </li>
                  {userType === 'hiker' && <li className="flex items-start gap-2">
                      <span className="text-sage shrink-0">✓</span>
                      <span>Your friends get €10 discount on their first booking</span>
                    </li>}
                  <li className="flex items-start gap-2">
                    <span className="text-sage shrink-0">✓</span>
                    <span>
                      {userType === 'hiker' ? 'Vouchers valid for 12 months from issue' : 'Credits never expire and are withdrawable'}
                    </span>
                  </li>
                </ul>
              </Card>

              <Card className="p-5 bg-white border-burgundy/20">
                <h4 className="font-semibold text-charcoal mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-burgundy" />
                  Important Terms
                </h4>
                <ul className="space-y-2 text-sm text-charcoal/70">
                  <li className="flex items-start gap-2">
                    <span className="text-burgundy shrink-0">•</span>
                    <span>Referral must be a new user to MadeToHike</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-burgundy shrink-0">•</span>
                    <span>Rewards issued after referred user completes first tour with paying customers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-burgundy shrink-0">•</span>
                    <span>Self-referrals and fraudulent activity will result in disqualification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-burgundy shrink-0">•</span>
                    <span>MadeToHike reserves the right to modify or terminate the program</span>
                  </li>
                </ul>
              </Card>
            </div>

            {/* FAQ Section */}
            <div>
              <h3 className="text-lg font-semibold text-charcoal mb-4" style={{
              fontFamily: 'Playfair Display, serif'
            }}>
                Frequently Asked Questions
              </h3>
              <div className="space-y-3">
                <Card className="p-4 bg-white border-burgundy/10">
                  <h4 className="font-semibold text-charcoal mb-2">How long does it take to receive my reward?</h4>
                  <p className="text-sm text-charcoal/70">
                    Rewards are automatically credited within 24-48 hours after your referral completes their first paid tour. You'll receive an email notification when your reward is available.
                  </p>
                </Card>

                <Card className="p-4 bg-white border-burgundy/10">
                  <h4 className="font-semibold text-charcoal mb-2">Is there a limit to how many people I can refer?</h4>
                  <p className="text-sm text-charcoal/70">
                    No! There's no limit on the number of referrals. The more friends you invite, the more rewards you can earn. We encourage you to share the adventure with everyone you know.
                  </p>
                </Card>

                <Card className="p-4 bg-white border-burgundy/10">
                  <h4 className="font-semibold text-charcoal mb-2">What if my referral doesn't complete their first tour?</h4>
                  <p className="text-sm text-charcoal/70">You'll only receive your reward once the referral completes their first paid tour. If they sign up but don't set up a tour, the referral will remain pending. </p>
                </Card>
              </div>
            </div>

            {/* Contact Support */}
            <Card className="p-5 bg-cream border-burgundy/10">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-6 h-6 text-burgundy flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h4 className="font-semibold text-charcoal mb-1">Have more questions?</h4>
                  <p className="text-sm text-charcoal/70 mb-3">
                    Our support team is here to help with any questions about the referral program.
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                    onClick={() => {
                      onOpenChange(false);
                      navigate('/help');
                    }}
                  >
                    Contact Support
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>;
}