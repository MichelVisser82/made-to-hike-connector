import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface WaiverViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  waiverData: any;
  tourName: string;
  bookingReference: string;
}

export function WaiverViewer({ open, onOpenChange, waiverData, tourName, bookingReference }: WaiverViewerProps) {
  if (!waiverData) return null;

  const sections = [
    { title: 'Participant Information', key: 'participantInfo' },
    { title: 'Emergency Contact', key: 'emergencyContact' },
    { title: 'Medical Information', key: 'medicalInfo' },
    { title: 'Experience & Fitness', key: 'experienceFitness' },
    { title: 'Insurance Information', key: 'insuranceInfo' },
    { title: 'Acknowledgment of Risks', key: 'riskAcknowledgment' },
    { title: 'Release of Liability', key: 'liabilityRelease' },
    { title: 'Photo & Media Release', key: 'mediaRelease' },
    { title: 'Cancellation Policy', key: 'cancellationPolicy' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            <CheckCircle2 className="w-5 h-5 text-sage" />
            Signed Liability Waiver
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {tourName} • {bookingReference}
          </p>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {sections.map((section) => {
              const data = waiverData[section.key];
              if (!data || Object.keys(data).length === 0) return null;

              return (
                <div key={section.key}>
                  <h3 className="font-semibold text-foreground mb-3">{section.title}</h3>
                  <div className="space-y-2 text-sm">
                    {Object.entries(data).map(([key, value]: [string, any]) => {
                      if (typeof value === 'boolean') {
                        return (
                          <div key={key} className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-sage" />
                            <span className="text-muted-foreground capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          </div>
                        );
                      }
                      if (value && typeof value === 'string') {
                        return (
                          <div key={key} className="grid grid-cols-3 gap-2">
                            <span className="text-muted-foreground capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}:
                            </span>
                            <span className="col-span-2 text-foreground">{value}</span>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                  <Separator className="mt-4" />
                </div>
              );
            })}

            {waiverData.signature && (
              <div>
                <h3 className="font-semibold text-foreground mb-3">Digital Signature</h3>
                <div className="border rounded-lg p-4 bg-background">
                  <img 
                    src={waiverData.signature.signatureData} 
                    alt="Signature" 
                    className="max-w-xs border-b border-muted"
                  />
                  <div className="mt-3 space-y-1 text-sm">
                    <p className="text-foreground font-medium">{waiverData.signature.fullName}</p>
                    {waiverData.signature.signedAt && (
                      <p className="text-muted-foreground">
                        Signed on {format(new Date(waiverData.signature.signedAt), 'MMMM dd, yyyy')} at{' '}
                        {format(new Date(waiverData.signature.signedAt), 'h:mm a')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
