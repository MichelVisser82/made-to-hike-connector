import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useMyGuideProfile } from '@/hooks/useGuideProfile';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { CertificationBadge } from '../ui/certification-badge';
import { ThumbnailSelectorModal } from './ThumbnailSelectorModal';
import { ImageSelectorModal } from './ImageSelectorModal';
import { Loader2, X, Mail, Lock, AlertCircle, Plus, Eye, Star, Upload, Video, ExternalLink, Image as ImageIcon, Trash2, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { 
  PRELOADED_CERTIFICATIONS, 
  getCertificationsByCategory, 
  findCertificationById,
  validateCertificateNumber 
} from '@/constants/certifications';
import { uploadCertificateDocument } from '@/utils/imageProcessing';
import type { GuideCertification } from '@/types/guide';

const SPECIALTY_OPTIONS = [
  'Alpine Hiking', 'Mountain Climbing', 'Glacier Trekking', 'Via Ferrata',
  'Winter Hiking', 'Wildlife Tracking', 'Photography Tours', 'Multi-day Expeditions'
];

const TERRAIN_OPTIONS = [
  'Mountain Trails', 'Glacier Routes', 'Forest Paths', 'Coastal Walks',
  'Alpine Meadows', 'Rocky Terrain', 'Snow & Ice', 'Canyon Routes'
];

const GUIDING_AREAS = [
  'Scottish Highlands', 'Lake District', 'Snowdonia', 'Peak District',
  'Alps', 'Dolomites', 'Pyrenees', 'Carpathians', 'Scandinavian Mountains'
];

const LANGUAGES = [
  'English', 'German', 'French', 'Italian', 'Spanish', 
  'Dutch', 'Norwegian', 'Swedish', 'Polish', 'Czech'
];

const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: 'Beginner', description: 'Easy trails for newcomers' },
  { value: 'intermediate', label: 'Intermediate', description: 'Moderate difficulty' },
  { value: 'advanced', label: 'Advanced', description: 'Challenging terrain' },
  { value: 'expert', label: 'Expert', description: 'Extreme conditions' },
];

interface GuideProfileEditFormProps {
  onNavigateToGuideProfile?: (guideId: string) => void;
}

