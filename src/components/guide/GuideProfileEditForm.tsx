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
import { Loader2, X, Mail, Lock, AlertCircle, Plus, Eye, Star, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '../ui/alert';
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
    portfolio_images: [] as string[],
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
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');
  const [heroImagePreview, setHeroImagePreview] = useState<string>('');
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
  const [portfolioPreviews, setPortfolioPreviews] = useState<string[]>([]);
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
        portfolio_images: profile.portfolio_images || [],
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
      });
      setProfileImagePreview(profile.profile_image_url || '');
      setHeroImagePreview(profile.hero_background_url || '');
      setPortfolioPreviews(profile.portfolio_images || []);
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
      } else {
        setHeroImage(file);
        setHeroImagePreview(URL.createObjectURL(file));
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

  const handlePortfolioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const totalImages = portfolioFiles.length + portfolioPreviews.length + files.length;
    if (totalImages > 10) {
      toast({
        title: "Error",
        description: "Maximum 10 portfolio images allowed",
        variant: "destructive",
      });
      return;
    }

    const newFiles = Array.from(files);
    setPortfolioFiles([...portfolioFiles, ...newFiles]);

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPortfolioPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePortfolioImage = (index: number) => {
    if (index < formData.portfolio_images.length) {
      setFormData({
        ...formData,
        portfolio_images: formData.portfolio_images.filter((_, i) => i !== index),
      });
      setPortfolioPreviews((prev) => prev.filter((_, i) => i !== index));
    } else {
      const fileIndex = index - formData.portfolio_images.length;
      setPortfolioFiles((prev) => prev.filter((_, i) => i !== fileIndex));
      setPortfolioPreviews((prev) => prev.filter((_, i) => i !== index));
    }
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

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let profileImageUrl = profile?.profile_image_url;
      let heroImageUrl = profile?.hero_background_url;
      let portfolioUrls = [...formData.portfolio_images];

      if (profileImage) {
        profileImageUrl = await uploadImage(profileImage, 'hero-images');
      }

      if (heroImage) {
        heroImageUrl = await uploadImage(heroImage, 'hero-images');
      }

      for (const file of portfolioFiles) {
        const url = await uploadImage(file, 'hero-images');
        if (url) portfolioUrls.push(url);
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
          certifications: mergedCertifications,
          portfolio_images: portfolioUrls,
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
          updated_at: new Date().toISOString(),
        } as any, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      // Check if we need to send certification notifications
      if (hasPendingCertifications) {
        await handleCertificationNotification(user.id, mergedCertifications);
      }

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

  const handleCertificationNotification = async (userId: string, certifications: GuideCertification[]) => {
    try {
      console.log('🔔 Checking for unverified certifications to notify admin...');
      
      // Find ALL certifications that don't have a verifiedDate (meaning they're new/unverified)
      const unverifiedCerts = certifications.filter(cert => !cert.verifiedDate);
      
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
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Account Settings
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

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
                      setHeroImage(null);
                      setHeroImagePreview('');
                    }}
                    className="absolute top-2 right-2 rounded-full bg-destructive p-1"
                  >
                    <X className="h-4 w-4 text-destructive-foreground" />
                  </button>
                </div>
              )}
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, 'hero')}
                  className="mb-2"
                />
                <p className="text-sm text-muted-foreground">
                  Wide landscape image recommended, at least 1920x600px
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Images</CardTitle>
          <CardDescription>Upload up to 10 images showcasing your guiding experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {portfolioPreviews.map((preview, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                <img src={preview} alt={`Portfolio ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removePortfolioImage(index)}
                  className="absolute top-2 right-2 rounded-full bg-destructive p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4 text-destructive-foreground" />
                </button>
              </div>
            ))}
          </div>
          {portfolioPreviews.length < 10 && (
            <div>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePortfolioChange}
              />
              <p className="text-sm text-muted-foreground mt-2">
                {portfolioPreviews.length} / 10 images uploaded
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Certifications</CardTitle>
          <CardDescription>Your professional qualifications and certifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Difficulty Levels</CardTitle>
          <CardDescription>Select the difficulty levels you can guide</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Professional Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Availability & Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>
            Your account email ({user?.email}) will be used for bookings and inquiries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security & Password
          </CardTitle>
          <CardDescription>
            Manage your account password and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Password</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Click the button below to receive a password reset link via email
            </p>
            <Button
              onClick={handleResetPassword}
              disabled={isResettingPassword}
              variant="outline"
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
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
        {profile && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              if (onNavigateToGuideProfile) {
                onNavigateToGuideProfile(profile.user_id);
              } else {
                navigate(`/guides/${profile.user_id}`);
              }
            }}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Public Profile
          </Button>
        )}
      </div>
    </div>
  );
}
