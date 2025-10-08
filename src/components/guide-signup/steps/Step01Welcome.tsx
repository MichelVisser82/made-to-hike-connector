import { Mountain, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Step01WelcomeProps {
  onNext: () => void;
}

export function Step01Welcome({ onNext }: Step01WelcomeProps) {
  const benefits = [
    'Reach thousands of adventure seekers',
    'Manage your tours and bookings',
    'Set your own rates and schedule',
    'Build your professional reputation',
    'Join a community of expert guides',
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Mountain className="w-16 h-16 text-burgundy" />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif text-charcoal mb-4" style={{fontFamily: 'Playfair Display, serif'}}>Become a Mountain Guide</h1>
        <p className="text-lg text-muted-foreground">
          Share your passion for the mountains and guide adventurers on unforgettable journeys
        </p>
      </div>

      <Card className="mb-8 border-0 shadow-lg">
        <CardContent className="p-8">
          <h2 className="text-2xl md:text-3xl font-serif mb-6 text-charcoal" style={{fontFamily: 'Playfair Display, serif'}}>Why Join MadeToHike?</h2>
          <ul className="space-y-4">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-burgundy flex-shrink-0 mt-0.5" />
                <span className="text-base text-charcoal">{benefit}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-muted-foreground mb-6">
          The application process takes about 10-15 minutes. Your progress will be saved automatically.
        </p>
        <Button size="lg" onClick={onNext} className="px-12 bg-burgundy hover:bg-burgundy/90 text-white">
          Get Started
        </Button>
      </div>
    </div>
  );
}
