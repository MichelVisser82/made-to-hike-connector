import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [bookingReference, setBookingReference] = useState<string>('');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const createBooking = async () => {
      if (!sessionId) {
        toast.error('Invalid payment session');
        navigate('/');
        return;
      }

      try {
        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          console.error('Error getting user:', authError);
          toast.error('Authentication required');
          navigate('/');
          return;
        }

        // Verify the session and create booking
        const { data: sessionData, error: sessionError } = await supabase.functions.invoke('verify-payment-session', {
          body: { sessionId }
        });

        if (sessionError || !sessionData) {
          console.error('Error verifying session:', sessionError);
          toast.error('Failed to verify payment');
          navigate('/');
          return;
        }

        // Check if profile exists, create if not
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, date_of_birth')
          .eq('id', user.id)
          .single();

        if (!existingProfile) {
          console.log('Creating profile for user:', user.id);
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email!,
              name: sessionData.bookingData.participants?.[0]?.firstName + ' ' + sessionData.bookingData.participants?.[0]?.surname || user.email!
            });

          if (profileError) {
            console.error('Error creating profile:', profileError);
          }
        }

        // Update profile with booking contact information
        const profileUpdateData: any = {
          phone: sessionData.bookingData.phone,
          country: sessionData.bookingData.country,
          emergency_contact_name: sessionData.bookingData.emergencyContactName,
          emergency_contact_phone: sessionData.bookingData.emergencyContactPhone,
          emergency_contact_relationship: sessionData.bookingData.emergencyContactRelationship,
        };

        // Add dietary preferences if present
        if (sessionData.bookingData.dietaryPreferences?.length > 0) {
          profileUpdateData.dietary_preferences = sessionData.bookingData.dietaryPreferences;
        }

        // Add accessibility needs if present
        if (sessionData.bookingData.accessibilityNeeds) {
          profileUpdateData.accessibility_needs = sessionData.bookingData.accessibilityNeeds;
        }

        // Add first participant's data to profile for future pre-population
        if (sessionData.bookingData.participants?.length > 0) {
          const firstParticipant = sessionData.bookingData.participants[0];
          
          // Save hiking experience level
          if (firstParticipant.experience) {
            profileUpdateData.hiking_experience = firstParticipant.experience;
          }
          
          // Save medical conditions
          if (firstParticipant.medicalConditions) {
            profileUpdateData.medical_conditions = firstParticipant.medicalConditions;
          }
          
          // Calculate and save date of birth from age if not already set
          if (firstParticipant.age && !existingProfile?.date_of_birth) {
            const currentYear = new Date().getFullYear();
            const birthYear = currentYear - firstParticipant.age;
            profileUpdateData.date_of_birth = `${birthYear}-01-01`;
          }
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update(profileUpdateData)
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating profile:', updateError);
        }

        // Add hiker_id to booking data
        const bookingDataWithHiker = {
          ...sessionData.bookingData,
          hiker_id: user.id
        };

        console.log('Creating booking with data:', bookingDataWithHiker);

        // Create the booking in database
        const { data: bookingData, error: bookingError } = await supabase.functions.invoke('create-booking', {
          body: bookingDataWithHiker
        });

        if (bookingError || !bookingData?.booking) {
          console.error('Error creating booking:', bookingError);
          toast.error('Payment successful but booking creation failed. Please contact support.');
          return;
        }

        setBookingReference(bookingData.booking.booking_reference);
        toast.success('Booking confirmed!');
        setIsProcessing(false);

      } catch (error) {
        console.error('Booking creation error:', error);
        toast.error('An error occurred. Please contact support.');
        navigate('/');
      }
    };

    createBooking();
  }, [sessionId, navigate]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md w-full text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-2">Processing your booking...</h2>
          <p className="text-muted-foreground">Please wait while we confirm your payment and create your booking.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="p-8 max-w-md w-full text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
        <p className="text-muted-foreground mb-6">
          Your payment was successful and your booking has been confirmed.
        </p>
        
        {bookingReference && (
          <div className="bg-muted p-4 rounded-lg mb-6">
            <p className="text-sm font-medium mb-1">Booking Reference</p>
            <p className="text-2xl font-bold">{bookingReference}</p>
          </div>
        )}

        <p className="text-sm text-muted-foreground mb-6">
          You will receive a confirmation email shortly with all the details of your booking.
        </p>

        <div className="flex gap-4">
          <Button onClick={() => navigate('/dashboard')} className="flex-1">
            View My Bookings
          </Button>
          <Button onClick={() => navigate('/')} variant="outline" className="flex-1">
            Back to Home
          </Button>
        </div>
      </Card>
    </div>
  );
};
