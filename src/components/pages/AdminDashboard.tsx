import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { type User } from '../../types';

interface AdminDashboardProps {
  user: User;
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Verifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">2</p>
              <p className="text-sm text-muted-foreground">Guides awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">47</p>
              <p className="text-sm text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">€12,450</p>
              <p className="text-sm text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}