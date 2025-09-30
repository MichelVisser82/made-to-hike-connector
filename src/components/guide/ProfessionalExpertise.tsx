import { useState } from 'react';
import { ChevronDown, Award } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import type { GuideCertification } from '@/types/guide';

interface ProfessionalExpertiseProps {
  certifications: GuideCertification[];
}

export function ProfessionalExpertise({ certifications }: ProfessionalExpertiseProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (!certifications || certifications.length === 0) return null;

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold mb-6">Professional Expertise</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {certifications.map((cert, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{cert.title}</h3>
                  <p className={`text-sm text-muted-foreground ${expandedId === index ? '' : 'line-clamp-2'}`}>
                    {cert.description}
                  </p>
                  {cert.description && cert.description.length > 100 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 p-0 h-auto"
                      onClick={() => setExpandedId(expandedId === index ? null : index)}
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedId === index ? 'rotate-180' : ''}`} />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
