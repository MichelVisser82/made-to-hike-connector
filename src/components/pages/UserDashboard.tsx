import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { type User, type Tour } from '../../types';

interface UserDashboardProps {
  user: User;
  onNavigateToSearch: () => void;
  onTourClick: (tour: Tour) => void;
}

export function UserDashboard({ user, onNavigateToSearch }: UserDashboardProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Welcome back, {user.name}!</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">No upcoming tours booked yet.</p>
              <Button onClick={onNavigateToSearch}>
                Find Your Next Adventure
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}