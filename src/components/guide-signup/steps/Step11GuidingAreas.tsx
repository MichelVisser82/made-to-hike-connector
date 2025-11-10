import { Check, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { GuideSignupData } from '@/types/guide';
import { useHikingRegions } from '@/hooks/useHikingRegions';
import { useState, useMemo } from 'react';

interface Step11GuidingAreasProps {
  data: Partial<GuideSignupData>;
  updateData: (data: Partial<GuideSignupData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step11GuidingAreas({ data, updateData, onNext, onBack }: Step11GuidingAreasProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: regions, isLoading } = useHikingRegions();
  const selected = data.guiding_areas || [];

  // Create searchable region labels at all hierarchy levels
  const regionOptions = useMemo(() => {
    if (!regions) return [];
    
    const options: Array<{
      id: string;
      label: string;
      searchText: string;
      level: 'country' | 'region' | 'subregion';
    }> = [];
    
    // Track unique entries to avoid duplicates
    const uniqueCountries = new Set<string>();
    const uniqueRegions = new Set<string>();
    const uniqueSubregions = new Set<string>();
    
    regions.forEach(r => {
      // Add country option
      if (!uniqueCountries.has(r.country)) {
        uniqueCountries.add(r.country);
        options.push({
          id: `country-${r.country}`,
          label: r.country,
          searchText: r.country.toLowerCase(),
          level: 'country',
        });
      }
      
      // Add region option (if region exists)
      if (r.region) {
        const regionLabel = `${r.region}, ${r.country}`;
        if (!uniqueRegions.has(regionLabel)) {
          uniqueRegions.add(regionLabel);
          options.push({
            id: `region-${regionLabel}`,
            label: regionLabel,
            searchText: `${r.region} ${r.country}`.toLowerCase(),
            level: 'region',
          });
        }
      }
      
      // Add subregion option
      const subregionLabel = r.region 
        ? `${r.subregion}, ${r.region}, ${r.country}` 
        : `${r.subregion}, ${r.country}`;
      
      if (!uniqueSubregions.has(subregionLabel)) {
        uniqueSubregions.add(subregionLabel);
        options.push({
          id: `subregion-${r.id}`,
          label: subregionLabel,
          searchText: `${r.country} ${r.region || ''} ${r.subregion}`.toLowerCase(),
          level: 'subregion',
        });
      }
    });
    
    // Sort: countries first, then regions, then subregions, alphabetically within each level
    return options.sort((a, b) => {
      const levelOrder = { country: 0, region: 1, subregion: 2 };
      if (a.level !== b.level) {
        return levelOrder[a.level] - levelOrder[b.level];
      }
      return a.label.localeCompare(b.label);
    });
  }, [regions]);

  // Filter regions based on search
  const filteredRegions = useMemo(() => {
    if (!searchTerm.trim()) return regionOptions;
    const search = searchTerm.toLowerCase();
    return regionOptions.filter(r => r.searchText.includes(search));
  }, [regionOptions, searchTerm]);

  const addArea = (regionLabel: string) => {
    if (!selected.includes(regionLabel)) {
      updateData({ guiding_areas: [...selected, regionLabel] });
    }
    setSearchTerm('');
  };

  const removeArea = (area: string) => {
    updateData({ guiding_areas: selected.filter(a => a !== area) });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-serif text-charcoal" style={{fontFamily: 'Playfair Display, serif'}}>Guiding Areas</CardTitle>
          <p className="text-muted-foreground">Where do you guide? Select countries, regions, or specific subregions (select at least 1)</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selected regions */}
          {selected.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-charcoal">Selected Regions:</p>
              <div className="flex flex-wrap gap-2">
                {selected.map((area) => (
                  <Badge
                    key={area}
                    variant="default"
                    className="py-2 px-3 bg-burgundy hover:bg-burgundy/90 text-white"
                  >
                    {area}
                    <button
                      onClick={() => removeArea(area)}
                      className="ml-2 hover:text-burgundy-light focus:outline-none"
                      aria-label={`Remove ${area}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Search box */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by country, region, or subregion (e.g., Switzerland, Scotland, Dolomites...)"
                className="pl-10"
              />
            </div>

            {/* Search results */}
            {searchTerm && (
              <ScrollArea className="h-64 border rounded-md">
                {isLoading ? (
                  <div className="p-4 text-center text-muted-foreground">Loading regions...</div>
                ) : filteredRegions.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">No regions found</div>
                ) : (
                  <div className="p-2">
                    {filteredRegions.map((region) => {
                      const isSelected = selected.includes(region.label);
                      
                      // Visual indicator based on level
                      const levelBadge = {
                        country: { text: '🌍 Country', color: 'text-blue-600' },
                        region: { text: '📍 Region', color: 'text-green-600' },
                        subregion: { text: '🏔️ Subregion', color: 'text-orange-600' },
                      }[region.level];
                      
                      return (
                        <button
                          key={region.id}
                          onClick={() => addArea(region.label)}
                          disabled={isSelected}
                          className="w-full text-left px-3 py-2 rounded-sm hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between transition-colors group"
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm">{region.label}</span>
                            <span className={`text-xs ${levelBadge.color} opacity-70 group-hover:opacity-100`}>
                              {levelBadge.text}
                            </span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-burgundy" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack} className="border-burgundy text-burgundy hover:bg-burgundy/10">Back</Button>
            <Button onClick={onNext} disabled={selected.length === 0} className="bg-burgundy hover:bg-burgundy/90 text-white">Continue</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
