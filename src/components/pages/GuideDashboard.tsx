import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { type User, type Tour } from '../../types';
import { Settings, Plus, Archive, Copy, Trash2, Pencil, Eye, EyeOff, User as UserIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SmartImage } from '../SmartImage';
import { GuideImageLibrary } from '../guide/GuideImageLibrary';
import { GuideProfileEditForm } from '../guide/GuideProfileEditForm';
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
}

export function GuideDashboard({ user, onTourClick, onStartVerification, onCreateTour, onEditTour }: GuideDashboardProps) {
  const navigate = useNavigate();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [activeTab, setActiveTab] = useState('tours');
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

      if (data) {
        setTours(data as Tour[]);
      }
    } catch (error) {
      console.error('Error fetching tours:', error);
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
        title: "Tour deleted",
        description: "The tour has been permanently deleted.",
      });

      fetchGuideTours();
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete tour. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedTour(null);
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
        title: "Tour unpublished",
        description: "The tour is no longer visible in search results.",
      });

      fetchGuideTours();
    } catch (error) {
      toast({
        title: "Unpublish failed",
        description: "Failed to unpublish tour. Please try again.",
        variant: "destructive",
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
        title: "Tour published",
        description: "The tour is now visible in search results.",
      });

      fetchGuideTours();
    } catch (error) {
      toast({
        title: "Publish failed",
        description: "Failed to publish tour. Please try again.",
        variant: "destructive",
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
        title: "Tour archived",
        description: "The tour has been moved to archived tours.",
      });

      fetchGuideTours();
    } catch (error) {
      toast({
        title: "Archive failed",
        description: "Failed to archive tour. Please try again.",
        variant: "destructive",
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
        title: "Tour restored",
        description: "The tour has been moved back to your active tours.",
      });

      fetchGuideTours();
    } catch (error) {
      toast({
        title: "Restore failed",
        description: "Failed to restore tour. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyTour = (tour: Tour) => {
    // Pass the tour data to create a copy
    onCreateTour(tour);
  };

  const activeTours = tours.filter(t => !t.archived);
  const archivedTours = tours.filter(t => t.archived);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Guide Dashboard</h1>
            <p className="text-muted-foreground">Welcome, {user.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('profile')}
            >
              <UserIcon className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Badge variant={user.verified ? 'default' : 'secondary'}>
              {user.verified ? 'Verified' : 'Pending Verification'}
            </Badge>
          </div>
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="tours">Your Tours</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="images">Image Library</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="tours">
            <div className="space-y-6">
              {/* Active Tours */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Your Tours</CardTitle>
                  {user.verified && (
                    <Button onClick={() => onCreateTour()} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Tour
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-muted-foreground">Loading your tours...</p>
                  ) : activeTours.length === 0 ? (
                    <>
                      <p className="text-muted-foreground">No tours created yet.</p>
                      {user.verified && (
                        <Button onClick={() => onCreateTour()} className="mt-4" variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Tour
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="space-y-4">
                      {activeTours.map((tour) => (
                        <div
                          key={tour.id}
                          className="flex gap-4 p-4 border rounded-lg"
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
                            <h4 className="font-semibold mb-1">{tour.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {tour.description}
                            </p>
                            <div className="flex gap-2 text-xs">
                              <Badge variant="secondary">{tour.difficulty}</Badge>
                              <Badge variant="outline">{tour.region}</Badge>
                              <Badge variant={tour.is_active ? 'default' : 'secondary'}>
                                {tour.is_active ? 'Published' : 'Unpublished'}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex flex-col items-end justify-between">
                            <div className="font-bold text-lg">
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
                                  <Plus className="w-4 h-4" />
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
                <Card>
                  <CardHeader>
                    <CardTitle>Archived Tours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {archivedTours.map((tour) => (
                        <div
                          key={tour.id}
                          className="flex gap-4 p-4 border rounded-lg bg-muted/50"
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
                            <h4 className="font-semibold mb-1">{tour.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {tour.description}
                            </p>
                            <div className="flex gap-2 text-xs">
                              <Badge variant="secondary">{tour.difficulty}</Badge>
                              <Badge variant="outline">{tour.region}</Badge>
                              <Badge variant="secondary">Archived</Badge>
                            </div>
                          </div>
                          <div className="flex flex-col items-end justify-between">
                            <div className="font-bold text-lg">
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
          </TabsContent>

          <TabsContent value="profile">
            <GuideProfileEditForm />
          </TabsContent>

          <TabsContent value="images">
            <GuideImageLibrary />
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">No bookings yet.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
    </div>
  );
}