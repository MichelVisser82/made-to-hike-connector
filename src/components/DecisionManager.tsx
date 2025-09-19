import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Settings, Palette, Layout, Users, Save } from 'lucide-react';
import { toast } from './ui/use-toast';

interface DecisionManagerProps {
  onApplyDecisions: (decisions: any) => void;
}

export function DecisionManager({ onApplyDecisions }: DecisionManagerProps) {
  const [decisions, setDecisions] = useState({
    branding: {
      siteName: 'MadeToHike',
      tagline: 'Guided Adventures',
      primaryColor: '#0f172a',
      accentColor: '#16a34a'
    },
    features: {
      userReviews: true,
      socialLogin: false,
      multiCurrency: true,
      notifications: true,
      chatSupport: false
    },
    layout: {
      headerStyle: 'fixed',
      footerStyle: 'minimal',
      cardStyle: 'elevated',
      spacing: 'comfortable'
    },
    marketplace: {
      commissionRate: 15,
      autoApproval: false,
      requireVerification: true,
      allowInstantBooking: true
    }
  });

  useEffect(() => {
    const saved = localStorage.getItem('madetohike-wireframe-decisions');
    if (saved) {
      try {
        setDecisions(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load decisions:', e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('madetohike-wireframe-decisions', JSON.stringify(decisions));
    onApplyDecisions(decisions);
    toast({
      title: "Settings Saved",
      description: "Your marketplace configuration has been saved successfully.",
    });
  };

  const updateDecision = (category: string, key: string, value: any) => {
    setDecisions(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Marketplace Configuration</h2>
          <p className="text-muted-foreground">Customize your marketplace settings and features</p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Save Configuration
        </Button>
      </div>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="branding" className="gap-2">
            <Palette className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-2">
            <Settings className="h-4 w-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="layout" className="gap-2">
            <Layout className="h-4 w-4" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="gap-2">
            <Users className="h-4 w-4" />
            Marketplace
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={decisions.branding.siteName}
                    onChange={(e) => updateDecision('branding', 'siteName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={decisions.branding.tagline}
                    onChange={(e) => updateDecision('branding', 'tagline', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <Input
                    id="primaryColor"
                    type="color"
                    value={decisions.branding.primaryColor}
                    onChange={(e) => updateDecision('branding', 'primaryColor', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <Input
                    id="accentColor"
                    type="color"
                    value={decisions.branding.accentColor}
                    onChange={(e) => updateDecision('branding', 'accentColor', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>User Reviews & Ratings</Label>
                  <p className="text-sm text-muted-foreground">Allow users to review tours and guides</p>
                </div>
                <Switch
                  checked={decisions.features.userReviews}
                  onCheckedChange={(checked) => updateDecision('features', 'userReviews', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Social Login</Label>
                  <p className="text-sm text-muted-foreground">Enable Google/Facebook login</p>
                </div>
                <Switch
                  checked={decisions.features.socialLogin}
                  onCheckedChange={(checked) => updateDecision('features', 'socialLogin', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Multi-Currency Support</Label>
                  <p className="text-sm text-muted-foreground">Support multiple currencies</p>
                </div>
                <Switch
                  checked={decisions.features.multiCurrency}
                  onCheckedChange={(checked) => updateDecision('features', 'multiCurrency', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send booking and update notifications</p>
                </div>
                <Switch
                  checked={decisions.features.notifications}
                  onCheckedChange={(checked) => updateDecision('features', 'notifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Live Chat Support</Label>
                  <p className="text-sm text-muted-foreground">Built-in customer support chat</p>
                </div>
                <Switch
                  checked={decisions.features.chatSupport}
                  onCheckedChange={(checked) => updateDecision('features', 'chatSupport', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Layout Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Header Style</Label>
                  <Select
                    value={decisions.layout.headerStyle}
                    onValueChange={(value) => updateDecision('layout', 'headerStyle', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="static">Static</SelectItem>
                      <SelectItem value="transparent">Transparent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Footer Style</Label>
                  <Select
                    value={decisions.layout.footerStyle}
                    onValueChange={(value) => updateDecision('layout', 'footerStyle', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                      <SelectItem value="newsletter">With Newsletter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Card Style</Label>
                  <Select
                    value={decisions.layout.cardStyle}
                    onValueChange={(value) => updateDecision('layout', 'cardStyle', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flat">Flat</SelectItem>
                      <SelectItem value="elevated">Elevated</SelectItem>
                      <SelectItem value="outlined">Outlined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Spacing</Label>
                  <Select
                    value={decisions.layout.spacing}
                    onValueChange={(value) => updateDecision('layout', 'spacing', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="comfortable">Comfortable</SelectItem>
                      <SelectItem value="spacious">Spacious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Marketplace Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="commission">Commission Rate (%)</Label>
                <Input
                  id="commission"
                  type="number"
                  min="0"
                  max="50"
                  value={decisions.marketplace.commissionRate}
                  onChange={(e) => updateDecision('marketplace', 'commissionRate', parseInt(e.target.value))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-approve Listings</Label>
                  <p className="text-sm text-muted-foreground">Automatically approve new tour listings</p>
                </div>
                <Switch
                  checked={decisions.marketplace.autoApproval}
                  onCheckedChange={(checked) => updateDecision('marketplace', 'autoApproval', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Guide Verification</Label>
                  <p className="text-sm text-muted-foreground">Guides must be verified before listing tours</p>
                </div>
                <Switch
                  checked={decisions.marketplace.requireVerification}
                  onCheckedChange={(checked) => updateDecision('marketplace', 'requireVerification', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Instant Booking</Label>
                  <p className="text-sm text-muted-foreground">Users can book tours without guide approval</p>
                </div>
                <Switch
                  checked={decisions.marketplace.allowInstantBooking}
                  onCheckedChange={(checked) => updateDecision('marketplace', 'allowInstantBooking', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Configuration Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Badge variant="outline">{decisions.branding.siteName}</Badge>
            <Badge variant={decisions.features.userReviews ? "default" : "secondary"}>
              Reviews: {decisions.features.userReviews ? "Enabled" : "Disabled"}
            </Badge>
            <Badge variant="outline">{decisions.layout.headerStyle} Header</Badge>
            <Badge variant="outline">{decisions.marketplace.commissionRate}% Commission</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}