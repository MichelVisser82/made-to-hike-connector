import { useState } from 'react';
import { Award, Plus, X, Upload, Shield, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadCertificateDocument } from '@/utils/imageProcessing';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { GuideSignupData, GuideCertification } from '@/types/guide';
import { PRELOADED_CERTIFICATIONS, getCertificationsByCategory, findCertificationById, validateCertificateNumber, CERTIFICATION_CATEGORIES } from '@/constants/certifications';
interface Step06CertificationsProps {
  data: Partial<GuideSignupData>;
  updateData: (data: Partial<GuideSignupData>) => void;
  onNext: () => void;
  onBack: () => void;
}
export function Step06Certifications({
  data,
  updateData,
  onNext,
  onBack
}: Step06CertificationsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [certificationType, setCertificationType] = useState<'standard' | 'custom'>('standard');
  const [selectedCertId, setSelectedCertId] = useState<string>('');
  const [certNumberError, setCertNumberError] = useState('');
  const [fileError, setFileError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const {
    toast
  } = useToast();
  const [newCert, setNewCert] = useState<Partial<GuideCertification>>({
    certificationType: 'standard',
    title: '',
    certifyingBody: '',
    certificateNumber: '',
    description: '',
    expiryDate: ''
  });
  const certifications = data.certifications || [];
  const groupedCerts = getCertificationsByCategory();
  const handleCertificationSelect = (certId: string) => {
    setSelectedCertId(certId);
    const preloaded = findCertificationById(certId);
    if (preloaded) {
      setNewCert({
        certificationType: 'standard',
        certificationId: certId,
        title: preloaded.name,
        certifyingBody: preloaded.certifyingBody,
        certificateNumber: '',
        description: preloaded.description || '',
        expiryDate: '',
        verificationPriority: preloaded.priority,
        badgeColor: preloaded.badgeColor
      });
    }
  };
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError('');
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setFileError('Please upload a PDF or image file (JPG, PNG)');
      return;
    }
    setNewCert({
      ...newCert,
      certificateDocument: file
    });
  };
  const validateForm = (): boolean => {
    setCertNumberError('');
    const preloaded = selectedCertId ? findCertificationById(selectedCertId) : null;

    // Check required fields
    if (!newCert.title?.trim() || !newCert.certifyingBody?.trim()) {
      return false;
    }

    // Check certificate number for standard certs that require it
    if (certificationType === 'standard' && preloaded?.requiresCertificateNumber) {
      if (!newCert.certificateNumber?.trim()) {
        setCertNumberError('Certificate number is required for this certification');
        return false;
      }
      if (!validateCertificateNumber(newCert.certificateNumber, selectedCertId)) {
        setCertNumberError('Invalid certificate number format (6-20 alphanumeric characters for IFMGA/UIMLA)');
        return false;
      }
    }

    // Check expiry date
    if (!newCert.expiryDate) {
      return false;
    }
    const expiryDate = new Date(newCert.expiryDate);
    if (expiryDate <= new Date()) {
      return false;
    }

    // Check document upload
    if (!newCert.certificateDocument) {
      setFileError('Certificate document is required');
      return false;
    }
    return true;
  };
  const addCertification = async () => {
    if (!validateForm()) return;
    setIsUploading(true);
    try {
      // Store the certificate with the File object - will be uploaded during final signup
      const certToAdd: GuideCertification = {
        ...newCert,
        addedDate: new Date().toISOString()
      } as GuideCertification;
      updateData({
        certifications: [...certifications, certToAdd]
      });
      toast({
        title: "Certification added",
        description: "Document will be uploaded when you complete signup."
      });

      // Reset form
      setNewCert({
        certificationType: 'standard',
        title: '',
        certifyingBody: '',
        certificateNumber: '',
        description: '',
        expiryDate: ''
      });
      setSelectedCertId('');
      setCertificationType('standard');
      setIsAdding(false);
      setCertNumberError('');
      setFileError('');
    } catch (error: any) {
      console.error('Error adding certification:', error);
      toast({
        title: "Failed to add",
        description: error?.message || "Failed to add certification. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  const removeCertification = (index: number) => {
    updateData({
      certifications: certifications.filter((_, i) => i !== index)
    });
  };
  const togglePrimary = (index: number) => {
    const updated = certifications.map((cert, i) => ({
      ...cert,
      isPrimary: i === index ? !cert.isPrimary : false
    }));
    updateData({
      certifications: updated
    });
  };
  const hasPriority1or2 = certifications.some(cert => cert.verificationPriority === 1 || cert.verificationPriority === 2);
  return <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Professional Certifications
          </CardTitle>
          <p className="text-muted-foreground">Add your professional qualifications. At least one certification is required for verified guide status.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Existing Certifications */}
          {certifications.map((cert, index) => <Card key={index} className="relative">
              <Button variant="ghost" size="icon" className="absolute top-2 right-2 z-10" onClick={() => removeCertification(index)} aria-label="Remove certification">
                <X className="w-4 h-4" />
              </Button>
              <CardContent className="p-4 pr-12">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{
                backgroundColor: cert.badgeColor || '#6b7280'
              }}>
                    {cert.verificationPriority === 1 ? <Shield className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-semibold">{cert.title}</div>
                      {cert.isPrimary && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Primary
                        </span>}
                    </div>
                    <div className="text-sm text-muted-foreground mb-1">{cert.certifyingBody}</div>
                    {cert.certificateNumber && <div className="text-xs text-muted-foreground">
                        Certificate #: {cert.certificateNumber}
                      </div>}
                    {cert.expiryDate && <div className="text-xs text-muted-foreground">
                        Expires: {new Date(cert.expiryDate).toLocaleDateString()}
                      </div>}
                    {cert.verificationPriority && <div className="text-xs text-muted-foreground mt-1">
                        Priority {cert.verificationPriority} - {cert.verificationPriority === 1 ? '2 hour verification' : cert.verificationPriority === 2 ? '24 hour verification' : '3-5 business days'}
                      </div>}
                  </div>
                </div>
                {!cert.isPrimary && certifications.length > 1 && <Button variant="outline" size="sm" className="mt-3" onClick={() => togglePrimary(index)}>
                    Set as Primary
                  </Button>}
              </CardContent>
            </Card>)}

          {/* Add New Certification */}
          {isAdding ? <Card>
              <CardContent className="p-4 space-y-4">
                {/* Step 1: Certification Type */}
                <div className="space-y-3">
                  <Label>Certification Type</Label>
                  <RadioGroup value={certificationType} onValueChange={(value: 'standard' | 'custom') => {
                setCertificationType(value);
                setNewCert({
                  certificationType: value,
                  title: '',
                  certifyingBody: '',
                  certificateNumber: '',
                  description: '',
                  expiryDate: '',
                  verificationPriority: value === 'custom' ? 3 : undefined,
                  badgeColor: value === 'custom' ? '#6b7280' : undefined
                });
                setSelectedCertId('');
              }}>
                    <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent">
                      <RadioGroupItem value="standard" id="standard" />
                      <Label htmlFor="standard" className="cursor-pointer flex-1">
                        <div className="font-medium">Standard Certification</div>
                        <div className="text-xs text-muted-foreground">
                          Select from our verified list (faster verification)
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent">
                      <RadioGroupItem value="custom" id="custom" />
                      <Label htmlFor="custom" className="cursor-pointer flex-1">
                        <div className="font-medium">Other Certification</div>
                        <div className="text-xs text-muted-foreground">
                          Add a custom certification (requires manual verification)
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Step 2a: Standard Certification Selection */}
                {certificationType === 'standard' && <>
                    <div>
                      <Label htmlFor="cert-select">Select Certification *</Label>
                      <Select value={selectedCertId} onValueChange={handleCertificationSelect}>
                        <SelectTrigger id="cert-select">
                          <SelectValue placeholder="Choose your certification..." />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(groupedCerts).map(([category, certs]) => <SelectGroup key={category}>
                              <SelectLabel className="text-xs font-semibold text-muted-foreground uppercase">
                                {CERTIFICATION_CATEGORIES[category as keyof typeof CERTIFICATION_CATEGORIES]}
                              </SelectLabel>
                              {certs.map(cert => <SelectItem key={cert.id} value={cert.id}>
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{
                            backgroundColor: cert.badgeColor
                          }} />
                                    {cert.name}
                                  </div>
                                </SelectItem>)}
                            </SelectGroup>)}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedCertId && <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="text-sm">
                            <strong>Certifying Body:</strong> {newCert.certifyingBody}
                            <br />
                            {findCertificationById(selectedCertId)?.requiresCertificateNumber && <>
                                <strong>Certificate Number:</strong> Required
                                <br />
                              </>}
                            <strong>Verification:</strong> Priority {newCert.verificationPriority} - {findCertificationById(selectedCertId)?.verificationTarget}
                          </div>
                        </AlertDescription>
                      </Alert>}
                  </>}

                {/* Step 2b: Custom Certification Form */}
                {certificationType === 'custom' && <>
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Custom certifications require manual verification and may take 3-5 business days.
                      </AlertDescription>
                    </Alert>

                    <div>
                      <Label htmlFor="custom-cert-name">Certification Name *</Label>
                      <Input id="custom-cert-name" value={newCert.title} onChange={e => setNewCert({
                  ...newCert,
                  title: e.target.value
                })} placeholder="e.g., Regional Mountain Guide Certification" />
                    </div>

                    <div>
                      <Label htmlFor="custom-cert-body">Certifying Body *</Label>
                      <Input id="custom-cert-body" value={newCert.certifyingBody} onChange={e => setNewCert({
                  ...newCert,
                  certifyingBody: e.target.value
                })} placeholder="e.g., Regional Mountain Guides Association" />
                    </div>
                  </>}

                {/* Common fields for both types */}
                {(certificationType === 'custom' || selectedCertId) && <>
                    <div>
                      <Label htmlFor="cert-number">
                        Certificate Number {certificationType === 'standard' && findCertificationById(selectedCertId)?.requiresCertificateNumber ? '*' : '(Optional)'}
                      </Label>
                      <Input id="cert-number" value={newCert.certificateNumber} onChange={e => {
                  setNewCert({
                    ...newCert,
                    certificateNumber: e.target.value
                  });
                  setCertNumberError('');
                }} placeholder="e.g., IFMGA-12345" className={certNumberError ? 'border-destructive' : ''} />
                      {certNumberError && <p className="text-sm text-destructive mt-1">{certNumberError}</p>}
                    </div>

                    <div>
                      <Label htmlFor="expiry-date">Expiry Date *</Label>
                      <Input id="expiry-date" type="date" value={newCert.expiryDate} onChange={e => setNewCert({
                  ...newCert,
                  expiryDate: e.target.value
                })} min={new Date().toISOString().split('T')[0]} />
                    </div>

                    <div>
                      <Label htmlFor="cert-document">Certificate Document (PDF or Image) *</Label>
                      <div className="mt-1">
                        <Input id="cert-document" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} className={fileError ? 'border-destructive' : ''} />
                        {newCert.certificateDocument && typeof newCert.certificateDocument !== 'string' && <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            {newCert.certificateDocument.name} ({(newCert.certificateDocument.size / 1024).toFixed(1)} KB)
                          </p>}
                        {fileError && <p className="text-sm text-destructive mt-1">{fileError}</p>}
                        <p className="text-xs text-muted-foreground mt-1">
                          Accepted formats: PDF, JPG, PNG
                        </p>
                      </div>
                    </div>

                    {certificationType === 'custom' && <div>
                        <Label htmlFor="cert-description">Description (Optional)</Label>
                        <Textarea id="cert-description" value={newCert.description} onChange={e => setNewCert({
                  ...newCert,
                  description: e.target.value
                })} placeholder="Any additional details about this certification..." rows={3} />
                      </div>}

                    <div className="flex gap-2">
                      <Button onClick={addCertification} disabled={isUploading || !newCert.title?.trim() || !newCert.certifyingBody?.trim()}>
                        {isUploading ? <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </> : <>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Certification
                          </>}
                      </Button>
                      <Button variant="outline" onClick={() => {
                  setIsAdding(false);
                  setNewCert({
                    certificationType: 'standard',
                    title: '',
                    certifyingBody: '',
                    certificateNumber: '',
                    description: '',
                    expiryDate: ''
                  });
                  setSelectedCertId('');
                  setCertificationType('standard');
                  setCertNumberError('');
                  setFileError('');
                }} disabled={isUploading}>
                        Cancel
                      </Button>
                    </div>
                  </>}
              </CardContent>
            </Card> : <Button variant="outline" onClick={() => setIsAdding(true)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Certification
            </Button>}

          {/* Verification Status Alert */}
          {certifications.length > 0 && !hasPriority1or2 && <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>To become a verified guide, add at least one certification (IFMGA, UIMLA, or national certifications).</AlertDescription>
            </Alert>}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack}>Back</Button>
            <Button onClick={onNext} disabled={certifications.length === 0}>
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>;
}