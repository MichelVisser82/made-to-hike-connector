import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BookingFormData, PricingDetails, BookingStep } from '@/types/booking';
import { supabase } from '@/integrations/supabase/client';
import { AccountStep } from '@/components/booking/AccountStep';
import { BookingProgress } from '@/components/booking/BookingProgress';
import { ParticipantsStep } from '@/components/booking/ParticipantsStep';
import { ContactStep } from '@/components/booking/ContactStep';
import { DateStep } from '@/components/booking/DateStep';
import { SpecialRequestsStep } from '@/components/booking/SpecialRequestsStep';
import { ReviewStep } from '@/components/booking/ReviewStep';
import { PaymentStep } from '@/components/booking/PaymentStep';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { MainLayout } from '@/components/layout/MainLayout';

// Form validation schema
const bookingFormSchema = z.object({
  participants: z.array(z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
    surname: z.string().min(2, 'Surname must be at least 2 characters').max(50),
    age: z.number().min(1, 'Age is required').max(120),
    experience: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
    medicalConditions: z.string().optional()
  })).min(1, 'At least one participant required').max(20),
  
  phone: z.string().regex(/^[0-9]{6,15}$/, 'Phone number must be 6-15 digits'),
  country: z.string().min(1, 'Country code is required'),
  emergencyContactName: z.string().min(2, 'Emergency contact name is required'),
  emergencyContactPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  emergencyContactRelationship: z.string().min(1, 'Relationship is required'),
  
  selectedDateSlotId: z.string().uuid('Please select a date'),
  
  dietaryPreferences: z.array(z.string()).optional(),
  accessibilityNeeds: z.string().optional(),
  specialRequests: z.string().max(500).optional(),
  
  agreedToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms')
});

