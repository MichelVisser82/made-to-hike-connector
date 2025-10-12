import { AlertCircle, RotateCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h3 className="text-xl font-playfair text-charcoal mb-2">
          Something went wrong
        </h3>
        <p className="text-charcoal/60 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={onRetry}
            className="bg-burgundy hover:bg-burgundy-dark text-white"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button variant="outline">Contact Support</Button>
        </div>
      </CardContent>
    </Card>
  );
}
