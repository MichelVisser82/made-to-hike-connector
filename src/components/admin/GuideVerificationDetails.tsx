import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { CertificationBadge } from '../ui/certification-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useGuideVerifications, useUpdateVerificationStatus } from '@/hooks/useGuideVerifications';
import { ArrowLeft, CheckCircle2, XCircle, FileText, ExternalLink, AlertCircle, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface GuideVerificationDetailsProps {
  verificationId: string;
  onBack: () => void;
}

export function GuideVerificationDetails({ verificationId, onBack }: GuideVerificationDetailsProps) {
  const [adminNotes, setAdminNotes] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<{ url: string; title: string } | null>(null);
  const [documentUrls, setDocumentUrls] = useState<Record<string, string>>({});
  const [verifyingIndex, setVerifyingIndex] = useState<number | null>(null);
  const { data: verifications } = useGuideVerifications();
  const updateStatus = useUpdateVerificationStatus();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const verification = verifications?.find(v => v.id === verificationId);

  const handleVerifyCertification = async (certIndex: number) => {
    if (!verification?.user_id) return;
    
    const certifications = verification.guide_profile?.certifications || [];
    const cert = certifications[certIndex];
    
    // Prevent duplicate verification
    if (cert.verifiedDate) {
      toast({
        title: 'Already Verified',
        description: 'This certification has already been verified.',
        variant: 'default',
      });
      return;
    }
    
    setVerifyingIndex(certIndex);
    
    try {
      const updatedCerts = certifications.map((c, idx) => {
        if (idx === certIndex) {
          return {
            ...c,
            verifiedDate: new Date().toISOString(),
            verifiedBy: 'admin'
          };
        }
        return c;
      });

      // Check if guide now has sufficient verified certifications (Priority 1 or 2)
      const hasPriorityOneOrTwo = updatedCerts.some(c => 
        c.verifiedDate && (c.verificationPriority === 1 || c.verificationPriority === 2)
      );

      // Update guide profile with verified certifications
      const { error: profileError } = await supabase
        .from('guide_profiles')
        .update({ 
          certifications: updatedCerts,
          verified: hasPriorityOneOrTwo,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', verification.user_id);

      if (profileError) throw profileError;

      // If guide now has sufficient certifications, also update verification status
      if (hasPriorityOneOrTwo) {
        const { error: verificationError } = await supabase
          .from('user_verifications')
          .update({
            verification_status: 'approved',
            admin_notes: 'Auto-approved: Guide has verified Priority 1 or 2 certification',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', verification.user_id);

        if (verificationError) {
          console.error('Failed to update verification status:', verificationError);
        }
      }

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['guide-verifications'] });
      await queryClient.invalidateQueries({ queryKey: ['guide-profile', verification.user_id] });

      console.log('✅ Certification verified via Admin Panel:', {
        guide: verification.guide_profile?.display_name,
        certification: cert.title,
        verifiedDate: new Date().toISOString(),
        verifiedBy: 'admin',
        guideFullyVerified: hasPriorityOneOrTwo
      });

      toast({
        title: 'Certification Verified',
        description: hasPriorityOneOrTwo 
          ? `${cert.title} verified. Guide is now fully verified!` 
          : `${cert.title} has been successfully verified.`,
      });
    } catch (error) {
      console.error('Error verifying certification:', error);
      toast({
        title: 'Verification Failed',
        description: 'Failed to verify certification. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setVerifyingIndex(null);
    }
  };

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

  const getDocumentUrl = async (documentPath: string): Promise<string> => {
    try {
      // Check if it's a storage path or a full URL
      if (documentPath.startsWith('http')) {
        return documentPath;
      } else {
        // It's a storage path in guide-documents bucket
        const { data, error } = await supabase.storage
          .from('guide-documents')
          .createSignedUrl(documentPath, 3600);
        
        if (error) throw error;
        return data?.signedUrl || '';
      }
    } catch (error) {
      console.error('Error getting document URL:', error);
      return '';
    }
  };

  const openDocumentModal = async (documentPath: string, title: string) => {
    const url = await getDocumentUrl(documentPath);
    if (url) {
      setSelectedDocument({ url, title });
    }
  };

  // Load document URLs for previews
  useEffect(() => {
    const loadDocumentUrls = async () => {
      if (!verification) return;
      
      const certifications = verification.guide_profile?.certifications || [];
      const urls: Record<string, string> = {};
      
      for (const cert of certifications) {
        if (cert.certificateDocument && typeof cert.certificateDocument === 'string') {
          const url = await getDocumentUrl(cert.certificateDocument);
          if (url) {
            urls[cert.certificateDocument] = url;
          }
        }
      }
      
      setDocumentUrls(urls);
    };
    
    loadDocumentUrls();
  }, [verification]);

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
                <div className="space-y-3 mb-4">
                  {certifications.map((cert: any, index: number) => {
                    // Check if it lacks verifiedDate (pending approval)
                    const isPendingReview = !cert.verifiedDate;
                    
                    // Check if certification was added recently (within last 7 days)
                    const isNewCert = cert.addedDate && 
                      (new Date().getTime() - new Date(cert.addedDate).getTime()) < (7 * 24 * 60 * 60 * 1000);
                    
                    return (
                      <div
                        key={index}
                        className={`p-4 border rounded-lg ${
                          isPendingReview 
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' 
                            : 'border-green-500 bg-green-50 dark:bg-green-950/20'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <CertificationBadge
                              certification={cert}
                              size="full"
                              showTooltip
                              isGuideVerified={verification?.verification_status === 'approved'}
                              showPrimaryIndicator
                            />
                            <div className="mt-3 text-xs text-muted-foreground space-y-1">
                              {cert.certificateNumber && (
                                <p>Certificate #: {cert.certificateNumber}</p>
                              )}
                              {cert.expiryDate && (
                                <p>Expires: {new Date(cert.expiryDate).toLocaleDateString()}</p>
                              )}
                              {cert.addedDate && (
                                <p className="font-medium">
                                  Added: {formatDistanceToNow(new Date(cert.addedDate))} ago
                                  {isNewCert && isPendingReview && <span className="ml-2 text-orange-600 font-semibold">NEW</span>}
                                </p>
                              )}
                              {cert.verifiedDate && (
                                <p className="text-green-600 dark:text-green-400 font-medium">
                                  ✓ Verified: {formatDistanceToNow(new Date(cert.verifiedDate))} ago
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 items-end">
                            {isPendingReview ? (
                              <>
                                <Badge variant="destructive" className="text-xs whitespace-nowrap">
                                  Pending Approval
                                </Badge>
                                <Button
                                  size="sm"
                                  onClick={() => handleVerifyCertification(index)}
                                  disabled={verifyingIndex === index}
                                  className="gap-2 whitespace-nowrap"
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  {verifyingIndex === index ? 'Verifying...' : 'Verify Now'}
                                </Button>
                              </>
                            ) : (
                              <Badge variant="default" className="text-xs bg-green-600 whitespace-nowrap">
                                ✓ Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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

          {/* Certificate Documents - All stored as JPEG now */}
          {certifications.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-4">Certificate Documents</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {certifications.map((cert: any, index: number) => {
                  if (!cert.certificateDocument) return null;
                  
                  const documentUrl = documentUrls[cert.certificateDocument];
                  
                  return (
                    <div
                      key={index}
                      className="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-border bg-card aspect-[3/4]"
                      onClick={() => {
                        if (typeof cert.certificateDocument === 'string') {
                          openDocumentModal(cert.certificateDocument, cert.title);
                        }
                      }}
                      title="Click to view full size"
                    >
                      {/* Certificate preview - All files are JPEG images */}
                      {documentUrl ? (
                        <img 
                          src={documentUrl} 
                          alt={cert.title}
                          className="absolute inset-0 w-full h-full object-cover"
                          loading="lazy"
                          onError={() => {
                            console.error('Failed to load certificate thumbnail:', {
                              path: cert.certificateDocument,
                              url: documentUrl
                            });
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                          <FileText className="h-12 w-12 text-muted-foreground animate-pulse" />
                        </div>
                      )}
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="text-white flex flex-col items-center gap-2">
                          <Eye className="h-8 w-8" />
                          <span className="text-sm font-medium">View Certificate</span>
                        </div>
                      </div>
                      
                      {/* Certificate title overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <p className="text-white text-xs font-medium line-clamp-2">{cert.title}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Additional Verification Documents */}
          {verification.verification_documents && verification.verification_documents.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-4">Additional Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {verification.verification_documents.map((doc, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start gap-2"
                    onClick={() => openDocumentModal(doc, `Document ${index + 1}`)}
                  >
                    <FileText className="h-4 w-4" />
                    Document {index + 1}
                    <Eye className="h-3 w-3 ml-auto" />
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

      {/* Document Viewer Modal - All files are JPEG images now */}
      <Dialog open={!!selectedDocument} onOpenChange={(open) => !open && setSelectedDocument(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.title || 'Certificate Document'}</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="mt-4 border-2 border-border rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center min-h-[70vh]">
              <img
                src={selectedDocument.url}
                alt={selectedDocument.title}
                className="max-w-full max-h-[70vh] object-contain"
                onError={() => {
                  console.error('Failed to load certificate document:', selectedDocument.url);
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
