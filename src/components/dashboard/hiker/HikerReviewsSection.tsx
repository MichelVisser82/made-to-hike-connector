import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Calendar, MapPin, Mountain, Users, Flag, X } from 'lucide-react';

interface HikerReviewsSectionProps {
  userId: string;
  onWriteReview: (tourId: string) => void;
}

export function HikerReviewsSection({ userId, onWriteReview }: HikerReviewsSectionProps) {
  const [activeTab, setActiveTab] = useState('pending');

  // Mock data
  const pendingReviews = [
    {
      id: '1',
      tourTitle: 'Bavarian Alps Trek',
      guide: 'Hans Mueller',
      dates: 'August 5-7, 2024',
      location: 'Garmisch, Germany',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4'
    },
    {
      id: '2',
      tourTitle: 'Alpine Lakes Discovery',
      guide: 'Sophie Laurent',
      dates: 'July 15-16, 2024',
      location: 'Annecy, France',
      image: 'https://images.unsplash.com/photo-1552084117-56a1e49ff5e0'
    }
  ];

  const writtenReviews = [
    {
      id: '1',
      tourTitle: 'Dolomites Via Ferrata',
      guide: 'Marco Rossi',
      rating: 5,
      date: 'September 18, 2024',
      comment: 'Absolutely incredible experience! Marco was professional, knowledgeable, and made us feel safe throughout the entire journey. The via ferrata routes were challenging but so rewarding. Highly recommend!',
      guideResponse: 'Thank you Maria! It was a pleasure guiding you and your group. Hope to see you again soon!',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4'
    },
    {
      id: '2',
      tourTitle: 'Pyrenees Explorer',
      guide: 'Sophie Laurent',
      rating: 5,
      date: 'July 12, 2024',
      comment: 'Sophie is an exceptional guide with deep knowledge of the region. The landscapes were breathtaking and the pace was perfect for our group.',
      image: 'https://images.unsplash.com/photo-1552084117-56a1e49ff5e0'
    }
  ];

  const receivedReviews = [
    {
      id: '1',
      guide: 'Sarah Mountain',
      guideAvatar: '',
      rating: 5,
      date: 'September 2024',
      tourTitle: 'Mont Blanc Summit Trek',
      comment: 'Maria was an excellent hiking companion - punctual, well-prepared, and always positive even in challenging conditions. Would love to guide her again!'
    },
    {
      id: '2',
      guide: 'Marco Rossi',
      guideAvatar: '',
      rating: 5,
      date: 'September 2024',
      tourTitle: 'Dolomites Via Ferrata',
      comment: 'Great energy and enthusiasm throughout the trek. Maria followed all safety instructions perfectly and was a joy to guide.'
    },
    {
      id: '3',
      guide: 'Hans Mueller',
      guideAvatar: '',
      rating: 4,
      date: 'August 2024',
      tourTitle: 'Bavarian Alps Trek',
      comment: 'Pleasant hiker with good fitness level. Enjoyed guiding Maria through the Bavarian Alps.'
    }
  ];

  const regionBadges = [
    { name: 'Alps Explorer', description: 'Completed 5+ treks in the Alps', treks: 8, unlocked: true },
    { name: 'Dolomites Adventurer', description: 'Explored the Dolomites', treks: 2, unlocked: true },
    { name: 'Scottish Highlands', description: 'Trekked in Scotland', treks: 1, unlocked: true },
    { name: 'Pyrenees Pioneer', description: 'Explored the Pyrenees', treks: 1, unlocked: true }
  ];

  const achievementBadges = [
    { name: 'First Summit', description: 'Completed your first mountain summit', unlocked: true },
    { name: '5-Star Reviewer', description: 'Written 5+ reviews', unlocked: true },
    { name: 'Social Hiker', description: 'Joined 10+ group tours', unlocked: true },
    { name: 'Seasoned Explorer', description: 'Complete 10 treks', unlocked: true },
    { name: 'Winter Warrior', description: 'Complete a winter trek', unlocked: false },
    { name: 'Global Trekker', description: 'Trek on 3 continents', unlocked: false }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif mb-2">Reviews & Badges</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">Pending Reviews</TabsTrigger>
          <TabsTrigger value="written">Reviews I've Written</TabsTrigger>
          <TabsTrigger value="received">Reviews I've Received</TabsTrigger>
          <TabsTrigger value="badges">My Badges</TabsTrigger>
        </TabsList>

        {/* Pending Reviews */}
        <TabsContent value="pending" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-serif">Pending Reviews</h2>
            <span className="text-muted-foreground">{pendingReviews.length} reviews to write</span>
          </div>

          <div className="space-y-4">
            {pendingReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <img src={review.image} alt={review.tourTitle} className="w-24 h-24 rounded-lg object-cover" />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{review.tourTitle}</h3>
                      <div className="space-y-1 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>Guide: {review.guide}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{review.dates}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{review.location}</span>
                        </div>
                      </div>
                      <Button onClick={() => onWriteReview(review.id)}>
                        <Star className="w-4 h-4 mr-2" />
                        Write Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Reviews I've Written */}
        <TabsContent value="written" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-serif">Reviews I've Written</h2>
            <span className="text-muted-foreground">{writtenReviews.length} reviews</span>
          </div>

          <div className="space-y-4">
            {writtenReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4 mb-4">
                    <img src={review.image} alt={review.tourTitle} className="w-20 h-20 rounded-lg object-cover" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-5 h-5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                        <span className="text-sm text-muted-foreground ml-2">• {review.date}</span>
                      </div>
                      <h3 className="text-xl font-semibold">{review.tourTitle}</h3>
                      <p className="text-sm text-muted-foreground">Guide: {review.guide}</p>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">{review.comment}</p>
                  
                  {review.guideResponse && (
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="bg-primary text-white text-xs">
                            {review.guide.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">Guide Response</span>
                      </div>
                      <p className="text-sm">{review.guideResponse}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Reviews I've Received */}
        <TabsContent value="received" className="space-y-4">
          <Card className="mb-6">
            <CardContent className="p-8 text-center">
              <div className="text-6xl font-bold mb-2">4.9</div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-6 h-6 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
              <p className="text-sm text-primary mt-2">
                Guides appreciate your professionalism, punctuality, and enthusiasm on tours. You're a valued member of the hiking community!
              </p>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-serif">Reviews I've Received</h2>
            <span className="text-muted-foreground">{receivedReviews.length} reviews</span>
          </div>

          <div className="space-y-4">
            {receivedReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-primary text-white">
                          {review.guide.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{review.guide}</h3>
                        <p className="text-sm text-muted-foreground">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">After: {review.tourTitle}</p>
                  <p className="text-muted-foreground">{review.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* My Badges */}
        <TabsContent value="badges" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-serif">My Badges</h2>
            <span className="text-muted-foreground">{regionBadges.length + achievementBadges.filter(b => b.unlocked).length} badges earned</span>
          </div>

          {/* Region Explorer Badges */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Region Explorer Badges</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {regionBadges.map((badge, idx) => (
                <div key={idx} className="text-center">
                  <div className="w-24 h-24 mx-auto mb-3 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
                    <Mountain className="w-12 h-12 text-white" />
                  </div>
                  <h4 className="font-semibold mb-1">{badge.name}</h4>
                  <p className="text-xs text-muted-foreground mb-1">{badge.description}</p>
                  <p className="text-xs font-medium">{badge.treks} treks</p>
                </div>
              ))}
            </div>
          </div>

          {/* Achievement Badges */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Achievement Badges</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {achievementBadges.map((badge, idx) => (
                <div key={idx} className="text-center">
                  <div className={`w-24 h-24 mx-auto mb-3 rounded-full flex items-center justify-center ${
                    badge.unlocked 
                      ? 'bg-gradient-to-br from-primary to-primary-dark' 
                      : 'bg-gray-200'
                  }`}>
                    {badge.unlocked ? (
                      <Star className="w-12 h-12 text-white" />
                    ) : (
                      <X className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <h4 className={`font-semibold mb-1 ${!badge.unlocked && 'text-muted-foreground'}`}>
                    {badge.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-1">{badge.description}</p>
                  {!badge.unlocked && <p className="text-xs font-medium text-muted-foreground">Locked</p>}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
