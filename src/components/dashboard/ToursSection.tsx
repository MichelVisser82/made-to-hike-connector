import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GuideImageLibrary } from '@/components/guide/GuideImageLibrary';
import { AvailabilityManager } from './AvailabilityManager';
import { useAuth } from '@/contexts/AuthContext';
import { useGuideTourOffers } from '@/hooks/useGuideTourOffers';
import { OfferExpiryBadge } from '@/components/tour-offer/OfferExpiryBadge';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  Download,
  Edit,
  MoreVertical,
  Eye,
  EyeOff,
  Copy,
  Archive,
  Trash2,
  Mountain,
  Calendar as CalendarIcon,
} from 'lucide-react';
import type { Tour } from '@/types';

interface ToursSectionProps {
  tours: Tour[];
  loading: boolean;
  initialTab?: 'my-tours' | 'custom-tours' | 'calendar' | 'image-library';
  onTabChange?: (tab: 'my-tours' | 'custom-tours' | 'calendar' | 'image-library') => void;
  onCreateTour: () => void;
  onEditTour: (tour: Tour) => void;
  onDeleteTour: (tour: Tour) => void;
  onTourClick: (tour: Tour) => void;
  onPublishTour: (tour: Tour) => void;
  onUnpublishTour: (tour: Tour) => void;
  onArchiveTour: (tour: Tour) => void;
  onUnarchiveTour: (tour: Tour) => void;
  onCopyTour: (tour: Tour) => void;
}

