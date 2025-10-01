import { CertificationBadge } from '../ui/certification-badge';
import type { GuideCertification } from '@/types/guide';
import { getPrimaryCertification } from '@/utils/guideDataUtils';

interface GuideCertificationCardProps {
  certifications: GuideCertification[];
  isGuideVerified?: boolean;
  className?: string;
}

/**
 * Large certification card for "Meet Your Guide" section
 * Shows detailed certification information in card format
 */
export function GuideCertificationCard({ certifications, isGuideVerified = false, className }: GuideCertificationCardProps) {
  const primaryCert = getPrimaryCertification(certifications);
  
  if (!primaryCert) return null;

  return (
    <div className={className}>
      <CertificationBadge 
        certification={primaryCert}
        displayMode="card"
        showTooltip={false}
        isGuideVerified={isGuideVerified}
      />
    </div>
  );
}
