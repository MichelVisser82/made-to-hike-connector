import { Languages } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

interface Language {
  language: string;
  proficiency: 'Native' | 'Fluent' | 'Conversational' | 'Basic';
}

interface LanguagesSectionProps {
  languages: Language[];
}

const proficiencyColors = {
  Native: 'bg-burgundy text-white',
  Fluent: 'bg-burgundy/80 text-white',
  Conversational: 'bg-burgundy/50 text-white',
  Basic: 'bg-burgundy/30 text-burgundy',
};

export function LanguagesSection({ languages }: LanguagesSectionProps) {
  if (!languages || languages.length === 0) return null;

  return (
    <Card className="border-burgundy/20 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Languages className="h-5 w-5 text-burgundy" />
          <h3 className="text-xl font-semibold" style={{fontFamily: 'Playfair Display, serif'}}>
            Languages
          </h3>
        </div>

        <div className="space-y-3">
          {languages.map((lang, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-charcoal font-medium">{lang.language}</span>
              <Badge className={proficiencyColors[lang.proficiency]}>
                {lang.proficiency}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
