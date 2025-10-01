import { CertificationBadge } from '../ui/certification-badge';
import type { GuideCertification } from '@/types/guide';

interface ProfessionalExpertiseProps {
  certifications: GuideCertification[];
  isGuideVerified?: boolean;
}

export function ProfessionalExpertise({ certifications, isGuideVerified = false }: ProfessionalExpertiseProps) {
  if (!certifications || certifications.length === 0) return null;

  // Sort certifications: primary first, then by priority
  const sortedCerts = [...certifications].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    const priorityA = a.verificationPriority || 3;
    const priorityB = b.verificationPriority || 3;
    return priorityA - priorityB;
  });

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold mb-6">Professional Expertise</h2>
      
      <div className="flex flex-wrap gap-3">
        {sortedCerts.map((cert, index) => (
          <CertificationBadge
            key={index}
            certification={cert}
            size="full"
            showTooltip
            isGuideVerified={isGuideVerified}
            showPrimaryIndicator
          />
        ))}
      </div>
      
      {certifications.some(c => c.description) && (
        <div className="mt-6 space-y-4">
          {certifications
            .filter(c => c.description)
            .map((cert, index) => (
              <div key={index} className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold text-lg mb-1">{cert.title}</h3>
                <p className="text-sm text-muted-foreground">{cert.certifyingBody}</p>
                <p className="text-sm mt-2">{cert.description}</p>
              </div>
            ))}
        </div>
      )}
    </section>
  );
}
