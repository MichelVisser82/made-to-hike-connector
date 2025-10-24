import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';

interface NotificationSettingsProps {
  userRole: 'guide' | 'hiker' | 'admin' | null;
}

export function NotificationSettings({ userRole }: NotificationSettingsProps) {
  const { preferences, loading, updatePreference } = useNotificationPreferences();

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
          <CardTitle className="text-lg font-playfair text-charcoal">Email Notifications</CardTitle>
          <CardDescription>Choose what updates you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {userRole === 'guide' && (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">New Booking Requests</Label>
                  <p className="text-sm text-charcoal/60">
                    Get notified when someone requests to book your tour
                  </p>
                </div>
                <Switch
                  checked={preferences?.email_on_new_booking ?? true}
                  onCheckedChange={(checked) => updatePreference('email_on_new_booking', checked)}
                  className="data-[state=checked]:bg-burgundy"
                />
              </div>

              <Separator className="bg-burgundy/10" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Payment & Payout Updates</Label>
                  <p className="text-sm text-charcoal/60">
                    Updates about earnings and scheduled payouts
                  </p>
                </div>
                <Switch
                  checked={preferences?.email_on_payout ?? true}
                  onCheckedChange={(checked) => updatePreference('email_on_payout', checked)}
                  className="data-[state=checked]:bg-burgundy"
                />
              </div>

              <Separator className="bg-burgundy/10" />
            </>
          )}

          {userRole === 'hiker' && (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Trip Confirmations</Label>
                  <p className="text-sm text-charcoal/60">
                    Booking confirmations and trip updates
                  </p>
                </div>
                <Switch
                  checked={preferences?.email_on_booking_update ?? true}
                  onCheckedChange={(checked) => updatePreference('email_on_booking_update', checked)}
                  className="data-[state=checked]:bg-burgundy"
                />
              </div>

              <Separator className="bg-burgundy/10" />
            </>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">New Messages</Label>
              <p className="text-sm text-charcoal/60">
                Receive emails for new {userRole === 'guide' ? 'messages from hikers' : 'messages from guides'}
              </p>
            </div>
            <Switch
              checked={preferences?.email_on_new_message ?? true}
              onCheckedChange={(checked) => updatePreference('email_on_new_message', checked)}
              className="data-[state=checked]:bg-burgundy"
            />
          </div>

          <Separator className="bg-burgundy/10" />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Reviews</Label>
              <p className="text-sm text-charcoal/60">
                Notifications about new reviews
              </p>
            </div>
            <Switch
              checked={preferences?.email_on_review ?? true}
              onCheckedChange={(checked) => updatePreference('email_on_review', checked)}
              className="data-[state=checked]:bg-burgundy"
            />
          </div>

          <Separator className="bg-burgundy/10" />

          <div className="space-y-2">
            <Label htmlFor="digest-frequency">Email Digest Frequency</Label>
            <Select
              value={preferences?.email_digest_frequency ?? 'instant'}
              onValueChange={(value) => updatePreference('email_digest_frequency', value)}
            >
              <SelectTrigger id="digest-frequency" className="border-burgundy/20 focus:border-burgundy focus:ring-burgundy/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instant">Instant (every notification)</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Summary</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-charcoal/60">
              Choose how often you want to receive email notifications
            </p>
          </div>
        </CardContent>
      </Card>

      {/* SMS Notifications - Coming Soon */}
      <Card className="border-burgundy/10 shadow-md opacity-60">
        <CardHeader>
          <CardTitle className="text-lg font-playfair text-charcoal">SMS Notifications</CardTitle>
          <CardDescription>Text message alerts (Coming Soon)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Urgent Booking Alerts</Label>
              <p className="text-sm text-charcoal/60">
                SMS alerts for time-sensitive booking updates
              </p>
            </div>
            <Switch disabled className="data-[state=checked]:bg-burgundy" />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card className="border-burgundy/10 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-playfair text-charcoal">Push Notifications</CardTitle>
          <CardDescription>Browser and mobile push notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Enable Push Notifications</Label>
              <p className="text-sm text-charcoal/60">
                Receive real-time updates in your browser
              </p>
            </div>
            <Switch
              checked={preferences?.push_notifications ?? true}
              onCheckedChange={(checked) => updatePreference('push_notifications', checked)}
              className="data-[state=checked]:bg-burgundy"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
