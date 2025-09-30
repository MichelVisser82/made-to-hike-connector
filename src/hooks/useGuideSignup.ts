import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { GuideSignupData } from '@/types/guide';

const STORAGE_KEY = 'guide_signup_data';

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
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email!,
        password: formData.password!,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: formData.display_name,
            role: 'guide',
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // Step 2: Upload images if any
      let profileImageUrl: string | undefined;
      const portfolioUrls: string[] = [];

      if (formData.profile_image) {
        const fileName = `${authData.user.id}/profile-${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('hero-images')
          .upload(fileName, formData.profile_image);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('hero-images')
            .getPublicUrl(fileName);
          profileImageUrl = publicUrl;
        }
      }

      if (formData.portfolio_images && formData.portfolio_images.length > 0) {
        for (const image of formData.portfolio_images) {
          const fileName = `${authData.user.id}/portfolio-${Date.now()}-${Math.random()}.jpg`;
          const { error: uploadError } = await supabase.storage
            .from('tour-images')
            .upload(fileName, image);

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('tour-images')
              .getPublicUrl(fileName);
            portfolioUrls.push(publicUrl);
          }
        }
      }

      // Step 3: Create guide profile
      const { error: profileError } = await supabase
        .from('guide_profiles')
        .insert([{
          user_id: authData.user.id,
          display_name: formData.display_name!,
          bio: formData.bio,
          location: formData.location,
          profile_image_url: profileImageUrl,
          certifications: formData.certifications || [],
          specialties: formData.specialties || [],
          guiding_areas: formData.guiding_areas || [],
          terrain_capabilities: formData.terrain_capabilities || [],
          portfolio_images: portfolioUrls,
          seasonal_availability: formData.seasonal_availability,
          upcoming_availability_start: formData.upcoming_availability_start,
          upcoming_availability_end: formData.upcoming_availability_end,
          daily_rate: formData.daily_rate,
          daily_rate_currency: formData.daily_rate_currency,
          max_group_size: formData.max_group_size,
          min_group_size: formData.min_group_size,
          languages_spoken: formData.languages_spoken || ['English'],
          profile_completed: true,
          verified: false,
        }] as any);

      if (profileError) throw profileError;

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
