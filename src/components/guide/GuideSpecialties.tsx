import { Check } from 'lucide-react';
import { Badge } from '../ui/badge';

interface GuideSpecialtiesProps {
  specialties: string[];
  title?: string;
}

export function GuideSpecialties({ specialties, title = "Specialties" }: GuideSpecialtiesProps) {
  if (!specialties || specialties.length === 0) return null;

  return (
    <section className="py-8">
      <h2 className="text-3xl font-bold mb-6">{title}</h2>
      
      <div className="flex flex-wrap gap-3">
        {specialties.map((specialty, index) => (
          <Badge 
            key={index} 
            variant="secondary" 
            className="text-sm py-2 px-4 bg-muted hover:bg-muted/80"
          >
            <Check className="w-4 h-4 mr-2 text-primary" />
            {specialty}
          </Badge>
        ))}
      </div>
    </section>
  );
}
