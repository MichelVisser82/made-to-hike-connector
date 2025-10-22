import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { TourHighlight, RouteDisplayMode, HIGHLIGHT_CATEGORY_ICONS } from '@/types/map';
import { Eye, EyeOff, MapPin, Lock, Globe } from 'lucide-react';

interface PrivacySettingsPanelProps {
  highlights: Partial<TourHighlight>[];
  onSettingsConfirmed: (settings: {
    showMeetingPoint: boolean;
    routeDisplayMode: RouteDisplayMode;
    featuredHighlightIds: string[];
  }) => void;
  onBack: () => void;
}

export function PrivacySettingsPanel({ highlights, onSettingsConfirmed, onBack }: PrivacySettingsPanelProps) {
  const [showMeetingPoint, setShowMeetingPoint] = useState(true);
  const [routeDisplayMode, setRouteDisplayMode] = useState<RouteDisplayMode>('region_overview');
  const [featuredHighlightIds, setFeaturedHighlightIds] = useState<string[]>([]);

  const publicHighlights = highlights.filter(h => h.isPublic);
  const secretHighlights = highlights.filter(h => !h.isPublic);

  const toggleFeatured = (id: string) => {
    if (featuredHighlightIds.includes(id)) {
      setFeaturedHighlightIds(featuredHighlightIds.filter(fid => fid !== id));
    } else if (featuredHighlightIds.length < 4) {
      setFeaturedHighlightIds([...featuredHighlightIds, id]);
    }
  };

  const handleContinue = () => {
    onSettingsConfirmed({
      showMeetingPoint,
      routeDisplayMode,
      featuredHighlightIds
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-1">Privacy & Public Display Settings</h3>
            <p className="text-sm text-muted-foreground">
              Control what information is shown publicly vs. revealed after booking
            </p>
          </div>
        </div>

        {/* Meeting Point */}
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label className="text-base">Show Meeting Point</Label>
                <p className="text-sm text-muted-foreground">
                  Display exact meeting location on public tour page
                </p>
              </div>
            </div>
            <Switch
              checked={showMeetingPoint}
              onCheckedChange={setShowMeetingPoint}
            />
          </div>

          {/* Route Display Mode */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <Label className="text-base">Route Display Mode</Label>
            </div>
            <RadioGroup value={routeDisplayMode} onValueChange={(v) => setRouteDisplayMode(v as RouteDisplayMode)}>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="region_overview" id="region" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="region" className="cursor-pointer font-medium">
                      Region Overview (Recommended)
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Show approximate region circle. Exact route revealed after booking.
                    </p>
                    <Badge variant="outline" className="mt-2">
                      <Globe className="h-3 w-3 mr-1" />
                      Balanced privacy & promotion
                    </Badge>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="waypoints_only" id="waypoints" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="waypoints" className="cursor-pointer font-medium">
                      Featured Highlights Only
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Show selected highlight locations without route line.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="none" id="none" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="none" className="cursor-pointer font-medium">
                      Keep Private
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Don't show route or highlights publicly. Fully revealed after booking.
                    </p>
                    <Badge variant="secondary" className="mt-2">
                      <Lock className="h-3 w-3 mr-1" />
                      Maximum privacy
                    </Badge>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Featured Highlights Selector */}
          {publicHighlights.length > 0 && routeDisplayMode !== 'none' && (
            <div className="space-y-4">
              <div>
                <Label className="text-base">
                  Featured Highlights (Select up to 4)
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  These will be prominently displayed on your public tour page
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {publicHighlights.map((highlight) => (
                  <div
                    key={highlight.id}
                    onClick={() => toggleFeatured(highlight.id!)}
                    className={`
                      flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors
                      ${featuredHighlightIds.includes(highlight.id!) 
                        ? 'bg-primary/10 border-primary' 
                        : 'hover:bg-muted/50'}
                      ${featuredHighlightIds.length >= 4 && !featuredHighlightIds.includes(highlight.id!) 
                        ? 'opacity-50 cursor-not-allowed' 
                        : ''}
                    `}
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-background border-2">
                      <span className="text-2xl">{HIGHLIGHT_CATEGORY_ICONS[highlight.category!]}</span>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium">{highlight.name}</h5>
                      {highlight.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {highlight.description}
                        </p>
                      )}
                    </div>
                    {featuredHighlightIds.includes(highlight.id!) && (
                      <Badge variant="default">Featured</Badge>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Selected: {featuredHighlightIds.length} / 4
              </p>
            </div>
          )}

          {/* Summary */}
          <Card className="p-4 bg-muted/30">
            <h4 className="font-medium mb-3">Privacy Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Public highlights:</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {publicHighlights.length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Secret highlights:</span>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <EyeOff className="h-3 w-3" />
                  {secretHighlights.length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Featured highlights:</span>
                <Badge variant="default">{featuredHighlightIds.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Meeting point:</span>
                <Badge variant={showMeetingPoint ? "default" : "secondary"}>
                  {showMeetingPoint ? 'Visible' : 'Hidden'}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
