import { Badge } from '@/components/ui/badge';

interface QuickFiltersProps {
  selectedSpecialties: string[];
  onToggleSpecialty: (specialty: string) => void;
}

const QUICK_FILTERS = [
  'Scottish Highlands',
  'Winter Hiking',
  'Alpine Climbing',
  'Family Adventures',
  'Photography Tours',
  'Via Ferrata',
  'Glacier Hiking',
  'Multi-day Treks',
];

export function QuickFilters({ selectedSpecialties, onToggleSpecialty }: QuickFiltersProps) {
  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex gap-2 min-w-max px-1">
        {QUICK_FILTERS.map((filter) => {
          const isSelected = selectedSpecialties.includes(filter);
          return (
            <Badge
              key={filter}
              variant={isSelected ? 'default' : 'outline'}
              className={`
                cursor-pointer transition-all whitespace-nowrap px-4 py-2
                ${isSelected 
                  ? 'bg-[#881337] hover:bg-[#7f1d1d] text-white border-[#881337]' 
                  : 'hover:bg-accent border-input'
                }
              `}
              onClick={() => onToggleSpecialty(filter)}
            >
              {filter}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
