import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CheckCircle } from 'lucide-react';
import { type User, type Tour } from '../../types';

interface BookingFlowProps {
  tour: Tour;
  user: User;
  onComplete: () => void;
  onCancel: () => void;
}

export function BookingFlow({ tour, user, onComplete, onCancel }: BookingFlowProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-primary" />
              Booking Confirmed!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Tour Details</h3>
              <p><strong>Tour:</strong> {tour.title}</p>
              <p><strong>Guide:</strong> {tour.guide_name}</p>
              <p><strong>Duration:</strong> {tour.duration}</p>
              <p><strong>Price:</strong> {tour.currency === 'EUR' ? '€' : '£'}{tour.price}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Confirmation Details</h3>
              <p><strong>Booking ID:</strong> MTH-{Date.now()}</p>
              <p><strong>Booked by:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                A confirmation email has been sent to {user.email} with all the details 
                and instructions for your upcoming adventure.
              </p>
            </div>

            <div className="flex gap-4">
              <Button onClick={onComplete} className="flex-1">
                Go to Dashboard
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Back to Tour
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}