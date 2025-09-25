import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Mail, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { type Tour } from '../../types';

interface PendingBookingFlowProps {
  tour: Tour;
  userEmail: string;
  onVerified: () => void;
  onCancel: () => void;
}

export function PendingBookingFlow({ tour, userEmail, onVerified, onCancel }: PendingBookingFlowProps) {
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes
  const { user: authUser } = useAuth();

  useEffect(() => {
    // Check if user has been verified
    if (authUser && authUser.email_confirmed_at) {
      onVerified();
      return;
    }

    // Countdown timer
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [authUser, onVerified]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" />
              Almost There! Verify Your Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Check Your Email</h3>
              <p className="text-muted-foreground">
                We've sent a verification link to <strong>{userEmail}</strong>
              </p>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Your Booking Details</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Tour:</strong> {tour.title}</p>
                <p><strong>Duration:</strong> {tour.duration}</p>
                <p><strong>Price:</strong> {tour.currency === 'EUR' ? '€' : '£'}{tour.price}</p>
                <p><strong>Meeting Point:</strong> {tour.meeting_point}</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-blue-800">Next Steps:</span>
              </div>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>1. Check your email inbox (and spam folder)</li>
                <li>2. Click the verification link in the email</li>
                <li>3. Return here to complete your booking</li>
              </ol>
            </div>

            {timeRemaining > 0 ? (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Your booking will be held for: <strong>{formatTime(timeRemaining)}</strong>
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  I've verified my email
                </Button>
              </div>
            ) : (
              <div className="text-center bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 font-semibold">Booking hold expired</p>
                <p className="text-sm text-yellow-700 mb-3">
                  Please start the booking process again
                </p>
                <Button onClick={onCancel} variant="outline">
                  Return to Tour Details
                </Button>
              </div>
            )}

            <div className="flex gap-4">
              <Button 
                onClick={() => window.location.reload()} 
                className="flex-1"
                disabled={timeRemaining === 0}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Continue After Verification
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Cancel Booking
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Didn't receive the email? Check your spam folder or contact support.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}