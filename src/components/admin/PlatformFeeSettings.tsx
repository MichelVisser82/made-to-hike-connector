import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Percent, Save, Search, X, DollarSign } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface PlatformFeeSettings {
  guide_fee_percentage: number;
  hiker_fee_percentage: number;
  enabled: boolean;
}

interface GuideWithCustomFees {
  user_id: string;
  display_name: string;
  email: string;
  custom_guide_fee_percentage: number | null;
  custom_hiker_fee_percentage: number | null;
  uses_custom_fees: boolean;
}

export function PlatformFeeSettings() {
  const [globalSettings, setGlobalSettings] = useState<PlatformFeeSettings>({
    guide_fee_percentage: 5,
    hiker_fee_percentage: 10,
    enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [guidesWithCustomFees, setGuidesWithCustomFees] = useState<GuideWithCustomFees[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<any | null>(null);
  const [customGuideFee, setCustomGuideFee] = useState<number>(5);
  const [customHikerFee, setCustomHikerFee] = useState<number>(10);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchGuidesWithCustomFees();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('setting_value')
        .eq('setting_key', 'platform_fees')
        .single();

      if (error) throw error;
      if (data && data.setting_value) {
        const settings = data.setting_value as any;
        setGlobalSettings({
          guide_fee_percentage: settings.guide_fee_percentage || 5,
          hiker_fee_percentage: settings.hiker_fee_percentage || 10,
          enabled: settings.enabled !== undefined ? settings.enabled : true,
        });
      }
    } catch (error) {
      console.error('Error fetching platform settings:', error);
      toast.error('Failed to load platform settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchGuidesWithCustomFees = async () => {
    try {
      const { data, error } = await supabase
        .from('guide_profiles')
        .select('user_id, display_name, custom_guide_fee_percentage, custom_hiker_fee_percentage, uses_custom_fees')
        .eq('uses_custom_fees', true);

      if (error) throw error;

      // Fetch emails from profiles table
      const userIds = data?.map(g => g.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);

      const guidesWithEmails = data?.map(guide => ({
        ...guide,
        email: profiles?.find(p => p.id === guide.user_id)?.email || 'Unknown',
      })) || [];

      setGuidesWithCustomFees(guidesWithEmails as GuideWithCustomFees[]);
    } catch (error) {
      console.error('Error fetching guides with custom fees:', error);
    }
  };

  const saveGlobalSettings = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('platform_settings')
        .update({
          setting_value: globalSettings as any,
          updated_at: new Date().toISOString(),
        })
        .eq('setting_key', 'platform_fees');

      if (error) throw error;

      toast.success('Platform fee settings saved');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const searchGuides = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
        .limit(10);

      if (profilesError) throw profilesError;

      const userIds = profiles?.map(p => p.id) || [];
      const { data: guideProfiles } = await supabase
        .from('guide_profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);

      const results = profiles?.filter(p => 
        guideProfiles?.some(gp => gp.user_id === p.id)
      ) || [];

      setSearchResults(results);
    } catch (error) {
      console.error('Error searching guides:', error);
      toast.error('Failed to search guides');
    } finally {
      setSearching(false);
    }
  };

  const addCustomFeeGuide = async () => {
    if (!selectedGuide) return;

    try {
      const { error } = await supabase
        .from('guide_profiles')
        .update({
          custom_guide_fee_percentage: customGuideFee,
          custom_hiker_fee_percentage: customHikerFee,
          uses_custom_fees: true,
        })
        .eq('user_id', selectedGuide.id);

      if (error) throw error;

      toast.success('Custom fees added for guide');
      setDialogOpen(false);
      setSelectedGuide(null);
      setSearchQuery('');
      setSearchResults([]);
      fetchGuidesWithCustomFees();
    } catch (error) {
      console.error('Error adding custom fees:', error);
      toast.error('Failed to add custom fees');
    }
  };

  const removeCustomFees = async (guideUserId: string) => {
    try {
      const { error } = await supabase
        .from('guide_profiles')
        .update({
          custom_guide_fee_percentage: null,
          custom_hiker_fee_percentage: null,
          uses_custom_fees: false,
        })
        .eq('user_id', guideUserId);

      if (error) throw error;

      toast.success('Custom fees removed');
      fetchGuidesWithCustomFees();
    } catch (error) {
      console.error('Error removing custom fees:', error);
      toast.error('Failed to remove custom fees');
    }
  };

  if (loading) {
    return <div className="p-6">Loading platform settings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-background border-burgundy/10">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-playfair text-foreground mb-2">Platform Fee Settings</h2>
            <p className="text-muted-foreground">
              Configure how platform fees are charged to guides and hikers
            </p>
          </div>

          <Separator />

          {/* Global Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Global Fee Structure</h3>
                <p className="text-sm text-muted-foreground">
                  Default fees applied to all guides unless overridden
                </p>
              </div>
              <Switch
                checked={globalSettings.enabled}
                onCheckedChange={(enabled) =>
                  setGlobalSettings({ ...globalSettings, enabled })
                }
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="guide-fee" className="text-foreground">
                  Guide Fee (% of total transaction)
                </Label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="guide-fee"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={globalSettings.guide_fee_percentage}
                      onChange={(e) =>
                        setGlobalSettings({
                          ...globalSettings,
                          guide_fee_percentage: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="pl-10"
                      disabled={!globalSettings.enabled}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Covers payment processing fees
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hiker-fee" className="text-foreground">
                  Hiker Fee (% of total transaction)
                </Label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="hiker-fee"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={globalSettings.hiker_fee_percentage}
                      onChange={(e) =>
                        setGlobalSettings({
                          ...globalSettings,
                          hiker_fee_percentage: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="pl-10"
                      disabled={!globalSettings.enabled}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Platform service fee
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={saveGlobalSettings}
                disabled={saving || !globalSettings.enabled}
                className="bg-burgundy hover:bg-burgundy-dark text-cream-light"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Global Settings'}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Custom Fee Guides */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Special Fee Structures</h3>
                <p className="text-sm text-muted-foreground">
                  Assign custom fees to specific guides
                </p>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-burgundy/30 text-burgundy hover:bg-burgundy/5">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Add Custom Fees
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-background">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Add Custom Fee Structure</DialogTitle>
                    <DialogDescription>
                      Search for a guide and set custom platform fees
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Search Guide</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Search by name or email..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && searchGuides()}
                        />
                        <Button onClick={searchGuides} disabled={searching} size="icon">
                          <Search className="w-4 h-4" />
                        </Button>
                      </div>
                      {searchResults.length > 0 && (
                        <div className="border border-border rounded-md max-h-40 overflow-y-auto">
                          {searchResults.map((guide) => (
                            <div
                              key={guide.id}
                              className="p-2 hover:bg-muted cursor-pointer"
                              onClick={() => {
                                setSelectedGuide(guide);
                                setSearchResults([]);
                              }}
                            >
                              <div className="font-medium text-foreground">{guide.name}</div>
                              <div className="text-xs text-muted-foreground">{guide.email}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {selectedGuide && (
                      <>
                        <div className="p-3 bg-muted rounded-md">
                          <div className="font-medium text-foreground">{selectedGuide.name}</div>
                          <div className="text-sm text-muted-foreground">{selectedGuide.email}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-foreground">Guide Fee (%)</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={customGuideFee}
                              onChange={(e) => setCustomGuideFee(parseFloat(e.target.value) || 0)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-foreground">Hiker Fee (%)</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={customHikerFee}
                              onChange={(e) => setCustomHikerFee(parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={addCustomFeeGuide}
                      disabled={!selectedGuide}
                      className="bg-burgundy hover:bg-burgundy-dark text-cream-light"
                    >
                      Add Custom Fees
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {guidesWithCustomFees.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No guides with custom fee structures
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-foreground">Guide</TableHead>
                    <TableHead className="text-foreground">Email</TableHead>
                    <TableHead className="text-foreground">Guide Fee</TableHead>
                    <TableHead className="text-foreground">Hiker Fee</TableHead>
                    <TableHead className="text-right text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guidesWithCustomFees.map((guide) => (
                    <TableRow key={guide.user_id}>
                      <TableCell className="font-medium text-foreground">
                        {guide.display_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{guide.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-sage text-sage">
                          {guide.custom_guide_fee_percentage}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-burgundy text-burgundy">
                          {guide.custom_hiker_fee_percentage}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCustomFees(guide.user_id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
