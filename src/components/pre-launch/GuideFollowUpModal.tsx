import { useState } from 'react';
import { X, Plus, Trash2, Mail } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GuideFollowUpModalProps {
  open: boolean;
  onClose: () => void;
  signupId: string;
  email: string;
}

export function GuideFollowUpModal({ open, onClose, signupId, email }: GuideFollowUpModalProps) {
  const [regions, setRegions] = useState<string[]>(['']);
  const [certifications, setCertifications] = useState<string[]>(['']);
  const [earlyTesterInterest, setEarlyTesterInterest] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAddRegion = () => {
    setRegions([...regions, '']);
  };

  const handleRemoveRegion = (index: number) => {
    if (regions.length > 1) {
      setRegions(regions.filter((_, i) => i !== index));
    }
  };

  const handleRegionChange = (index: number, value: string) => {
    const newRegions = [...regions];
    newRegions[index] = value;
    setRegions(newRegions);
  };

  const handleAddCertification = () => {
    setCertifications([...certifications, '']);
  };

  const handleRemoveCertification = (index: number) => {
    if (certifications.length > 1) {
      setCertifications(certifications.filter((_, i) => i !== index));
    }
  };

  const handleCertificationChange = (index: number, value: string) => {
    const newCertifications = [...certifications];
    newCertifications[index] = value;
    setCertifications(newCertifications);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const filteredRegions = regions.filter(r => r.trim() !== '');
      const filteredCertifications = certifications.filter(c => c.trim() !== '');

      const { error } = await supabase
        .from('launch_signups')
        .update({
          regions: filteredRegions.length > 0 ? filteredRegions : null,
          certifications: filteredCertifications.length > 0 ? filteredCertifications : null,
          early_tester_interest: earlyTesterInterest === 'yes' ? true : earlyTesterInterest === 'no' ? false : null,
        })
        .eq('id', signupId);

      if (error) throw error;

      toast({
        title: 'Thank you!',
        description: "We've saved your information and will be in touch soon.",
      });

      onClose();
    } catch (error) {
      console.error('Error updating signup:', error);
      toast({
        title: 'Something went wrong',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    toast({
      title: "You're all set!",
      description: "We'll email you when we launch.",
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto border-burgundy/20 bg-gradient-to-b from-background to-background/95">
        <DialogHeader className="space-y-3 pb-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-burgundy to-burgundy-dark flex items-center justify-center">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-2xl text-center bg-gradient-to-r from-burgundy to-burgundy-dark bg-clip-text text-transparent">
            Tell us more about your guiding
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Help us tailor the platform to your needs. All fields are optional.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Regions Section */}
          <div className="space-y-3 p-4 rounded-lg border border-burgundy/10 bg-gradient-to-br from-burgundy/5 to-transparent">
            <Label className="text-base font-semibold text-foreground">What regions do you organize hikes?</Label>
            <div className="space-y-2">
              {regions.map((region, index) => (
                <div key={index} className="flex gap-2 animate-fade-in">
                  <Input
                    placeholder="e.g., Scottish Highlands, Dolomites"
                    value={region}
                    onChange={(e) => handleRegionChange(index, e.target.value)}
                    className="flex-1 border-burgundy/20 focus:border-burgundy focus:ring-burgundy/20"
                  />
                  {regions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveRegion(index)}
                      className="shrink-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddRegion}
              className="w-full border-burgundy/30 hover:bg-burgundy/10 hover:text-burgundy hover:border-burgundy"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Region
            </Button>
          </div>

          {/* Certifications Section */}
          <div className="space-y-3 p-4 rounded-lg border border-burgundy/10 bg-gradient-to-br from-burgundy/5 to-transparent">
            <Label className="text-base font-semibold text-foreground">What certifications do you own?</Label>
            <div className="space-y-2">
              {certifications.map((cert, index) => (
                <div key={index} className="flex gap-2 animate-fade-in">
                  <Input
                    placeholder="e.g., IFMGA Mountain Guide, First Aid"
                    value={cert}
                    onChange={(e) => handleCertificationChange(index, e.target.value)}
                    className="flex-1 border-burgundy/20 focus:border-burgundy focus:ring-burgundy/20"
                  />
                  {certifications.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCertification(index)}
                      className="shrink-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddCertification}
              className="w-full border-burgundy/30 hover:bg-burgundy/10 hover:text-burgundy hover:border-burgundy"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Certification
            </Button>
          </div>

          {/* Early Tester Interest */}
          <div className="space-y-4 p-4 rounded-lg border border-burgundy/10 bg-gradient-to-br from-burgundy/5 to-transparent">
            <Label className="text-base font-semibold text-foreground">
              Can we contact you to be one of the first Guides to test the platform?
            </Label>
            <RadioGroup value={earlyTesterInterest} onValueChange={setEarlyTesterInterest} className="space-y-3">
              <div className="flex items-center space-x-3 p-3 rounded-md border border-burgundy/20 hover:border-burgundy/40 hover:bg-burgundy/5 transition-all cursor-pointer">
                <RadioGroupItem value="yes" id="yes" className="border-burgundy text-burgundy" />
                <Label htmlFor="yes" className="font-normal cursor-pointer flex-1">
                  Yes, I'm interested in early testing
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-md border border-burgundy/20 hover:border-burgundy/40 hover:bg-burgundy/5 transition-all cursor-pointer">
                <RadioGroupItem value="no" id="no" className="border-burgundy text-burgundy" />
                <Label htmlFor="no" className="font-normal cursor-pointer flex-1">
                  No, just notify me at launch
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="flex-1 border-burgundy/30 hover:bg-burgundy/5"
          >
            Skip for Now
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-burgundy to-burgundy-dark hover:from-burgundy-dark hover:to-burgundy text-white shadow-lg hover:shadow-xl transition-all"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
