import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Package, User, Upload, Info, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { TripDetails, TripChecklistItem } from '@/hooks/useTripDetails';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import SmartWaiverForm from '@/components/waiver/SmartWaiverForm';
import { format, addDays } from 'date-fns';

interface TripChecklistTabProps {
  tripDetails: TripDetails;
}

// Mock data structure - updated dynamically based on database
const getMockDocuments = (waiverUploaded: boolean) => [
  {
    id: 'doc-1',
    name: 'Liability Waiver',
    description: 'Sign and submit the digital liability waiver',
    required: true,
    uploadable: false,
    checked: waiverUploaded,
  },
  {
    id: 'doc-2',
    name: 'Travel Insurance',
    description: 'Proof of travel and mountain rescue insurance',
    required: true,
    uploadable: true,
    checked: false,
  },
  {
    id: 'doc-3',
    name: 'Emergency Contact',
    description: 'Contact information on file',
    required: false,
    uploadable: false,
    checked: true,
  },
  {
    id: 'doc-4',
    name: 'Valid ID/Passport',
    description: 'Bring your passport or national ID',
    required: false,
    uploadable: false,
    checked: false,
  },
];

const mockEssentialGear = [
  { id: 'gear-1', name: 'Hiking boots (well broken-in)', checked: false },
  { id: 'gear-2', name: '40-50L backpack', checked: false },
  { id: 'gear-3', name: 'Sleeping bag (rated -5°C)', checked: false },
  { id: 'gear-4', name: 'Layered clothing system', checked: false },
  { id: 'gear-5', name: 'Waterproof jacket', checked: false },
  { id: 'gear-6', name: 'Waterproof pants', checked: false },
  { id: 'gear-7', name: 'Warm gloves', checked: false },
  { id: 'gear-8', name: 'Warm hat/beanie', checked: false },
  { id: 'gear-9', name: 'Headlamp with spare batteries', checked: false },
  { id: 'gear-10', name: 'Trekking poles', checked: false },
  { id: 'gear-11', name: 'Sunglasses (UV protection)', checked: false },
  { id: 'gear-12', name: 'High SPF sunscreen', checked: false },
];

const mockPersonalItems = [
  { id: 'personal-1', name: '2L water capacity (bottles/bladder)', checked: false },
  { id: 'personal-2', name: 'High-energy snacks/bars', checked: false },
  { id: 'personal-3', name: 'Personal first aid kit', checked: false },
  { id: 'personal-4', name: 'Personal medications', checked: false },
  { id: 'personal-5', name: 'Toiletries & towel', checked: false },
  { id: 'personal-6', name: 'Camera/phone charger', checked: false },
];

