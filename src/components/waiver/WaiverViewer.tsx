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

  const hasAnyData = Object.keys(waiverData || {}).length > 0;
  if (!hasAnyData) return null;

  const renderRow = (label: string, value: any) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    const display = Array.isArray(value) ? value.join(', ') : String(value);
    return (
      <div className="grid grid-cols-3 gap-2" key={label}>
        <span className="text-muted-foreground">{label}</span>
        <span className="col-span-2 text-foreground">{display}</span>
      </div>
    );
  };

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
            {/* Participant Information */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Participant Information</h3>
              <div className="space-y-2 text-sm">
                {renderRow('Full name', waiverData.fullName)}
                {renderRow('Date of birth', waiverData.dateOfBirth)}
                {renderRow('Nationality', waiverData.nationality)}
                {renderRow('Address', waiverData.address)}
                {renderRow('City', waiverData.city)}
                {renderRow('Country', waiverData.country)}
                {renderRow('Email', waiverData.email)}
                {renderRow('Phone', waiverData.phone)}
              </div>
              <Separator className="mt-4" />
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Emergency Contact</h3>
              <div className="space-y-2 text-sm">
                {renderRow('Name', waiverData.emergencyName)}
                {renderRow('Phone', waiverData.emergencyPhone)}
                {renderRow('Relationship', waiverData.emergencyRelationship)}
              </div>
              <Separator className="mt-4" />
            </div>

            {/* Medical Information */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Medical Information</h3>
              <div className="space-y-2 text-sm">
                {renderRow('Medical conditions', waiverData.medicalConditions)}
                {renderRow('Details', waiverData.medicalDetails)}
                {renderRow('Current medications', waiverData.currentMedications)}
                {renderRow('Allergies', waiverData.allergies)}
                {renderRow('Last tetanus shot', waiverData.lastTetanusShot)}
              </div>
              <Separator className="mt-4" />
            </div>

            {/* Insurance Information */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Insurance Information</h3>
              <div className="space-y-2 text-sm">
                {renderRow('Has insurance', typeof waiverData.hasInsurance === 'boolean' ? (waiverData.hasInsurance ? 'Yes' : 'No') : undefined)}
                {renderRow('Provider', waiverData.insuranceProvider)}
                {renderRow('Policy number', waiverData.policyNumber)}
                {renderRow('Emergency number', waiverData.insuranceEmergencyNumber)}
              </div>
              <Separator className="mt-4" />
            </div>

            {/* Acknowledgments */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Acknowledgments</h3>
              <div className="space-y-2 text-sm">
                {renderRow('Risks initials', waiverData.risksInitial)}
                {renderRow('Liability initials', waiverData.liabilityInitial)}
                {renderRow('Conduct initials', waiverData.conductInitial)}
                {renderRow('Media consent', typeof waiverData.mediaConsent === 'boolean' ? (waiverData.mediaConsent ? 'Yes' : 'No') : undefined)}
                {renderRow('Media initials', waiverData.mediaInitial)}
              </div>
              <Separator className="mt-4" />
            </div>

            {/* Digital Signature */}
            {waiverData.signature && (
              <div>
                <h3 className="font-semibold text-foreground mb-3">Digital Signature</h3>
                <div className="border rounded-lg p-4 bg-background">
                  {/* Signature is currently stored as a string (e.g. drawn signature or name) */}
                  <p className="text-foreground font-medium">{waiverData.fullName}</p>
                  <p className="text-muted-foreground mt-1 break-words">Signature: {waiverData.signature}</p>
                  {(waiverData.signatureDate || waiverData.submittedAt) && (
                    <p className="text-muted-foreground mt-1">
                      Signed on{' '}
                      {format(new Date(waiverData.signatureDate || waiverData.submittedAt), 'MMMM dd, yyyy')} at{' '}
                      {format(new Date(waiverData.signatureDate || waiverData.submittedAt), 'h:mm a')}
                    </p>
                  )}
                  {waiverData.signatureLocation && (
                    <p className="text-muted-foreground mt-1">
                      Location: {waiverData.signatureLocation}
                    </p>
                  )}
                  {waiverData.isUnder18 && waiverData.guardianName && (
                    <p className="text-muted-foreground mt-2">
                      Signed on behalf of minor by {waiverData.guardianName} ({waiverData.guardianRelationship})
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
