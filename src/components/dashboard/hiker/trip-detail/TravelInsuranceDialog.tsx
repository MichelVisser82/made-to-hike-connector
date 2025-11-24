import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

interface TravelInsuranceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  existingData?: {
    provider?: string;
    policyNumber?: string;
  };
  onSuccess?: () => void;
}

const insuranceSchema = z.object({
  provider: z.string().trim().min(2, 'Insurance company name is required').max(200, 'Name is too long'),
  policyNumber: z.string().trim().min(3, 'Policy number is required').max(100, 'Policy number is too long'),
});

export function TravelInsuranceDialog({
  open,
  onOpenChange,
  bookingId,
  existingData,
  onSuccess,
}: TravelInsuranceDialogProps) {
  const [provider, setProvider] = useState(existingData?.provider || '');
  const [policyNumber, setPolicyNumber] = useState(existingData?.policyNumber || '');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const validation = insuranceSchema.safeParse({ provider, policyNumber });
    if (!validation.success) {
      toast({
        title: 'Validation Error',
        description: validation.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Store insurance details in participants_details JSON
      const { data: booking } = await supabase
        .from('bookings')
        .select('participants_details')
        .eq('id', bookingId)
        .single();

      const participantsDetails = (booking?.participants_details as any) || [];
      const updatedDetails = [...participantsDetails];
      
      // Update or add insurance info to primary participant (index 0)
      if (updatedDetails[0]) {
        updatedDetails[0] = {
          ...updatedDetails[0],
          insurance_provider: provider.trim(),
          insurance_policy_number: policyNumber.trim(),
        };
      } else {
        updatedDetails[0] = {
          insurance_provider: provider.trim(),
          insurance_policy_number: policyNumber.trim(),
        };
      }

      // Update booking with insurance details and mark as uploaded
      const { error } = await supabase
        .from('bookings')
        .update({
          participants_details: updatedDetails,
          insurance_uploaded_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: 'Insurance Saved',
        description: 'Your travel insurance details have been saved successfully.',
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving insurance:', error);
      toast({
        title: 'Error',
        description: 'Failed to save insurance details. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-sage" />
            <DialogTitle>Travel Insurance Details</DialogTitle>
          </div>
          <DialogDescription>
            Please provide your travel insurance information for this trip.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Insurance Company Name *</Label>
            <Input
              id="provider"
              placeholder="e.g., World Nomads, Allianz"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              maxLength={200}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="policyNumber">Policy Number *</Label>
            <Input
              id="policyNumber"
              placeholder="e.g., WN-123456789"
              value={policyNumber}
              onChange={(e) => setPolicyNumber(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Insurance Details'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
