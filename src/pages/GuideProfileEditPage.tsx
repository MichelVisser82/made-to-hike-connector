import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMyGuideProfile } from '@/hooks/useGuideProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';

const SPECIALTY_OPTIONS = [
  'Mountain Hiking', 'Alpine Climbing', 'Rock Climbing', 'Ice Climbing',
  'Via Ferrata', 'Mountaineering', 'Trekking', 'Backpacking',
  'Wildlife Observation', 'Photography Tours', 'Winter Hiking', 'Snowshoeing'
];

const TERRAIN_OPTIONS = [
  'Alpine', 'Forest', 'Desert', 'Coastal', 'Glacier', 
  'Rocky', 'Grassland', 'Wetland', 'Volcanic', 'Canyon'
];

const GUIDING_AREAS = [
  'Dolomites', 'Pyrenees', 'Scottish Highlands', 'Alps', 
  'Carpathians', 'Apennines', 'Picos de Europa', 'Sierra Nevada'
];

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 
  'Portuguese', 'Dutch', 'Polish', 'Czech', 'Romanian'
];

export default function GuideProfileEditPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: profile, isLoading } = useMyGuideProfile();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<any>({
    display_name: '',
    bio: '',
    location: '',
    experience_years: 0,
    seasonal_availability: '',
    daily_rate: 0,
    daily_rate_currency: 'EUR',
    contact_email: '',
    phone: '',
    instagram_url: '',
    facebook_url: '',
    website_url: '',
    specialties: [],
    guiding_areas: [],
    terrain_capabilities: [],
    languages_spoken: [],
    min_group_size: 1,
    max_group_size: 10,
    upcoming_availability_start: '',
    upcoming_availability_end: '',
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');
  const [heroImagePreview, setHeroImagePreview] = useState<string>('');

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        experience_years: profile.experience_years || 0,
        seasonal_availability: profile.seasonal_availability || '',
        daily_rate: profile.daily_rate || 0,
        daily_rate_currency: profile.daily_rate_currency || 'EUR',
        contact_email: profile.contact_email || '',
        phone: profile.phone || '',
        instagram_url: profile.instagram_url || '',
        facebook_url: profile.facebook_url || '',
        website_url: profile.website_url || '',
        specialties: profile.specialties || [],
        guiding_areas: profile.guiding_areas || [],
        terrain_capabilities: profile.terrain_capabilities || [],
        languages_spoken: profile.languages_spoken || [],
        min_group_size: profile.min_group_size || 1,
        max_group_size: profile.max_group_size || 10,
        upcoming_availability_start: profile.upcoming_availability_start || '',
        upcoming_availability_end: profile.upcoming_availability_end || '',
      });
      setProfileImagePreview(profile.profile_image_url || '');
      setHeroImagePreview(profile.hero_background_url || '');
    }
  }, [profile]);

  useEffect(() => {
    document.title = 'Edit Profile | MadeToHike';
  }, []);

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

  const uploadImage = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return publicUrl;
  };

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    }
    return [...array, item];
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let profileImageUrl = profileImagePreview;
      let heroBackgroundUrl = heroImagePreview;

      // Upload images if selected
      if (profileImage) {
        profileImageUrl = await uploadImage(
          profileImage,
          'hero-images',
          `${user.id}/profile-${Date.now()}.jpg`
        );
      }

      if (heroImage) {
        heroBackgroundUrl = await uploadImage(
          heroImage,
          'hero-images',
          `${user.id}/hero-${Date.now()}.jpg`
        );
      }

      const { error } = await supabase
        .from('guide_profiles')
        .upsert({
          user_id: user.id,
          display_name: formData.display_name,
          bio: formData.bio,
          location: formData.location,
          experience_years: formData.experience_years,
          seasonal_availability: formData.seasonal_availability,
          daily_rate: formData.daily_rate,
          daily_rate_currency: formData.daily_rate_currency,
          contact_email: formData.contact_email,
          phone: formData.phone,
          instagram_url: formData.instagram_url,
          facebook_url: formData.facebook_url,
          website_url: formData.website_url,
          specialties: formData.specialties,
          guiding_areas: formData.guiding_areas,
          terrain_capabilities: formData.terrain_capabilities,
          languages_spoken: formData.languages_spoken,
          min_group_size: formData.min_group_size,
          max_group_size: formData.max_group_size,
          upcoming_availability_start: formData.upcoming_availability_start || null,
          upcoming_availability_end: formData.upcoming_availability_end || null,
          profile_image_url: profileImageUrl,
          hero_background_url: heroBackgroundUrl,
          profile_completed: true,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "Profile Saved",
        description: "Your changes have been saved successfully.",
      });

      navigate(`/guides/${user.id}`);
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-background py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Edit Your Guide Profile</h1>
              <p className="text-muted-foreground">Update your information to attract more hikers</p>
            </div>
            <div className="flex gap-2">
              {profile && (
                <Button variant="outline" onClick={() => navigate(`/guides/${profile.user_id}`)}>
                  View Public Profile
                </Button>
              )}
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </div>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="professional">Professional</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Your public profile information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="display_name">Display Name *</Label>
                    <Input
                      id="display_name"
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      placeholder="Your name as it appears to hikers"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Chamonix, France"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio *</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="min-h-[150px]"
                      placeholder="Tell hikers about yourself, your experience, and what makes you passionate about guiding..."
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="images" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Images</CardTitle>
                  <CardDescription>Upload your profile and hero images</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Profile Image</Label>
                    <div className="mt-2 flex items-center gap-4">
                      {profileImagePreview && (
                        <img src={profileImagePreview} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                      )}
                      <div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, 'profile')}
                          className="max-w-xs"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Square image recommended (min 400x400px)</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Hero Background Image</Label>
                    <div className="mt-2 space-y-2">
                      {heroImagePreview && (
                        <img src={heroImagePreview} alt="Hero" className="w-full h-48 rounded-lg object-cover" />
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 'hero')}
                      />
                      <p className="text-xs text-muted-foreground">Wide image recommended (min 1600x600px)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="professional" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Professional Details</CardTitle>
                  <CardDescription>Your expertise and capabilities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Specialties</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {SPECIALTY_OPTIONS.map(specialty => (
                        <Badge
                          key={specialty}
                          variant={formData.specialties.includes(specialty) ? 'default' : 'outline'}
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
                      {GUIDING_AREAS.map(area => (
                        <Badge
                          key={area}
                          variant={formData.guiding_areas.includes(area) ? 'default' : 'outline'}
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
                      {TERRAIN_OPTIONS.map(terrain => (
                        <Badge
                          key={terrain}
                          variant={formData.terrain_capabilities.includes(terrain) ? 'default' : 'outline'}
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
                      {LANGUAGES.map(language => (
                        <Badge
                          key={language}
                          variant={formData.languages_spoken.includes(language) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => setFormData({
                            ...formData,
                            languages_spoken: toggleArrayItem(formData.languages_spoken, language)
                          })}
                        >
                          {language}
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
                    <p className="text-xs text-muted-foreground mt-1">This will be displayed on your public profile</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="min_group_size">Minimum Group Size</Label>
                      <Input
                        id="min_group_size"
                        type="number"
                        min="1"
                        value={formData.min_group_size}
                        onChange={(e) => setFormData({ ...formData, min_group_size: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="max_group_size">Maximum Group Size</Label>
                      <Input
                        id="max_group_size"
                        type="number"
                        min="1"
                        value={formData.max_group_size}
                        onChange={(e) => setFormData({ ...formData, max_group_size: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="availability" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Availability & Pricing</CardTitle>
                  <CardDescription>Set your rates and availability</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="seasonal_availability">Seasonal Availability</Label>
                    <Textarea
                      id="seasonal_availability"
                      value={formData.seasonal_availability}
                      onChange={(e) => setFormData({ ...formData, seasonal_availability: e.target.value })}
                      placeholder="e.g., Available year-round, peak season June-September"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="availability_start">Next Available From</Label>
                      <Input
                        id="availability_start"
                        type="date"
                        value={formData.upcoming_availability_start}
                        onChange={(e) => setFormData({ ...formData, upcoming_availability_start: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="availability_end">Available Until</Label>
                      <Input
                        id="availability_end"
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
                        onChange={(e) => setFormData({ ...formData, daily_rate: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={formData.daily_rate_currency}
                        onValueChange={(value) => setFormData({ ...formData, daily_rate_currency: value })}
                      >
                        <SelectTrigger>
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
            </TabsContent>

            <TabsContent value="contact" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact & Social</CardTitle>
                  <CardDescription>How hikers can reach you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="contact_email">Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagram_url">Instagram URL</Label>
                    <Input
                      id="instagram_url"
                      value={formData.instagram_url}
                      onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                      placeholder="https://instagram.com/yourprofile"
                    />
                  </div>
                  <div>
                    <Label htmlFor="facebook_url">Facebook URL</Label>
                    <Input
                      id="facebook_url"
                      value={formData.facebook_url}
                      onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                      placeholder="https://facebook.com/yourprofile"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website_url">Website URL</Label>
                    <Input
                      id="website_url"
                      value={formData.website_url}
                      onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
