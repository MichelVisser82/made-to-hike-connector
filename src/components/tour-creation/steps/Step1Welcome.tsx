import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mountain } from 'lucide-react';

interface Step1WelcomeProps {
  onNext: () => void;
}

export default function Step1Welcome({ onNext }: Step1WelcomeProps) {
  return (
    <Card>
      <CardContent className="pt-12 pb-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Mountain className="w-10 h-10 text-primary" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold mb-4">Create Your Tour</h2>
        
        <p className="text-muted-foreground text-lg mb-2 max-w-2xl mx-auto">
          Let's build something amazing together
        </p>
        
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          We'll guide you through creating your perfect hiking tour. 
          This process will take about 10-15 minutes. You can save your progress 
          and come back anytime.
        </p>

        <Button size="lg" onClick={onNext} className="px-8">
          Get Started
        </Button>
      </CardContent>
    </Card>
  );
}
