import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Mail, MessageCircle, Award, ChevronDown, Loader2 } from 'lucide-react';
import { type User, type Tour } from '../../types';
import type { GuideProfile, GuideStats } from '@/types/guide';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useGuideProfile } from '@/hooks/useGuideProfile';
import { useGuideStats } from '@/hooks/useGuideStats';

interface BookingFlowProps {
  tour: Tour;
  user: User;
  guide?: GuideProfile;
  stats?: GuideStats;
  onComplete: () => void;
  onCancel: () => void;
}

// Mock date options with pricing and availability
interface DateOption {
  date: string;
  spotsLeft: number;
  price: number;
  originalPrice?: number;
  discount?: string;
  savings?: number;
}

const mockDateOptions: DateOption[] = [
  { date: 'April 15-17, 2024', spotsLeft: 4, price: 450 },
  { date: 'April 22-24, 2024', spotsLeft: 2, price: 480 },
  { date: 'May 6-8, 2024', spotsLeft: 6, price: 405, originalPrice: 450, discount: 'Early Bird', savings: 45 },
  { date: 'May 13-15, 2024', spotsLeft: 3, price: 450 },
  { date: 'May 20-22, 2024', spotsLeft: 5, price: 427, originalPrice: 450, discount: 'Limited Spots', savings: 23 },
];

export function BookingFlow({ tour, user, guide, stats, onComplete, onCancel }: BookingFlowProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDateOptions, setShowDateOptions] = useState(false);
  
  // Fetch guide data if not provided via props
  const { data: fetchedGuide, isLoading: isLoadingGuide } = useGuideProfile(guide ? undefined : tour.guide_id);
  const { data: fetchedStats, isLoading: isLoadingStats } = useGuideStats(stats ? undefined : tour.guide_id);
  
  // Three-level fallback system
  const guideData = guide || fetchedGuide;
  const statsData = stats || fetchedStats;
  const isLoading = isLoadingGuide || isLoadingStats;
  
  // Enhanced fallbacks using tour object as middle layer
  const guideDisplayName = guide?.display_name || tour.guide_display_name || fetchedGuide?.display_name || 'Professional Guide';
  const guideImage = guide?.profile_image_url || tour.guide_avatar_url || fetchedGuide?.profile_image_url;
  const guideCertification = guide?.certifications?.[0]?.title || fetchedGuide?.certifications?.[0]?.title || 'Certified Professional';
  
  console.log('BookingFlow - Guide data:', {
    propGuide: !!guide,
    tourGuideId: tour.guide_id,
    tourGuideDisplayName: tour.guide_display_name,
    tourGuideAvatarUrl: tour.guide_avatar_url,
    fetchedGuide: !!fetchedGuide,
    fetchedGuideData: fetchedGuide,
    guideDataExperienceYears: guideData?.experience_years,
    guideDataActiveSince: guideData?.active_since,
    guideDataCertifications: guideData?.certifications,
    finalName: guideDisplayName,
    finalCertification: guideCertification
  });
  
  const selectedDateOption = mockDateOptions.find(d => d.date === selectedDate);
  const tourPrice = selectedDateOption?.price || tour.price;
  const totalPrice = tourPrice;
  
  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onComplete();
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {!user.verified && (
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Email verification pending. Your booking will be confirmed once you verify your email address.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader className="relative pb-4">
            <div className="absolute top-6 right-6 w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <div className="flex items-start gap-4 pr-16">
              <Avatar className="h-20 w-20">
                <AvatarImage 
                  src={guideImage || ''} 
                  alt={guideDisplayName} 
                />
                <AvatarFallback>
                  {guideDisplayName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-1">
                  {guideDisplayName}
                </h3>
                <p className="text-primary font-semibold mb-1">
                  {guideCertification}
                </p>
                {(() => {
                  // Use experience_years if available, fallback to calculating from active_since
                  const yearsExperience = guideData?.experience_years ?? (
                    guideData?.active_since 
                      ? new Date().getFullYear() - new Date(guideData.active_since).getFullYear()
                      : 0
                  );
                  
                  if (yearsExperience > 0) {
                    return (
                      <p className="text-sm text-muted-foreground">
                        {yearsExperience}+ years experience
                      </p>
                    );
                  }
                  if (statsData?.tours_completed && statsData.tours_completed > 0) {
                    return (
                      <p className="text-sm text-muted-foreground">
                        {statsData.tours_completed}+ tours completed
                      </p>
                    );
                  }
                  return (
                    <p className="text-sm text-muted-foreground">
                      Experienced professional
                    </p>
                  );
                })()}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Date Selection */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Select Date</h3>
              <div className="relative">
                <button
                  onClick={() => setShowDateOptions(!showDateOptions)}
                  className="w-full p-4 border rounded-lg text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <span className={selectedDate ? "text-foreground" : "text-muted-foreground"}>
                    {selectedDate || "Choose your adventure dates"}
                  </span>
                  <ChevronDown className={`h-5 w-5 transition-transform ${showDateOptions ? 'rotate-180' : ''}`} />
                </button>
                
                {showDateOptions && (
                  <div className="absolute z-50 w-full mt-2 bg-background border rounded-lg shadow-lg overflow-hidden">
                    {mockDateOptions.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedDate(option.date);
                          setShowDateOptions(false);
                        }}
                        className="w-full p-4 hover:bg-muted/50 transition-colors border-b last:border-b-0 text-left"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="font-semibold mb-1">{option.date}</div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">{option.spotsLeft} spots left</span>
                              {option.discount && (
                                <Badge 
                                  variant="secondary" 
                                  className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200"
                                >
                                  {option.discount}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold">
                              {tour.currency === 'EUR' ? '€' : '£'}{option.price}
                            </div>
                            {option.originalPrice && (
                              <>
                                <div className="text-sm text-muted-foreground line-through">
                                  {tour.currency === 'EUR' ? '€' : '£'}{option.originalPrice}
                                </div>
                                <div className="text-sm text-primary font-semibold">
                                  Save {tour.currency === 'EUR' ? '€' : '£'}{option.savings}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Summary */}
            {selectedDate && (
              <Card className="bg-muted/30 border-0">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tour price</span>
                    <span className="text-2xl font-bold">
                      {tour.currency === 'EUR' ? '€' : '£'}{tourPrice}
                    </span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold">Total</span>
                      <span className="text-2xl font-bold text-primary">
                        {tour.currency === 'EUR' ? '€' : '£'}{totalPrice}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Spots Remaining */}
            {selectedDateOption && (
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                <p className="text-center">
                  <span className="font-bold text-primary">{selectedDateOption.spotsLeft} spots remaining</span>
                  <span className="text-muted-foreground"> (max {tour.group_size} hikers)</span>
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handlePayment} 
                className="w-full h-12 text-base"
                disabled={isProcessing || !selectedDate}
              >
                {isProcessing ? 'Processing...' : 'Book Now'}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full h-12 text-base"
                onClick={() => {/* Handle message guide */}}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Message Guide
              </Button>
            </div>

            {/* Tour Summary for Reference */}
            <div className="pt-4 border-t">
              <details className="group">
                <summary className="cursor-pointer font-semibold mb-2 flex items-center justify-between">
                  Tour Details
                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                </summary>
                <div className="bg-muted/30 p-4 rounded-lg mt-2">
                  <div className="space-y-1 text-sm">
                    <p><strong>Tour:</strong> {tour.title}</p>
                    <p><strong>Duration:</strong> {tour.duration}</p>
                    <p><strong>Meeting Point:</strong> {tour.meeting_point}</p>
                  </div>
                </div>
              </details>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}