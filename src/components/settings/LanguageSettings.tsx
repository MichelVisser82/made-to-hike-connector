import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react';
import { useUserSettings } from '@/hooks/useUserSettings';

export function LanguageSettings() {
  const { settings, loading, updateSetting } = useUserSettings();

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
          <CardTitle className="text-lg font-playfair text-charcoal">Regional Preferences</CardTitle>
          <CardDescription>Customize your language and regional settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="language">Interface Language</Label>
            <Select
              value={settings?.language ?? 'en'}
              onValueChange={(value) => updateSetting('language', value)}
            >
              <SelectTrigger id="language" className="border-burgundy/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="it">Italiano</SelectItem>
                <SelectItem value="es">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={settings?.timezone ?? 'Europe/London'}
              onValueChange={(value) => updateSetting('timezone', value)}
            >
              <SelectTrigger id="timezone" className="border-burgundy/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Europe/London">London (GMT)</SelectItem>
                <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                <SelectItem value="Europe/Berlin">Berlin (CET)</SelectItem>
                <SelectItem value="Europe/Rome">Rome (CET)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Date Format</Label>
            <RadioGroup
              value={settings?.date_format ?? 'DD/MM/YYYY'}
              onValueChange={(value) => updateSetting('date_format', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="DD/MM/YYYY" id="dmy" />
                <Label htmlFor="dmy" className="font-normal">DD/MM/YYYY (31/12/2025)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="MM/DD/YYYY" id="mdy" />
                <Label htmlFor="mdy" className="font-normal">MM/DD/YYYY (12/31/2025)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="YYYY-MM-DD" id="ymd" />
                <Label htmlFor="ymd" className="font-normal">YYYY-MM-DD (2025-12-31)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency Display</Label>
            <Select
              value={settings?.currency_display ?? 'EUR'}
              onValueChange={(value) => updateSetting('currency_display', value)}
            >
              <SelectTrigger id="currency" className="border-burgundy/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
