import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { type User, type Tour } from '../../types';
import type { DashboardSection } from '@/types/dashboard';
import { MainLayout } from '../layout/MainLayout';
import { TodaySection } from '../dashboard/TodaySection';
import { ToursSection } from '../dashboard/ToursSection';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Home, Users as UsersIcon, Euro, MessageSquare } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface GuideDashboardProps {
  user: User;
  onTourClick: (tour: Tour) => void;
  onStartVerification: () => void;
  onCreateTour: (tourData?: Tour) => void;
  onEditTour: (tour: Tour) => void;
  onNavigateToGuideProfile?: (guideId: string) => void;
}

export function GuideDashboard({ user, onTourClick, onStartVerification, onCreateTour, onEditTour, onNavigateToGuideProfile }: GuideDashboardProps) {
  const navigate = useNavigate();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [activeSection, setActiveSection] = useState<DashboardSection>('today');
  const { toast } = useToast();

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
      setTours(data as Tour[] || []);
    } catch (error) {
      console.error('Error fetching tours:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tours',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTour = async () => {
    if (!selectedTour) return;

    try {
      const { error } = await supabase
        .from('tours')
        .delete()
        .eq('id', selectedTour.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Tour deleted successfully',
      });
      
      setDeleteDialogOpen(false);
      setSelectedTour(null);
      fetchGuideTours();
    } catch (error) {
      console.error('Error deleting tour:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete tour',
        variant: 'destructive',
      });
    }
  };

  const handleUnpublishTour = async (tour: Tour) => {
    try {
      const { error } = await supabase
        .from('tours')
        .update({ is_active: false })
        .eq('id', tour.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Tour unpublished',
      });
      fetchGuideTours();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to unpublish tour',
        variant: 'destructive',
      });
    }
  };

  const handlePublishTour = async (tour: Tour) => {
    try {
      const { error } = await supabase
        .from('tours')
        .update({ is_active: true })
        .eq('id', tour.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Tour published',
      });
      fetchGuideTours();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to publish tour',
        variant: 'destructive',
      });
    }
  };

  const handleArchiveTour = async (tour: Tour) => {
    try {
      const { error } = await supabase
        .from('tours')
        .update({ archived: true, is_active: false })
        .eq('id', tour.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Tour archived',
      });
      fetchGuideTours();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to archive tour',
        variant: 'destructive',
      });
    }
  };

  const handleUnarchiveTour = async (tour: Tour) => {
    try {
      const { error } = await supabase
        .from('tours')
        .update({ archived: false })
        .eq('id', tour.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Tour restored',
      });
      fetchGuideTours();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to restore tour',
        variant: 'destructive',
      });
    }
  };

  const handleCopyTour = (tour: Tour) => {
    onCreateTour(tour);
  };

  // Mock data for TODAY section
  const mockStats = {
    todayTours: 0,
    pendingBookings: 5,
    weekEarnings: 0,
    unreadMessages: 0,
  };

  const mockSchedule = [];
  const mockNotifications = [];


  return (
    <MainLayout 
      isDashboardMode={true}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      showVerificationBadge={true}
      isVerified={user.verified}
    >
      <div className="min-h-screen bg-cream-light">
        <main className="p-6">
          {/* TODAY Section */}
          {activeSection === 'today' && (
            <TodaySection
              guideName={user.name.split(' ')[0] || 'Guide'}
              currentDate={new Date()}
              upcomingTours={mockSchedule}
              stats={mockStats}
              notifications={mockNotifications}
              onCreateTour={() => setActiveSection('tours')}
              onManageAvailability={() => setActiveSection('tours')}
              onViewEarnings={() => setActiveSection('money')}
              onSectionNavigate={(section) => setActiveSection(section as DashboardSection)}
            />
          )}

          {/* TOURS Section */}
          {activeSection === 'tours' && (
            <>
              {!user.verified && (
                <Card className="border-burgundy/20 bg-cream mb-6">
                  <CardContent className="p-6">
                    <h3 className="font-semibold font-playfair text-lg mb-2">Complete Your Verification</h3>
                    <p className="text-charcoal/70 mb-4">
                      You need to complete the verification process to start offering tours.
                    </p>
                    <Button onClick={onStartVerification} className="bg-burgundy hover:bg-burgundy-dark text-white">
                      Start Verification Process
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              <ToursSection
                tours={tours}
                loading={loading}
                onCreateTour={onCreateTour}
                onEditTour={onEditTour}
                onDeleteTour={(tour) => {
                  setSelectedTour(tour);
                  setDeleteDialogOpen(true);
                }}
                onTourClick={onTourClick}
                onPublishTour={handlePublishTour}
                onUnpublishTour={handleUnpublishTour}
                onArchiveTour={handleArchiveTour}
                onUnarchiveTour={handleUnarchiveTour}
                onCopyTour={handleCopyTour}
              />
            </>
          )}

          {/* BOOKINGS Section */}
          {activeSection === 'bookings' && (
            <div className="p-8 bg-white rounded-lg shadow-md border border-burgundy/10">
              <h2 className="text-2xl font-playfair text-charcoal mb-4">Bookings Section</h2>
              <p className="text-charcoal/60">Bookings management coming soon...</p>
            </div>
          )}

          {/* MONEY Section */}
          {activeSection === 'money' && (
            <div className="p-8 bg-white rounded-lg shadow-md border border-burgundy/10">
              <h2 className="text-2xl font-playfair text-charcoal mb-4">Money Section</h2>
              <p className="text-charcoal/60">Financial overview coming soon...</p>
            </div>
          )}

          {/* INBOX Section */}
          {activeSection === 'inbox' && (
            <div className="p-8 bg-white rounded-lg shadow-md border border-burgundy/10">
              <h2 className="text-2xl font-playfair text-charcoal mb-4">Inbox Section</h2>
              <p className="text-charcoal/60">Messages and reviews coming soon...</p>
            </div>
          )}
        </main>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Tour</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently delete "{selectedTour?.title}"? This action cannot be undone.
                All bookings and reviews associated with this tour will also be affected.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteTour} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
