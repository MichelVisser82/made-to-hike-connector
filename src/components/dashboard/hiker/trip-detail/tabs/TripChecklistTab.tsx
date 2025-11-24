import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FileText, Package, User, Upload, Info, AlertCircle, Eye, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { TripDetails, TripChecklistItem } from '@/hooks/useTripDetails';
import type { ParticipantDetails } from '@/types/booking';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import SmartWaiverForm from '@/components/waiver/SmartWaiverForm';
import { WaiverViewer } from '@/components/waiver/WaiverViewer';
import { format, addDays } from 'date-fns';
import { useEmail } from '@/hooks/useEmail';
import ParticipantManagementModal from '@/components/participant-management/ParticipantManagementModal';

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
  const [waiverViewerOpen, setWaiverViewerOpen] = useState(false);
  const [selectedParticipantIndex, setSelectedParticipantIndex] = useState<number>(0);
  const [showParticipantSelector, setShowParticipantSelector] = useState(false);
  const [participantManagementOpen, setParticipantManagementOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { sendEmail } = useEmail();

  // Fetch user profile for pre-filling waiver
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, phone, country, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, date_of_birth')
        .eq('id', user.id)
        .single();
      
      return data;
    }
  });

  // Extract participant data from booking for pre-filling
  const getParticipantData = () => {
    const participantsDetails = booking.participants_details as any;
    if (!participantsDetails || !Array.isArray(participantsDetails) || participantsDetails.length === 0) {
      return null;
    }
    return participantsDetails[0]; // Use first participant (primary booker)
  };

  const primaryParticipant = getParticipantData();

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

  const handleWaiverSubmit = async (waiverData: any, participantIndex: number = 0) => {
    try {
      // Get current participants_details
      const { data: currentBooking } = await supabase
        .from('bookings')
        .select('participants_details')
        .eq('id', booking.id)
        .single();
      
      const participantsDetails = (currentBooking?.participants_details as any[]) || [];
      
      // Update specific participant's waiver data
      participantsDetails[participantIndex] = {
        ...participantsDetails[participantIndex],
        waiverStatus: 'completed',
        waiverSubmittedAt: new Date().toISOString(),
        waiverData: waiverData
      };
      
      // Update booking with modified participants_details
      const { error } = await supabase
        .from('bookings')
        .update({
          participants_details: participantsDetails as any,
          waiver_data: waiverData, // Keep booking-level for backwards compat
          waiver_uploaded_at: participantIndex === 0 ? new Date().toISOString() : undefined // Only update if lead
        })
        .eq('id', booking.id);
      
      if (error) throw error;
      
      // Send confirmation email with waiver copy
      try {
        const participant = participantsDetails[participantIndex];
        const participantName = `${participant.firstName} ${participant.surname}`;
        await sendEmail({
          type: 'waiver_confirmation',
          to: userProfile?.email || booking.hiker_email,
          data: {
            name: waiverData.fullName || participantName,
            tourTitle: tour.title,
            bookingReference: booking.booking_reference || `BK-${booking.id.slice(0, 8)}`,
            participantName
          },
        });
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
      }
      
      setWaiverDialogOpen(false);
      setShowParticipantSelector(false);
      queryClient.invalidateQueries({ queryKey: ['trip-details', booking.id] });
      
      const participant = participantsDetails[participantIndex];
      toast({
        title: 'Waiver Submitted Successfully',
        description: `Waiver for ${participant.firstName} ${participant.surname} has been saved.`,
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

  // Helper to parse and normalize waiver data from various storage formats
  const getParsedWaiverData = () => {
    const raw = booking.waiver_data;
    if (!raw) return undefined;

    let data: any = raw;
    
    // If it's a string, try to parse it
    if (typeof raw === 'string') {
      try {
        data = JSON.parse(raw);
      } catch {
        return undefined;
      }
    }
    
    // If it has a nested formData key, use that
    if (data && typeof data === 'object' && data.formData && typeof data.formData === 'object') {
      return data.formData;
    }
    
    // Otherwise return the object if valid
    return data && typeof data === 'object' ? data : undefined;
  };

  const parsedWaiverData = getParsedWaiverData();

  // Fetch the most recent completed waiver for this logged-in hiker to reuse across bookings
  const { data: previousWaiverData } = useQuery({
    queryKey: ['previous-waiver', booking.id],
    queryFn: async () => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (!user) return undefined;

      const { data, error } = await supabase
        .from('bookings')
        .select('waiver_data, booking_date')
        .eq('hiker_id', user.id)
        .not('waiver_data', 'is', null)
        .order('booking_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data?.waiver_data) return undefined;

      let raw: any = data.waiver_data;
      if (typeof raw === 'string') {
        try {
          raw = JSON.parse(raw);
        } catch {
          return undefined;
        }
      }

      if (raw && typeof raw === 'object' && raw.formData && typeof raw.formData === 'object') {
        return raw.formData;
      }

      return raw && typeof raw === 'object' ? raw : undefined;
    },
  });

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

  const handleWaiverButtonClick = () => {
    const participants = parsedWaiverData?.participants_details || booking.participants_details || [];
    
    if (participants.length > 1) {
      // Show participant selector dialog
      setShowParticipantSelector(true);
    } else {
      // Single participant - go directly to waiver form
      setSelectedParticipantIndex(0);
      setWaiverDialogOpen(true);
    }
  };

  const participants = (parsedWaiverData?.participants_details || booking.participants_details || []) as ParticipantDetails[];

  // Fetch participant statuses from tokens
  const { data: participantStatuses } = useQuery({
    queryKey: ['participant-statuses', booking.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('manage-participant-tokens', {
        body: {
          action: 'get_participants_status',
          booking_id: booking.id
        }
      });
      if (error) throw error;
      return data?.participants || [];
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  // Calculate participant completion (excluding primary booker at index 0)
  const additionalParticipants = participants.slice(1); // Exclude primary booker
  const completedParticipants = participantStatuses?.filter((p: any) => 
    p.participant_index > 0 && // Only count additional participants
    p.waiver_completed && p.insurance_completed && p.emergency_contact_completed
  ).length || 0;
  const totalParticipants = additionalParticipants.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2" style={{fontFamily: 'Playfair Display, serif'}}>Pre-Trip Checklist</h2>
        <p className="text-muted-foreground">
          Make sure you have everything you need
        </p>
      </div>

      <Card className="p-6 bg-background border-burgundy/10 shadow-sm">
        <div className="space-y-6">
          {/* Required Documents Section */}
          <div>
            <h3 className="text-lg mb-4 text-foreground flex items-center gap-2" style={{fontFamily: 'Playfair Display, serif'}}>
              <FileText className="w-5 h-5 text-burgundy" />
              Required Documents
            </h3>
            
            {/* Participant Overview Card */}
            <Card className="mb-4 border-burgundy/20 bg-cream/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-burgundy" />
                    <h4 className="font-semibold text-foreground">Participant Documents</h4>
                  </div>
                  <Badge variant="outline" className="bg-background">
                    {completedParticipants} of {totalParticipants} Complete
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  Each participant needs to complete their waiver, insurance, and emergency contact information.
                </p>
                
                <div className="space-y-2 mb-3">
                  {additionalParticipants.map((participant, index) => {
                    const actualIndex = index + 1; // Adjust index since we're showing from index 1+
                    const status = participantStatuses?.find((p: any) => p.participant_index === actualIndex);
                    const isComplete = status?.waiver_completed && status?.insurance_completed;
                    const isInvited = !!status?.invited_at;
                    const isInProgress = status && !isComplete && (status.waiver_completed || status.insurance_completed);
                    
                    return (
                      <div key={actualIndex} className="flex items-center justify-between p-2 bg-background rounded border border-burgundy/10">
                        <span className="text-sm font-medium">
                          {participant.firstName} {participant.surname}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={
                            isComplete 
                              ? 'bg-sage/10 text-sage border-sage/30' 
                              : isInProgress
                              ? 'bg-gold/10 text-gold border-gold/30'
                              : isInvited
                              ? 'bg-burgundy/10 text-burgundy border-burgundy/30'
                              : 'bg-muted text-muted-foreground'
                          }
                        >
                          {isComplete ? 'Complete' : isInProgress ? 'In Progress' : isInvited ? 'Invited' : 'Not Started'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                  onClick={() => setParticipantManagementOpen(true)}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage Participants
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-3">
            {mockDocuments.map((doc) => {
              const isLiabilityWaiver = doc.name === 'Liability Waiver';
              const isChecked = useMockData
                ? (doc.checked || localCheckedItems.has(doc.id))
                : isLiabilityWaiver
                ? !!booking.waiver_uploaded_at
                : false;

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
                        disabled={loading === doc.id || isLiabilityWaiver}
                      />
                      <div>
                        <label htmlFor={doc.id} className="font-medium text-foreground cursor-pointer">
                          {doc.name}
                        </label>
                        <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                      </div>
                    </div>
                    {isChecked ? (
                      <Badge className="bg-sage text-white border-0 text-xs">Complete</Badge>
                    ) : doc.required ? (
                      <Badge className="bg-gold text-white border-0 text-xs">Required</Badge>
                    ) : (
                      <Badge className="bg-burgundy/10 text-burgundy border-burgundy/20 text-xs">Reminder</Badge>
                    )}
                  </div>
                  {isLiabilityWaiver && !isChecked && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3 border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                      onClick={() => {
                        setSelectedParticipantIndex(0);
                        setWaiverDialogOpen(true);
                      }}
                    >
                      <FileText className="w-3.5 h-3.5 mr-2" />
                      Submit Liability Waiver
                    </Button>
                  )}
                  {isLiabilityWaiver && isChecked && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3 border-sage/30 text-sage hover:bg-sage/5"
                      onClick={() => setWaiverViewerOpen(true)}
                    >
                      <Eye className="w-3.5 h-3.5 mr-2" />
                      View Signed Waiver
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

      {/* Participant Selector Dialog */}
      <Dialog open={showParticipantSelector} onOpenChange={setShowParticipantSelector}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Participant</DialogTitle>
            <DialogDescription>
              Choose which participant is submitting their liability waiver
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {participants.map((participant, index) => {
              const isCompleted = participant.waiverStatus === 'completed' || (index === 0 && !!booking.waiver_uploaded_at);
              return (
                <Button
                  key={index}
                  variant={isCompleted ? "outline" : "default"}
                  className="w-full justify-between"
                  disabled={isCompleted}
                  onClick={() => {
                    setSelectedParticipantIndex(index);
                    setShowParticipantSelector(false);
                    setWaiverDialogOpen(true);
                  }}
                >
                  <span>
                    {participant.firstName} {participant.surname}
                    {index === 0 && " (Lead)"}
                  </span>
                  {isCompleted && (
                    <Badge variant="secondary" className="ml-2">✓ Completed</Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Waiver Dialog */}
      <Dialog open={waiverDialogOpen} onOpenChange={setWaiverDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-4 pb-2">
            <DialogTitle className="text-lg font-semibold text-foreground">
              Liability Waiver
            </DialogTitle>
          </DialogHeader>
          <SmartWaiverForm
            tourName={tour.title}
            bookingReference={booking.booking_reference || `BK-${booking.id.slice(0, 8)}`}
            tourDates={{
              from: format(new Date(booking.booking_date), 'MMM dd, yyyy'),
              to: format(addDays(new Date(booking.booking_date), parseInt(tour.duration) || 3), 'MMM dd, yyyy')
            }}
            location={tour.region_region ? `${tour.region_subregion}, ${tour.region_region}, ${tour.region_country}` : `${tour.region_subregion}, ${tour.region_country}`}
            guideName={guide.display_name}
            guideContact={guide.phone || 'Contact via platform'}
            participantIndex={selectedParticipantIndex}
            participantName={participants[selectedParticipantIndex] ? `${participants[selectedParticipantIndex].firstName} ${participants[selectedParticipantIndex].surname}` : undefined}
            onSubmit={handleWaiverSubmit}
            onSaveDraft={handleWaiverDraftSave}
            prefilledData={{
              // For primary booker (index 0), prioritize user profile and booking data
              // For other participants, use their participant data
              fullName: selectedParticipantIndex === 0
                ? (userProfile?.first_name && userProfile?.last_name
                  ? `${userProfile.first_name} ${userProfile.last_name}`
                  : undefined)
                : (participants[selectedParticipantIndex]?.firstName && participants[selectedParticipantIndex]?.surname
                  ? `${participants[selectedParticipantIndex].firstName} ${participants[selectedParticipantIndex].surname}`
                  : undefined),
              dateOfBirth: selectedParticipantIndex === 0 ? (userProfile?.date_of_birth || undefined) : undefined,
              // Start with participant/booker email preference
              email: selectedParticipantIndex === 0
                ? (userProfile?.email || booking.hiker_email || undefined)
                : (participants[selectedParticipantIndex]?.participantEmail || undefined),
              country: selectedParticipantIndex === 0
                ? (userProfile?.country && !String(userProfile.country).trim().startsWith('+')
                  ? userProfile.country
                  : undefined)
                : undefined,
              emergencyName: selectedParticipantIndex === 0 ? (userProfile?.emergency_contact_name || undefined) : undefined,
              emergencyPhone: selectedParticipantIndex === 0 ? (userProfile?.emergency_contact_phone || undefined) : undefined,
              emergencyRelationship: selectedParticipantIndex === 0 ? (userProfile?.emergency_contact_relationship || undefined) : undefined,
              medicalDetails: participants[selectedParticipantIndex]?.medicalConditions || undefined,
              // Then overlay any previously saved waiver data for this participant
              ...(participants[selectedParticipantIndex]?.waiverData || {}),
              // Then overlay any previously saved waiver data for any booking (only for primary booker)
              ...(selectedParticipantIndex === 0 ? (previousWaiverData || {}) : {}),
              // Then overlay any saved waiver data for this specific booking
              ...(parsedWaiverData || {}),
              // Finally overlay any draft data (most recent)
              ...loadWaiverDraft(),
              // But always enforce the correct email and phone for the primary booker so it never gets
              // overwritten by older waiver data or drafts.
              ...(selectedParticipantIndex === 0 && userProfile ? (() => {
                const result: any = { email: userProfile.email || booking.hiker_email || undefined };
                const phoneStr = userProfile.phone ? String(userProfile.phone).trim() : '';
                const countryStr = userProfile.country ? String(userProfile.country).trim() : '';

                // 1) Prefer explicit phone with country code, if present
                if (phoneStr) {
                  if (phoneStr.startsWith('+')) {
                    const match = phoneStr.match(/^(\+\d{1,4})\s*(.*)$/);
                    if (match) {
                      result.phoneCountryCode = match[1];
                      result.phone = match[2].trim();
                    }
                  } else {
                    // No explicit country code, keep the local number and let user choose code
                    result.phone = phoneStr;
                  }
                }

                // 2) Legacy case: country field stored a phone code like "+43"
                if (!result.phoneCountryCode && countryStr && countryStr.startsWith('+')) {
                  result.phoneCountryCode = countryStr;
                }

                // 3) Map known country names to default dial codes (e.g. Netherlands -> +31)
                if (!result.phoneCountryCode && countryStr && !countryStr.startsWith('+')) {
                  const countryDialMap: Record<string, string> = {
                    Netherlands: '+31',
                    Austria: '+43',
                    Germany: '+49',
                    France: '+33',
                    Spain: '+34',
                    Italy: '+39',
                    Belgium: '+32',
                    Switzerland: '+41',
                    Portugal: '+351',
                    Ireland: '+353',
                    Sweden: '+46',
                    Norway: '+47',
                    Denmark: '+45',
                    Finland: '+358',
                    Poland: '+48',
                    'Czech Republic': '+420',
                    Hungary: '+36',
                    Greece: '+30',
                  };
                  const mapped = countryDialMap[countryStr];
                  if (mapped) {
                    result.phoneCountryCode = mapped;
                  }
                }

                return result;
              })() : {}),
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Waiver Viewer */}
      <WaiverViewer
        open={waiverViewerOpen}
        onOpenChange={setWaiverViewerOpen}
        waiverData={booking.waiver_data || loadWaiverDraft()}
        tourName={tour.title}
        bookingReference={booking.booking_reference || `BK-${booking.id.slice(0, 8)}`}
      />

      {/* Participant Management Modal */}
      <ParticipantManagementModal
        open={participantManagementOpen}
        onClose={() => setParticipantManagementOpen(false)}
        bookingReference={booking.booking_reference || `BK-${booking.id.slice(0, 8)}`}
        tourName={tour.title}
        maxParticipants={booking.participants}
        participants={additionalParticipants.map((p, index) => {
          const actualIndex = index + 1; // Adjust since we're excluding primary booker
          const status = participantStatuses?.find((s: any) => s.participant_index === actualIndex);
          return {
            id: status?.token_id || `participant-${actualIndex}`,
            name: `${p.firstName} ${p.surname}`,
            email: p.participantEmail || '',
            status: status?.waiver_completed && status?.insurance_completed
              ? 'complete'
              : status?.waiver_completed || status?.insurance_completed
              ? 'in_progress'
              : status?.invited_at
              ? 'invited'
              : 'not_started',
            waiverStatus: !!status?.waiver_completed,
            insuranceStatus: !!status?.insurance_completed,
            emergencyContactStatus: !!status?.emergency_contact_completed,
            invitedAt: status?.invited_at,
            completedAt: status?.completed_at,
            uniqueLink: status ? `${window.location.origin}/participant/${status.token}` : undefined,
          };
        })}
        onAddParticipant={async (name: string, email: string) => {
          try {
            // Parse name into first and last name
            const nameParts = name.trim().split(' ');
            const firstName = nameParts[0];
            const surname = nameParts.slice(1).join(' ') || nameParts[0];

            // Get current participants
            const currentParticipants = booking.participants_details as ParticipantDetails[] || [];
            
            // Check for duplicate email
            if (currentParticipants.some(p => p.participantEmail === email)) {
              toast({
                title: 'Duplicate Email',
                description: 'A participant with this email already exists.',
                variant: 'destructive',
              });
              return;
            }

            // Add new participant
            const newParticipant: ParticipantDetails = {
              firstName,
              surname,
              age: 0,
              experience: 'beginner',
              participantEmail: email,
              documentStatus: 'not_started',
            };

            const updatedParticipants = [...currentParticipants, newParticipant];

            // Update booking
            const { error } = await supabase
              .from('bookings')
              .update({ 
                participants_details: updatedParticipants as any,
              })
              .eq('id', booking.id);

            if (error) throw error;

            // Invalidate queries to refresh UI
            queryClient.invalidateQueries({ queryKey: ['trip-details', booking.id] });
            queryClient.invalidateQueries({ queryKey: ['participant-statuses', booking.id] });

            toast({
              title: 'Participant Added',
              description: `${name} has been added. You can now send them an invitation.`,
            });
          } catch (error) {
            console.error('Error adding participant:', error);
            toast({
              title: 'Error',
              description: 'Failed to add participant. Please try again.',
              variant: 'destructive',
            });
          }
        }}
        onSendInvite={async (participantId: string, emailOverride?: string) => {
          console.log('=== onSendInvite called ===', { participantId, emailOverride });
          
          const participantIndex = additionalParticipants.findIndex((_, i) => {
            const actualIndex = i + 1;
            const status = participantStatuses?.find((s: any) => s.participant_index === actualIndex);
            const derivedId = status?.token_id || `participant-${actualIndex}`;
            return derivedId === participantId;
          });
          
          console.log('Found participant:', { participantIndex, additionalParticipants: additionalParticipants.length });
          
          if (participantIndex === -1) {
            console.error('Participant not found for ID:', participantId);
            return;
          }
          
          const actualIndex = participantIndex + 1;
          const participant = additionalParticipants[participantIndex];
          const email = emailOverride || participant.participantEmail;
          
          console.log('Preparing to send invitation:', { actualIndex, participant, email });
          
          if (!email) {
            console.error('No email for participant:', participant);
            toast({
              title: 'Email Required',
              description: `${participant.firstName} ${participant.surname} needs an email address.`,
              variant: 'destructive',
            });
            return;
          }
          
          try {
            console.log('Step 1: Creating token...');
            const { data: tokenData, error: tokenError } = await supabase.functions.invoke('manage-participant-tokens', {
              body: {
                action: 'create_token',
                bookingId: booking.id,
                email: email,
                name: `${participant.firstName} ${participant.surname}`,
                participantIndex: actualIndex,
              }
            });
            
            console.log('Token creation result:', { tokenData, tokenError });
            
            if (tokenError) {
              console.error('Token creation error:', tokenError);
              throw new Error(`Token creation failed: ${tokenError.message || JSON.stringify(tokenError)}`);
            }
            
            if (!tokenData?.token_id) {
              console.error('No token_id in response:', tokenData);
              throw new Error('Invalid token response: missing token_id');
            }
            
            console.log('Step 2: Sending invitation...');
            const invitePayload = {
              action: 'send_invitation',
              tokenId: tokenData.token_id,
              tourName: tour.title,
              tourDates: format(new Date(booking.booking_date), 'MMM dd, yyyy'),
              guideName: guide.display_name,
              primaryBookerName: userProfile?.first_name || 'the primary booker',
              bookingReference: booking.booking_reference,
              frontendUrl: window.location.origin
            };
            
            console.log('Sending invitation with payload:', invitePayload);
            
            const { data: inviteData, error: inviteError } = await supabase.functions.invoke('manage-participant-tokens', {
              body: invitePayload
            });
            
            console.log('Invitation send result:', { inviteData, inviteError });
            
            if (inviteError) {
              console.error('Invitation send error:', inviteError);
              throw new Error(`Invitation failed: ${inviteError.message || JSON.stringify(inviteError)}`);
            }
            
            console.log('Success! Invalidating queries...');
            queryClient.invalidateQueries({ queryKey: ['participant-statuses', booking.id] });
            
            toast({
              title: 'Invitation Sent',
              description: `Invitation email sent to ${participant.firstName} ${participant.surname}`,
            });
          } catch (error: any) {
            console.error('=== Complete error in onSendInvite ===', error);
            toast({
              title: 'Error',
              description: error?.message || 'Failed to send invitation. Please try again.',
              variant: 'destructive',
            });
          }
        }}
        onRemoveParticipant={async (participantId: string) => {
          try {
            // Get current participants
            const currentParticipants = booking.participants_details as ParticipantDetails[] || [];
            
            // Find the participant index (accounting for the fact that modal shows additionalParticipants)
            // The participantId might be a token_id or a participant-{index} string
            const participantIndex = additionalParticipants.findIndex((_, i) => {
              const actualIndex = i + 1;
              const status = participantStatuses?.find((s: any) => s.participant_index === actualIndex);
              return status?.token_id === participantId || `participant-${actualIndex}` === participantId;
            });
            
            if (participantIndex === -1) {
              toast({
                title: 'Error',
                description: 'Participant not found.',
                variant: 'destructive',
              });
              return;
            }

            // The actual index in the full participants array (including booker)
            const actualParticipantIndex = participantIndex + 1;
            
            // Remove the participant from the array
            const updatedParticipants = currentParticipants.filter((_, idx) => idx !== actualParticipantIndex);

            // Update booking
            const { error } = await supabase
              .from('bookings')
              .update({ 
                participants_details: updatedParticipants as any,
              })
              .eq('id', booking.id);

            if (error) throw error;

            // If participant had a token, delete it
            const status = participantStatuses?.find((s: any) => s.participant_index === actualParticipantIndex);
            if (status?.token_id) {
              await supabase
                .from('participant_tokens')
                .delete()
                .eq('id', status.token_id);
            }

            // Invalidate queries to refresh UI
            queryClient.invalidateQueries({ queryKey: ['trip-details', booking.id] });
            queryClient.invalidateQueries({ queryKey: ['participant-statuses', booking.id] });

            toast({
              title: 'Participant Removed',
              description: 'The participant has been removed from this booking.',
            });
          } catch (error) {
            console.error('Error removing participant:', error);
            toast({
              title: 'Error',
              description: 'Failed to remove participant. Please try again.',
              variant: 'destructive',
            });
          }
        }}
        onUpdateEmail={async (participantId: string, email: string) => {
          try {
            // Get current participants
            const currentParticipants = booking.participants_details as ParticipantDetails[] || [];
            
            // Find the participant index (accounting for the fact that modal shows additionalParticipants)
            const participantIndex = additionalParticipants.findIndex((_, i) => {
              const actualIndex = i + 1;
              const status = participantStatuses?.find((s: any) => s.participant_index === actualIndex);
              return status?.token_id === participantId || `participant-${actualIndex}` === participantId;
            });
            
            if (participantIndex === -1) {
              toast({
                title: 'Error',
                description: 'Participant not found.',
                variant: 'destructive',
              });
              return;
            }

            // The actual index in the full participants array (including booker)
            const actualParticipantIndex = participantIndex + 1;
            
            // Update the participant's email
            const updatedParticipants = [...currentParticipants];
            updatedParticipants[actualParticipantIndex] = {
              ...updatedParticipants[actualParticipantIndex],
              participantEmail: email,
            };

            // Update booking
            const { error } = await supabase
              .from('bookings')
              .update({ 
                participants_details: updatedParticipants as any,
              })
              .eq('id', booking.id);

            if (error) throw error;

            // Invalidate queries to refresh UI
            queryClient.invalidateQueries({ queryKey: ['trip-details', booking.id] });
            queryClient.invalidateQueries({ queryKey: ['participant-statuses', booking.id] });

            toast({
              title: 'Email Updated',
              description: 'The participant email has been updated.',
            });
          } catch (error) {
            console.error('Error updating email:', error);
            toast({
              title: 'Error',
              description: 'Failed to update email. Please try again.',
              variant: 'destructive',
            });
          }
        }}
      />
    </div>
  );
}