export function TripChecklistTab({ tripDetails }: TripChecklistTabProps) {
  const { checklist, booking, tour, guide } = tripDetails;
  const [loading, setLoading] = useState<string | null>(null);
  const [localCheckedItems, setLocalCheckedItems] = useState<Set<string>>(new Set());
  const [waiverDialogOpen, setWaiverDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user profile for pre-filling waiver
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from('profiles')
        .select('email, phone, country, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship')
        .eq('id', user.id)
        .single();
      
      return data;
    }
  });

  // Determine whether to use database checklist or mock data
  const useMockData = checklist.length === 0;
  const mockDocuments = getMockDocuments(!!booking.waiver_uploaded_at);

  const handleCheckItem = async (itemId: string, currentlyChecked: boolean) => {
    if (useMockData) {
      // For mock data, just toggle locally
      setLocalCheckedItems(prev => {
        const newSet = new Set(prev);
        if (currentlyChecked) {
          newSet.delete(itemId);
        } else {
          newSet.add(itemId);
        }
        return newSet;
      });
      return;
    }

    setLoading(itemId);
    try {
      const { error } = await supabase
        .from('trip_checklist_items')
        .update({
          is_checked: !currentlyChecked,
          checked_at: !currentlyChecked ? new Date().toISOString() : null
        })
        .eq('id', itemId);

      if (error) throw error;

      // Refresh trip details
      queryClient.invalidateQueries({ queryKey: ['trip-details', booking.id] });

      toast({
        title: !currentlyChecked ? 'Item checked' : 'Item unchecked',
        description: 'Your checklist has been updated.',
      });
    } catch (error) {
      console.error('Error updating checklist:', error);
      toast({
        title: 'Error',
        description: 'Failed to update checklist item.',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleWaiverSubmit = async (waiverData: any) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          waiver_uploaded_at: new Date().toISOString(),
        })
        .eq('id', booking.id);
      
      if (error) throw error;
      
      setWaiverDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['trip-details', booking.id] });
      
      toast({
        title: 'Waiver Submitted Successfully',
        description: 'Your liability waiver has been saved. A copy will be sent to your email.',
      });
    } catch (error) {
      console.error('Error submitting waiver:', error);
      toast({
        title: 'Submission Failed',
        description: 'Failed to submit waiver. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleWaiverDraftSave = async (draftData: any) => {
    try {
      localStorage.setItem(
        `waiver-draft-${booking.id}`,
        JSON.stringify(draftData)
      );
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const loadWaiverDraft = () => {
    try {
      const draft = localStorage.getItem(`waiver-draft-${booking.id}`);
      return draft ? JSON.parse(draft) : null;
    } catch {
      return null;
    }
  };

  // Calculate progress
  const calculateProgress = () => {
    if (useMockData) {
      const totalMock = mockDocuments.length + mockEssentialGear.length + mockPersonalItems.length;
      const completedMock = 
        mockDocuments.filter(d => d.checked || localCheckedItems.has(d.id)).length +
        mockEssentialGear.filter(g => g.checked || localCheckedItems.has(g.id)).length +
        mockPersonalItems.filter(p => p.checked || localCheckedItems.has(p.id)).length;
      return { completed: completedMock, total: totalMock };
    }
    const completedItems = checklist.filter(item => item.is_checked).length;
    return { completed: completedItems, total: checklist.length };
  };

  const { completed, total } = calculateProgress();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2" style={{fontFamily: 'Playfair Display, serif'}}>Pre-Trip Checklist</h2>
          <p className="text-muted-foreground">
            Make sure you have everything you need
          </p>
        </div>
        <Badge variant={completed === total ? 'default' : 'secondary'} className="text-lg px-4 py-2">
          {completed} / {total}
        </Badge>
      </div>

      <Card className="p-6 bg-background border-burgundy/10 shadow-sm">
        <div className="space-y-6">
          {/* Required Documents Section */}
          <div>
            <h3 className="text-lg mb-4 text-foreground flex items-center gap-2" style={{fontFamily: 'Playfair Display, serif'}}>
              <FileText className="w-5 h-5 text-burgundy" />
              Required Documents
            </h3>
            <div className="space-y-3">
              {mockDocuments.map((doc) => {
                const isChecked = useMockData ? (doc.checked || localCheckedItems.has(doc.id)) : false;
                return (
                  <div key={doc.id} className={`border rounded-lg p-4 ${
                    isChecked ? 'border-sage/30 bg-sage/5' : 'border-burgundy/20'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex gap-3 items-start">
                        <Checkbox 
                          id={doc.id}
                          checked={isChecked}
                          onCheckedChange={() => handleCheckItem(doc.id, isChecked)}
                          disabled={loading === doc.id}
                        />
                        <div>
                          <label htmlFor={doc.id} className="font-medium text-foreground cursor-pointer">
                            {doc.name}
                          </label>
                          <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                        </div>
                      </div>
                      {doc.required ? (
                        <Badge className="bg-gold text-white border-0 text-xs">Required</Badge>
                      ) : isChecked ? (
                        <Badge className="bg-sage text-white border-0 text-xs">Complete</Badge>
                      ) : (
                        <Badge className="bg-burgundy/10 text-burgundy border-burgundy/20 text-xs">Reminder</Badge>
                      )}
                    </div>
                    {doc.name === 'Liability Waiver' && !isChecked && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-3 border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                        onClick={() => setWaiverDialogOpen(true)}
                      >
                        <FileText className="w-3.5 h-3.5 mr-2" />
                        Submit Liability Waiver
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Essential Gear Section */}
          <div>
            <h3 className="text-lg mb-4 text-foreground flex items-center gap-2" style={{fontFamily: 'Playfair Display, serif'}}>
              <Package className="w-5 h-5 text-burgundy" />
              Essential Gear & Equipment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mockEssentialGear.map((item) => {
                const isChecked = useMockData ? (item.checked || localCheckedItems.has(item.id)) : false;
                return (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-cream rounded-lg">
                    <Checkbox 
                      id={item.id}
                      checked={isChecked}
                      onCheckedChange={() => handleCheckItem(item.id, isChecked)}
                      disabled={loading === item.id}
                    />
                    <label htmlFor={item.id} className="text-sm text-foreground cursor-pointer flex-1">
                      {item.name}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Personal Items Section */}
          <div>
            <h3 className="text-lg mb-4 text-foreground flex items-center gap-2" style={{fontFamily: 'Playfair Display, serif'}}>
              <User className="w-5 h-5 text-burgundy" />
              Personal Items
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mockPersonalItems.map((item) => {
                const isChecked = useMockData ? (item.checked || localCheckedItems.has(item.id)) : false;
                return (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-cream rounded-lg">
                    <Checkbox 
                      id={item.id}
                      checked={isChecked}
                      onCheckedChange={() => handleCheckItem(item.id, isChecked)}
                      disabled={loading === item.id}
                    />
                    <label htmlFor={item.id} className="text-sm text-foreground cursor-pointer flex-1">
                      {item.name}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Equipment Rental Info Box */}
          <div className="bg-sage/10 border border-sage/20 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-sage mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-foreground mb-2">Equipment Rental Available</h4>
                <p className="text-sm text-muted-foreground mb-2">Don't have all the gear? No problem! Your guide can arrange equipment rental for:</p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Backpacks, sleeping bags, and trekking poles</li>
                  <li>Technical gear (crampons, ice axes if needed)</li>
                  <li>Waterproof clothing</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2">Contact your guide at least 7 days before departure to arrange rentals.</p>
              </div>
            </div>
          </div>

          {/* Important Reminder Box */}
          <div className="bg-burgundy/10 border border-burgundy/20 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-burgundy mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-foreground mb-1">Important Reminder</h4>
                <p className="text-sm text-muted-foreground">All required documents must be submitted at least 48 hours before your trip start date.</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Waiver Dialog */}
      <Dialog open={waiverDialogOpen} onOpenChange={setWaiverDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <SmartWaiverForm
            tourName={tour.title}
            bookingReference={booking.booking_reference || `BK-${booking.id.slice(0, 8)}`}
            tourDates={{
              from: format(new Date(booking.booking_date), 'MMM dd, yyyy'),
              to: format(addDays(new Date(booking.booking_date), parseInt(tour.duration) || 3), 'MMM dd, yyyy')
            }}
            location={`${tour.region}, ${tour.country}`}
            guideName={guide.display_name}
            guideContact={guide.phone || 'Contact via platform'}
            onSubmit={handleWaiverSubmit}
            onSaveDraft={handleWaiverDraftSave}
            prefilledData={{
              ...loadWaiverDraft(),
              fullName: booking.participants_details?.[0] 
                ? `${booking.participants_details[0].firstName || ''} ${booking.participants_details[0].surname || ''}`.trim()
                : '',
              email: userProfile?.email || '',
              phone: userProfile?.phone || '',
              country: userProfile?.country || '',
              emergencyName: userProfile?.emergency_contact_name || '',
              emergencyPhone: userProfile?.emergency_contact_phone || '',
              emergencyRelationship: userProfile?.emergency_contact_relationship || '',
              hasInsurance: !!booking.insurance_uploaded_at,
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
