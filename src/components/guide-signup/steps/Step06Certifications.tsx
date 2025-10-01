import { useState } from 'react';
import { Award, Plus, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GuideSignupData, GuideCertification } from '@/types/guide';

interface Step06CertificationsProps {
  data: Partial<GuideSignupData>;
  updateData: (data: Partial<GuideSignupData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step06Certifications({ data, updateData, onNext, onBack }: Step06CertificationsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCert, setNewCert] = useState<GuideCertification>({ 
    title: '', 
    certifyingBody: '', 
    certificateNumber: '',
    description: '',
    verificationStatus: 'pending'
  });
  
  const certifications = data.certifications || [];

  const addCertification = () => {
    if (newCert.title.trim() && newCert.certifyingBody.trim()) {
      updateData({ certifications: [...certifications, { ...newCert }] });
      setNewCert({ 
        title: '', 
        certifyingBody: '', 
        certificateNumber: '',
        description: '',
        verificationStatus: 'pending'
      });
      setIsAdding(false);
    }
  };

  const removeCertification = (index: number) => {
    updateData({ certifications: certifications.filter((_, i) => i !== index) });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-6 h-6" />
            Certifications
          </CardTitle>
          <p className="text-muted-foreground">Add your professional qualifications</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Existing Certifications */}
          {certifications.map((cert, index) => (
            <Card key={index} className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => removeCertification(index)}
                aria-label="Remove certification"
              >
                <X className="w-4 h-4" />
              </Button>
              <CardContent className="p-4 pr-12">
                <div className="font-semibold mb-1">{cert.title}</div>
                <div className="text-sm text-muted-foreground mb-2">{cert.certifyingBody}</div>
                {cert.certificateNumber && (
                  <div className="text-xs text-muted-foreground">Certificate #: {cert.certificateNumber}</div>
                )}
                {cert.description && (
                  <div className="text-sm text-muted-foreground mt-2">{cert.description}</div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Add New Certification */}
          {isAdding ? (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <Label htmlFor="cert-name">Certification Name *</Label>
                  <Input
                    id="cert-name"
                    value={newCert.title}
                    onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                    placeholder="e.g., IFMGA Mountain Guide"
                  />
                </div>
                <div>
                  <Label htmlFor="cert-body">Certifying Body *</Label>
                  <Input
                    id="cert-body"
                    value={newCert.certifyingBody}
                    onChange={(e) => setNewCert({ ...newCert, certifyingBody: e.target.value })}
                    placeholder="e.g., International Federation of Mountain Guides Associations"
                  />
                </div>
                <div>
                  <Label htmlFor="cert-number">Certificate Number (Optional)</Label>
                  <Input
                    id="cert-number"
                    value={newCert.certificateNumber}
                    onChange={(e) => setNewCert({ ...newCert, certificateNumber: e.target.value })}
                    placeholder="e.g., IFMGA-12345"
                  />
                </div>
                <div>
                  <Label htmlFor="cert-description">Description (Optional)</Label>
                  <Textarea
                    id="cert-description"
                    value={newCert.description}
                    onChange={(e) => setNewCert({ ...newCert, description: e.target.value })}
                    placeholder="Any additional details about this certification..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={addCertification}
                    disabled={!newCert.title.trim() || !newCert.certifyingBody.trim()}
                  >
                    Add Certification
                  </Button>
                  <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button variant="outline" onClick={() => setIsAdding(true)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Certification
            </Button>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack}>Back</Button>
            <Button onClick={onNext}>Continue</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
