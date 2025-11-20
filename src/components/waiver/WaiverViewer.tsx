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

type WaiverSignature =
  | string
  | {
      _type?: string;
      value?: string;
      [key: string]: unknown;
    };

interface WaiverData {
  fullName?: string;
  dateOfBirth?: string;
  nationality?: string;
  address?: string;
  city?: string;
  country?: string;
  email?: string;
  phone?: string;

  emergencyName?: string;
  emergencyPhone?: string;
  emergencyRelationship?: string;

  medicalConditions?: string;
  medicalDetails?: string;
  currentMedications?: string;
  allergies?: string;
  lastTetanusShot?: string;

  hasInsurance?: boolean;
  insuranceProvider?: string;
  policyNumber?: string;
  insuranceEmergencyNumber?: string;

  risksInitial?: string;
  liabilityInitial?: string;
  conductInitial?: string;
  mediaConsent?: boolean;
  mediaInitial?: string;

  isUnder18?: boolean;
  guardianName?: string;
  guardianRelationship?: string;

  signature?: WaiverSignature;
  signatureDate?: string;
  submittedAt?: string;
  signatureLocation?: string;

  location?: string;
  tourName?: string;
  guideName?: string;

  [key: string]: unknown;
}

const normalizeWaiverData = (raw: any): WaiverData | null => {
  if (!raw) return null;

  let data = raw;

  // 1) If it's a string, try to parse as JSON
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      return null;
    }
  }

  // 2) If there's a nested formData object, prefer that
  if (data && typeof data === 'object' && 'formData' in data && typeof data.formData === 'object') {
    data = data.formData;
  }

  // 3) If it's a wrapper object with a single nested object
  if (data && typeof data === 'object' && !('fullName' in data)) {
    const values = Object.values(data);
    if (values.length === 1 && values[0] && typeof values[0] === 'object') {
      data = values[0];
    }
  }

  // Final guard
  if (!data || typeof data !== 'object') {
    return null;
  }

  return data as WaiverData;
};

export function WaiverViewer({ open, onOpenChange, waiverData, tourName, bookingReference }: WaiverViewerProps) {
  const data = normalizeWaiverData(waiverData);

  console.log('WaiverViewer data (normalized):', data);

  const hasAnyData = data && Object.keys(data).length > 0;

  // If absolutely nothing is there, still show a friendly dialog
  if (!hasAnyData) {
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
          <p className="text-sm text-muted-foreground">
            No waiver details could be loaded for this booking.
          </p>
          {waiverData && (
            <>
              <Separator className="my-4" />
              <p className="text-xs text-muted-foreground mb-2">Raw stored data (for debugging):</p>
              <pre className="text-xs text-muted-foreground break-all whitespace-pre-wrap">
                {typeof waiverData === 'string'
                  ? waiverData
                  : JSON.stringify(waiverData, null, 2)}
              </pre>
            </>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  const renderRow = (label: string, value: unknown) => {
    if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
      return null;
    }
    const display = Array.isArray(value) ? value.join(', ') : String(value);
    return (
      <div className="grid grid-cols-3 gap-2" key={label}>
        <span className="text-muted-foreground">{label}</span>
        <span className="col-span-2 text-foreground">{display}</span>
      </div>
    );
  };

  const resolveSignatureImage = (sig?: WaiverSignature): string | null => {
    if (!sig) return null;
    if (typeof sig === 'string') return sig;
    if (typeof sig === 'object' && typeof sig.value === 'string') return sig.value;
    return null;
  };

  const signatureImage = resolveSignatureImage(data?.signature);

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
            {/* Trip & Guide Info */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Trip &amp; Guide Information</h3>
              <div className="space-y-2 text-sm">
                {renderRow('Tour', data?.tourName)}
                {renderRow('Location', data?.location)}
                {renderRow('Guide', data?.guideName)}
              </div>
              <Separator className="mt-4" />
            </div>

            {/* Participant Information */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Participant Information</h3>
              <div className="space-y-2 text-sm">
                {renderRow('Full name', data?.fullName)}
                {renderRow('Date of birth', data?.dateOfBirth)}
                {renderRow('Nationality', data?.nationality)}
                {renderRow('Address', data?.address)}
                {renderRow('City', data?.city)}
                {renderRow('Country', data?.country)}
                {renderRow('Email', data?.email)}
                {renderRow('Phone', data?.phone)}
              </div>
              <Separator className="mt-4" />
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Emergency Contact</h3>
              <div className="space-y-2 text-sm">
                {renderRow('Name', data?.emergencyName)}
                {renderRow('Phone', data?.emergencyPhone)}
                {renderRow('Relationship', data?.emergencyRelationship)}
              </div>
              <Separator className="mt-4" />
            </div>

            {/* Medical Information */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Medical Information</h3>
              <div className="space-y-2 text-sm">
                {renderRow('Medical conditions', data?.medicalConditions)}
                {renderRow('Details', data?.medicalDetails)}
                {renderRow('Current medications', data?.currentMedications)}
                {renderRow('Allergies', data?.allergies)}
                {renderRow('Last tetanus shot', data?.lastTetanusShot)}
              </div>
              <Separator className="mt-4" />
            </div>

            {/* Insurance Information */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Insurance Information</h3>
              <div className="space-y-2 text-sm">
                {renderRow(
                  'Has insurance',
                  typeof data?.hasInsurance === 'boolean'
                    ? data.hasInsurance ? 'Yes' : 'No'
                    : undefined
                )}
                {renderRow('Provider', data?.insuranceProvider)}
                {renderRow('Policy number', data?.policyNumber)}
                {renderRow('Emergency number', data?.insuranceEmergencyNumber)}
              </div>
              <Separator className="mt-4" />
            </div>

            {/* Acknowledgments */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Acknowledgments</h3>
              <div className="space-y-2 text-sm">
                {renderRow('Risks initials', data?.risksInitial)}
                {renderRow('Liability initials', data?.liabilityInitial)}
                {renderRow('Conduct initials', data?.conductInitial)}
                {renderRow(
                  'Media consent',
                  typeof data?.mediaConsent === 'boolean'
                    ? data.mediaConsent ? 'Yes' : 'No'
                    : undefined
                )}
                {renderRow('Media initials', data?.mediaInitial)}
              </div>
              <Separator className="mt-4" />
            </div>

            {/* Digital Signature */}
            {signatureImage && (
              <div>
                <h3 className="font-semibold text-foreground mb-3">Digital Signature</h3>
                <div className="border rounded-lg p-4 bg-background space-y-2">
                  <p className="text-foreground font-medium">
                    {data?.fullName || 'Signed participant'}
                  </p>
                  <div className="mt-2">
                    <img
                      src={signatureImage}
                      alt={`Digital signature of ${data?.fullName || 'participant'}`}
                      className="border rounded bg-white max-h-32"
                    />
                  </div>
                  {(data?.signatureDate || data?.submittedAt) && (
                    <p className="text-muted-foreground">
                      Signed on{' '}
                      {format(new Date(data.signatureDate || data.submittedAt), 'MMMM dd, yyyy')}{' '}
                      at {format(new Date(data.signatureDate || data.submittedAt), 'h:mm a')}
                    </p>
                  )}
                  {data?.signatureLocation && (
                    <p className="text-muted-foreground">
                      Location: {data.signatureLocation}
                    </p>
                  )}
                  {data?.isUnder18 && data.guardianName && (
                    <p className="text-muted-foreground">
                      Signed on behalf of minor by {data.guardianName}
                      {data.guardianRelationship ? ` (${data.guardianRelationship})` : ''}
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