export const BookingFlowNew = () => {
  const { tourSlug } = useParams();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState<BookingStep>('account' as BookingStep);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tourData, setTourData] = useState<any>(null);
  const [guideData, setGuideData] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [pricing, setPricing] = useState<PricingDetails>({
    subtotal: 0,
    discount: 0,
    serviceFee: 0,
    total: 0,
    currency: 'EUR'
  });
  
  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    mode: 'onBlur',
    defaultValues: {
      participants: [{ firstName: '', surname: '', age: 0, experience: 'beginner', medicalConditions: '' }],
      dietaryPreferences: [],
      agreedToTerms: false
    }
  });

  // Check auth status and load tour data
  useEffect(() => {
    const checkAuthAndLoadTour = async () => {
      try {
      // Check if user is authenticated
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        
        if (session) {
          setIsVerified(true);
          setCurrentStep('date' as BookingStep);
          
          // Clear any existing drafts that don't belong to this user
          if (tourSlug) {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
              if (key.startsWith('booking-draft-') && !key.includes(session.user.id)) {
                localStorage.removeItem(key);
              }
            });
          }
          
          // Load user profile to pre-fill data
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            // Pre-fill form with profile data
            if (profile.phone) form.setValue('phone', profile.phone);
            if (profile.country) form.setValue('country', profile.country);
            if (profile.emergency_contact_name) form.setValue('emergencyContactName', profile.emergency_contact_name);
            if (profile.emergency_contact_phone) form.setValue('emergencyContactPhone', profile.emergency_contact_phone);
            if (profile.emergency_contact_relationship) form.setValue('emergencyContactRelationship', profile.emergency_contact_relationship);
            if (profile.dietary_preferences) form.setValue('dietaryPreferences', profile.dietary_preferences as string[]);
            if (profile.accessibility_needs) form.setValue('accessibilityNeeds', profile.accessibility_needs);
            
            // Pre-fill first participant with user data (split name into first and surname)
            if (profile.name) {
              const nameParts = profile.name.trim().split(' ');
              const firstName = nameParts[0] || '';
              const surname = nameParts.slice(1).join(' ') || '';
              form.setValue('participants.0.firstName', firstName);
              form.setValue('participants.0.surname', surname);
            }
            if (profile.date_of_birth) {
              const age = new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear();
              form.setValue('participants.0.age', age);
            }
            if (profile.hiking_experience) {
              form.setValue('participants.0.experience', profile.hiking_experience as any);
            }
            if (profile.medical_conditions) {
              form.setValue('participants.0.medicalConditions', profile.medical_conditions);
            }
          }
        }

        // Load tour data
      const { data: tour, error: tourError } = await supabase
        .from('tours')
        .select('*, guide_profiles!tours_guide_id_fkey(*)')
        .eq('slug', tourSlug)
        .maybeSingle();

        if (tourError) throw tourError;
        
        setTourData(tour);
        setGuideData(tour.guide_profiles);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load tour information');
        navigate('/tours');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadTour();
  }, [tourSlug, navigate]);

  // Load draft from localStorage
  useEffect(() => {
    const loadDraft = async () => {
      if (tourData && isVerified) {
        const { data } = await supabase.auth.getSession();
        if (!data.session) return;
        
        const draftKey = `booking-draft-${tourData.id}-${data.session.user.id}`;
        const draft = localStorage.getItem(draftKey);
        
        if (draft) {
          try {
            const parsed = JSON.parse(draft);
            // Check if draft is less than 24 hours old
            if (Date.now() - parsed.timestamp < 86400000) {
              form.reset(parsed.formData);
              setCurrentStep(parsed.currentStep);
              toast.info('Draft booking restored');
            } else {
              localStorage.removeItem(draftKey);
            }
          } catch (error) {
            console.error('Error parsing draft:', error);
            localStorage.removeItem(draftKey);
          }
        }
      }
    };
    
    loadDraft();
  }, [tourData, isVerified]);

  // Save draft to localStorage
  useEffect(() => {
    const saveDraft = async () => {
      if (tourData && isVerified && currentStep !== 'account') {
        const { data } = await supabase.auth.getSession();
        if (!data.session) return;
        
        const draftKey = `booking-draft-${tourData.id}-${data.session.user.id}`;
        const draft = {
          formData: form.getValues(),
          currentStep,
          timestamp: Date.now()
        };
        localStorage.setItem(draftKey, JSON.stringify(draft));
      }
    };
    
    saveDraft();
  }, [currentStep, tourData, isVerified]);

  const handleAccountVerified = async () => {
    setIsVerified(true);
    
    // Clear old drafts when new user verifies
    const { data } = await supabase.auth.getSession();
    if (data.session && tourData) {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('booking-draft-') && !key.includes(data.session.user.id)) {
          localStorage.removeItem(key);
        }
      });
    }
    
    setCurrentStep('date' as BookingStep);
  };

  const handleDateSelected = async (slotId: string) => {
    try {
      const { data: slot, error } = await supabase
        .from('tour_date_slots')
        .select('*')
        .eq('id', slotId)
        .single();

      if (error) throw error;

      setSelectedSlot(slot);
      form.setValue('selectedDateSlotId', slotId);

      // Calculate pricing
      const participants = form.getValues('participants');
      const basePrice = slot.price_override || tourData.price;
      const subtotal = basePrice * participants.length;
      const slotDiscount = slot.discount_percentage 
        ? subtotal * (slot.discount_percentage / 100) 
        : 0;
      const serviceFee = tourData.service_fee_percentage 
        ? subtotal * (tourData.service_fee_percentage / 100) 
        : subtotal * 0.10;
      const total = subtotal - slotDiscount + serviceFee;

      setPricing({
        subtotal,
        discount: slotDiscount,
        slotDiscount,
        serviceFee,
        total,
        currency: slot.currency_override || tourData.currency
      });

      setCurrentStep('participants' as BookingStep);
    } catch (error) {
      console.error('Error loading slot:', error);
      toast.error('Failed to load date information');
    }
  };

  const handlePaymentSuccess = async (clientSecret: string) => {
    try {
      // Create booking
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw new Error('Not authenticated');

      const bookingData = {
        tour_id: tourData.id,
        guide_id: tourData.guide_id,
        hiker_id: data.session.user.id,
        booking_date: selectedSlot.slot_date,
        date_slot_id: selectedSlot.id,
        participants: form.getValues('participants').length,
        participants_details: form.getValues('participants') as any,
        status: tourData.auto_confirm ? 'confirmed' : 'pending_confirmation',
        subtotal: pricing.subtotal,
        discount_amount: pricing.discount,
        service_fee_amount: pricing.serviceFee,
        total_price: pricing.total,
        currency: pricing.currency as 'EUR' | 'GBP',
        special_requests: form.getValues('specialRequests'),
        stripe_client_secret: clientSecret,
        payment_status: 'processing'
      };

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Update profile with booking info
      await supabase
        .from('profiles')
        .update({
          phone: form.getValues('phone'),
          country: form.getValues('country'),
          emergency_contact_name: form.getValues('emergencyContactName'),
          emergency_contact_phone: form.getValues('emergencyContactPhone'),
          emergency_contact_relationship: form.getValues('emergencyContactRelationship'),
          dietary_preferences: form.getValues('dietaryPreferences'),
          accessibility_needs: form.getValues('accessibilityNeeds')
        })
        .eq('id', data.session.user.id);

      // Call create-booking edge function to finalize
      const { error: createError } = await supabase.functions.invoke('create-booking', {
        body: {
          bookingId: booking.id,
          clientSecret: clientSecret
        }
      });

      if (createError) throw createError;

      // Clear draft
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        localStorage.removeItem(`booking-draft-${tourData.id}-${sessionData.session.user.id}`);
      }

      toast.success('Booking confirmed!');
      navigate(`/bookings/${booking.booking_reference}`);
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to complete booking. Please contact support.');
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!tourData) {
    return <MainLayout><div /></MainLayout>;
  }

  const getStepNumber = () => {
    if (currentStep === 'account') return 0;
    const steps: BookingStep[] = ['date', 'participants', 'contact', 'special-requests', 'review', 'payment'];
    return steps.indexOf(currentStep) + 1;
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Tour Header */}
        <Card className="p-6 mb-8">
          <h1 className="text-3xl font-bold mb-2">{tourData.title}</h1>
          <p className="text-muted-foreground">{tourData.region} • {tourData.duration}</p>
        </Card>

        {/* Progress Indicator */}
        {currentStep !== 'account' && (
          <BookingProgress currentStep={getStepNumber()} totalSteps={6} />
        )}

        {/* Step Content */}
        <div className="mt-8">
          {currentStep === 'account' && (
            <AccountStep onVerified={handleAccountVerified} />
          )}
          
          {currentStep === 'date' && (
            <DateStep
              form={form}
              tourId={tourData.id}
              onNext={handleDateSelected}
              participantCount={1} // Initial count, will be updated after participants step
              preselectedSlotId={form.getValues('selectedDateSlotId')}
            />
          )}
          
          {currentStep === 'participants' && (
            <ParticipantsStep
              form={form}
              onNext={() => setCurrentStep('contact')}
              onBack={() => setCurrentStep('date')}
              minGroupSize={tourData.min_group_size || 1}
              maxGroupSize={tourData.max_group_size || tourData.group_size}
              spotsRemaining={selectedSlot?.spots_remaining || 1000}
            />
          )}
          
          {currentStep === 'contact' && (
            <ContactStep
              form={form}
              onNext={() => setCurrentStep('special-requests')}
              onBack={() => setCurrentStep('participants')}
            />
          )}
          
          {currentStep === 'special-requests' && (
            <SpecialRequestsStep
              form={form}
              onNext={() => setCurrentStep('review')}
              onBack={() => setCurrentStep('contact')}
            />
          )}
          
          {currentStep === 'review' && (
            <ReviewStep
              form={form}
              tourData={tourData}
              guideData={guideData}
              selectedSlot={selectedSlot}
              pricing={pricing}
              onNext={() => setCurrentStep('payment')}
              onBack={() => setCurrentStep('special-requests')}
              onEdit={(step) => {
                const steps: BookingStep[] = ['date', 'participants', 'contact', 'special-requests', 'review', 'payment'];
                setCurrentStep(steps[step - 1]);
              }}
            />
          )}
          
          {currentStep === 'payment' && (
            <PaymentStep
              form={form}
              tourId={tourData.id}
              guideId={tourData.guide_id}
              pricing={pricing}
              onUpdatePricing={setPricing}
              onBack={() => setCurrentStep('review')}
              onPaymentSuccess={handlePaymentSuccess}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
};