export function ToursSection({
  tours,
  loading,
  initialTab = 'my-tours',
  onTabChange,
  onCreateTour,
  onEditTour,
  onDeleteTour,
  onTourClick,
  onPublishTour,
  onUnpublishTour,
  onArchiveTour,
  onUnarchiveTour,
  onCopyTour,
}: ToursSectionProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'my-tours' | 'custom-tours' | 'calendar' | 'image-library'>(initialTab);
  
  const handleTabChange = (tab: 'my-tours' | 'custom-tours' | 'calendar' | 'image-library') => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch custom tour offers to identify custom tours
  const { data: tourOffers = [], isLoading: offersLoading } = useGuideTourOffers(user?.id);

  // Separate regular tours from custom tours based on tour_offers
  const { regularTours, customTours } = useMemo(() => {
    const customTourIds = new Set(tourOffers.map(offer => offer.tour_id).filter(Boolean));
    
    const regular = tours.filter(tour => !customTourIds.has(tour.id));
    const custom = tours.filter(tour => customTourIds.has(tour.id));
    
    return { regularTours: regular, customTours: custom };
  }, [tours, tourOffers]);

  // Calculate counts for regular tours
  const counts = useMemo(() => {
    const active = regularTours.filter(t => t.is_active && !t.archived).length;
    const draft = regularTours.filter(t => !t.is_active && !t.archived).length;
    const archived = regularTours.filter(t => t.archived).length;
    const total = regularTours.length;
    return { active, draft, archived, total };
  }, [regularTours]);

  // Calculate counts for custom tours based on offer status
  const customCounts = useMemo(() => {
    const active = customTours.filter(tour => {
      const linkedOffer = tourOffers.find(o => o.tour_id === tour.id);
      return linkedOffer?.offer_status === 'accepted' && !tour.archived;
    }).length;
    
    const draft = customTours.filter(tour => {
      const linkedOffer = tourOffers.find(o => o.tour_id === tour.id);
      const isExpired = linkedOffer?.isExpired ?? false;
      return linkedOffer?.offer_status === 'pending' && !isExpired && !tour.archived;
    }).length;
    
    const archived = customTours.filter(tour => {
      const linkedOffer = tourOffers.find(o => o.tour_id === tour.id);
      const isExpired = linkedOffer?.isExpired ?? false;
      const isDeclined = linkedOffer?.offer_status === 'declined';
      return tour.archived || isExpired || isDeclined;
    }).length;
    
    const total = customTours.length;
    return { active, draft, archived, total };
  }, [customTours, tourOffers]);

  // Filter regular tours for My Tours tab
  const filteredRegularTours = useMemo(() => {
    return regularTours.filter(tour => {
      // Status filter
      if (statusFilter === 'active' && (!tour.is_active || tour.archived)) return false;
      if (statusFilter === 'draft' && (tour.is_active || tour.archived)) return false;
      if (statusFilter === 'archived' && !tour.archived) return false;
      
      // Search filter
      if (searchTerm && !tour.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [regularTours, statusFilter, searchTerm]);

  // Filter custom tours for Custom Tours tab based on offer status
  const filteredCustomTours = useMemo(() => {
    return customTours.filter(tour => {
      const linkedOffer = tourOffers.find(o => o.tour_id === tour.id);
      const isExpired = linkedOffer?.isExpired ?? false;
      const isDeclined = linkedOffer?.offer_status === 'declined';
      const isPending = linkedOffer?.offer_status === 'pending';
      const isAccepted = linkedOffer?.offer_status === 'accepted';
      
      // Status filter: active = accepted & not archived, draft = pending & not expired, archived = archived OR expired OR declined
      if (statusFilter === 'active' && !(isAccepted && !tour.archived)) return false;
      if (statusFilter === 'draft' && !(isPending && !isExpired && !tour.archived)) return false;
      if (statusFilter === 'archived' && !(tour.archived || isExpired || isDeclined)) return false;
      
      // Search filter
      if (searchTerm && !tour.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [customTours, statusFilter, searchTerm, tourOffers]);

  const getDifficultyBadgeClass = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-sage text-white px-3 py-1 text-xs font-medium rounded';
      case 'moderate': return 'bg-gold text-white px-3 py-1 text-xs font-medium rounded';
      case 'challenging': return 'bg-burgundy text-white px-3 py-1 text-xs font-medium rounded';
      case 'expert': return 'bg-burgundy-dark text-white px-3 py-1 text-xs font-medium rounded';
      default: return 'bg-charcoal text-white px-3 py-1 text-xs font-medium rounded';
    }
  };

  const getStatusBadgeClass = (tour: Tour) => {
    if (tour.archived) {
      return 'bg-charcoal/10 text-charcoal border-charcoal/20 text-xs px-2 py-1 rounded border';
    }
    if (tour.is_active) {
      return 'bg-sage/10 text-sage border-sage/20 text-xs px-2 py-1 rounded border';
    }
    return 'bg-gold/10 text-gold border-gold/20 text-xs px-2 py-1 rounded border';
  };

  const getStatusText = (tour: Tour) => {
    if (tour.archived) return 'Archived';
    if (tour.is_active) return 'Active';
    return 'Draft';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-6">
          {/* Left: Title & Subtitle */}
          <div>
            <h1 className="text-3xl font-playfair text-charcoal mb-2">
              Tours & Calendar
            </h1>
            <p className="text-charcoal/60">
              Manage your tour offerings and availability
            </p>
          </div>
          
          {/* Right: Create New Tour Button */}
          <Button 
            className="bg-burgundy hover:bg-burgundy-dark text-white"
            onClick={onCreateTour}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Tour
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v as 'my-tours' | 'custom-tours' | 'calendar' | 'image-library')}>
        <TabsList className="bg-cream p-1 rounded-lg">
          <TabsTrigger 
            value="my-tours"
            className="data-[state=active]:bg-burgundy data-[state=active]:text-white"
          >
            My Tours
          </TabsTrigger>
          <TabsTrigger 
            value="custom-tours"
            className="data-[state=active]:bg-burgundy data-[state=active]:text-white"
          >
            Custom Tours
          </TabsTrigger>
          <TabsTrigger 
            value="calendar"
            className="data-[state=active]:bg-burgundy data-[state=active]:text-white"
          >
            Calendar
          </TabsTrigger>
          <TabsTrigger 
            value="image-library"
            className="data-[state=active]:bg-burgundy data-[state=active]:text-white"
          >
            Image Library
          </TabsTrigger>
        </TabsList>

        {/* My Tours Tab Content */}
        <TabsContent value="my-tours" className="mt-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
            {/* Status Select */}
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-full sm:w-[180px] border-burgundy/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tours ({counts.total})</SelectItem>
                <SelectItem value="active">Active ({counts.active})</SelectItem>
                <SelectItem value="draft">Draft ({counts.draft})</SelectItem>
                <SelectItem value="archived">Archived ({counts.archived})</SelectItem>
              </SelectContent>
            </Select>

            {/* Search Input */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
              <Input
                placeholder="Search tours..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 border-burgundy/20"
              />
            </div>

            {/* Export Button */}
            <Button variant="outline" className="sm:ml-auto">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Tour Cards Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-charcoal/60">Loading your tours...</p>
            </div>
          ) : filteredRegularTours.length === 0 ? (
            <div className="py-12 text-center">
              <Mountain className="w-16 h-16 text-burgundy/20 mx-auto mb-4" />
              <h3 className="text-lg font-playfair text-charcoal mb-2">
                {searchTerm || statusFilter !== 'all' ? 'No tours found' : 'No tours yet'}
              </h3>
              <p className="text-sm text-charcoal/60 mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your filters or search term' 
                  : 'Create your first tour to start accepting bookings'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button 
                  onClick={onCreateTour}
                  className="bg-burgundy hover:bg-burgundy-dark text-white"
                >
                  Create Your First Tour
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {filteredRegularTours.map(tour => (
                <Card key={tour.id} className="overflow-hidden border border-burgundy/10 shadow-md hover:shadow-lg transition-shadow">
                  {/* Image Section */}
                  <div className="h-48 relative cursor-pointer" onClick={() => onTourClick(tour)}>
                    {tour.hero_image || tour.images?.[0] ? (
                      <img 
                        src={tour.hero_image || tour.images[0]} 
                        alt={tour.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-burgundy to-burgundy-dark flex items-center justify-center">
                        <span className="text-6xl text-white font-playfair">
                          {tour.title[0]}
                        </span>
                      </div>
                    )}
                    
                    {/* Difficulty Badge - Absolute positioned */}
                    <Badge className={`absolute top-3 right-3 ${getDifficultyBadgeClass(tour.difficulty)}`}>
                      {tour.difficulty}
                    </Badge>
                  </div>

                  {/* Card Body */}
                  <CardContent className="p-4">
                    {/* Row 1: Title & Status */}
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 
                        className="font-medium text-charcoal line-clamp-1 flex-1 cursor-pointer hover:text-burgundy transition-colors"
                        onClick={() => onTourClick(tour)}
                      >
                        {tour.title}
                      </h3>
                      <Badge className={getStatusBadgeClass(tour)}>
                        {getStatusText(tour)}
                      </Badge>
                    </div>

                    {/* Row 2: Price & Bookings */}
                    <div className="flex justify-between text-sm text-charcoal/70 mb-4">
                      <span>{tour.currency === 'EUR' ? '€' : '£'}{tour.price} per person</span>
                      <span>
                        {(tour as any).bookings_count 
                          ? `${(tour as any).bookings_count} booking${(tour as any).bookings_count !== 1 ? 's' : ''}`
                          : 'No bookings yet'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                        onClick={() => onEditTour(tour)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="border-burgundy/30">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onTourClick(tour)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onCopyTour(tour)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </DropdownMenuItem>
                          {!tour.is_custom_tour && (
                            <>
                              {tour.is_active ? (
                                <DropdownMenuItem onClick={() => onUnpublishTour(tour)}>
                                  <EyeOff className="w-4 h-4 mr-2" />
                                  Unpublish
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => onPublishTour(tour)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Publish
                                </DropdownMenuItem>
                              )}
                            </>
                          )}
                          {tour.archived ? (
                            <DropdownMenuItem onClick={() => onUnarchiveTour(tour)}>
                              <Archive className="w-4 h-4 mr-2" />
                              Unarchive
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => onArchiveTour(tour)}>
                              <Archive className="w-4 h-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => onDeleteTour(tour)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Custom Tours Tab Content */}
        <TabsContent value="custom-tours" className="mt-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
            {/* Status Select */}
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-full sm:w-[180px] border-burgundy/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tours ({customCounts.total})</SelectItem>
                <SelectItem value="active">Active ({customCounts.active})</SelectItem>
                <SelectItem value="draft">Draft ({customCounts.draft})</SelectItem>
                <SelectItem value="archived">Archived ({customCounts.archived})</SelectItem>
              </SelectContent>
            </Select>

            {/* Search Input */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
              <Input
                placeholder="Search tours..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 border-burgundy/20"
              />
            </div>

            {/* Export Button */}
            <Button variant="outline" className="sm:ml-auto">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Custom Tour Cards Grid */}
          {loading || offersLoading ? (
            <div className="text-center py-12">
              <p className="text-charcoal/60">Loading custom tours...</p>
            </div>
          ) : filteredCustomTours.length === 0 ? (
            <div className="py-12 text-center">
              <Mountain className="w-16 h-16 text-burgundy/20 mx-auto mb-4" />
              <h3 className="text-lg font-playfair text-charcoal mb-2">
                {searchTerm || statusFilter !== 'all' ? 'No tours found' : 'No custom tours yet'}
              </h3>
              <p className="text-charcoal/60 mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Custom tours created from requests will appear here'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCustomTours.map((tour) => (
                <Card key={tour.id} className="overflow-hidden hover:shadow-lg transition-shadow border-burgundy/10">
                  {/* Card Image */}
                  <div className="relative h-48 bg-gradient-to-br from-burgundy/20 to-burgundy/5 overflow-hidden">
                    {tour.hero_image ? (
                      <img 
                        src={tour.hero_image} 
                        alt={tour.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Mountain className="w-16 h-16 text-burgundy/30" />
                      </div>
                    )}
                    
                    {/* Rating Badge - Absolute positioned if exists */}
                    {tour.rating && tour.reviews_count && tour.reviews_count > 0 && (
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-md flex items-center gap-1">
                        <span className="text-gold text-sm">★</span>
                        <span className="text-sm font-medium text-charcoal">
                          {tour.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-charcoal/60">
                          ({tour.reviews_count})
                        </span>
                      </div>
                    )}
                    
                    {/* Difficulty Badge - Absolute positioned */}
                    <Badge className={`absolute top-3 right-3 ${getDifficultyBadgeClass(tour.difficulty)}`}>
                      {tour.difficulty}
                    </Badge>
                  </div>

                  {/* Card Body */}
                  <CardContent className="p-4">
                    {/* Row 1: Title & Status */}
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 
                        className="font-medium text-charcoal line-clamp-1 flex-1 cursor-pointer hover:text-burgundy transition-colors"
                        onClick={() => onTourClick(tour)}
                      >
                        {tour.title}
                      </h3>
                      <Badge className={getStatusBadgeClass(tour)}>
                        {getStatusText(tour)}
                      </Badge>
                    </div>

                    {/* Offer Expiry Badge */}
                    {(() => {
                      const linkedOffer = tourOffers.find(o => o.tour_id === tour.id);
                      return linkedOffer?.expires_at && (
                        <div className="mb-3">
                          <OfferExpiryBadge 
                            expiresAt={linkedOffer.expires_at} 
                            status={linkedOffer.offer_status || undefined}
                          />
                        </div>
                      );
                    })()}

                    {/* Row 2: Price & Bookings */}
                    <div className="flex justify-between text-sm text-charcoal/70 mb-4">
                      <span>{tour.currency === 'EUR' ? '€' : '£'}{tour.price} per person</span>
                      <span>
                        {(tour as any).bookings_count 
                          ? `${(tour as any).bookings_count} booking${(tour as any).bookings_count !== 1 ? 's' : ''}`
                          : 'No bookings yet'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                        onClick={() => onEditTour(tour)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="border-burgundy/30">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onTourClick(tour)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onCopyTour(tour)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </DropdownMenuItem>
                          {tour.is_active ? (
                            <DropdownMenuItem onClick={() => onUnpublishTour(tour)}>
                              <EyeOff className="w-4 h-4 mr-2" />
                              Unpublish
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => onPublishTour(tour)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Publish
                            </DropdownMenuItem>
                          )}
                          {tour.archived ? (
                            <DropdownMenuItem onClick={() => onUnarchiveTour(tour)}>
                              <Archive className="w-4 h-4 mr-2" />
                              Unarchive
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => onArchiveTour(tour)}>
                              <Archive className="w-4 h-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => onDeleteTour(tour)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Calendar Tab Content */}
        <TabsContent value="calendar" className="mt-6">
          <AvailabilityManager />
        </TabsContent>

        {/* Image Library Tab Content */}
        <TabsContent value="image-library" className="mt-6">
          <GuideImageLibrary />
        </TabsContent>
      </Tabs>
    </div>
  );
}
