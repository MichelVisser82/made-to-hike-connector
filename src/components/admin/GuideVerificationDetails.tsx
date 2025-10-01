import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { CertificationBadge } from '../ui/certification-badge';
import { useGuideVerifications, useUpdateVerificationStatus } from '@/hooks/useGuideVerifications';
import { ArrowLeft, CheckCircle2, XCircle, FileText, ExternalLink, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface GuideVerificationDetailsProps {
  verificationId: string;
  onBack: () => void;
}

export function GuideVerificationDetails({ verificationId, onBack }: GuideVerificationDetailsProps) {
  const [adminNotes, setAdminNotes] = useState('');
  const { data: verifications } = useGuideVerifications();
  const updateStatus = useUpdateVerificationStatus();

  const verification = verifications?.find(v => v.id === verificationId);

  const handleApprove = () => {
    updateStatus.mutate({
      verificationId,
      status: 'approved',
      adminNotes: adminNotes || undefined,
    }, {
      onSuccess: () => onBack(),
    });
  };

  const handleReject = () => {
    if (!adminNotes.trim()) {
      alert('Please provide a reason for rejection in the admin notes.');
      return;
    }
    updateStatus.mutate({
      verificationId,
      status: 'rejected',
      adminNotes,
    }, {
      onSuccess: () => onBack(),
    });
  };

  const viewDocument = async (documentPath: string) => {
    const { data } = await supabase.storage
      .from('guide-documents')
      .createSignedUrl(documentPath, 3600);
    
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank');
    }
  };

  if (!verification) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Verification request not found</p>
          <Button onClick={onBack} variant="outline" className="mt-4">
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  const certifications = verification.guide_profile?.certifications || [];
  const hasPriorityOne = certifications.some(cert => cert.verificationPriority === 1);
  const hasPriorityTwo = certifications.some(cert => cert.verificationPriority === 2);

  return (
    <div className="space-y-6">
      <Button onClick={onBack} variant="ghost" className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Verifications
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={verification.guide_profile?.profile_image_url} />
                <AvatarFallback className="text-xl">
                  {verification.guide_profile?.display_name?.charAt(0) || 'G'}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">
                  {verification.guide_profile?.display_name || 'Unknown Guide'}
                </CardTitle>
                <p className="text-muted-foreground">{verification.profile?.email}</p>
              </div>
            </div>
            <Badge variant={
              verification.verification_status === 'approved' ? 'default' :
              verification.verification_status === 'rejected' ? 'destructive' : 'outline'
            }>
              {verification.verification_status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Business Information */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Company Name</Label>
                <p className="font-medium">{verification.company_name || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">License Number</Label>
                <p className="font-medium">{verification.license_number || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Experience Years</Label>
                <p className="font-medium">{verification.experience_years || 0} years</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Location</Label>
                <p className="font-medium">{verification.guide_profile?.location || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <Label className="text-muted-foreground">Insurance Information</Label>
                <p className="font-medium">{verification.insurance_info || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Certifications</h3>
            {certifications.length === 0 ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No certifications submitted. At least one Priority 1 or 2 certification is required for verification.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="flex flex-wrap gap-3 mb-4">
                  {certifications.map((cert: any, index: number) => (
                    <CertificationBadge
                      key={index}
                      certification={cert}
                      size="full"
                      showTooltip
                      showVerificationStatus
                      showPrimaryIndicator
                    />
                  ))}
                </div>
                {!hasPriorityOne && !hasPriorityTwo && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      This guide does not have any Priority 1 or 2 certifications. Consider requesting additional certifications before approval.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </div>

          {/* Documents */}
          {verification.verification_documents && verification.verification_documents.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-4">Verification Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {verification.verification_documents.map((doc, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start gap-2"
                    onClick={() => viewDocument(doc)}
                  >
                    <FileText className="h-4 w-4" />
                    Document {index + 1}
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Admin Notes Section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="admin-notes">Admin Notes</Label>
              <Textarea
                id="admin-notes"
                placeholder="Add notes about this verification (required for rejection)..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>

            {verification.admin_notes && (
              <Alert>
                <AlertDescription>
                  <strong>Previous Notes:</strong> {verification.admin_notes}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Action Buttons */}
          {verification.verification_status === 'pending' && (
            <div className="flex gap-4">
              <Button
                onClick={handleApprove}
                disabled={updateStatus.isPending}
                className="flex-1 gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve Verification
              </Button>
              <Button
                onClick={handleReject}
                variant="destructive"
                disabled={updateStatus.isPending}
                className="flex-1 gap-2"
              >
                <XCircle className="h-4 w-4" />
                Reject Verification
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
