import { useState, useEffect } from 'react';
import { MapPin, CheckCircle, Star, Users, Clock, Award, MessageCircle, Mail, Heart, UserPlus, Share2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { GuideProfile, GuideStats } from '@/types/guide';
import { useWebsiteImages } from '@/hooks/useWebsiteImages';
import { useFollowedGuides } from '@/hooks/useFollowedGuides';
import { supabase } from '@/integrations/supabase/client';

interface GuideHeroSectionProps {
  guide: GuideProfile;
  stats: GuideStats;
}

export function GuideHeroSection({ guide, stats }: GuideHeroSectionProps) {
  const [fallbackHeroUrl, setFallbackHeroUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | undefined>();
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const { fetchImages, getImageUrl } = useWebsiteImages();
  const { toast } = useToast();

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  // Follow functionality
  const { isGuideFollowed, toggleFollowGuide } = useFollowedGuides(userId);
  const isFollowing = isGuideFollowed(guide.user_id);

  const activeSinceYear = guide.active_since 
    ? new Date(guide.active_since).getFullYear()
    : new Date().getFullYear();
  
  const experienceYears = guide.experience_years || (new Date().getFullYear() - activeSinceYear);
  const reviewCount = stats.review_count || 0;
  const responseTime = '2 hours'; // This should come from guide data

  useEffect(() => {
    const loadFallbackImage = async () => {
      if (!guide.hero_background_url) {
        // Fetch images from website_images table for this guide
        const guideImages = await fetchImages({ guide_id: guide.user_id });
        
        if (guideImages && guideImages.length > 0) {
          // Prioritize hero images, then landscapes, then any image
          const heroImages = guideImages.filter(img => 
            img.category === 'hero' || img.usage_context?.includes('hero')
          );
          const landscapeImages = guideImages.filter(img => 
            img.category === 'landscape' || img.usage_context?.includes('landscape')
          );
          
          const imageToUse = heroImages[0] || landscapeImages[0] || guideImages[0];
          const imageUrl = getImageUrl(imageToUse);
          setFallbackHeroUrl(imageUrl);
        }
      }
    };

    loadFallbackImage();
  }, [guide.hero_background_url, guide.user_id, fetchImages, getImageUrl]);

  return (
    <section className="relative w-full overflow-hidden lg:h-[480px]">
      {/* Hero Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: guide.hero_background_url 
            ? `url(${guide.hero_background_url})` 
            : fallbackHeroUrl
            ? `url(${fallbackHeroUrl})`
            : 'linear-gradient(135deg, #1a4d2e 0%, #2d5f3e 25%, #4a7c59 50%, #6b9377 75%, #8ba888 100%)',
        }}
      >
        {/* Lighter gradient overlays to show more of the image */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/15 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 md:h-40 bg-gradient-to-b from-transparent to-cream-light" />
      </div>

      {/* Content - Positioned at bottom */}
      <div className="relative container mx-auto px-4 lg:h-full lg:flex lg:items-end lg:pb-8">
        {/* Share Button - Icon Only */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-40 text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm"
          onClick={() => {
            const guideUrl = window.location.href;
            if (navigator.share) {
              navigator.share({
                title: guide.display_name,
                text: `Check out ${guide.display_name}'s guide profile`,
                url: guideUrl
              }).catch(() => {});
            } else {
              navigator.clipboard.writeText(guideUrl);
            }
          }}
          aria-label="Share guide profile"
        >
          <Share2 className="h-4 w-4" />
        </Button>

        {/* Follow Button - Top Right */}
        <Button
          variant="ghost"
          size="sm"
          className={`absolute top-4 right-4 backdrop-blur-sm ${isFollowing 
            ? 'text-burgundy bg-white/90 hover:bg-white hover:text-burgundy-dark' 
            : 'text-white bg-white/20 hover:bg-white/30'
          }`}
          onClick={() => toggleFollowGuide(guide.user_id)}
        >
          {isFollowing ? (
            <CheckCircle className="h-4 w-4 mr-2" />
          ) : (
            <UserPlus className="h-4 w-4 mr-2" />
          )}
          {isFollowing ? 'Following' : 'Follow Guide'}
        </Button>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between lg:gap-6 w-full py-8 lg:py-0">
          {/* Left Side - Profile + Info */}
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start flex-1">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48">
                <img
                  src={guide.profile_image_url || 'https://via.placeholder.com/176'}
                  alt={guide.display_name}
                  className="w-full h-full rounded-full object-cover border-4 border-white shadow-2xl"
                />
                {guide.verified && (
                  <div className="absolute bottom-2 right-2 bg-burgundy rounded-full p-2.5 shadow-lg border-3 border-white">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Name, Location & Stats */}
            <div className="flex-1 text-center md:text-left">
              {/* Name */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-white mb-2 leading-tight" style={{fontFamily: 'Playfair Display, serif'}}>
                {guide.display_name}
              </h1>

              {/* Subtitle */}
              <p className="text-white text-base md:text-lg mb-2">
                Certified Mountain Guide - {experienceYears} Years Experience
              </p>

              {/* Location */}
              {guide.location && (
                <div className="flex items-center justify-center md:justify-start gap-2 text-white text-base mb-4">
                  <MapPin className="w-5 h-5" />
                  <span>{guide.location}</span>
                </div>
              )}

              {/* Stats Card - Compact with 2x2 grid */}
              <Card className="bg-white/95 backdrop-blur-sm shadow-xl rounded-xl p-4 max-w-xl">
                <div className="grid grid-cols-2 gap-4">
                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-gold fill-gold flex-shrink-0" />
                    <div>
                      <span className="font-bold text-charcoal text-base">{stats.average_rating.toFixed(1)}</span>
                      <span className="text-charcoal/60 text-xs ml-1">({reviewCount} reviews)</span>
                    </div>
                  </div>

                  {/* Tours */}
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-burgundy flex-shrink-0" />
                    <div>
                      <span className="font-bold text-charcoal text-base">{stats.tours_completed}+</span>
                      <span className="text-charcoal/60 text-xs ml-1">tours</span>
                    </div>
                  </div>

                  {/* Response Time */}
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-burgundy flex-shrink-0" />
                    <div>
                      <span className="font-bold text-charcoal text-base">{responseTime}</span>
                      <span className="text-charcoal/60 text-xs ml-1">response</span>
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-burgundy flex-shrink-0" />
                    <div>
                      <span className="font-bold text-charcoal text-base">{experienceYears}</span>
                      <span className="text-charcoal/60 text-xs ml-1">years experience</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Contact Card - Compact, aligned to bottom */}
          <Card className="hidden lg:block lg:flex-shrink-0 lg:w-64 bg-white/95 backdrop-blur-sm shadow-xl rounded-xl p-4">
            <h3 className="text-lg font-semibold text-charcoal mb-3">
              Contact {guide.display_name.split(' ')[0]}
            </h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-charcoal/70">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs">Responds within 2 hours</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">99% response rate</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button 
                className="w-full bg-burgundy hover:bg-burgundy/90 text-white text-sm py-2"
                onClick={() => setMessageModalOpen(true)}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Send Message
              </Button>
              <Button variant="outline" className="w-full border-burgundy text-burgundy hover:bg-burgundy/10 text-sm py-2">
                <Mail className="w-4 h-4 mr-2" />
                Request Custom Tour
              </Button>
            </div>
          </Card>
        </div>

        {/* Contact Card - Mobile/Tablet */}
        <Card className="lg:hidden mt-6 bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl p-5 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-charcoal mb-3 sm:mb-4">
            Contact {guide.display_name.split(' ')[0]}
          </h3>
          
          <div className="space-y-2 sm:space-y-3 mb-5 sm:mb-6">
            <div className="flex items-center gap-2 text-charcoal/70">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm">Responds within 2 hours</span>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">99% response rate</span>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <Button 
              className="w-full bg-burgundy hover:bg-burgundy/90 text-white text-sm sm:text-base py-2.5 sm:py-3"
              onClick={() => setMessageModalOpen(true)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Send Message
            </Button>
            <Button variant="outline" className="w-full border-burgundy text-burgundy hover:bg-burgundy/10 text-sm sm:text-base py-2.5 sm:py-3">
              <Mail className="w-4 h-4 mr-2" />
              Request Custom Tour
            </Button>
          </div>
        </Card>
      </div>

      {/* Message Modal */}
      <Dialog open={messageModalOpen} onOpenChange={setMessageModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-playfair text-charcoal">Message {guide.display_name}</DialogTitle>
            <DialogDescription className="text-charcoal/70">
              Send a message to inquire about tours or ask questions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Type your message here..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={5}
            />
            <div className="flex justify-end">
              <Button
                disabled={sendingMessage || !messageText.trim()}
                onClick={async () => {
                  if (!messageText.trim()) return;

                  setSendingMessage(true);
                  try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) {
                      toast({
                        title: 'Authentication required',
                        description: 'Please sign in to send a message.',
                        variant: 'destructive',
                      });
                      return;
                    }

                    // Find or create conversation with this guide
                    let conversationId: string;
                    
                    const { data: existingConv } = await supabase
                      .from('conversations')
                      .select('id')
                      .eq('hiker_id', user.id)
                      .eq('guide_id', guide.user_id)
                      .is('booking_id', null)
                      .maybeSingle();

                    if (existingConv) {
                      conversationId = existingConv.id;
                    } else {
                      const { data: newConv, error: convError } = await supabase
                        .from('conversations')
                        .insert({
                          hiker_id: user.id,
                          guide_id: guide.user_id,
                          conversation_type: 'general'
                        })
                        .select('id')
                        .single();

                      if (convError) throw convError;
                      conversationId = newConv.id;
                    }

                    // Send message
                    const { error: sendError } = await supabase.functions.invoke('send-message', {
                      body: {
                        conversationId,
                        content: messageText.trim(),
                        senderType: 'hiker'
                      }
                    });

                    if (sendError) throw sendError;

                    toast({
                      title: 'Message sent',
                      description: `Your message has been sent to ${guide.display_name}.`,
                    });

                    setMessageText('');
                    setMessageModalOpen(false);
                  } catch (error) {
                    console.error('Error sending message:', error);
                    toast({
                      title: 'Error',
                      description: 'Failed to send message. Please try again.',
                      variant: 'destructive',
                    });
                  } finally {
                    setSendingMessage(false);
                  }
                }}
                className="bg-burgundy hover:bg-burgundy/90 text-white"
              >
                {sendingMessage ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
