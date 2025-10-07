import { Check } from 'lucide-react';
import { Badge } from '../ui/badge';

interface GuideSpecialtiesProps {
  specialties: string[];
  title?: string;
}

export function GuideSpecialties({ specialties, title = "Specialties" }: GuideSpecialtiesProps) {
  if (!specialties || specialties.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {specialties.map((specialty, index) => (
        <Badge 
          key={index} 
          className="text-sm py-2 px-4 bg-burgundy/10 text-burgundy border border-burgundy/30 hover:bg-burgundy/20"
        >
          <Check className="w-4 h-4 mr-2 text-burgundy" />
          {specialty}
        </Badge>
      ))}
    </div>
  );
}
