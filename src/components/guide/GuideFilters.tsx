import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PRELOADED_CERTIFICATIONS } from '@/constants/certifications';

interface GuideFiltersProps {
  filters: {
    location: string;
    specialties: string[];
    certifications: string[];
    priceRange: string;
    difficultyLevels: string[];
  };
  onFilterChange: (filters: GuideFiltersProps['filters']) => void;
  availableLocations: string[];
  availableSpecialties: string[];
  availableCertifications: string[];
  availableDifficultyLevels: string[];
  availablePriceRanges: Array<{ value: string; label: string }>;
}

const DIFFICULTY_LEVEL_LABELS: Record<string, string> = {
  'easy': 'Level A - Easy',
  'moderate': 'Level B - Moderate',
  'challenging': 'Level C - Challenging',
  'difficult': 'Level D - Difficult',
};

export function GuideFilters({ 
  filters, 
  onFilterChange, 
  availableLocations,
  availableSpecialties,
  availableCertifications,
  availableDifficultyLevels,
  availablePriceRanges,
}: GuideFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSpecialty = (specialty: string) => {
    const newSpecialties = filters.specialties.includes(specialty)
      ? filters.specialties.filter(s => s !== specialty)
      : [...filters.specialties, specialty];
    
    onFilterChange({ ...filters, specialties: newSpecialties });
  };

  const toggleCertification = (certId: string) => {
    const newCerts = filters.certifications.includes(certId)
      ? filters.certifications.filter(c => c !== certId)
      : [...filters.certifications, certId];
    
    onFilterChange({ ...filters, certifications: newCerts });
  };

  const toggleDifficulty = (level: string) => {
    const newLevels = filters.difficultyLevels.includes(level)
      ? filters.difficultyLevels.filter(l => l !== level)
      : [...filters.difficultyLevels, level];
    
    onFilterChange({ ...filters, difficultyLevels: newLevels });
  };

  const clearAllFilters = () => {
    onFilterChange({
      location: 'all',
      specialties: [],
      certifications: [],
      priceRange: 'all',
      difficultyLevels: [],
    });
  };

  const hasActiveFilters = 
    filters.location !== 'all' ||
    filters.specialties.length > 0 ||
    filters.certifications.length > 0 ||
    filters.priceRange !== 'all' ||
    filters.difficultyLevels.length > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between gap-4">
        <CollapsibleTrigger asChild>
          <Button 
            variant="outline" 
            className="border-[#881337] text-[#881337] hover:bg-[#881337]/10"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge className="ml-2 bg-[#881337] hover:bg-[#881337]">
                {filters.specialties.length + filters.certifications.length + filters.difficultyLevels.length}
              </Badge>
            )}
          </Button>
        </CollapsibleTrigger>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      <CollapsibleContent className="mt-4">
        <div className="p-6 bg-card border rounded-lg shadow-lg space-y-6">
          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <Select
              value={filters.location}
              onValueChange={(value) => onFilterChange({ ...filters, location: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {availableLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Specialties */}
          {availableSpecialties.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Specialties</label>
              <div className="flex flex-wrap gap-2">
                {availableSpecialties.map((specialty) => {
                  const isSelected = filters.specialties.includes(specialty);
                  return (
                    <Badge
                      key={specialty}
                      variant={isSelected ? 'default' : 'outline'}
                      className={`
                        cursor-pointer transition-all
                        ${isSelected 
                          ? 'bg-[#881337] hover:bg-[#7f1d1d] text-white' 
                          : 'hover:bg-accent'
                        }
                      `}
                      onClick={() => toggleSpecialty(specialty)}
                    >
                      {specialty}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Certifications */}
          {availableCertifications.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Certifications</label>
              <div className="flex flex-wrap gap-2">
                {PRELOADED_CERTIFICATIONS
                  .filter(cert => availableCertifications.includes(cert.id))
                  .map((cert) => {
                    const isSelected = filters.certifications.includes(cert.id);
                    return (
                      <Badge
                        key={cert.id}
                        variant={isSelected ? 'default' : 'outline'}
                        className={`
                          cursor-pointer transition-all
                          ${isSelected 
                            ? 'bg-[#881337] hover:bg-[#7f1d1d] text-white' 
                            : 'hover:bg-accent'
                          }
                        `}
                        onClick={() => toggleCertification(cert.id)}
                      >
                        {cert.name.split('(')[0].trim()}
                      </Badge>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Price Range */}
          {availablePriceRanges.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Daily Rate</label>
              <Select
                value={filters.priceRange}
                onValueChange={(value) => onFilterChange({ ...filters, priceRange: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Prices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  {availablePriceRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Difficulty Levels */}
          {availableDifficultyLevels.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty Levels</label>
              <div className="flex flex-wrap gap-2">
                {availableDifficultyLevels.map((level) => {
                  const isSelected = filters.difficultyLevels.includes(level);
                  const label = DIFFICULTY_LEVEL_LABELS[level] || level;
                  return (
                    <Badge
                      key={level}
                      variant={isSelected ? 'default' : 'outline'}
                      className={`
                        cursor-pointer transition-all
                        ${isSelected 
                          ? 'bg-[#881337] hover:bg-[#7f1d1d] text-white' 
                          : 'hover:bg-accent'
                        }
                      `}
                      onClick={() => toggleDifficulty(level)}
                    >
                      {label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
