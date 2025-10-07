import { Award } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { CertificationBadge } from '../ui/certification-badge';
import type { GuideCertification } from '@/types/guide';

interface CredentialsSectionProps {
  certifications: GuideCertification[];
  isGuideVerified?: boolean;
}

export function CredentialsSection({ certifications, isGuideVerified = false }: CredentialsSectionProps) {
  if (!certifications || certifications.length === 0) return null;

  return (
    <Card className="border-burgundy/20 shadow-lg bg-cream">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-5 w-5 text-burgundy" />
          <h3 className="text-xl font-semibold" style={{fontFamily: 'Playfair Display, serif'}}>
            Credentials
          </h3>
        </div>

        <div className="flex flex-wrap gap-3">
          {certifications.map((cert, index) => (
            <CertificationBadge
              key={index}
              certification={cert}
              displayMode="detailed"
              showTooltip
              isGuideVerified={isGuideVerified}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
