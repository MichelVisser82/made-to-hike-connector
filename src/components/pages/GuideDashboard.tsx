import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { type User, type Tour } from '../../types';

interface GuideDashboardProps {
  user: User;
  onTourClick: (tour: Tour) => void;
  onStartVerification: () => void;
}

export function GuideDashboard({ user, onStartVerification }: GuideDashboardProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Guide Dashboard</h1>
            <p className="text-muted-foreground">Welcome, {user.name}</p>
          </div>
          <Badge variant={user.verified ? 'default' : 'secondary'}>
            {user.verified ? 'Verified' : 'Pending Verification'}
          </Badge>
        </div>

        {!user.verified && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Complete Your Verification</h3>
              <p className="text-muted-foreground mb-4">
                You need to complete the verification process to start offering tours.
              </p>
              <Button onClick={onStartVerification}>
                Start Verification Process
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Tours</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No tours created yet.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No bookings yet.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}