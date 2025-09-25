import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { CreditCard, Mail, Info } from 'lucide-react';
import { type User, type Tour } from '../../types';

interface BookingFlowProps {
  tour: Tour;
  user: User;
  onComplete: () => void;
  onCancel: () => void;
}

export function BookingFlow({ tour, user, onComplete, onCancel }: BookingFlowProps) {
  const [participants, setParticipants] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const totalPrice = tour.price * participants;
  
  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onComplete();
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {!user.verified && (
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Email verification pending. Your booking will be confirmed once you verify your email address.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-primary" />
              Complete Your Booking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tour Summary */}
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Tour Summary</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Tour:</strong> {tour.title}</p>
                <p><strong>Guide:</strong> {tour.guide_name}</p>
                <p><strong>Duration:</strong> {tour.duration}</p>
                <p><strong>Meeting Point:</strong> {tour.meeting_point}</p>
                <p><strong>Price per person:</strong> {tour.currency === 'EUR' ? '€' : '£'}{tour.price}</p>
              </div>
            </div>

            {/* Participants */}
            <div className="space-y-2">
              <Label htmlFor="participants">Number of Participants</Label>
              <Input
                id="participants"
                type="number"
                min="1"
                max={tour.group_size}
                value={participants}
                onChange={(e) => setParticipants(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <p className="text-sm text-muted-foreground">
                Maximum group size: {tour.group_size} people
              </p>
            </div>

            {/* Payment Details */}
            <div className="space-y-4">
              <h3 className="font-semibold">Payment Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input id="expiryDate" placeholder="MM/YY" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input id="cvv" placeholder="123" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input id="cardName" placeholder="John Doe" />
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Amount:</span>
                <span>{tour.currency === 'EUR' ? '€' : '£'}{totalPrice}</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-semibold mb-1">Booking Terms:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Your booking will be confirmed after email verification</li>
                    <li>• Full refund available up to 48 hours before the tour</li>
                    <li>• Guide contact details will be shared 24 hours before the tour</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={handlePayment} 
                className="flex-1"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : `Pay ${tour.currency === 'EUR' ? '€' : '£'}${totalPrice}`}
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}