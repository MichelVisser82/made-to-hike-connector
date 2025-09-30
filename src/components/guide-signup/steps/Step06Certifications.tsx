import { useState } from 'react';
import { Award, Plus, X } from 'lucide-react';
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
  const [newCert, setNewCert] = useState<GuideCertification>({ title: '', description: '' });
  
  const certifications = data.certifications || [];

  const addCertification = () => {
    if (newCert.title.trim()) {
      updateData({ certifications: [...certifications, newCert] });
      setNewCert({ title: '', description: '' });
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
              >
                <X className="w-4 h-4" />
              </Button>
              <CardContent className="p-4">
                <div className="font-semibold mb-1">{cert.title}</div>
                <div className="text-sm text-muted-foreground">{cert.description}</div>
              </CardContent>
            </Card>
          ))}

          {/* Add New Certification */}
          {isAdding ? (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <Label>Certification Name *</Label>
                  <Input
                    value={newCert.title}
                    onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                    placeholder="e.g., IFMGA Certified"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newCert.description}
                    onChange={(e) => setNewCert({ ...newCert, description: e.target.value })}
                    placeholder="Brief description..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={addCertification}>Add</Button>
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
