import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { type User as CustomUser } from '../types';

export function useProfile() {
  const { user, session } = useAuth();
  const [profile, setProfile] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && session) {
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [user, session]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        return;
      }

      // Fetch verification data
      const { data: verificationData, error: verificationError } = await supabase
        .from('user_verifications')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (verificationError && verificationError.code !== 'PGRST116') {
        console.error('Error fetching verification:', verificationError);
      }

      // Build the profile object
      const customProfile: CustomUser = {
        id: profileData.id,
        email: profileData.email,
        name: profileData.name,
        role: rolesData?.[0]?.role || 'hiker',
        verified: verificationData?.verification_status === 'approved' || false,
        verification_status: verificationData?.verification_status || 'not_requested',
        verification_documents: verificationData?.verification_documents || [],
        business_info: verificationData ? {
          company_name: verificationData.company_name,
          license_number: verificationData.license_number,
          insurance_info: verificationData.insurance_info,
          experience_years: verificationData.experience_years,
        } : undefined,
      };

      setProfile(customProfile);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<CustomUser>) => {
    if (!user || !profile) return;

    try {
      setLoading(true);

      // Update basic profile info
      if (updates.name || updates.email) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            name: updates.name || profile.name,
            email: updates.email || profile.email,
          })
          .eq('id', user.id);

        if (profileError) {
          throw profileError;
        }
      }

      // Update verification info if provided
      if (updates.business_info || updates.verification_documents) {
        const { error: verificationError } = await supabase
          .from('user_verifications')
          .update({
            company_name: updates.business_info?.company_name,
            license_number: updates.business_info?.license_number,
            insurance_info: updates.business_info?.insurance_info,
            experience_years: updates.business_info?.experience_years,
            verification_documents: updates.verification_documents,
          })
          .eq('user_id', user.id);

        if (verificationError) {
          throw verificationError;
        }
      }

      // Refresh the profile
      await fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    refetchProfile: fetchProfile,
  };
}