export function GuideProfileEditForm({ onNavigateToGuideProfile }: GuideProfileEditFormProps = {}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile, isLoading, refetch } = useMyGuideProfile();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [hasPendingCertifications, setHasPendingCertifications] = useState(false);
  const [newCertificationsCount, setNewCertificationsCount] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  
  const [openSections, setOpenSections] = useState({
    basicInfo: true,
    profileImages: false,
    videoIntro: false,
    certifications: false,
    difficultyLevels: false,
    professional: false,
    availability: false,
    contact: false,
    security: false,
  });
  
  const [savingStates, setSavingStates] = useState({
    basicInfo: false,
    profileImages: false,
    videoIntro: false,
    certifications: false,
    difficultyLevels: false,
    professional: false,
    availability: false,
    contact: false,
  });

  const [formData, setFormData] = useState({
    display_name: '',
    location: '',
    bio: '',
    experience_years: 0,
    specialties: [] as string[],
    guiding_areas: [] as string[],
    terrain_capabilities: [] as string[],
    languages_spoken: [] as string[],
    difficulty_levels: [] as string[],
    certifications: [] as GuideCertification[],
    min_group_size: 1,
    max_group_size: 8,
    seasonal_availability: '',
    upcoming_availability_start: '',
    upcoming_availability_end: '',
    daily_rate: '',
    daily_rate_currency: 'EUR' as 'EUR' | 'GBP',
    phone: '',
    instagram_url: '',
    facebook_url: '',
    website_url: '',
    intro_video_url: '',
    intro_video_thumbnail_url: '',
    hero_background_url: '',
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');
  const [heroImagePreview, setHeroImagePreview] = useState<string>('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoType, setVideoType] = useState<'upload' | 'external'>('external');
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [thumbnailSelectorOpen, setThumbnailSelectorOpen] = useState(false);
  const [heroImageSelectorOpen, setHeroImageSelectorOpen] = useState(false);
  const [newCert, setNewCert] = useState<GuideCertification>({
    certificationType: 'custom',
    title: '', 
    certifyingBody: '', 
    certificateNumber: '',
    description: '',
    verificationPriority: 3,
    badgeColor: '#6b7280'
  });
  const [isAddingCert, setIsAddingCert] = useState(false);
  const [certificationType, setCertificationType] = useState<'standard' | 'custom'>('standard');
  const [selectedCertId, setSelectedCertId] = useState<string>('');
  const [certNumberError, setCertNumberError] = useState<string>('');
  const [fileError, setFileError] = useState<string>('');
  const [isUploadingCert, setIsUploadingCert] = useState(false);
  const [certFile, setCertFile] = useState<File | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        location: profile.location || '',
        bio: profile.bio || '',
        experience_years: (profile as any).experience_years || 0,
        specialties: profile.specialties || [],
        guiding_areas: profile.guiding_areas || [],
        terrain_capabilities: profile.terrain_capabilities || [],
        languages_spoken: profile.languages_spoken || [],
        difficulty_levels: (profile as any).difficulty_levels || [],
        certifications: profile.certifications || [],
        min_group_size: profile.min_group_size || 1,
        max_group_size: profile.max_group_size || 8,
        seasonal_availability: profile.seasonal_availability || '',
        upcoming_availability_start: profile.upcoming_availability_start || '',
        upcoming_availability_end: profile.upcoming_availability_end || '',
        daily_rate: profile.daily_rate?.toString() || '',
        daily_rate_currency: profile.daily_rate_currency || 'EUR',
        phone: profile.phone || '',
        instagram_url: profile.instagram_url || '',
        facebook_url: profile.facebook_url || '',
        website_url: profile.website_url || '',
        intro_video_url: (profile as any).intro_video_url || '',
        intro_video_thumbnail_url: (profile as any).intro_video_thumbnail_url || '',
        hero_background_url: profile.hero_background_url || '',
      });
      setProfileImagePreview(profile.profile_image_url || '');
      setHeroImagePreview(profile.hero_background_url || '');
      setVideoType((profile as any).video_type || 'external');
    }
    if (user?.email) {
      setNewEmail(user.email);
    }
  }, [profile, user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'hero') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'profile') {
        setProfileImage(file);
        setProfileImagePreview(URL.createObjectURL(file));
      }
    }
  };

  const uploadImage = async (file: File, bucket: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  };


  const handleCertificationSelect = (certId: string) => {
    setSelectedCertId(certId);
    const cert = findCertificationById(certId);
    if (cert) {
      setNewCert({
        ...newCert,
        certificationType: 'standard',
        certificationId: cert.id,
        title: cert.name,
        certifyingBody: cert.certifyingBody,
        verificationPriority: cert.priority as 1 | 2 | 3,
        badgeColor: cert.badgeColor,
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setFileError('Please upload a PDF or image file (JPG, PNG)');
      return;
    }

    setFileError('');
    setCertFile(file);
    setNewCert({ ...newCert, certificateDocument: file });
  };

  const validateForm = (): boolean => {
    // Required fields
    if (!newCert.title.trim() || !newCert.certifyingBody.trim()) {
      toast({
        title: "Error",
        description: "Please fill in certification name and certifying body",
        variant: "destructive",
      });
      return false;
    }

    // Validate certificate number for standard certifications
    if (certificationType === 'standard' && selectedCertId) {
      const cert = findCertificationById(selectedCertId);
      if (cert?.requiresCertificateNumber) {
        if (!newCert.certificateNumber?.trim()) {
          setCertNumberError('Certificate number is required for this certification');
          return false;
        }
        if (!validateCertificateNumber(newCert.certificateNumber, selectedCertId)) {
          setCertNumberError('Invalid certificate number format (6-20 alphanumeric characters)');
          return false;
        }
      }
    }

    // Validate expiry date
    if (newCert.expiryDate) {
      const expiryDate = new Date(newCert.expiryDate);
      if (expiryDate <= new Date()) {
        toast({
          title: "Error",
          description: "Expiry date must be in the future",
          variant: "destructive",
        });
        return false;
      }
    }

    // Required document upload
    if (!newCert.certificateDocument && !certFile) {
      setFileError('Certificate document is required');
      return false;
    }

    return true;
  };

  const addCertification = async () => {
    if (!validateForm()) return;

    setIsUploadingCert(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let certToAdd = {
        ...newCert,
        addedDate: new Date().toISOString(),
        isNewlyAdded: true, // Flag for Slack notification
      };
      
      // Upload certificate document if provided
      if (certFile instanceof File) {
        toast({
          title: "Optimizing document...",
          description: "This may take a moment for large files.",
        });
        
        const filePath = await uploadCertificateDocument(
          certFile,
          user.id,
          true // optimize
        );
        
        certToAdd = {
          ...certToAdd,
          certificateDocument: filePath
        };
        
        toast({
          title: "Document uploaded",
          description: "Certificate document optimized and uploaded successfully.",
        });
      }

      const updatedCertifications = [...formData.certifications, certToAdd];

      // Immediately save to database
      const { error: updateError } = await supabase
        .from('guide_profiles')
        .update({
          certifications: updatedCertifications as any,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Invalidate queries to refresh data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-guide-profile'] }),
        queryClient.invalidateQueries({ queryKey: ['guide-profile'] }),
        refetch()
      ]);

      setFormData({
        ...formData,
        certifications: updatedCertifications,
      });
      
      // Mark that we have pending certifications to notify about
      setHasPendingCertifications(true);
      setNewCertificationsCount(prev => prev + 1);
      
      console.log('✅ Certification added. Will send notification when "Save Changes" is clicked.');
      
      // Reset form
      setNewCert({ 
        certificationType: 'custom',
        title: '', 
        certifyingBody: '', 
        certificateNumber: '',
        description: '',
        verificationPriority: 3,
        badgeColor: '#6b7280'
      });
      setCertificationType('standard');
      setSelectedCertId('');
      setCertNumberError('');
      setFileError('');
      setCertFile(null);
      setIsAddingCert(false);
      
      toast({
        title: "Certification Added",
        description: "Click 'Save Changes' to submit for verification.",
      });
    } catch (error) {
      console.error('Error uploading certificate:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload certificate document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingCert(false);
    }
  };

  const togglePrimary = (index: number) => {
    const updatedCerts = formData.certifications.map((cert, i) => ({
      ...cert,
      isPrimary: i === index ? !cert.isPrimary : false,
    }));
    setFormData({ ...formData, certifications: updatedCerts });
  };

  const removeCertification = (index: number) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter((_, i) => i !== index),
    });
    toast({
      title: "Success",
      description: "Certification removed",
    });
  };

  const handleUpdateEmail = async () => {
    if (!newEmail || newEmail === user?.email) {
      toast({
        title: "No change",
        description: "Please enter a different email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdatingEmail(true);
      const { error } = await supabase.auth.updateUser({ email: newEmail });

      if (error) throw error;

      // Also update the profiles table
      await supabase
        .from('profiles')
        .update({ email: newEmail })
        .eq('id', user?.id);

      toast({
        title: "Email update initiated",
        description: "Please check both your old and new email addresses to confirm the change.",
      });
    } catch (error: any) {
      console.error('Error updating email:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;

    try {
      setIsResettingPassword(true);
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/`,
      });

      if (error) throw error;

      toast({
        title: "Password reset email sent",
        description: "Please check your email for instructions to reset your password.",
      });
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send password reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Video file must be less than 100MB",
        variant: "destructive",
      });
      return;
    }

    const validTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload MP4, MOV, WebM, or AVI format",
        variant: "destructive",
      });
      return;
    }

    setVideoFile(file);
    toast({
      title: "Video ready",
      description: "Click 'Save Changes' to upload your video",
    });
  };

  const handleDeleteVideo = async () => {
    if (!user) return;

    try {
      if (videoType === 'upload' && (profile as any)?.intro_video_file_path) {
        const { error: deleteError } = await supabase.storage
          .from('guide-videos')
          .remove([(profile as any).intro_video_file_path]);

        if (deleteError) throw deleteError;
      }

      const { error } = await supabase
        .from('guide_profiles')
        .update({
          intro_video_url: null,
          intro_video_file_path: null,
          video_type: null,
          intro_video_size_bytes: null,
          intro_video_duration_seconds: null,
          intro_video_thumbnail_url: null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setFormData(prev => ({
        ...prev,
        intro_video_url: '',
        intro_video_thumbnail_url: '',
      }));
      setVideoFile(null);
      
      await refetch();
      
      toast({
        title: "Video deleted",
        description: "Your video has been removed",
      });
    } catch (error: any) {
      console.error('Error deleting video:', error);
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive",
      });
    }
  };

  const handleThumbnailSelect = (imageId: string, imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      intro_video_thumbnail_url: imageUrl,
    }));
    toast({
      title: "Thumbnail selected",
      description: "Custom thumbnail has been set",
    });
  };

  const handleHeroImageSelect = (imageId: string, imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      hero_background_url: imageUrl,
    }));
    setHeroImagePreview(imageUrl);
    toast({
      title: "Hero image selected",
      description: "Hero background has been updated",
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let profileImageUrl = profile?.profile_image_url;
      let heroImageUrl = formData.hero_background_url || profile?.hero_background_url;
      let videoUrl = formData.intro_video_url;
      let videoFilePath = (profile as any)?.intro_video_file_path;
      let videoSizeBytes: number | null = null;

      if (profileImage) {
        profileImageUrl = await uploadImage(profileImage, 'hero-images');
      }

      if (videoType === 'upload' && videoFile) {
        setIsUploadingVideo(true);
        const fileExt = videoFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('guide-videos')
          .upload(fileName, videoFile, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('guide-videos')
          .getPublicUrl(fileName);

        videoUrl = urlData.publicUrl;
        videoFilePath = fileName;
        videoSizeBytes = videoFile.size;
        setIsUploadingVideo(false);
      }

      console.log('Saving guide profile with experience_years:', formData.experience_years);
      console.log('Saving certifications:', formData.certifications);

      // Preserve admin verification data on existing certifications
      const existingProfile = await supabase
        .from('guide_profiles')
        .select('certifications')
        .eq('user_id', user.id)
        .maybeSingle();
      
      const existingCerts = (existingProfile?.data?.certifications as any[]) || [];
      
      // Merge: preserve verifiedDate and verifiedBy from existing certs
      const mergedCertifications = formData.certifications.map((newCert) => {
        // Find matching cert by title and certifying body (or certificateNumber if available)
        const existingCert = existingCerts.find((ec: any) => {
          if (newCert.certificateNumber && ec.certificateNumber) {
            return ec.certificateNumber === newCert.certificateNumber;
          }
          return ec.title === newCert.title && ec.certifyingBody === newCert.certifyingBody;
        });
        
        // If found, preserve verification fields
        if (existingCert?.verifiedDate) {
          return {
            ...newCert,
            verifiedDate: existingCert.verifiedDate,
            verifiedBy: existingCert.verifiedBy,
          };
        }
        
        return newCert;
      });

      // Check if we need to send certification notifications BEFORE cleaning
      if (hasPendingCertifications) {
        await handleCertificationNotification(user.id, mergedCertifications);
      }

      // Remove isNewlyAdded flags before saving to database
      const cleanedCertifications = mergedCertifications.map(cert => {
        const { isNewlyAdded, ...rest } = cert as any;
        return rest;
      });

      // Single database update with cleaned certifications
      const { error } = await supabase
        .from('guide_profiles')
        .upsert({
          user_id: user.id,
          display_name: formData.display_name,
          location: formData.location,
          bio: formData.bio,
          experience_years: formData.experience_years,
          profile_image_url: profileImageUrl,
          hero_background_url: heroImageUrl,
          specialties: formData.specialties,
          guiding_areas: formData.guiding_areas,
          terrain_capabilities: formData.terrain_capabilities,
          languages_spoken: formData.languages_spoken,
          difficulty_levels: formData.difficulty_levels,
          certifications: cleanedCertifications,
          min_group_size: formData.min_group_size,
          max_group_size: formData.max_group_size,
          seasonal_availability: formData.seasonal_availability,
          upcoming_availability_start: formData.upcoming_availability_start || null,
          upcoming_availability_end: formData.upcoming_availability_end || null,
          daily_rate: formData.daily_rate ? parseFloat(formData.daily_rate) : null,
          daily_rate_currency: formData.daily_rate_currency,
          phone: formData.phone,
          instagram_url: formData.instagram_url,
          facebook_url: formData.facebook_url,
          website_url: formData.website_url,
          intro_video_url: videoType === 'external' ? formData.intro_video_url : videoUrl,
          intro_video_file_path: videoType === 'upload' ? videoFilePath : null,
          video_type: videoType,
          intro_video_size_bytes: videoType === 'upload' ? videoSizeBytes : null,
          intro_video_thumbnail_url: formData.intro_video_thumbnail_url || null,
          updated_at: new Date().toISOString(),
        } as any, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      // Aggressively invalidate ALL guide profile queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-guide-profile'] }),
        queryClient.invalidateQueries({ queryKey: ['guide-profile'] }),
        queryClient.invalidateQueries({ queryKey: ['guide-stats'] }),
        refetch()
      ]);
      
      toast({
        title: "Profile updated",
        description: "Your guide profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSectionToggle = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSaveBasicInfo = async () => {
    setSavingStates(prev => ({ ...prev, basicInfo: true }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('guide_profiles')
        .update({
          display_name: formData.display_name,
          location: formData.location,
          bio: formData.bio,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refetch();
      toast({
        title: "Basic Info Saved",
        description: "Your basic information has been updated.",
      });
    } catch (error) {
      console.error('Error saving basic info:', error);
      toast({
        title: "Error",
        description: "Failed to save basic information.",
        variant: "destructive",
      });
    } finally {
      setSavingStates(prev => ({ ...prev, basicInfo: false }));
    }
  };

  const handleSaveProfileImages = async () => {
    setSavingStates(prev => ({ ...prev, profileImages: true }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let profileImageUrl = profile?.profile_image_url;
      if (profileImage) {
        profileImageUrl = await uploadImage(profileImage, 'hero-images');
      }

      const { error } = await supabase
        .from('guide_profiles')
        .update({
          profile_image_url: profileImageUrl,
          hero_background_url: formData.hero_background_url,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refetch();
      toast({
        title: "Profile Images Saved",
        description: "Your profile images have been updated.",
      });
    } catch (error) {
      console.error('Error saving profile images:', error);
      toast({
        title: "Error",
        description: "Failed to save profile images.",
        variant: "destructive",
      });
    } finally {
      setSavingStates(prev => ({ ...prev, profileImages: false }));
    }
  };

  const handleSaveVideoIntroduction = async () => {
    setSavingStates(prev => ({ ...prev, videoIntro: true }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let videoUrl = formData.intro_video_url;
      let videoFilePath = (profile as any)?.intro_video_file_path;
      let videoSizeBytes: number | null = null;

      if (videoType === 'upload' && videoFile) {
        setIsUploadingVideo(true);
        const fileExt = videoFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('guide-videos')
          .upload(fileName, videoFile, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('guide-videos')
          .getPublicUrl(fileName);

        videoUrl = urlData.publicUrl;
        videoFilePath = fileName;
        videoSizeBytes = videoFile.size;
        setIsUploadingVideo(false);
      }

      const { error } = await supabase
        .from('guide_profiles')
        .update({
          intro_video_url: videoType === 'external' ? formData.intro_video_url : videoUrl,
          intro_video_file_path: videoType === 'upload' ? videoFilePath : null,
          video_type: videoType,
          intro_video_size_bytes: videoType === 'upload' ? videoSizeBytes : null,
          intro_video_thumbnail_url: formData.intro_video_thumbnail_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refetch();
      toast({
        title: "Video Introduction Saved",
        description: "Your video introduction has been updated.",
      });
    } catch (error) {
      console.error('Error saving video introduction:', error);
      toast({
        title: "Error",
        description: "Failed to save video introduction.",
        variant: "destructive",
      });
    } finally {
      setSavingStates(prev => ({ ...prev, videoIntro: false }));
      setIsUploadingVideo(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast({
        title: "Confirmation Required",
        description: "Please type DELETE in capitals to confirm.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (!user?.id) throw new Error('Not authenticated');

      // Delete all connected data in order
      // 1. Delete website images uploaded by this guide
      await supabase
        .from('website_images')
        .delete()
        .eq('uploaded_by', user.id);

      // 2. Get all tours by this guide
      const { data: guideTours } = await supabase
        .from('tours')
        .select('id')
        .eq('guide_id', user.id);

      if (guideTours && guideTours.length > 0) {
        const tourIds = guideTours.map(t => t.id);
        
        // Delete reviews and bookings for these tours
        await supabase
          .from('reviews')
          .delete()
          .in('tour_id', tourIds);
        
        await supabase
          .from('bookings')
          .delete()
          .in('tour_id', tourIds);
      }

      // 3. Delete all tours
      await supabase
        .from('tours')
        .delete()
        .eq('guide_id', user.id);

      // 4. Delete guide profile
      await supabase
        .from('guide_profiles')
        .delete()
        .eq('user_id', user.id);

      // 5. Delete user verification
      await supabase
        .from('user_verifications')
        .delete()
        .eq('user_id', user.id);

      // 6. Delete user roles
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.id);

      // 7. Delete profile
      await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      toast({
        title: "Profile Deleted",
        description: "Your profile and all associated data have been permanently deleted."
      });

      // Sign out and redirect
      await supabase.auth.signOut();
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast({
        title: "Error",
        description: "Failed to delete profile. Please try again or contact support.",
        variant: "destructive"
      });
    }
  };

  const handleSaveCertifications = async () => {
    setSavingStates(prev => ({ ...prev, certifications: true }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get existing certifications to preserve admin verification data
      const existingProfile = await supabase
        .from('guide_profiles')
        .select('certifications')
        .eq('user_id', user.id)
        .maybeSingle();
      
      const existingCerts = (existingProfile?.data?.certifications as any[]) || [];
      
      // Merge: preserve verifiedDate and verifiedBy from existing certs
      const mergedCertifications = formData.certifications.map((newCert) => {
        const existingCert = existingCerts.find((ec: any) => {
          if (newCert.certificateNumber && ec.certificateNumber) {
            return ec.certificateNumber === newCert.certificateNumber;
          }
          return ec.title === newCert.title && ec.certifyingBody === newCert.certifyingBody;
        });
        
        if (existingCert?.verifiedDate) {
          return {
            ...newCert,
            verifiedDate: existingCert.verifiedDate,
            verifiedBy: existingCert.verifiedBy,
          };
        }
        
        return newCert;
      });

      // Trigger Slack notification BEFORE cleaning
      if (hasPendingCertifications) {
        await handleCertificationNotification(user.id, mergedCertifications);
      }

      // Remove isNewlyAdded flags before saving to database
      const cleanedCertifications = mergedCertifications.map(cert => {
        const { isNewlyAdded, ...rest } = cert as any;
        return rest;
      });

      const { error } = await supabase
        .from('guide_profiles')
        .update({
          certifications: cleanedCertifications,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-guide-profile'] }),
        queryClient.invalidateQueries({ queryKey: ['guide-profile'] }),
        refetch()
      ]);
      
      toast({
        title: "Certifications Saved",
        description: hasPendingCertifications 
          ? "Certifications submitted for verification" 
          : "Certifications updated successfully",
      });
    } catch (error) {
      console.error('Error saving certifications:', error);
      toast({
        title: "Error",
        description: "Failed to save certifications.",
        variant: "destructive",
      });
    } finally {
      setSavingStates(prev => ({ ...prev, certifications: false }));
    }
  };

  const handleSaveDifficultyLevels = async () => {
    setSavingStates(prev => ({ ...prev, difficultyLevels: true }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('guide_profiles')
        .update({
          difficulty_levels: formData.difficulty_levels,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refetch();
      toast({
        title: "Difficulty Levels Saved",
        description: "Your difficulty levels have been updated.",
      });
    } catch (error) {
      console.error('Error saving difficulty levels:', error);
      toast({
        title: "Error",
        description: "Failed to save difficulty levels.",
        variant: "destructive",
      });
    } finally {
      setSavingStates(prev => ({ ...prev, difficultyLevels: false }));
    }
  };

  const handleSaveProfessional = async () => {
    setSavingStates(prev => ({ ...prev, professional: true }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('guide_profiles')
        .update({
          specialties: formData.specialties,
          guiding_areas: formData.guiding_areas,
          terrain_capabilities: formData.terrain_capabilities,
          languages_spoken: formData.languages_spoken,
          experience_years: formData.experience_years,
          min_group_size: formData.min_group_size,
          max_group_size: formData.max_group_size,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refetch();
      toast({
        title: "Professional Details Saved",
        description: "Your professional details have been updated.",
      });
    } catch (error) {
      console.error('Error saving professional details:', error);
      toast({
        title: "Error",
        description: "Failed to save professional details.",
        variant: "destructive",
      });
    } finally {
      setSavingStates(prev => ({ ...prev, professional: false }));
    }
  };

  const handleSaveAvailability = async () => {
    setSavingStates(prev => ({ ...prev, availability: true }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('guide_profiles')
        .update({
          seasonal_availability: formData.seasonal_availability,
          upcoming_availability_start: formData.upcoming_availability_start || null,
          upcoming_availability_end: formData.upcoming_availability_end || null,
          daily_rate: formData.daily_rate ? parseFloat(formData.daily_rate) : null,
          daily_rate_currency: formData.daily_rate_currency,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refetch();
      toast({
        title: "Availability & Pricing Saved",
        description: "Your availability and pricing have been updated.",
      });
    } catch (error) {
      console.error('Error saving availability:', error);
      toast({
        title: "Error",
        description: "Failed to save availability and pricing.",
        variant: "destructive",
      });
    } finally {
      setSavingStates(prev => ({ ...prev, availability: false }));
    }
  };

  const handleSaveContact = async () => {
    setSavingStates(prev => ({ ...prev, contact: true }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('guide_profiles')
        .update({
          phone: formData.phone,
          instagram_url: formData.instagram_url,
          facebook_url: formData.facebook_url,
          website_url: formData.website_url,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refetch();
      toast({
        title: "Contact Information Saved",
        description: "Your contact information has been updated.",
      });
    } catch (error) {
      console.error('Error saving contact information:', error);
      toast({
        title: "Error",
        description: "Failed to save contact information.",
        variant: "destructive",
      });
    } finally {
      setSavingStates(prev => ({ ...prev, contact: false }));
    }
  };

  const handleCertificationNotification = async (userId: string, certifications: GuideCertification[]) => {
    try {
      console.log('🔔 Checking for unverified certifications to notify admin...');
      
      // Find certifications that were newly added in this session
      const unverifiedCerts = certifications.filter(cert => (cert as any).isNewlyAdded && !cert.verifiedDate);
      
      if (unverifiedCerts.length === 0) {
        console.log('✅ No unverified certifications to notify about');
        return;
      }
      
      console.log(`📋 Found ${unverifiedCerts.length} unverified certification(s)`);
      
      // Update verification status to pending
      const { data: verification, error: verificationError } = await supabase
        .from('user_verifications')
        .update({
          verification_status: 'pending',
          admin_notes: `Guide added ${unverifiedCerts.length} certification(s) for review: ${unverifiedCerts.map(c => c.title).join(', ')}`,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select('id')
        .single();
      
      if (verificationError || !verification) {
        console.error('❌ Failed to update verification status:', verificationError);
        throw verificationError || new Error('No verification record found');
      }
      
      console.log('✅ Verification status updated to pending, ID:', verification.id);
      
      // Call Slack notification edge function
      const { data: slackResponse, error: slackError } = await supabase.functions.invoke(
        'slack-verification-notification',
        {
          body: {
            verificationId: verification.id,
            action: 'send'
          }
        }
      );
      
      if (slackError) {
        console.error('❌ Slack notification failed:', slackError);
        toast({
          title: "Certifications Submitted",
          description: `${unverifiedCerts.length} certification(s) submitted for review. Admin notification may be delayed.`,
        });
      } else {
        console.log('✅ Slack notification sent successfully:', slackResponse);
        toast({
          title: "Certifications Submitted",
          description: `${unverifiedCerts.length} certification(s) submitted. Admin team has been notified.`,
        });
      }
      
      // Reset pending flags
      setHasPendingCertifications(false);
      setNewCertificationsCount(0);
      
    } catch (error: any) {
      console.error('❌ Certification notification error:', error);
      toast({
        title: "Notification Failed",
        description: error.message || "Failed to notify admin team. Please contact support.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-burgundy" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-playfair font-bold text-charcoal">Guide Profile Settings</h1>
        <p className="text-charcoal/60 mt-2">
          Manage your professional guide profile and credentials
        </p>
      </div>

      <Card className="border-burgundy/10 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-playfair text-charcoal flex items-center gap-2">
            <Mail className="h-5 w-5 text-burgundy" />
            Account Email
          </CardTitle>
          <CardDescription>
            Manage your account email and authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="account_email">Account Email</Label>
            <p className="text-sm text-muted-foreground mb-2">
              This email is used for login and all account communications
            </p>
            <div className="flex gap-2">
              <Input
                id="account_email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="your@email.com"
              />
              <Button
                onClick={handleUpdateEmail}
                disabled={isUpdatingEmail || newEmail === user?.email}
                variant="outline"
                className="border-burgundy/30 text-burgundy hover:bg-burgundy/5"
              >
                {isUpdatingEmail ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Email'
                )}
              </Button>
            </div>
            {newEmail !== user?.email && (
              <Alert className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Changing your email will require verification. You'll receive confirmation emails at both addresses.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Basic Information Section */}
      <Collapsible open={openSections.basicInfo} onOpenChange={() => handleSectionToggle('basicInfo')}>
        <Card className="border-burgundy/10 shadow-md">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-burgundy/5 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-playfair text-charcoal">Basic Information</CardTitle>
                  <CardDescription>Your display name, location, and bio</CardDescription>
                </div>
                <ChevronDown className={cn(
                  "h-5 w-5 transition-transform",
                  openSections.basicInfo && "rotate-180"
                )} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-6">
              <div>
                <Label htmlFor="display_name">Display Name *</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="Your professional name"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Scottish Highlands"
                />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell hikers about yourself..."
                  rows={6}
                />
              </div>
              
              <div className="flex justify-end pt-4 border-t border-burgundy/10">
                <Button 
                  onClick={handleSaveBasicInfo}
                  disabled={savingStates.basicInfo}
                  className="bg-burgundy hover:bg-burgundy-dark text-white"
                >
                  {savingStates.basicInfo ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Basic Info'
                  )}
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Profile Images Section */}
      <Collapsible open={openSections.profileImages} onOpenChange={() => handleSectionToggle('profileImages')}>
        <Card className="border-burgundy/10 shadow-md">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-burgundy/5 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-playfair text-charcoal">Profile Images</CardTitle>
                  <CardDescription>Your profile picture and hero background</CardDescription>
                </div>
                <ChevronDown className={cn(
                  "h-5 w-5 transition-transform",
                  openSections.profileImages && "rotate-180"
                )} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6 pt-6">
              <div>
                <Label>Profile Image</Label>
            <div className="mt-2 flex items-start gap-4">
              {profileImagePreview && (
                <div className="relative">
                  <img
                    src={profileImagePreview}
                    alt="Profile preview"
                    className="h-24 w-24 rounded-full object-cover"
                  />
                  <button
                    onClick={() => {
                      setProfileImage(null);
                      setProfileImagePreview('');
                    }}
                    className="absolute -top-2 -right-2 rounded-full bg-destructive p-1"
                  >
                    <X className="h-4 w-4 text-destructive-foreground" />
                  </button>
                </div>
              )}
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, 'profile')}
                  className="mb-2"
                />
                <p className="text-sm text-muted-foreground">
                  Square image recommended, at least 400x400px
                </p>
              </div>
            </div>
          </div>

          <div>
            <Label>Hero Background Image</Label>
            <div className="mt-2 space-y-4">
              {heroImagePreview && (
                <div className="relative">
                  <img
                    src={heroImagePreview}
                    alt="Hero preview"
                    className="h-48 w-full rounded-lg object-cover"
                  />
                  <button
                    onClick={() => {
                      setFormData(prev => ({ ...prev, hero_background_url: '' }));
                      setHeroImagePreview('');
                    }}
                    className="absolute top-2 right-2 rounded-full bg-destructive p-1"
                  >
                    <X className="h-4 w-4 text-destructive-foreground" />
                  </button>
                </div>
              )}
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setHeroImageSelectorOpen(true)}
                  className="w-full"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {heroImagePreview ? 'Change Hero Image' : 'Select from Image Library'}
                </Button>
                <p className="text-sm text-muted-foreground">
                  Select a wide landscape image from your Image Library (recommended: 1920x600px)
                </p>
              </div>
            </div>
          </div>
            
          <div className="flex justify-end pt-4 border-t border-burgundy/10">
              <Button 
                onClick={handleSaveProfileImages}
                disabled={savingStates.profileImages}
                className="bg-burgundy hover:bg-burgundy-dark text-white"
              >
                {savingStates.profileImages ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Profile Images'
                )}
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>

      {/* Video Introduction Section */}
      <Collapsible open={openSections.videoIntro} onOpenChange={() => handleSectionToggle('videoIntro')}>
        <Card className="border-burgundy/10 shadow-md">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-burgundy/5 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-playfair text-charcoal">Video Introduction</CardTitle>
                  <CardDescription>Add a video to help hikers get to know you</CardDescription>
                </div>
                <ChevronDown className={cn(
                  "h-5 w-5 transition-transform",
                  openSections.videoIntro && "rotate-180"
                )} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-6">
          {/* Video Type Selection */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant={videoType === 'upload' ? 'default' : 'outline'}
              onClick={() => setVideoType('upload')}
              className="flex-1"
            >
              <Video className="w-4 h-4 mr-2" />
              Upload Video
            </Button>
            <Button
              type="button"
              variant={videoType === 'external' ? 'default' : 'outline'}
              onClick={() => setVideoType('external')}
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              External URL
            </Button>
          </div>

          {/* Upload Video Option */}
          {videoType === 'upload' && (
            <>
              {!(profile as any)?.intro_video_file_path && !videoFile ? (
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Input
                    type="file"
                    accept="video/mp4,video/quicktime,video/webm,video/x-msvideo"
                    onChange={handleVideoFileChange}
                    className="hidden"
                    id="video-upload"
                  />
                  <Label htmlFor="video-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 rounded-full bg-primary/10">
                        <Video className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Click to upload video</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          MP4, MOV, WebM, AVI (max 100MB)
                        </p>
                      </div>
                    </div>
                  </Label>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Video className="w-6 h-6 text-primary" />
                      <div>
                        <p className="font-medium">
                          {videoFile ? videoFile.name : 'Video uploaded'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {videoFile
                            ? `${(videoFile.size / (1024 * 1024)).toFixed(2)} MB`
                            : 'Stored in system'}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteVideo}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                  
                  {(profile as any)?.intro_video_url && videoType === 'upload' && !videoFile && (
                    <video
                      src={(profile as any).intro_video_url}
                      controls
                      className="w-full rounded-lg"
                      poster={formData.intro_video_thumbnail_url}
                    />
                  )}
                </div>
              )}
            </>
          )}

          {/* External URL Option */}
          {videoType === 'external' && (
            <div className="space-y-2">
              <Label htmlFor="intro_video_url">Video URL</Label>
              <Input
                id="intro_video_url"
                value={formData.intro_video_url}
                onChange={(e) => setFormData({ ...formData, intro_video_url: e.target.value })}
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
              />
              <p className="text-sm text-muted-foreground">
                Supports YouTube, Vimeo, and other video platforms
              </p>
            </div>
          )}

          {/* Thumbnail Selection */}
          {(formData.intro_video_url || (profile as any)?.intro_video_file_path || videoFile) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Custom Thumbnail</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setThumbnailSelectorOpen(true)}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Select from Image Library
                </Button>
              </div>
              
              {formData.intro_video_thumbnail_url && (
                <div className="border rounded-lg p-3 bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-2">Selected thumbnail:</p>
                  <img
                    src={formData.intro_video_thumbnail_url}
                    alt="Video thumbnail"
                    className="w-full max-w-sm aspect-video object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-end pt-4 border-t border-burgundy/10">
            <Button 
              onClick={handleSaveVideoIntroduction}
              disabled={savingStates.videoIntro || isUploadingVideo}
              className="bg-burgundy hover:bg-burgundy-dark text-white"
            >
              {savingStates.videoIntro || isUploadingVideo ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Video Introduction'
              )}
            </Button>
          </div>
        </CardContent>
      </CollapsibleContent>
    </Card>
  </Collapsible>

      <ThumbnailSelectorModal
        open={thumbnailSelectorOpen}
        onClose={() => setThumbnailSelectorOpen(false)}
        onSelect={handleThumbnailSelect}
        currentThumbnailUrl={formData.intro_video_thumbnail_url}
      />

      <ImageSelectorModal
        open={heroImageSelectorOpen}
        onClose={() => setHeroImageSelectorOpen(false)}
        onSelect={handleHeroImageSelect}
        currentImageUrl={formData.hero_background_url}
        category="hero"
        title="Select Hero Background Image"
        description="Choose a wide landscape image from your Image Library"
      />

      {/* Certifications Section */}
      <Collapsible open={openSections.certifications} onOpenChange={() => handleSectionToggle('certifications')}>
        <Card className="border-burgundy/10 shadow-md">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-burgundy/5 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-playfair text-charcoal">Certifications</CardTitle>
                  <CardDescription>Your professional qualifications and certifications</CardDescription>
                </div>
                <ChevronDown className={cn(
                  "h-5 w-5 transition-transform",
                  openSections.certifications && "rotate-180"
                )} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-6">
          {/* Existing Certifications */}
          {formData.certifications.length > 0 && (
            <div className="space-y-3">
              {formData.certifications.map((cert, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CertificationBadge
                            certification={cert}
                            size="compact"
                            showTooltip
                            isGuideVerified={profile?.verified || false}
                          />
                          {cert.isPrimary && (
                            <Badge variant="secondary" className="gap-1">
                              <Star className="w-3 h-3 fill-current" />
                              Primary
                            </Badge>
                          )}
                        </div>
                        {cert.certificateNumber && (
                          <p className="text-xs text-muted-foreground">Certificate #: {cert.certificateNumber}</p>
                        )}
                        {cert.expiryDate && (
                          <p className="text-xs text-muted-foreground">
                            Expires: {new Date(cert.expiryDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePrimary(index)}
                          aria-label="Set as primary certification"
                          title={cert.isPrimary ? "Remove primary" : "Set as primary"}
                        >
                          <Star className={`w-4 h-4 ${cert.isPrimary ? 'fill-current' : ''}`} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCertification(index)}
                          aria-label="Remove certification"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Priority Alert */}
          {formData.certifications.length > 0 && 
           !formData.certifications.some(c => c.verificationPriority && c.verificationPriority <= 2) && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                To become a verified guide, you need at least one Priority 1 or 2 certification (IFMGA, UIMLA, national, or medical).
              </AlertDescription>
            </Alert>
          )}

          {/* Add Certification Form */}
          {isAddingCert ? (
            <Card className="border-2 border-primary/20">
              <CardContent className="pt-6 space-y-4">
                {/* Step 1: Certification Type Selection */}
                <div>
                  <Label>Certification Type *</Label>
                  <RadioGroup value={certificationType} onValueChange={(v) => {
                    setCertificationType(v as 'standard' | 'custom');
                    setSelectedCertId('');
                    setCertNumberError('');
                    if (v === 'custom') {
                      setNewCert({
                        certificationType: 'custom',
                        title: '',
                        certifyingBody: '',
                        certificateNumber: '',
                        description: '',
                        verificationPriority: 3,
                        badgeColor: '#6b7280'
                      });
                    }
                  }} className="flex gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="standard" id="standard" />
                      <Label htmlFor="standard" className="font-normal cursor-pointer">
                        Standard Certification
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="custom" id="custom" />
                      <Label htmlFor="custom" className="font-normal cursor-pointer">
                        Other Certification
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Step 2a: Standard Certification */}
                {certificationType === 'standard' && (
                  <>
                    <div>
                      <Label htmlFor="cert-select">Select Certification *</Label>
                      <Select value={selectedCertId} onValueChange={handleCertificationSelect}>
                        <SelectTrigger id="cert-select" className="bg-background">
                          <SelectValue placeholder="Choose a certification..." />
                        </SelectTrigger>
                        <SelectContent className="bg-background">
                          {Object.entries(getCertificationsByCategory()).map(([category, certs]) => (
                            <div key={category}>
                              <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                                {category}
                              </div>
                              {certs.map((cert) => (
                                <SelectItem key={cert.id} value={cert.id}>
                                  {cert.name}
                                </SelectItem>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedCertId && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Certifying Body: {findCertificationById(selectedCertId)?.certifyingBody}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Step 2b: Custom Certification */}
                {certificationType === 'custom' && (
                  <>
                    <div>
                      <Label htmlFor="edit-cert-name">Certification Name *</Label>
                      <Input
                        id="edit-cert-name"
                        value={newCert.title}
                        onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                        placeholder="e.g., Local Hiking Guide Certificate"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-cert-body">Certifying Body *</Label>
                      <Input
                        id="edit-cert-body"
                        value={newCert.certifyingBody}
                        onChange={(e) => setNewCert({ ...newCert, certifyingBody: e.target.value })}
                        placeholder="e.g., Regional Tourism Board"
                      />
                    </div>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Custom certifications require manual verification and may take 3-5 business days to review.
                      </AlertDescription>
                    </Alert>
                  </>
                )}

                {/* Common Fields (for both types) */}
                {(certificationType === 'custom' || selectedCertId) && (
                  <>
                    <div>
                      <Label htmlFor="edit-cert-number">
                        Certificate Number 
                        {certificationType === 'standard' && selectedCertId && 
                         findCertificationById(selectedCertId)?.requiresCertificateNumber && ' *'}
                      </Label>
                      <Input
                        id="edit-cert-number"
                        value={newCert.certificateNumber || ''}
                        onChange={(e) => {
                          setNewCert({ ...newCert, certificateNumber: e.target.value });
                          setCertNumberError('');
                        }}
                        placeholder="e.g., IFMGA-12345"
                      />
                      {certNumberError && (
                        <p className="text-xs text-destructive mt-1">{certNumberError}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="edit-cert-expiry">Expiry Date *</Label>
                      <Input
                        id="edit-cert-expiry"
                        type="date"
                        value={newCert.expiryDate || ''}
                        onChange={(e) => setNewCert({ ...newCert, expiryDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-cert-file">Certificate Document *</Label>
                      <div className="mt-2">
                        <Input
                          id="edit-cert-file"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileUpload}
                          className="cursor-pointer"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Upload your certificate (PDF or image)
                        </p>
                        {certFile && (
                          <div className="flex items-center gap-2 mt-2 text-xs text-green-600">
                            <Upload className="w-3 h-3" />
                            {certFile.name}
                          </div>
                        )}
                        {fileError && (
                          <p className="text-xs text-destructive mt-1">{fileError}</p>
                        )}
                      </div>
                    </div>

                    {certificationType === 'custom' && (
                      <div>
                        <Label htmlFor="edit-cert-desc">Description (Optional)</Label>
                        <Textarea
                          id="edit-cert-desc"
                          value={newCert.description || ''}
                          onChange={(e) => setNewCert({ ...newCert, description: e.target.value })}
                          placeholder="Any additional details about this certification..."
                          rows={3}
                        />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        onClick={addCertification}
                        disabled={isUploadingCert}
                      >
                        {isUploadingCert ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          'Add Certification'
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsAddingCert(false);
                          setNewCert({ 
                            certificationType: 'custom',
                            title: '', 
                            certifyingBody: '', 
                            certificateNumber: '',
                            description: '',
                            verificationPriority: 3,
                            badgeColor: '#6b7280'
                          });
                          setCertificationType('standard');
                          setSelectedCertId('');
                          setCertNumberError('');
                          setFileError('');
                          setCertFile(null);
                        }}
                        disabled={isUploadingCert}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Button type="button" variant="outline" onClick={() => setIsAddingCert(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Certification
            </Button>
          )}
          
          {formData.certifications.length > 0 && (
            <div className="flex justify-end pt-4 border-t">
              <Button 
                onClick={handleSaveCertifications}
                disabled={savingStates.certifications}
              >
                {savingStates.certifications ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Certifications'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </CollapsibleContent>
    </Card>
  </Collapsible>

      {/* Difficulty Levels Section */}
      <Collapsible open={openSections.difficultyLevels} onOpenChange={() => handleSectionToggle('difficultyLevels')}>
        <Card className="border-burgundy/10 shadow-md">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-burgundy/5 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-playfair text-charcoal">Difficulty Levels</CardTitle>
                  <CardDescription>Select the difficulty levels you can guide</CardDescription>
                </div>
                <ChevronDown className={cn(
                  "h-5 w-5 transition-transform",
                  openSections.difficultyLevels && "rotate-180"
                )} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DIFFICULTY_OPTIONS.map((option) => (
              <Card
                key={option.value}
                className={`cursor-pointer transition-all ${
                  formData.difficulty_levels.includes(option.value)
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                }`}
                onClick={() =>
                  setFormData({
                    ...formData,
                    difficulty_levels: toggleArrayItem(formData.difficulty_levels, option.value),
                  })
                }
              >
                <CardContent className="p-4">
                  <h4 className="font-semibold">{option.label}</h4>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-end pt-4 border-t border-burgundy/10">
            <Button 
              onClick={handleSaveDifficultyLevels}
              disabled={savingStates.difficultyLevels}
              className="bg-burgundy hover:bg-burgundy-dark text-white"
            >
              {savingStates.difficultyLevels ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Difficulty Levels'
              )}
            </Button>
          </div>
        </CardContent>
      </CollapsibleContent>
    </Card>
  </Collapsible>

      {/* Professional Details Section */}
      <Collapsible open={openSections.professional} onOpenChange={() => handleSectionToggle('professional')}>
        <Card className="border-burgundy/10 shadow-md">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-burgundy/5 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-playfair text-charcoal">Professional Details</CardTitle>
                  <CardDescription>Your expertise, specialties, and capabilities</CardDescription>
                </div>
                <ChevronDown className={cn(
                  "h-5 w-5 transition-transform",
                  openSections.professional && "rotate-180"
                )} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6 pt-6">
          <div>
            <Label>Specialties</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {SPECIALTY_OPTIONS.map((specialty) => (
                <Badge
                  key={specialty}
                  variant={formData.specialties.includes(specialty) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFormData({
                    ...formData,
                    specialties: toggleArrayItem(formData.specialties, specialty)
                  })}
                >
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Guiding Areas</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {GUIDING_AREAS.map((area) => (
                <Badge
                  key={area}
                  variant={formData.guiding_areas.includes(area) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFormData({
                    ...formData,
                    guiding_areas: toggleArrayItem(formData.guiding_areas, area)
                  })}
                >
                  {area}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Terrain Capabilities</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {TERRAIN_OPTIONS.map((terrain) => (
                <Badge
                  key={terrain}
                  variant={formData.terrain_capabilities.includes(terrain) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFormData({
                    ...formData,
                    terrain_capabilities: toggleArrayItem(formData.terrain_capabilities, terrain)
                  })}
                >
                  {terrain}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Languages Spoken</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <Badge
                  key={lang}
                  variant={formData.languages_spoken.includes(lang) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFormData({
                    ...formData,
                    languages_spoken: toggleArrayItem(formData.languages_spoken, lang)
                  })}
                >
                  {lang}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="experience_years">Years of Guiding Experience</Label>
            <Input
              id="experience_years"
              type="number"
              min="0"
              max="50"
              value={formData.experience_years}
              onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
              placeholder="e.g., 5"
            />
            <p className="text-xs text-muted-foreground mt-1">
              This will be displayed on your public profile
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min_group_size">Min Group Size</Label>
              <Input
                id="min_group_size"
                type="number"
                min="1"
                value={formData.min_group_size}
                onChange={(e) => setFormData({ ...formData, min_group_size: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div>
              <Label htmlFor="max_group_size">Max Group Size</Label>
              <Input
                id="max_group_size"
                type="number"
                min="1"
                value={formData.max_group_size}
                onChange={(e) => setFormData({ ...formData, max_group_size: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
          
          <div className="flex justify-end pt-4 border-t border-burgundy/10">
            <Button 
              onClick={handleSaveProfessional}
              disabled={savingStates.professional}
              className="bg-burgundy hover:bg-burgundy-dark text-white"
            >
              {savingStates.professional ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Professional Details'
              )}
            </Button>
          </div>
        </CardContent>
      </CollapsibleContent>
    </Card>
  </Collapsible>

      {/* Availability & Pricing Section */}
      <Collapsible open={openSections.availability} onOpenChange={() => handleSectionToggle('availability')}>
        <Card className="border-burgundy/10 shadow-md">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-burgundy/5 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-playfair text-charcoal">Availability & Pricing</CardTitle>
                  <CardDescription>Your availability and daily rates</CardDescription>
                </div>
                <ChevronDown className={cn(
                  "h-5 w-5 transition-transform",
                  openSections.availability && "rotate-180"
                )} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-6">
          <div>
            <Label htmlFor="seasonal_availability">Seasonal Availability</Label>
            <Textarea
              id="seasonal_availability"
              value={formData.seasonal_availability}
              onChange={(e) => setFormData({ ...formData, seasonal_availability: e.target.value })}
              placeholder="Describe your seasonal availability..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="upcoming_availability_start">Available From</Label>
              <Input
                id="upcoming_availability_start"
                type="date"
                value={formData.upcoming_availability_start}
                onChange={(e) => setFormData({ ...formData, upcoming_availability_start: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="upcoming_availability_end">Available Until</Label>
              <Input
                id="upcoming_availability_end"
                type="date"
                value={formData.upcoming_availability_end}
                onChange={(e) => setFormData({ ...formData, upcoming_availability_end: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="daily_rate">Daily Rate</Label>
              <Input
                id="daily_rate"
                type="number"
                step="0.01"
                value={formData.daily_rate}
                onChange={(e) => setFormData({ ...formData, daily_rate: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="daily_rate_currency">Currency</Label>
              <Select
                value={formData.daily_rate_currency}
                onValueChange={(value: 'EUR' | 'GBP') => setFormData({ ...formData, daily_rate_currency: value })}
              >
                <SelectTrigger id="daily_rate_currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end pt-4 border-t border-burgundy/10">
            <Button 
              onClick={handleSaveAvailability}
              disabled={savingStates.availability}
              className="bg-burgundy hover:bg-burgundy-dark text-white"
            >
              {savingStates.availability ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Availability & Pricing'
              )}
            </Button>
          </div>
        </CardContent>
      </CollapsibleContent>
    </Card>
  </Collapsible>

      {/* Contact Information Section */}
      <Collapsible open={openSections.contact} onOpenChange={() => handleSectionToggle('contact')}>
        <Card className="border-burgundy/10 shadow-md">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-burgundy/5 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-playfair text-charcoal">Contact Information</CardTitle>
                  <CardDescription>Your phone and social media links</CardDescription>
                </div>
                <ChevronDown className={cn(
                  "h-5 w-5 transition-transform",
                  openSections.contact && "rotate-180"
                )} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-6">
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+44 123 456 7890"
            />
          </div>
          <div>
            <Label htmlFor="instagram_url">Instagram URL</Label>
            <Input
              id="instagram_url"
              type="url"
              value={formData.instagram_url}
              onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
              placeholder="https://instagram.com/..."
            />
          </div>
          <div>
            <Label htmlFor="facebook_url">Facebook URL</Label>
            <Input
              id="facebook_url"
              type="url"
              value={formData.facebook_url}
              onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
              placeholder="https://facebook.com/..."
            />
          </div>
          <div>
            <Label htmlFor="website_url">Website URL</Label>
            <Input
              id="website_url"
              type="url"
              value={formData.website_url}
              onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
            placeholder="https://..."
          />
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your account email ({user?.email}) will be used for bookings and inquiries
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-end pt-4 border-t border-burgundy/10">
          <Button 
            onClick={handleSaveContact}
            disabled={savingStates.contact}
            className="bg-burgundy hover:bg-burgundy-dark text-white"
          >
            {savingStates.contact ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Contact Information'
            )}
          </Button>
        </div>
      </CardContent>
    </CollapsibleContent>
  </Card>
</Collapsible>

      {/* Security & Password Section */}
      <Collapsible open={openSections.security} onOpenChange={() => handleSectionToggle('security')}>
        <Card className="border-burgundy/10 shadow-md">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-burgundy/5 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-burgundy" />
                  <div>
                    <CardTitle className="text-lg font-playfair text-charcoal">Security & Password</CardTitle>
                    <CardDescription>Manage your account password and security settings</CardDescription>
                  </div>
                </div>
                <ChevronDown className={cn(
                  "h-5 w-5 transition-transform",
                  openSections.security && "rotate-180"
                )} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-6">
          <div>
            <Label>Password</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Click the button below to receive a password reset link via email
            </p>
            <Button
              onClick={handleResetPassword}
              disabled={isResettingPassword}
              variant="outline"
              className="border-burgundy/30 text-burgundy hover:bg-burgundy/5"
            >
              {isResettingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </div>
        </CardContent>
      </CollapsibleContent>
    </Card>
  </Collapsible>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <button
          onClick={() => setIsDeleteDialogOpen(true)}
          className="text-sm text-destructive hover:underline transition-colors"
        >
          Delete Profile
        </button>
        
        {profile && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              if (onNavigateToGuideProfile) {
                onNavigateToGuideProfile(profile.user_id);
              } else {
                navigate(`/${profile.slug}`);
              }
            }}
            className="border-burgundy/30 text-burgundy hover:bg-burgundy/5"
          >
            <Eye className="mr-2 h-4 w-4" />
            View Public Profile
          </Button>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open) setDeleteConfirmation('');
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Your Profile?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your guide profile, 
              all tours, bookings, reviews, and associated data.
              <br /><br />
              Type <strong>DELETE</strong> in capitals to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="mt-4"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProfile}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteConfirmation !== 'DELETE'}
            >
              Delete Profile Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
