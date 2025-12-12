import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LANGUAGE_OPTIONS } from '@/constants/guideOptions';
import type { GuideSignupData } from '@/types/guide';

interface Step09LanguagesProps {
  data: Partial<GuideSignupData>;
  updateData: (data: Partial<GuideSignupData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step09Languages({ data, updateData, onNext, onBack }: Step09LanguagesProps) {
  const selected = data.languages_spoken || [];

  const toggleLanguage = (language: string) => {
    const newSelected = selected.includes(language)
      ? selected.filter(l => l !== language)
      : [...selected, language];
    updateData({ languages_spoken: newSelected });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-serif text-charcoal" style={{fontFamily: 'Playfair Display, serif'}}>Languages Spoken</CardTitle>
          <p className="text-muted-foreground">Select all languages you can guide in (minimum 1)</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {LANGUAGE_OPTIONS.map((language) => {
              const isSelected = selected.includes(language);
              return (
                <Badge
                  key={language}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer py-3 justify-start text-sm hover:bg-muted"
                  onClick={() => toggleLanguage(language)}
                >
                  {isSelected && <Check className="w-4 h-4 mr-2" />}
                  {language}
                </Badge>
              );
            })}
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack} className="border-burgundy text-burgundy hover:bg-burgundy/10">Back</Button>
            <Button onClick={onNext} disabled={selected.length === 0} className="bg-burgundy hover:bg-burgundy/90 text-white">Continue</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
