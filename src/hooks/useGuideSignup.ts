import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { GuideSignupData } from '@/types/guide';

const STORAGE_KEY = 'guide_signup_data';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
};

export function useGuideSignup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<GuideSignupData>>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {
      min_group_size: 1,
      max_group_size: 10,
      experience_years: 0,
      daily_rate_currency: 'EUR',
      specialties: [],
      difficulty_levels: [],
      certifications: [],
      guiding_areas: [],
      terrain_capabilities: [],
      languages_spoken: ['English'],
      terms_accepted: false,
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const updateFormData = (data: Partial<GuideSignupData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < 15) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= 15) {
      setCurrentStep(step);
      window.scrollTo(0, 0);
    }
  };

  const submitSignup = async () => {
    setIsSubmitting(true);
    try {
      // Check if user is already logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      // Convert images to base64 for edge function
      let profileImageBase64: string | undefined;
      const portfolioImagesBase64: Array<{ base64: string; metadata: any }> = [];

      if (formData.profile_image) {
        profileImageBase64 = await fileToBase64(formData.profile_image);
      }

      if (formData.portfolio_images && formData.portfolio_images.length > 0) {
        for (const image of formData.portfolio_images) {
          const base64 = await fileToBase64(image);
          // For now, include basic metadata - will be enhanced with AI suggestions
          portfolioImagesBase64.push({
            base64,
            metadata: {
              alt_text: '',
              description: '',
              tags: []
            }
          });
        }
      }

      // Call edge function to create guide account
      const { data, error } = await supabase.functions.invoke('guide-signup', {
        body: {
          userId: user?.id, // Pass existing user ID if logged in
          email: formData.email || user?.email,
          password: formData.password,
          guideData: {
            display_name: formData.display_name,
            bio: formData.bio,
            location: formData.location,
            experience_years: formData.experience_years,
            certifications: formData.certifications || [],
            specialties: formData.specialties || [],
            guiding_areas: formData.guiding_areas || [],
            terrain_capabilities: formData.terrain_capabilities || [],
            seasonal_availability: formData.seasonal_availability,
            upcoming_availability_start: formData.upcoming_availability_start,
            upcoming_availability_end: formData.upcoming_availability_end,
            daily_rate: formData.daily_rate,
            daily_rate_currency: formData.daily_rate_currency,
            max_group_size: formData.max_group_size,
            min_group_size: formData.min_group_size,
            languages_spoken: formData.languages_spoken || ['English'],
            profile_image_base64: profileImageBase64,
            portfolio_images_base64: portfolioImagesBase64,
          },
        },
      });

      if (error) throw error;

      localStorage.removeItem(STORAGE_KEY);

      toast({
        title: "Application Submitted!",
        description: "Your guide application has been submitted for review. You'll receive an email once approved.",
      });

      navigate('/');
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Signup Failed",
        description: error.message || "Failed to create guide account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / 15) * 100;

  return {
    currentStep,
    formData,
    updateFormData,
    nextStep,
    previousStep,
    goToStep,
    submitSignup,
    isSubmitting,
    progress,
  };
}
