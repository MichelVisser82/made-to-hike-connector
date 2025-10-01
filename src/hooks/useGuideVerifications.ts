import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GuideVerificationData {
  id: string;
  user_id: string;
  verification_status: 'not_requested' | 'pending' | 'approved' | 'rejected';
  company_name?: string;
  license_number?: string;
  insurance_info?: string;
  experience_years?: number;
  admin_notes?: string;
  verification_documents?: string[];
  created_at: string;
  updated_at: string;
  guide_profile?: {
    display_name: string;
    profile_image_url?: string;
    certifications?: any[];
    experience_years?: number;
    location?: string;
  };
  profile?: {
    email: string;
    name: string;
  };
}

export function useGuideVerifications(status?: string) {
  return useQuery({
    queryKey: ['guide-verifications', status],
    queryFn: async () => {
      let query = supabase
        .from('user_verifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('verification_status', status as 'not_requested' | 'pending' | 'approved' | 'rejected');
      }

      const { data: verifications, error } = await query;
      if (error) throw error;

      // Fetch related guide profiles and user profiles separately
      const userIds = verifications?.map(v => v.user_id) || [];
      
      const { data: guideProfiles } = await supabase
        .from('guide_profiles')
        .select('user_id, display_name, profile_image_url, certifications, experience_years, location')
        .in('user_id', userIds);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, name')
        .in('id', userIds);

      // Combine the data
      const combined = verifications?.map(verification => ({
        ...verification,
        guide_profile: guideProfiles?.find(gp => gp.user_id === verification.user_id),
        profile: profiles?.find(p => p.id === verification.user_id),
      }));

      return combined as GuideVerificationData[];
    },
  });
}

export function useUpdateVerificationStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      verificationId,
      status,
      adminNotes,
    }: {
      verificationId: string;
      status: 'approved' | 'rejected';
      adminNotes?: string;
    }) => {
      // Update verification status
      const { error: verificationError } = await supabase
        .from('user_verifications')
        .update({
          verification_status: status,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', verificationId);

      if (verificationError) throw verificationError;

      // If approved, update guide_profiles.verified
      if (status === 'approved') {
        const { data: verification } = await supabase
          .from('user_verifications')
          .select('user_id')
          .eq('id', verificationId)
          .single();

        if (verification) {
          const { error: profileError } = await supabase
            .from('guide_profiles')
            .update({ verified: true })
            .eq('user_id', verification.user_id);

          if (profileError) throw profileError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guide-verifications'] });
      toast({
        title: 'Success',
        description: 'Verification status updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update verification status',
        variant: 'destructive',
      });
      console.error('Verification update error:', error);
    },
  });
}
