import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ParticipantWaiverLanding from '@/components/participant-management/ParticipantWaiverLanding';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

export default function ParticipantPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [participantData, setParticipantData] = useState<any>(null);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      console.log('Validating token:', token?.substring(0, 10) + '...');
      
      // Call edge function to validate token and get participant data
      const { data, error } = await supabase.functions.invoke('manage-participant-tokens', {
        body: {
          action: 'validate_token',
          token
        }
      });

      console.log('Validation response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (!data || !data.valid) {
        toast({
          title: 'Invalid or Expired Link',
          description: data?.error || 'This participant link is no longer valid.',
          variant: 'destructive'
        });
        navigate('/');
        return;
      }

      console.log('Setting participant data:', data);
      setParticipantData(data);
      setLoading(false);
    } catch (error: any) {
      console.error('Error validating token:', error);
      toast({
        title: 'Error',
        description: 'Failed to load participant information.',
        variant: 'destructive'
      });
      navigate('/');
    }
  };

  const handleWaiverSubmit = async (waiverData: any) => {
    console.log('=== handleWaiverSubmit called ===', { waiverData });
    try {
      const { data, error } = await supabase.functions.invoke('manage-participant-tokens', {
        body: {
          action: 'submit_waiver',
          token,
          waiverData
        }
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Supabase function invocation error:', error);
        throw error;
      }

      if (data && (data as any).error) {
        console.error('Edge function returned error:', (data as any).error);
        throw new Error((data as any).error);
      }

      toast({
        title: 'Waiver Submitted',
        description: 'Your liability waiver has been saved successfully.'
      });
    } catch (error: any) {
      console.error('=== handleWaiverSubmit ERROR ===', error);
      toast({
        title: 'Submission Failed',
        description: error?.message || 'Failed to submit waiver. Please try again.',
        variant: 'destructive'
      });
      throw error;
    }
  };
  const handleInsuranceSubmit = async (insuranceData: any) => {
    console.log('=== handleInsuranceSubmit called ===', { insuranceData });
    try {
      const { data, error } = await supabase.functions.invoke('manage-participant-tokens', {
        body: {
          action: 'submit_insurance',
          token,
          insuranceData
        }
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Supabase function invocation error:', error);
        throw error;
      }

      if (data && (data as any).error) {
        console.error('Edge function returned error:', (data as any).error);
        throw new Error((data as any).error);
      }

      toast({
        title: 'Insurance Submitted',
        description: 'Your travel insurance information has been saved successfully.'
      });
    } catch (error: any) {
      console.error('=== handleInsuranceSubmit ERROR ===', error);
      toast({
        title: 'Submission Failed',
        description: error?.message || 'Failed to submit insurance. Please try again.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-light">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-burgundy animate-spin mx-auto mb-4" />
          <p className="text-charcoal/70">Loading participant information...</p>
        </div>
      </div>
    );
  }

  if (!participantData) {
    return null;
  }

  const { booking, tour } = participantData;

  return (
    <ParticipantWaiverLanding
      token={token!}
      bookingReference={booking.booking_reference || `BK-${booking.id.slice(0, 8)}`}
      tourName={tour.title}
      tourDates={{
        from: format(new Date(booking.booking_date), 'MMM dd, yyyy'),
        to: format(new Date(booking.booking_date), 'MMM dd, yyyy')
      }}
      location={tour.region}
      guideName={tour.guide_display_name || 'Your Guide'}
      primaryBooker={booking.hiker_email}
      participantEmail={participantData.participant_email}
      onWaiverSubmit={handleWaiverSubmit}
      onInsuranceSubmit={handleInsuranceSubmit}
    />
  );
}
