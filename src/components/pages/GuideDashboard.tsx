import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { type User, type Tour } from '../../types';
import type { DashboardSection } from '@/types/dashboard';
import { MainLayout } from '../layout/MainLayout';
import { TodaySection } from '../dashboard/TodaySection';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Mountain, Home, Users as UsersIcon, Euro, MessageSquare, Eye, Edit as EditIcon, Copy, Archive, Trash2, Plus, EyeOff, User as UserIcon, Pencil } from 'lucide-react';
import { GuideProfileEditForm } from '../guide/GuideProfileEditForm';
import { GuideImageLibrary } from '../guide/GuideImageLibrary';
import { SmartImage } from '../SmartImage';
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

  const activeTours = tours.filter(t => !t.archived);
  const archivedTours = tours.filter(t => t.archived);

  // Mock data for TODAY section
  const mockStats = {
    todayTours: 0,
    pendingBookings: 5,
    weekEarnings: 0,
    unreadMessages: 0,
  };

  const mockSchedule = [];
  const mockNotifications = [];

  // Navigation items
  const navigationItems = [
    { id: 'today' as DashboardSection, label: 'Today', icon: Home },
    { id: 'tours' as DashboardSection, label: 'Tours', icon: Mountain },
    { id: 'bookings' as DashboardSection, label: 'Bookings', icon: UsersIcon },
    { id: 'money' as DashboardSection, label: 'Money', icon: Euro },
    { id: 'inbox' as DashboardSection, label: 'Inbox', icon: MessageSquare },
  ];

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
            <div className="space-y-6">
              {!user.verified && (
                <Card className="border-burgundy/20 bg-cream">
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

              {/* Active Tours */}
              <Card className="border-burgundy/10">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-playfair">Your Tours</CardTitle>
                  {user.verified && (
                    <Button onClick={() => onCreateTour()} className="bg-burgundy hover:bg-burgundy-dark text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Tour
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-charcoal/60">Loading your tours...</p>
                  ) : activeTours.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-charcoal/60 mb-4">No tours created yet.</p>
                      {user.verified && (
                        <Button onClick={() => onCreateTour()} variant="outline" className="border-burgundy/30 text-burgundy hover:bg-burgundy/5">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Tour
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeTours.map((tour) => (
                        <div
                          key={tour.id}
                          className="flex gap-4 p-4 border border-burgundy/10 rounded-lg bg-white hover:shadow-md transition-shadow"
                        >
                          <div 
                            className="w-24 h-24 rounded overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => onTourClick(tour)}
                          >
                            {tour.hero_image ? (
                              <img src={tour.hero_image} alt={tour.title} className="w-full h-full object-cover" />
                            ) : tour.images[0] ? (
                              <img src={tour.images[0]} alt={tour.title} className="w-full h-full object-cover" />
                            ) : (
                              <SmartImage
                                category="tour"
                                usageContext={tour.region}
                                tags={[tour.region, tour.difficulty]}
                                className="w-full h-full object-cover"
                                alt={tour.title}
                              />
                            )}
                          </div>
                          <div 
                            className="flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => onTourClick(tour)}
                          >
                            <h4 className="font-semibold font-playfair text-lg mb-1">{tour.title}</h4>
                            <p className="text-sm text-charcoal/60 mb-2 line-clamp-2">
                              {tour.description}
                            </p>
                            <div className="flex gap-2 text-xs">
                              <Badge variant="secondary">{tour.difficulty}</Badge>
                              <Badge variant="outline">{tour.region}</Badge>
                              <Badge className={tour.is_active ? 'bg-sage text-white' : 'bg-charcoal/20 text-charcoal'}>
                                {tour.is_active ? 'Published' : 'Unpublished'}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex flex-col items-end justify-between">
                            <div className="font-bold text-lg font-playfair">
                              {tour.currency === 'EUR' ? '€' : '£'}{tour.price}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditTour(tour);
                                }}
                                className="border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyTour(tour);
                                }}
                                title="Copy tour"
                                className="border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              {tour.is_active ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUnpublishTour(tour)}
                                  title="Unpublish tour"
                                >
                                  <EyeOff className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handlePublishTour(tour)}
                                  title="Publish tour"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleArchiveTour(tour)}
                                title="Archive tour"
                              >
                                <Archive className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedTour(tour);
                                  setDeleteDialogOpen(true);
                                }}
                                title="Delete tour"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Archived Tours */}
              {archivedTours.length > 0 && (
                <Card className="border-burgundy/10">
                  <CardHeader>
                    <CardTitle className="font-playfair">Archived Tours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {archivedTours.map((tour) => (
                        <div
                          key={tour.id}
                          className="flex gap-4 p-4 border rounded-lg bg-cream/50"
                        >
                          <div 
                            className="w-24 h-24 rounded overflow-hidden flex-shrink-0 cursor-pointer"
                            onClick={() => onTourClick(tour)}
                          >
                            {tour.hero_image ? (
                              <img src={tour.hero_image} alt={tour.title} className="w-full h-full object-cover" />
                            ) : tour.images[0] ? (
                              <img src={tour.images[0]} alt={tour.title} className="w-full h-full object-cover" />
                            ) : (
                              <SmartImage
                                category="tour"
                                usageContext={tour.region}
                                tags={[tour.region, tour.difficulty]}
                                className="w-full h-full object-cover"
                                alt={tour.title}
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold font-playfair mb-1">{tour.title}</h4>
                            <p className="text-sm text-charcoal/60 mb-2 line-clamp-2">
                              {tour.description}
                            </p>
                            <div className="flex gap-2 text-xs">
                              <Badge variant="secondary">{tour.difficulty}</Badge>
                              <Badge variant="outline">{tour.region}</Badge>
                              <Badge variant="secondary">Archived</Badge>
                            </div>
                          </div>
                          <div className="flex flex-col items-end justify-between">
                            <div className="font-bold text-lg font-playfair">
                              {tour.currency === 'EUR' ? '€' : '£'}{tour.price}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCopyTour(tour)}
                                title="Copy tour"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUnarchiveTour(tour)}
                                title="Restore tour"
                              >
                                <Archive className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedTour(tour);
                                  setDeleteDialogOpen(true);
                                }}
                                title="Delete tour"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
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
