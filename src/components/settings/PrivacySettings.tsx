import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Download, Info } from 'lucide-react';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function PrivacySettings() {
  const { user } = useAuth();
  const { settings, loading, updateSetting } = useUserSettings();

  const handleExportData = async () => {
    if (!user) return;

    try {
      // Fetch all user data
      const [profileData, bookingsData, messagesData] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('bookings').select('*').eq('hiker_id', user.id),
        supabase.from('messages').select('*').eq('sender_id', user.id),
      ]);

      const exportData = {
        user: {
          id: user.id,
          email: user.email,
        },
        profile: profileData.data,
        bookings: bookingsData.data,
        messages: messagesData.data,
        exported_at: new Date().toISOString(),
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `madetohike-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully');
    } catch (error: any) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-burgundy" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-burgundy/10 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-playfair text-charcoal">Profile Visibility</CardTitle>
          <CardDescription>Control who can see your profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base mb-3 block">Who can see your profile</Label>
            <RadioGroup
              value={settings?.profile_visibility ?? 'public'}
              onValueChange={(value) => updateSetting('profile_visibility', value)}
            >
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public" className="font-normal cursor-pointer">
                  Public (anyone on MadeToHike)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="registered" id="registered" />
                <Label htmlFor="registered" className="font-normal cursor-pointer">
                  Registered users only
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Card className="border-burgundy/10 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-playfair text-charcoal">Contact Information</CardTitle>
          <CardDescription>Manage visibility of your contact details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Show email to confirmed bookings</Label>
              <p className="text-sm text-charcoal/60">
                Share your email with hikers who have confirmed bookings
              </p>
            </div>
            <Switch
              checked={settings?.show_email_to_bookings ?? false}
              onCheckedChange={(checked) => updateSetting('show_email_to_bookings', checked)}
              className="data-[state=checked]:bg-burgundy"
            />
          </div>

          <Separator className="bg-burgundy/10" />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Show phone to confirmed bookings</Label>
              <p className="text-sm text-charcoal/60">
                Share your phone number with confirmed bookings
              </p>
            </div>
            <Switch
              checked={settings?.show_phone_to_bookings ?? false}
              onCheckedChange={(checked) => updateSetting('show_phone_to_bookings', checked)}
              className="data-[state=checked]:bg-burgundy"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-burgundy/10 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-playfair text-charcoal">Your Data Rights</CardTitle>
          <CardDescription>GDPR-compliant data management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-burgundy/10">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-charcoal/70">
              You have the right to access, export, and delete your personal data at any time
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button 
              variant="outline" 
              onClick={handleExportData}
              className="w-full border-burgundy/30 text-burgundy hover:bg-burgundy/5"
            >
              <Download className="w-4 h-4 mr-2" />
              Export My Data
            </Button>
            <p className="text-xs text-charcoal/60 text-center">
              Download all your personal data in JSON format
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-burgundy/10 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-playfair text-charcoal">Cookie Preferences</CardTitle>
          <CardDescription>Manage how we use cookies on your device</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Necessary Cookies</Label>
              <p className="text-sm text-charcoal/60">
                Required for basic functionality
              </p>
            </div>
            <Badge className="bg-charcoal/10 text-charcoal">Always Active</Badge>
          </div>

          <Separator className="bg-burgundy/10" />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Analytics Cookies</Label>
              <p className="text-sm text-charcoal/60">
                Help us improve your experience
              </p>
            </div>
            <Switch
              checked={settings?.analytics_cookies ?? true}
              onCheckedChange={(checked) => updateSetting('analytics_cookies', checked)}
              className="data-[state=checked]:bg-burgundy"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
