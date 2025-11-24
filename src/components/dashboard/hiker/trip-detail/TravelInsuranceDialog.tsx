import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
      <DialogContent className="sm:max-w-lg bg-cream border-burgundy/20">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-burgundy/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-burgundy" />
            </div>
            <div>
              <DialogTitle className="text-2xl text-burgundy" style={{fontFamily: 'Playfair Display, serif'}}>
                Travel Insurance
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1">
                Secure your adventure with proof of coverage
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-6">
          <div className="space-y-4 bg-white rounded-lg p-6 border border-burgundy/10">
            <div className="space-y-2">
              <Label htmlFor="provider" className="text-sm font-medium text-foreground">
                Insurance Company Name <span className="text-burgundy">*</span>
              </Label>
              <Input
                id="provider"
                placeholder="e.g., World Nomads, Allianz Global"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                maxLength={200}
                required
                className="border-burgundy/20 focus:border-burgundy focus:ring-burgundy/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="policyNumber" className="text-sm font-medium text-foreground">
                Policy Number <span className="text-burgundy">*</span>
              </Label>
              <Input
                id="policyNumber"
                placeholder="e.g., WN-123456789"
                value={policyNumber}
                onChange={(e) => setPolicyNumber(e.target.value)}
                maxLength={100}
                required
                className="border-burgundy/20 focus:border-burgundy focus:ring-burgundy/20"
              />
            </div>
          </div>

          <div className="bg-sage/5 border border-sage/20 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-sage">Important:</strong> Your insurance must cover mountain hiking activities and emergency rescue at altitude.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1 border-burgundy/30 text-burgundy hover:bg-burgundy/5"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-burgundy text-white hover:bg-burgundy/90"
            >
              {loading ? 'Saving...' : existingData ? 'Update Details' : 'Save Insurance Details'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
