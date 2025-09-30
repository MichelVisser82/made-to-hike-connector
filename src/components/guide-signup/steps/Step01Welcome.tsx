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
          <Mountain className="w-16 h-16 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Become a Mountain Guide</h1>
        <p className="text-xl text-muted-foreground">
          Share your passion for the mountains and guide adventurers on unforgettable journeys
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="p-8">
          <h2 className="text-2xl font-semibold mb-6">Why Join MadeToHike?</h2>
          <ul className="space-y-4">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-lg">{benefit}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-muted-foreground mb-6">
          The application process takes about 10-15 minutes. Your progress will be saved automatically.
        </p>
        <Button size="lg" onClick={onNext} className="px-12">
          Get Started
        </Button>
      </div>
    </div>
  );
}
