import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { CertificationBadge } from '../ui/certification-badge';
import { Award, Loader2 } from 'lucide-react';
import type { GuideDisplayInfo } from '@/utils/guideDataUtils';
import { getExperienceDisplayText, getPrimaryCertification } from '@/utils/guideDataUtils';
import type { GuideCertification } from '@/types/guide';

interface GuideInfoDisplayProps {
  guideInfo: GuideDisplayInfo;
  isLoadingProfessional?: boolean;
  showBadge?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'overlay';
  certifications?: GuideCertification[];
  isGuideVerified?: boolean;
}

/**
 * Reusable component for consistent guide information display
 * Handles loading states and fallbacks automatically
 */
export function GuideInfoDisplay({ 
  guideInfo, 
  isLoadingProfessional = false,
  showBadge = true,
  size = 'md',
  variant = 'default',
  certifications,
  isGuideVerified = false
}: GuideInfoDisplayProps) {
  const primaryCert = getPrimaryCertification(certifications);
  const avatarSizes = {
    sm: 'h-12 w-12',
    md: 'h-20 w-20',
    lg: 'h-24 w-24',
  };
  
  const badgeSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
  };
  
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-7 w-7',
  };
  
  const titleSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  // Overlay variant for image overlays
  if (variant === 'overlay') {
    return (
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8 border-2 border-white/50">
          <AvatarImage 
            src={guideInfo.avatarUrl || ''} 
            alt={guideInfo.displayName} 
          />
          <AvatarFallback className="bg-white/20 text-white text-xs">
            {guideInfo.displayName.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          {isLoadingProfessional ? (
            <div className="flex items-center gap-2 text-xs text-white/90">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading...
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-white drop-shadow-lg">
                {guideInfo.displayName}
              </p>
              {/* Primary Certification Badge - Simple mode for tour cards */}
              {primaryCert && (
                <CertificationBadge 
                  certification={primaryCert}
                  displayMode="simple"
                  showTooltip={true}
                  isGuideVerified={isGuideVerified}
                />
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {showBadge && (
        <div className={`absolute top-0 right-0 ${badgeSizes[size]} bg-muted rounded-full flex items-center justify-center`}>
          <Award className={`${iconSizes[size]} text-primary`} />
        </div>
      )}
      
      <div className={`flex items-start gap-4 ${showBadge ? 'pr-16' : ''}`}>
        <Avatar className={avatarSizes[size]}>
          <AvatarImage 
            src={guideInfo.avatarUrl || ''} 
            alt={guideInfo.displayName} 
          />
          <AvatarFallback>
            {guideInfo.displayName.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h3 className={`${titleSizes[size]} font-semibold mb-1`}>
            {guideInfo.displayName}
          </h3>
          
          {isLoadingProfessional ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading credentials...
            </div>
          ) : (
            <>
              {primaryCert ? (
                <div className="mb-2">
                  <CertificationBadge
                    certification={primaryCert}
                    displayMode="simple"
                    showTooltip
                    isGuideVerified={isGuideVerified}
                  />
                </div>
              ) : (
                <p className="text-primary font-semibold mb-1">
                  Certified Professional
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                {getExperienceDisplayText(guideInfo)}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
