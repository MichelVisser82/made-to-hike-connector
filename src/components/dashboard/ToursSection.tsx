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
  FileText,
  MessageSquare,
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
  const [offerStatusFilter, setOfferStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');
  const [offerSearchTerm, setOfferSearchTerm] = useState('');

  // Fetch custom tour offers
  const { data: tourOffers = [], isLoading: offersLoading } = useGuideTourOffers(user?.id);

  // Calculate counts for regular tours
  const counts = useMemo(() => {
    const active = tours.filter(t => t.is_active && !t.archived).length;
    const draft = tours.filter(t => !t.is_active && !t.archived).length;
    const archived = tours.filter(t => t.archived).length;
    const total = tours.length;
    return { active, draft, archived, total };
  }, [tours]);

  // Calculate counts for custom tour offers
  const offerCounts = useMemo(() => {
    const pending = tourOffers.filter(o => o.offer_status === 'pending').length;
    const accepted = tourOffers.filter(o => o.offer_status === 'accepted').length;
    const declined = tourOffers.filter(o => o.offer_status === 'declined').length;
    const total = tourOffers.length;
    return { pending, accepted, declined, total };
  }, [tourOffers]);

  // Filter tours
  const filteredTours = useMemo(() => {
    return tours.filter(tour => {
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
  }, [tours, statusFilter, searchTerm]);

  // Filter custom tour offers
  const filteredOffers = useMemo(() => {
    return tourOffers.filter(offer => {
      // Status filter
      if (offerStatusFilter === 'pending' && offer.offer_status !== 'pending') return false;
      if (offerStatusFilter === 'accepted' && offer.offer_status !== 'accepted') return false;
      if (offerStatusFilter === 'declined' && offer.offer_status !== 'declined') return false;
      
      // Search filter
      if (offerSearchTerm) {
        const searchLower = offerSearchTerm.toLowerCase();
        const matchesEmail = offer.hiker_email?.toLowerCase().includes(searchLower);
        const matchesTour = offer.tours?.title?.toLowerCase().includes(searchLower);
        const matchesMeeting = offer.meeting_point?.toLowerCase().includes(searchLower);
        if (!matchesEmail && !matchesTour && !matchesMeeting) return false;
      }
      
      return true;
    });
  }, [tourOffers, offerStatusFilter, offerSearchTerm]);

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
          ) : filteredTours.length === 0 ? (
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
              {filteredTours.map(tour => (
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

        {/* Custom Tours Tab Content */}
        <TabsContent value="custom-tours" className="mt-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
            {/* Status Select */}
            <Select value={offerStatusFilter} onValueChange={(v) => setOfferStatusFilter(v as any)}>
              <SelectTrigger className="w-full sm:w-[180px] border-burgundy/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Offers ({offerCounts.total})</SelectItem>
                <SelectItem value="pending">Pending ({offerCounts.pending})</SelectItem>
                <SelectItem value="accepted">Accepted ({offerCounts.accepted})</SelectItem>
                <SelectItem value="declined">Declined ({offerCounts.declined})</SelectItem>
              </SelectContent>
            </Select>

            {/* Search Input */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
              <Input
                placeholder="Search by email or tour..."
                value={offerSearchTerm}
                onChange={(e) => setOfferSearchTerm(e.target.value)}
                className="pl-9 border-burgundy/20"
              />
            </div>

            {/* Export Button */}
            <Button variant="outline" className="sm:ml-auto">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Custom Tour Offers Grid */}
          {offersLoading ? (
            <div className="text-center py-12">
              <p className="text-charcoal/60">Loading custom tour offers...</p>
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="w-16 h-16 text-burgundy/20 mx-auto mb-4" />
              <h3 className="text-lg font-playfair text-charcoal mb-2">
                {offerSearchTerm || offerStatusFilter !== 'all' ? 'No offers found' : 'No custom tour offers yet'}
              </h3>
              <p className="text-charcoal/60 mb-6">
                {offerSearchTerm || offerStatusFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Custom tour offers you create will appear here'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredOffers.map((offer) => (
                <Card key={offer.id} className="overflow-hidden hover:shadow-lg transition-shadow border-burgundy/10">
                  {/* Card Header with Status Badge */}
                  <div className="bg-gradient-to-br from-burgundy/5 to-burgundy/10 p-4 relative">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-charcoal mb-1">
                          {offer.tours?.title || 'Custom Tour Request'}
                        </h3>
                        <p className="text-sm text-charcoal/60">{offer.hiker_email}</p>
                      </div>
                      <Badge 
                        className={`
                          ${offer.offer_status === 'pending' ? 'bg-gold/10 text-gold border-gold/20' : ''}
                          ${offer.offer_status === 'accepted' ? 'bg-sage/10 text-sage border-sage/20' : ''}
                          ${offer.offer_status === 'declined' ? 'bg-charcoal/10 text-charcoal border-charcoal/20' : ''}
                          text-xs px-2 py-1 rounded border
                        `}
                      >
                        {offer.offer_status || 'pending'}
                      </Badge>
                    </div>
                  </div>

                  {/* Card Body */}
                  <CardContent className="p-4">
                    {/* Offer Details */}
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-charcoal/60">Group Size:</span>
                        <span className="font-medium text-charcoal">{offer.group_size} people</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal/60">Duration:</span>
                        <span className="font-medium text-charcoal">{offer.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal/60">Price:</span>
                        <span className="font-medium text-charcoal">
                          {offer.currency === 'EUR' ? '€' : '£'}{offer.total_price}
                        </span>
                      </div>
                      {offer.preferred_date && (
                        <div className="flex justify-between">
                          <span className="text-charcoal/60">Date:</span>
                          <span className="font-medium text-charcoal">
                            {format(new Date(offer.preferred_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                      )}
                      {offer.created_at && (
                        <div className="flex justify-between">
                          <span className="text-charcoal/60">Created:</span>
                          <span className="text-charcoal">{format(new Date(offer.created_at), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                        onClick={() => {
                          // Navigate to inbox conversation
                          window.location.href = `/dashboard?section=inbox&conversation=${offer.conversation_id}`;
                        }}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        View Chat
                      </Button>
                      
                      {offer.booking_id && (
                        <Button
                          variant="outline"
                          className="border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                          onClick={() => {
                            window.location.href = `/dashboard/bookings/${offer.booking_id}`;
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
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
