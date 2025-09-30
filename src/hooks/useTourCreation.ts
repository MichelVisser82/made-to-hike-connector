import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const tourSchema = z.object({
  // Step 2: Basic Info
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(50, 'Description must be at least 50 characters').max(2000),
  
  // Step 3: Location
  region: z.enum(['dolomites', 'pyrenees', 'scotland']),
  meeting_point: z.string().min(10, 'Meeting point is required'),
  
  // Step 4: Duration & Difficulty
  duration: z.string().min(1, 'Duration is required'),
  difficulty: z.enum(['easy', 'moderate', 'challenging', 'expert']),
  
  // Step 5: Tour Details
  pack_weight: z.number().min(1).max(50),
  daily_hours: z.string().min(1, 'Daily hours is required'),
  terrain_types: z.array(z.string()).min(1, 'Select at least one terrain type'),
  
  // Step 6: Available Dates
  available_dates: z.array(z.date()).min(1, 'Select at least one date'),
  
  // Step 7: Images
  hero_image: z.string().optional(),
  images: z.array(z.string()).default([]),
  
  // Step 8: Highlights
  highlights: z.array(z.string()).min(3, 'Add at least 3 highlights').max(10),
  
  // Step 9: Itinerary
  itinerary: z.array(z.object({
    day: z.number(),
    title: z.string(),
    activities: z.array(z.string()),
    accommodation: z.string(),
    meals: z.string()
  })).min(1),
  
  // Step 10: Inclusions/Exclusions
  includes: z.array(z.string()).min(1, 'Add at least 1 inclusion'),
  excluded_items: z.array(z.string()).default([]),
  
  // Step 11: Pricing
  price: z.number().min(1, 'Price must be greater than 0'),
  currency: z.enum(['EUR', 'GBP']),
  service_fee: z.number().min(0).default(0),
  group_size: z.number().min(1).max(20),
});

export type TourFormData = z.infer<typeof tourSchema>;

const STORAGE_KEY = 'tour_creation_draft';

export function useTourCreation() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TourFormData>({
    resolver: zodResolver(tourSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      region: 'dolomites',
      meeting_point: '',
      duration: '',
      difficulty: 'moderate',
      pack_weight: 10,
      daily_hours: '',
      terrain_types: [],
      available_dates: [],
      images: [],
      highlights: [],
      itinerary: [],
      includes: [],
      excluded_items: [],
      price: 0,
      currency: 'EUR',
      service_fee: 0,
      group_size: 8,
    }
  });

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem(STORAGE_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        // Convert date strings back to Date objects
        if (parsed.available_dates) {
          parsed.available_dates = parsed.available_dates.map((d: string) => new Date(d));
        }
        form.reset(parsed);
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, [form]);

  // Auto-save draft
  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const nextStep = () => {
    if (currentStep < 12) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= 12) {
      setCurrentStep(step);
      window.scrollTo(0, 0);
    }
  };

  const submitTour = async (data: TourFormData) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Convert dates to strings for database
      const tourData = {
        guide_id: user.id,
        title: data.title,
        description: data.description,
        region: data.region,
        meeting_point: data.meeting_point,
        duration: data.duration,
        difficulty: data.difficulty,
        pack_weight: data.pack_weight,
        daily_hours: data.daily_hours,
        terrain_types: data.terrain_types,
        available_dates: data.available_dates.map(d => d.toISOString().split('T')[0]),
        images: data.images,
        highlights: data.highlights,
        itinerary: data.itinerary,
        includes: data.includes,
        excluded_items: data.excluded_items,
        price: data.price,
        currency: data.currency,
        service_fee: data.service_fee,
        group_size: data.group_size,
        is_active: true,
        rating: 0,
        reviews_count: 0,
      };

      const { error } = await supabase
        .from('tours')
        .insert([tourData]);

      if (error) throw error;

      // Clear draft on successful submission
      localStorage.removeItem(STORAGE_KEY);
      
      toast({
        title: "Tour created successfully!",
        description: "Your tour is now live and visible to hikers.",
      });

      return { success: true };
    } catch (error) {
      console.error('Error creating tour:', error);
      toast({
        title: "Failed to create tour",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    submitTour,
    isSubmitting,
    totalSteps: 12,
  };
}
