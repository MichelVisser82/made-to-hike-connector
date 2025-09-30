import { MapPin } from 'lucide-react';
import { Badge } from '../ui/badge';

interface GuidingAreasGridProps {
  areas: string[];
}

export function GuidingAreasGrid({ areas }: GuidingAreasGridProps) {
  if (!areas || areas.length === 0) return null;

  const half = Math.ceil(areas.length / 2);
  const leftColumn = areas.slice(0, half);
  const rightColumn = areas.slice(half);

  return (
    <section className="py-8">
      <h2 className="text-3xl font-bold mb-6">Guiding Areas</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          {leftColumn.map((area, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="w-full justify-start text-sm py-3 px-4"
            >
              <MapPin className="w-4 h-4 mr-2 text-primary" />
              {area}
            </Badge>
          ))}
        </div>
        <div className="space-y-3">
          {rightColumn.map((area, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="w-full justify-start text-sm py-3 px-4"
            >
              <MapPin className="w-4 h-4 mr-2 text-primary" />
              {area}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
}
