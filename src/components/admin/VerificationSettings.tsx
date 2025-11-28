import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck } from 'lucide-react';

export function VerificationSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [requireVerification, setRequireVerification] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('setting_value')
        .eq('setting_key', 'verification_requirements')
        .maybeSingle();

      if (error) throw error;

      if (data?.setting_value) {
        const settings = data.setting_value as any;
        setRequireVerification(settings.require_verification_for_publishing ?? true);
      }
    } catch (error) {
      console.error('Error fetching verification settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load verification settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      const settingsValue = {
        require_verification_for_publishing: requireVerification,
        updated_at: new Date().toISOString(),
      };

      // Check if settings exist
      const { data: existing } = await supabase
        .from('platform_settings')
        .select('id')
        .eq('setting_key', 'verification_requirements')
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('platform_settings')
          .update({
            setting_value: settingsValue,
            updated_at: new Date().toISOString(),
          })
          .eq('setting_key', 'verification_requirements');

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('platform_settings')
          .insert({
            setting_key: 'verification_requirements',
            setting_value: settingsValue,
          });

        if (error) throw error;
      }

      toast({
        title: 'Settings Saved',
        description: 'Verification requirements updated successfully',
      });
    } catch (error) {
      console.error('Error saving verification settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save verification settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-burgundy" />
          <CardTitle>Guide Verification Requirements</CardTitle>
        </div>
        <CardDescription>
          Control when guides need to complete Stripe verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <Label className="text-base font-medium">
              Require Stripe Verification for Publishing Tours
            </Label>
            <p className="text-sm text-muted-foreground">
              When enabled, guides can create tours as drafts but must complete Stripe verification before publishing them live. 
              When disabled, guides can publish tours without Stripe verification (not recommended for production).
            </p>
          </div>
          <Switch
            checked={requireVerification}
            onCheckedChange={setRequireVerification}
            disabled={saving}
          />
        </div>

        <div className="pt-4 border-t">
          <Button
            onClick={saveSettings}
            disabled={saving}
            className="bg-burgundy hover:bg-burgundy-dark text-white"
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
