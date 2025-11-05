import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Percent, Calendar, Users, Clock } from 'lucide-react';
import { EarlyBirdSettings, GroupDiscountSettings, LastMinuteSettings } from '@/types/policySettings';

interface DiscountSettingsProps {
  earlyBird: EarlyBirdSettings;
  group: GroupDiscountSettings;
  lastMinute: LastMinuteSettings;
  onEarlyBirdChange: (settings: EarlyBirdSettings) => void;
  onGroupChange: (settings: GroupDiscountSettings) => void;
  onLastMinuteChange: (settings: LastMinuteSettings) => void;
}

export function DiscountSettings({
  earlyBird,
  group,
  lastMinute,
  onEarlyBirdChange,
  onGroupChange,
  onLastMinuteChange,
}: DiscountSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-playfair text-charcoal flex items-center gap-2">
          <Percent className="w-5 h-5 text-burgundy" />
          Discount Management
        </CardTitle>
        <CardDescription>
          Configure automatic discounts to boost bookings. Discounts stack up to a maximum of 40%.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Early Bird Discounts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-burgundy" />
              <Label htmlFor="early-bird" className="text-base font-medium">Early Bird Discounts</Label>
            </div>
            <Switch
              id="early-bird"
              checked={earlyBird.enabled}
              onCheckedChange={(enabled) => onEarlyBirdChange({ ...earlyBird, enabled })}
            />
          </div>
          
          {earlyBird.enabled && (
            <div className="ml-6 space-y-3 p-4 border rounded-lg bg-accent/20">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">60+ days before</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      min="0"
                      max="50"
                      value={earlyBird.tier1_percent}
                      onChange={(e) => onEarlyBirdChange({ ...earlyBird, tier1_percent: Number(e.target.value) })}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">% off</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm">30-59 days before</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      min="0"
                      max="50"
                      value={earlyBird.tier2_percent}
                      onChange={(e) => onEarlyBirdChange({ ...earlyBird, tier2_percent: Number(e.target.value) })}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">% off</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm">14-29 days before</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      min="0"
                      max="50"
                      value={earlyBird.tier3_percent}
                      onChange={(e) => onEarlyBirdChange({ ...earlyBird, tier3_percent: Number(e.target.value) })}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">% off</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Group Discounts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-burgundy" />
              <Label htmlFor="group" className="text-base font-medium">Group Discounts</Label>
            </div>
            <Switch
              id="group"
              checked={group.enabled}
              onCheckedChange={(enabled) => onGroupChange({ ...group, enabled })}
            />
          </div>
          
          {group.enabled && (
            <div className="ml-6 space-y-3 p-4 border rounded-lg bg-accent/20">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">2-3 people</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      min="0"
                      max="50"
                      value={group.tier1_percent}
                      onChange={(e) => onGroupChange({ ...group, tier1_percent: Number(e.target.value) })}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">% off</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm">4-5 people</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      min="0"
                      max="50"
                      value={group.tier2_percent}
                      onChange={(e) => onGroupChange({ ...group, tier2_percent: Number(e.target.value) })}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">% off</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm">6+ people</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      min="0"
                      max="50"
                      value={group.tier3_percent}
                      onChange={(e) => onGroupChange({ ...group, tier3_percent: Number(e.target.value) })}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">% off</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Last Minute Discounts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-burgundy" />
              <Label htmlFor="last-minute" className="text-base font-medium">Last-Minute Discounts</Label>
            </div>
            <Switch
              id="last-minute"
              checked={lastMinute.enabled}
              onCheckedChange={(enabled) => onLastMinuteChange({ ...lastMinute, enabled })}
            />
          </div>
          
          {lastMinute.enabled && (
            <div className="ml-6 space-y-3 p-4 border rounded-lg bg-accent/20">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Within (hours)</Label>
                  <Input
                    type="number"
                    min="12"
                    max="168"
                    value={lastMinute.hours}
                    onChange={(e) => onLastMinuteChange({ ...lastMinute, hours: Number(e.target.value) })}
                    className="w-24"
                  />
                </div>
                <div>
                  <Label className="text-sm">Discount</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="50"
                      value={lastMinute.percent}
                      onChange={(e) => onLastMinuteChange({ ...lastMinute, percent: Number(e.target.value) })}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">% off</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
