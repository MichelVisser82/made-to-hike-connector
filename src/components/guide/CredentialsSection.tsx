import { Shield, Mountain, Heart } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { CertificationBadge } from '../ui/certification-badge';
import type { GuideCertification } from '@/types/guide';

interface CredentialsSectionProps {
  certifications: GuideCertification[];
  isGuideVerified?: boolean;
}

// Define medical/first aid certification types
const MEDICAL_CERT_TYPES = [
  'WEMT', 'WFR', 'WFA', 'EMT', 'CPR', 'AED', 
  'First Aid', 'Wilderness First Aid', 'Wilderness First Responder',
  'Wilderness EMT', 'CPR/AED'
];

export function CredentialsSection({ certifications, isGuideVerified = false }: CredentialsSectionProps) {
  if (!certifications || certifications.length === 0) return null;

  // Categorize certifications
  const mountainCerts = certifications.filter(cert => 
    !MEDICAL_CERT_TYPES.some(type => 
      cert.title?.toUpperCase().includes(type.toUpperCase()) ||
      cert.certifyingBody?.toUpperCase().includes(type.toUpperCase())
    )
  );

  const medicalCerts = certifications.filter(cert => 
    MEDICAL_CERT_TYPES.some(type => 
      cert.title?.toUpperCase().includes(type.toUpperCase()) ||
      cert.certifyingBody?.toUpperCase().includes(type.toUpperCase())
    )
  );

  return (
    <Card className="border-burgundy/20 shadow-lg bg-white">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-5 w-5 text-burgundy" />
          <h2 className="text-2xl font-semibold text-charcoal" style={{fontFamily: 'Playfair Display, serif'}}>
            Certifications
          </h2>
        </div>

        <div className="border-t border-burgundy/10 mb-6" />

        {/* Mountain Certifications */}
        {mountainCerts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Mountain className="h-5 w-5 text-burgundy" />
              <h3 className="text-lg font-semibold text-charcoal/80">
                Mountain Certifications
              </h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {mountainCerts.map((cert, index) => (
                <CertificationBadge
                  key={index}
                  certification={cert}
                  displayMode="detailed"
                  showTooltip
                  isGuideVerified={isGuideVerified}
                />
              ))}
            </div>
          </div>
        )}

        {/* First Aid & Medical Certifications */}
        {medicalCerts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-burgundy" />
              <h3 className="text-lg font-semibold text-charcoal/80">
                First Aid & Medical Certifications
              </h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {medicalCerts.map((cert, index) => (
                <CertificationBadge
                  key={index}
                  certification={cert}
                  displayMode="detailed"
                  showTooltip
                  isGuideVerified={isGuideVerified}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
