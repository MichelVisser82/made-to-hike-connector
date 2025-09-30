import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { type User, type Tour } from '../../types';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SmartImage } from '../SmartImage';

interface GuideDashboardProps {
  user: User;
  onTourClick: (tour: Tour) => void;
  onStartVerification: () => void;
  onCreateTour: () => void;
}

export function GuideDashboard({ user, onTourClick, onStartVerification, onCreateTour }: GuideDashboardProps) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuideTours();
  }, [user.id]);

  const fetchGuideTours = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .eq('guide_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setTours(data as Tour[]);
      }
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setLoading(false);
    }
  };

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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Tours</CardTitle>
              {user.verified && (
                <Button onClick={onCreateTour} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Tour
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading your tours...</p>
              ) : tours.length === 0 ? (
                <>
                  <p className="text-muted-foreground">No tours created yet.</p>
                  {user.verified && (
                    <Button onClick={onCreateTour} className="mt-4" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Tour
                    </Button>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  {tours.map((tour) => (
                    <div
                      key={tour.id}
                      onClick={() => onTourClick(tour)}
                      className="flex gap-4 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <div className="w-24 h-24 rounded overflow-hidden flex-shrink-0">
                        <SmartImage
                          category="tour"
                          usageContext={tour.region}
                          tags={[tour.region, tour.difficulty]}
                          className="w-full h-full object-cover"
                          alt={tour.title}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{tour.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {tour.description}
                        </p>
                        <div className="flex gap-2 text-xs">
                          <Badge variant="secondary">{tour.difficulty}</Badge>
                          <Badge variant="outline">{tour.region}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {tour.currency === 'EUR' ? '€' : '£'}{tour.price}
                        </div>
                        <Badge variant={tour.is_active ? 'default' : 'secondary'} className="mt-2">
                          {tour.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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