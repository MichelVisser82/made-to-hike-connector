import { Languages } from 'lucide-react';
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
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Languages className="h-5 w-5 text-burgundy" />
        <h3 className="text-lg font-semibold text-charcoal/80">
          Languages
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {languages.map((lang, index) => (
          <div key={index} className="flex items-center justify-between bg-cream/50 rounded-lg px-4 py-3">
            <span className="text-charcoal font-medium">{lang.language}</span>
            <span className="text-charcoal/60 text-sm">{lang.proficiency}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
