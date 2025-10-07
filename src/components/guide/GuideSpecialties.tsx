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
      <h2 className="text-3xl font-bold mb-6 text-charcoal" style={{fontFamily: 'Playfair Display, serif'}}>
        {title}
      </h2>
      
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
    </section>
  );
}
