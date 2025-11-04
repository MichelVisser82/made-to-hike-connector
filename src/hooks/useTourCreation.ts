import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { DateSlotFormData } from '@/types/tourDateSlot';

const tourSchema = z.object({
  // Step 2: Basic Info
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  short_description: z.string().min(10, 'Short description must be at least 10 characters').max(140, 'Short description must be 140 characters or less'),
  description: z.string().min(50, 'Description must be at least 50 characters').max(2000),
  
  // Step 3: Location
  region: z.string().min(1, 'Region is required'),
  meeting_point: z.string().min(1, 'Meeting point is required'),
  meeting_point_lat: z.number().optional(),
  meeting_point_lng: z.number().optional(),
  meeting_point_formatted: z.string().optional(),
  
  // Step 4: Duration & Difficulty
  duration: z.string().min(1, 'Duration is required'),
  difficulty: z.enum(['easy', 'moderate', 'challenging', 'expert']),
  
  // Step 5: Tour Details
  pack_weight: z.number().min(1).max(50),
  daily_hours: z.string().min(1, 'Daily hours is required'),
  terrain_types: z.array(z.string()).min(1, 'Select at least one terrain type'),
  distance_km: z.number().min(0.1).optional(),
  elevation_gain_m: z.number().min(0).optional(),
  
  // Step 6: Available Dates - NEW: Date slots with pricing/capacity
  available_dates: z.array(z.date()).min(1, 'Select at least one date').optional(), // Kept for backward compatibility
  date_slots: z.array(z.object({
    date: z.date(),
    spotsTotal: z.number().min(1),
    priceOverride: z.number().optional(),
    currencyOverride: z.string().optional(),
    discountPercentage: z.number().min(0).max(100).optional(),
    discountLabel: z.string().optional(),
    earlyBirdDate: z.date().optional(),
    notes: z.string().optional()
  })).min(1, 'Add at least one date slot'),
  
  // Step 7: Images
  hero_image: z.string().optional(),
  images: z.array(z.string()).default([]),
  
  // Step 8: Route & Map (optional)
  routeData: z.object({
    gpxData: z.any().optional(),
    trackpoints: z.array(z.object({
      lat: z.number(),
      lng: z.number(),
      elevation: z.number().optional()
    })).optional()
  }).optional(),
  
  // Step 9: Highlights
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

interface UseTourCreationOptions {
  initialData?: any;
  editMode?: boolean;
  tourId?: string;
}

const STORAGE_KEY = 'tour_creation_draft';

export function useTourCreation(options?: UseTourCreationOptions) {
  const { initialData, editMode = false, tourId } = options || {};
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const getDefaultValues = () => {
    if (initialData) {
      // Convert tour data to form data format
      return {
        title: editMode ? initialData.title : initialData.title + ' (Copy)',
        short_description: initialData.short_description,
        description: initialData.description,
        region: initialData.region,
        meeting_point: initialData.meeting_point,
        meeting_point_lat: initialData.meeting_point_lat,
        meeting_point_lng: initialData.meeting_point_lng,
        meeting_point_formatted: initialData.meeting_point_formatted,
        duration: initialData.duration,
        difficulty: initialData.difficulty,
        pack_weight: initialData.pack_weight || 10,
        daily_hours: initialData.daily_hours || '',
        terrain_types: initialData.terrain_types || [],
        distance_km: initialData.distance_km,
        elevation_gain_m: initialData.elevation_gain_m,
        available_dates: initialData.available_dates?.map((d: string) => new Date(d)) || [],
        date_slots: initialData.available_dates?.map((d: string) => ({
          date: new Date(d),
          spotsTotal: initialData.group_size,
        })) || [],
        hero_image: initialData.hero_image,
        images: initialData.images || [],
        highlights: initialData.highlights || [],
        itinerary: initialData.itinerary || [],
        includes: initialData.includes || [],
        excluded_items: initialData.excluded_items || [],
        price: initialData.price,
        currency: initialData.currency,
        service_fee: initialData.service_fee || 0,
        group_size: initialData.group_size,
      };
    }

    return {
      title: '',
      short_description: '',
      description: '',
      region: 'dolomites' as const,
      meeting_point: '',
      meeting_point_lat: undefined,
      meeting_point_lng: undefined,
      meeting_point_formatted: undefined,
      duration: '',
      difficulty: 'moderate' as const,
      pack_weight: 10,
      daily_hours: '',
      terrain_types: [],
      distance_km: undefined,
      elevation_gain_m: undefined,
      available_dates: [],
      date_slots: [],
      images: [],
      highlights: [],
      itinerary: [],
      includes: [],
      excluded_items: [],
      price: 0,
      currency: 'EUR' as const,
      service_fee: 0,
      group_size: 8,
    };
  };

  const form = useForm<TourFormData>({
    resolver: zodResolver(tourSchema),
    mode: 'onChange',
    defaultValues: getDefaultValues(),
  });

  // Load draft from localStorage on mount (skip in edit mode)
  useEffect(() => {
    if (editMode) return; // Don't load drafts when editing existing tour
    
    const draft = localStorage.getItem(STORAGE_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        // Convert date strings back to Date objects
        if (parsed.available_dates) {
          parsed.available_dates = parsed.available_dates.map((d: string) => new Date(d));
        }
        if (parsed.date_slots) {
          parsed.date_slots = parsed.date_slots.map((slot: any) => ({
            ...slot,
            date: new Date(slot.date),
            earlyBirdDate: slot.earlyBirdDate ? new Date(slot.earlyBirdDate) : undefined
          }));
        }
        form.reset(parsed);
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, [form, editMode]);

  // Auto-save draft (skip in edit mode)
  useEffect(() => {
    if (editMode) return; // Don't auto-save when editing existing tour
    
    const subscription = form.watch((value) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form, editMode]);

  const nextStep = () => {
    if (currentStep < 13) {
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

  const saveProgress = async (data: TourFormData) => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to save progress",
          variant: "destructive",
        });
        return { success: false };
      }

      if (!editMode || !tourId) {
        // For new tours, just save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        toast({
          title: "Progress saved",
          description: "Your changes have been saved as a draft",
        });
        return { success: true };
      }

      // For existing tours, save to database
      const { date_slots, routeData, ...tourData } = data as any;
      
      const formattedTourData = {
        ...tourData,
        guide_id: user.id,
        available_dates: date_slots?.map((slot: DateSlotFormData) => 
          slot.date.toISOString().split('T')[0]
        ) || [],
      };

      const { error } = await supabase
        .from('tours')
        .update(formattedTourData)
        .eq('id', tourId)
        .eq('guide_id', user.id);

      if (error) {
        console.error('Error saving progress:', error);
        toast({
          title: "Error",
          description: "Failed to save progress. Please try again.",
          variant: "destructive",
        });
        return { success: false };
      }

      // Update date slots
      await supabase
        .from('tour_date_slots')
        .delete()
        .eq('tour_id', tourId);

      if (date_slots && date_slots.length > 0) {
        const dateSlotInserts = date_slots.map((slot: DateSlotFormData) => ({
          tour_id: tourId,
          slot_date: slot.date.toISOString().split('T')[0],
          spots_total: slot.spotsTotal,
          price_override: slot.priceOverride,
          currency_override: slot.currencyOverride,
          discount_percentage: slot.discountPercentage,
          discount_label: slot.discountLabel,
          early_bird_date: slot.earlyBirdDate?.toISOString().split('T')[0],
          notes: slot.notes,
          is_available: true
        }));

        await supabase
          .from('tour_date_slots')
          .insert(dateSlotInserts);
      }

      toast({
        title: "Progress saved",
        description: "Your changes have been saved",
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error saving progress:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setIsSaving(false);
    }
  };

  const submitTour = async (data: TourFormData) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to submit a tour",
          variant: "destructive",
        });
        return { success: false };
      }

      // Format the data for submission (exclude date_slots and routeData, we handle them separately)
      const { date_slots, routeData, ...tourData } = data as any;
      
      const formattedTourData = {
        ...tourData,
        guide_id: user.id,
        available_dates: date_slots?.map((slot: DateSlotFormData) => 
          slot.date.toISOString().split('T')[0]
        ) || [],
      };

      let createdTourId = tourId;

      if (editMode && tourId) {
        // UPDATE existing tour
        const { error } = await supabase
          .from('tours')
          .update(formattedTourData)
          .eq('id', tourId)
          .eq('guide_id', user.id);

        if (error) {
          console.error('Error updating tour:', error);
          toast({
            title: "Error",
            description: "Failed to update tour. Please try again.",
            variant: "destructive",
          });
          return { success: false };
        }

        // Delete existing date slots for this tour
        await supabase
          .from('tour_date_slots')
          .delete()
          .eq('tour_id', tourId);

      } else {
        // INSERT new tour
        const { data: newTour, error } = await supabase
          .from('tours')
          .insert([formattedTourData])
          .select('id')
          .single();

        if (error) {
          console.error('Error creating tour:', error);
          toast({
            title: "Error",
            description: "Failed to create tour. Please try again.",
            variant: "destructive",
          });
          return { success: false };
        }

        createdTourId = newTour.id;
      }

      // Insert date slots
      if (date_slots && date_slots.length > 0 && createdTourId) {
        const dateSlotInserts = date_slots.map((slot: DateSlotFormData) => ({
          tour_id: createdTourId,
          slot_date: slot.date.toISOString().split('T')[0],
          spots_total: slot.spotsTotal,
          price_override: slot.priceOverride,
          currency_override: slot.currencyOverride,
          discount_percentage: slot.discountPercentage,
          discount_label: slot.discountLabel,
          early_bird_date: slot.earlyBirdDate?.toISOString().split('T')[0],
          notes: slot.notes,
          is_available: true
        }));

        const { error: slotsError } = await supabase
          .from('tour_date_slots')
          .insert(dateSlotInserts);

        if (slotsError) {
          console.error('Error creating date slots:', slotsError);
          toast({
            title: "Warning",
            description: "Tour created but some dates failed to save. Please edit the tour to add them.",
            variant: "destructive",
          });
        }
      }

      // Clear draft from local storage on successful submission
      if (!editMode) {
        localStorage.removeItem(STORAGE_KEY);
      }

      toast({
        title: "Success",
        description: editMode ? "Tour updated successfully!" : "Tour published successfully!",
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error submitting tour:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
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
    saveProgress,
    isSubmitting,
    isSaving,
    totalSteps: 13,
    editMode,
  };
}
