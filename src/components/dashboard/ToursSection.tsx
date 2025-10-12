import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GuideImageLibrary } from '@/components/guide/GuideImageLibrary';
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
  const [activeTab, setActiveTab] = useState<'my-tours' | 'calendar' | 'image-library'>('my-tours');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate counts
  const counts = useMemo(() => {
    const active = tours.filter(t => t.is_active && !t.archived).length;
    const draft = tours.filter(t => !t.is_active && !t.archived).length;
    const archived = tours.filter(t => t.archived).length;
    const total = tours.length;
    return { active, draft, archived, total };
  }, [tours]);

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
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'my-tours' | 'calendar' | 'image-library')}>
        <TabsList className="bg-cream p-1 rounded-lg">
          <TabsTrigger 
            value="my-tours"
            className="data-[state=active]:bg-burgundy data-[state=active]:text-white"
          >
            My Tours
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
                      <span>No bookings yet</span>
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
          <div className="py-12 text-center">
            <CalendarIcon className="w-16 h-16 text-burgundy/20 mx-auto mb-4" />
            <h3 className="text-lg font-playfair text-charcoal mb-2">
              Calendar View
            </h3>
            <p className="text-sm text-charcoal/60">
              Calendar functionality coming soon
            </p>
          </div>
        </TabsContent>

        {/* Image Library Tab Content */}
        <TabsContent value="image-library" className="mt-6">
          <GuideImageLibrary />
        </TabsContent>
      </Tabs>
    </div>
  );
}
