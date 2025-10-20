import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Mail, MessageCircle, ChevronDown, Loader2 } from 'lucide-react';
import { type User, type Tour } from '../../types';
import { Badge } from '../ui/badge';
import { useEnhancedGuideInfo } from '@/hooks/useEnhancedGuideInfo';
import { GuideInfoDisplay } from '../guide/GuideInfoDisplay';
import { useGuideProfile } from '@/hooks/useGuideProfile';
import { CertificationBadge } from '../ui/certification-badge';
import { getPrimaryCertification } from '@/utils/guideDataUtils';
import { MainLayout } from '../layout/MainLayout';
import { supabase } from '@/integrations/supabase/client';
import { useTourDateAvailability } from '@/hooks/useTourDateAvailability';

interface BookingFlowProps {
  tour: Tour;
  user: User;
  onComplete: () => void;
  onCancel: () => void;
}

export function BookingFlow({ tour, user, onComplete, onCancel }: BookingFlowProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDateOptions, setShowDateOptions] = useState(false);
  
  // Use unified hook for consistent guide data
  const { guideInfo, isLoading, isLoadingProfessional } = useEnhancedGuideInfo(tour);
  const { data: guideProfile } = useGuideProfile(tour.guide_id);
  const primaryCert = guideProfile?.certifications ? getPrimaryCertification(guideProfile.certifications) : null;
  
  // Fetch real date availability
  const { data: dateSlots } = useTourDateAvailability(tour.id);

  // Transform to format for display
  const dateOptions = dateSlots?.map(slot => ({
    date: slot.slotDate.toISOString().split('T')[0],
    displayDate: slot.slotDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    spotsLeft: slot.spotsRemaining,
    price: slot.price,
    originalPrice: slot.discountPercentage ? slot.price / (1 - slot.discountPercentage / 100) : undefined,
    discount: slot.discountLabel || (slot.isEarlyBird ? 'Early Bird' : undefined),
    savings: slot.discountPercentage ? (slot.price * slot.discountPercentage / 100) : undefined,
    slotId: slot.slotId
  })) || [];
  
  const selectedDateOption = dateOptions.find(d => d.date === selectedDate);
  const tourPrice = selectedDateOption?.price || tour.price;
  const totalPrice = tourPrice;
  
  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create booking with date_slot_id
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert([{
          tour_id: tour.id,
          hiker_id: user.id,
          booking_date: new Date(selectedDate).toISOString().split('T')[0],
          participants: 1,
          total_price: totalPrice,
          currency: tour.currency,
          status: 'pending',
          date_slot_id: selectedDateOption?.slotId || null
        }])
        .select()
        .single();

      if (bookingError) throw bookingError;
      
      // Create conversation for booking
      const { data: conversation } = await supabase
        .from('conversations')
        .insert({
          tour_id: tour.id,
          hiker_id: user.id,
          guide_id: tour.guide_id,
          conversation_type: 'booking_chat'
        })
        .select()
        .single();
      
      // Send automated welcome message
      if (conversation) {
        await supabase.functions.invoke('send-message', {
          body: {
            conversationId: conversation.id,
            content: `Thanks for booking "${tour.title}"! Looking forward to our adventure. Feel free to ask any questions.`,
            senderType: 'guide',
            senderName: tour.guide_display_name,
            automated: true
          }
        });
      }
      
      setIsProcessing(false);
      onComplete();
    } catch (error) {
      console.error('Booking error:', error);
      setIsProcessing(false);
    }
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
    <MainLayout>
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
          <CardHeader className="pb-4">
            <GuideInfoDisplay 
              guideInfo={guideInfo}
              isLoadingProfessional={isLoadingProfessional}
              showBadge={true}
              size="md"
              certifications={guideProfile?.certifications}
              isGuideVerified={guideProfile?.verified ?? false}
              guideSlug={guideProfile?.slug}
            />
            
            {/* Certification Badge - Detailed mode for booking modal */}
            {primaryCert && (
              <div className="mt-4">
                <CertificationBadge 
                  certification={primaryCert}
                  displayMode="detailed"
                  showTooltip={false}
                  isGuideVerified={guideProfile?.verified ?? false}
                />
              </div>
            )}
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
                    {dateOptions.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">No dates available</div>
                    ) : dateOptions.map((option, index) => (
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
                            <div className="font-semibold mb-1">{option.displayDate}</div>
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
    </MainLayout>
  );
}