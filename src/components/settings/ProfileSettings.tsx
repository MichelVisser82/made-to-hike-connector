import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ExternalLink, Loader2 } from 'lucide-react';

interface ProfileSettingsProps {
  userRole: 'guide' | 'hiker' | 'admin' | null;
}

export function ProfileSettings({ userRole }: ProfileSettingsProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Guide-specific state
  const [profileVisible, setProfileVisible] = useState(true);
  const [slug, setSlug] = useState('');
  const [originalSlug, setOriginalSlug] = useState('');

  useEffect(() => {
    if (userRole === 'guide') {
      fetchGuideProfile();
    } else {
      setLoading(false);
    }
  }, [userRole, user]);

  const fetchGuideProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('guide_profiles')
        .select('slug, profile_completed')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setSlug(data.slug || '');
        setOriginalSlug(data.slug || '');
        setProfileVisible(data.profile_completed || false);
      }
    } catch (error: any) {
      console.error('Error fetching guide profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSlugChange = async () => {
    if (!user || slug === originalSlug) return;

    try {
      setSaving(true);
      
      // Sanitize slug
      const sanitizedSlug = slug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      const { error } = await supabase
        .from('guide_profiles')
        .update({ slug: sanitizedSlug })
        .eq('user_id', user.id);

      if (error) throw error;

      setSlug(sanitizedSlug);
      setOriginalSlug(sanitizedSlug);
      toast.success('Profile URL updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile URL');
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async (checked: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('guide_profiles')
        .update({ profile_completed: checked })
        .eq('user_id', user.id);

      if (error) throw error;

      setProfileVisible(checked);
      toast.success(checked ? 'Profile is now public' : 'Profile is now private');
    } catch (error: any) {
      toast.error('Failed to update visibility');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-burgundy" />
      </div>
    );
  }

  if (userRole === 'guide') {
    return (
      <div className="space-y-6">
        <Card className="border-burgundy/10 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-playfair text-charcoal">Public Profile</CardTitle>
            <CardDescription>Manage how your profile appears to hikers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Profile Visibility</Label>
                <p className="text-sm text-charcoal/60">
                  Make your profile visible to hikers
                </p>
              </div>
              <Switch
                checked={profileVisible}
                onCheckedChange={toggleVisibility}
                className="data-[state=checked]:bg-burgundy"
              />
            </div>

            <Separator className="bg-burgundy/10" />

            <div>
              <Label htmlFor="profile-url">Profile URL</Label>
              <p className="text-sm text-charcoal/60 mb-2">
                Customize your public profile link
              </p>
              <div className="flex gap-2 items-center">
                <span className="text-sm text-charcoal/60 whitespace-nowrap">
                  madetohike.com/
                </span>
                <Input
                  id="profile-url"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="your-name"
                  className="border-burgundy/20 focus:border-burgundy focus:ring-burgundy/20"
                />
              </div>
              {slug !== originalSlug && (
                <Button
                  onClick={handleSlugChange}
                  disabled={saving}
                  className="mt-3 bg-burgundy hover:bg-burgundy-dark text-white"
                  size="sm"
                >
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {saving ? 'Saving...' : 'Save URL'}
                </Button>
              )}
            </div>

            <Separator className="bg-burgundy/10" />

            <Button
              onClick={() => navigate('/profile')}
              variant="outline"
              className="w-full border-burgundy/30 text-burgundy hover:bg-burgundy/5"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Edit Full Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Hiker profile settings
  return (
    <div className="space-y-6">
      <Card className="border-burgundy/10 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-playfair text-charcoal">Profile Preferences</CardTitle>
          <CardDescription>Manage your hiker profile settings</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => navigate('/profile')}
            variant="outline"
            className="w-full border-burgundy/30 text-burgundy hover:bg-burgundy/5"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Edit Full Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
