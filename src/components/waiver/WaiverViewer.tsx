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
  // Normalize waiver data from various possible storage formats
  if (!waiverData) return null;

  let data: any = waiverData;

  // If it's a string, try to parse it
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      return null;
    }
  }

  // If it has a nested formData key, prefer that
  if (data && typeof data === 'object' && (data as any).formData && typeof (data as any).formData === 'object') {
    data = (data as any).formData;
  }

  // If it's a wrapper object with a single nested object, unwrap it
  if (data && typeof data === 'object' && !('fullName' in data)) {
    const values = Object.values(data);
    if (values.length === 1 && values[0] && typeof values[0] === 'object') {
      data = values[0];
    }
  }

  if (!data || typeof data !== 'object') return null;

  console.log('WaiverViewer data:', data);

  const hasAnyData = Object.keys(data || {}).length > 0;
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
                {renderRow('Full name', data.fullName)}
                {renderRow('Date of birth', data.dateOfBirth)}
                {renderRow('Nationality', data.nationality)}
                {renderRow('Address', data.address)}
                {renderRow('City', data.city)}
                {renderRow('Country', data.country)}
                {renderRow('Email', data.email)}
                {renderRow('Phone', data.phone)}
              </div>
              <Separator className="mt-4" />
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Emergency Contact</h3>
              <div className="space-y-2 text-sm">
                {renderRow('Name', data.emergencyName)}
                {renderRow('Phone', data.emergencyPhone)}
                {renderRow('Relationship', data.emergencyRelationship)}
              </div>
              <Separator className="mt-4" />
            </div>

            {/* Medical Information */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Medical Information</h3>
              <div className="space-y-2 text-sm">
                {renderRow('Medical conditions', data.medicalConditions)}
                {renderRow('Details', data.medicalDetails)}
                {renderRow('Current medications', data.currentMedications)}
                {renderRow('Allergies', data.allergies)}
                {renderRow('Last tetanus shot', data.lastTetanusShot)}
              </div>
              <Separator className="mt-4" />
            </div>

            {/* Insurance Information */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Insurance Information</h3>
              <div className="space-y-2 text-sm">
                {renderRow('Has insurance', typeof data.hasInsurance === 'boolean' ? (data.hasInsurance ? 'Yes' : 'No') : undefined)}
                {renderRow('Provider', data.insuranceProvider)}
                {renderRow('Policy number', data.policyNumber)}
                {renderRow('Emergency number', data.insuranceEmergencyNumber)}
              </div>
              <Separator className="mt-4" />
            </div>

            {/* Acknowledgments */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Acknowledgments</h3>
              <div className="space-y-2 text-sm">
                {renderRow('Risks initials', data.risksInitial)}
                {renderRow('Liability initials', data.liabilityInitial)}
                {renderRow('Conduct initials', data.conductInitial)}
                {renderRow('Media consent', typeof data.mediaConsent === 'boolean' ? (data.mediaConsent ? 'Yes' : 'No') : undefined)}
                {renderRow('Media initials', data.mediaInitial)}
              </div>
              <Separator className="mt-4" />
            </div>

            {/* Digital Signature */}
            {data.signature && (
              <div>
                <h3 className="font-semibold text-foreground mb-3">Digital Signature</h3>
                <div className="border rounded-lg p-4 bg-background">
                  {/* Signature is currently stored as a string (e.g. drawn signature or name) */}
                  <p className="text-foreground font-medium">{data.fullName}</p>
                  <p className="text-muted-foreground mt-1 break-words">Signature: {data.signature}</p>
                  {(data.signatureDate || data.submittedAt) && (
                    <p className="text-muted-foreground mt-1">
                      Signed on{' '}
                      {format(new Date(data.signatureDate || data.submittedAt), 'MMMM dd, yyyy')} at{' '}
                      {format(new Date(data.signatureDate || data.submittedAt), 'h:mm a')}
                    </p>
                  )}
                  {data.signatureLocation && (
                    <p className="text-muted-foreground mt-1">
                      Location: {data.signatureLocation}
                    </p>
                  )}
                  {data.isUnder18 && data.guardianName && (
                    <p className="text-muted-foreground mt-2">
                      Signed on behalf of minor by {data.guardianName} ({data.guardianRelationship})
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
