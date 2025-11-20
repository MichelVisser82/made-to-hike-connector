import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useCountries, useRegionsByCountry, useSubregionsByRegion } from '@/hooks/useHikingRegions';
import { AddRegionModal } from './AddRegionModal';

interface RegionSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const RegionSelector = ({ value, onChange }: RegionSelectorProps) => {
  const [countryOpen, setCountryOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const [subregionOpen, setSubregionOpen] = useState(false);
  const [addRegionOpen, setAddRegionOpen] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const { data: countries } = useCountries();
  const { data: regionData } = useRegionsByCountry(selectedCountry);
  const { data: subregionData } = useSubregionsByRegion(selectedCountry, selectedRegion);

  const countryRegions = regionData?.regions || [];
  const hasRegions = regionData?.hasRegions || false;
  const subregions = subregionData?.subregions || [];

  // regions is now an array of strings
  const parentRegions = countryRegions.sort();

  // Sync internal state with form value when it changes
  useEffect(() => {
    if (value && value !== '') {
      // Parse the value string: "Country - Region - Subregion" or "Country - Subregion"
      const parts = value.split(' - ').map(p => p.trim());
      
      if (parts.length === 3) {
        // Has country, region, and subregion
        setSelectedCountry(parts[0]);
        setSelectedRegion(parts[1]);
      } else if (parts.length === 2) {
        // Has country and subregion only
        setSelectedCountry(parts[0]);
        setSelectedRegion(null);
      }
    } else if (value === '') {
      // Reset if value is cleared
      setSelectedCountry(null);
      setSelectedRegion(null);
    }
  }, [value]);

  const handleCountrySelect = (selectedValue: string) => {
    // Find the original country name (case-sensitive) from the lowercased value
    const country = countries?.find(c => c.toLowerCase() === selectedValue.toLowerCase());
    if (country) {
      setSelectedCountry(country);
      setSelectedRegion(null);
      onChange(''); // Reset final value
      setCountryOpen(false);
    }
  };

  const handleRegionSelect = (selectedValue: string) => {
    const region = parentRegions.find(r => r.toLowerCase() === selectedValue.toLowerCase());
    if (region) {
      setSelectedRegion(region);
      onChange(''); // Reset final value
      setRegionOpen(false);
    }
  };

  const handleSubregionSelect = (selectedValue: string) => {
    const subregion = subregions.find(s => s.toLowerCase() === selectedValue.toLowerCase());
    if (subregion) {
      const fullValue = selectedRegion 
        ? `${selectedCountry} - ${selectedRegion} - ${subregion}`
        : `${selectedCountry} - ${subregion}`;
      onChange(fullValue);
      setSubregionOpen(false);
    }
  };

  const displayValue = value || 'Select hiking region...';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Country Selector */}
        <div>
          <label className="text-sm font-medium mb-2 block">Country</label>
          <Popover open={countryOpen} onOpenChange={setCountryOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={countryOpen}
                className="w-full justify-between"
              >
                {selectedCountry || 'Select country...'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="p-0 z-[1000]" 
              align="start" 
              sideOffset={8}
              collisionPadding={16}
            >
              <Command className="bg-background border">
                <CommandInput placeholder="Search country..." />
                <CommandList>
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandGroup>
                    {countries?.map((country) => (
                      <CommandItem
                        key={country}
                        value={country}
                        onSelect={handleCountrySelect}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedCountry === country ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {country}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Region Selector (if applicable) */}
        {selectedCountry && hasRegions && (
          <div>
            <label className="text-sm font-medium mb-2 block">Region</label>
            <Popover open={regionOpen} onOpenChange={setRegionOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={regionOpen}
                  className="w-full justify-between"
                >
                  {selectedRegion || 'Select region...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="p-0 z-[1000]" 
                align="start" 
                sideOffset={8}
                collisionPadding={16}
              >
                <Command className="bg-background border">
                  <CommandInput placeholder="Search region..." />
                  <CommandList>
                    <CommandEmpty>No region found.</CommandEmpty>
                    <CommandGroup>
                      {parentRegions.map((region) => (
                        <CommandItem
                          key={region}
                          value={region}
                          onSelect={handleRegionSelect}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              selectedRegion === region ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          {region}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Subregion Selector */}
        {selectedCountry && (!hasRegions || selectedRegion) && (
          <div>
            <label className="text-sm font-medium mb-2 block">
              {hasRegions ? 'Specific Area' : 'Hiking Area'}
            </label>
            <Popover open={subregionOpen} onOpenChange={setSubregionOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={subregionOpen}
                  className="w-full justify-between"
                >
                  {value ? value.split(' - ').pop() : 'Select area...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="p-0 z-[1000]" 
                align="start" 
                sideOffset={8}
                collisionPadding={16}
              >
                <Command className="bg-background border">
                  <CommandInput placeholder="Search area..." />
                  <CommandList>
                    <CommandEmpty>No area found.</CommandEmpty>
                    <CommandGroup>
                      {subregions.map((sub) => (
                         <CommandItem
                          key={sub}
                          value={sub}
                          onSelect={handleSubregionSelect}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              value.endsWith(sub) ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          <span>{sub}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {/* Display Selected Region Path */}
      {value && (
        <div className="px-4 py-3 bg-muted/50 rounded-md border border-border">
          <p className="text-sm font-medium text-foreground mb-1">Selected Region:</p>
          <p className="text-sm text-muted-foreground">{value}</p>
        </div>
      )}

      {/* Add Custom Region Button */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">or</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setAddRegionOpen(true)}
          className="w-full md:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add my own region
        </Button>
      </div>

      <AddRegionModal
        open={addRegionOpen}
        onOpenChange={setAddRegionOpen}
        preselectedCountry={selectedCountry}
        onSuccess={(region) => {
          // Parse the region string to populate all dropdowns
          // Format: "Country - Region - Subregion" or "Country - Subregion"
          const parts = region.split(' - ').map(p => p.trim());
          
          if (parts.length === 3) {
            // Has country, region, and subregion
            setSelectedCountry(parts[0]);
            setSelectedRegion(parts[1]);
            onChange(region);
          } else if (parts.length === 2) {
            // Has country and subregion only
            setSelectedCountry(parts[0]);
            setSelectedRegion(null);
            onChange(region);
          }
          
          setAddRegionOpen(false);
        }}
      />
    </div>
  );
};