import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { CertificationBadge } from '../ui/certification-badge';
import { ProfileWithBadge } from '../common/ProfileWithBadge';
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
  guideSlug?: string;
  badgeType?: 'founder' | 'pioneer-guide';
  pioneerNumber?: number;
  joinedDate?: string;
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
  isGuideVerified = false,
  guideSlug,
  badgeType,
  pioneerNumber,
  joinedDate
}: GuideInfoDisplayProps) {
  const primaryCert = getPrimaryCertification(certifications);
  const avatarSizes = {
    sm: 'h-12 w-12',
    md: 'h-20 w-20',
    lg: 'h-20 w-20',
  };
  
  const badgeSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };
  
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };
  
  const titleSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  // Overlay variant for image overlays
  if (variant === 'overlay') {
    const overlayContent = (
      <>
        <Avatar className="h-8 w-8 border-2 border-white/50">
          <AvatarImage 
            src={guideInfo.avatarUrl || ''} 
            alt={guideInfo.displayName} 
          />
          <AvatarFallback className="bg-white/20 text-white text-xs">
            {guideInfo.displayName.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        {isLoadingProfessional ? (
          <div className="flex items-center gap-2 text-xs text-white/90">
            <Loader2 className="h-3 w-3 animate-spin" />
            Loading...
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1">
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
      </>
    );

    return guideSlug ? (
      <Link to={`/${guideSlug}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        {overlayContent}
      </Link>
    ) : (
      <div className="flex items-center gap-2">
        {overlayContent}
      </div>
    );
  }

  const profileBadgeSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md';

  const AvatarComponent = guideSlug ? (
    <Link to={`/${guideSlug}`} className="block hover:opacity-80 transition-opacity">
      <ProfileWithBadge
        imageUrl={guideInfo.avatarUrl || undefined}
        name={guideInfo.displayName}
        badgeType={badgeType}
        pioneerNumber={pioneerNumber}
        joinedDate={joinedDate}
        size={profileBadgeSize}
        showVerifiedBadge={true}
        isVerified={isGuideVerified}
      />
    </Link>
  ) : (
    <ProfileWithBadge
      imageUrl={guideInfo.avatarUrl || undefined}
      name={guideInfo.displayName}
      badgeType={badgeType}
      pioneerNumber={pioneerNumber}
      joinedDate={joinedDate}
      size={profileBadgeSize}
      showVerifiedBadge={true}
      isVerified={isGuideVerified}
    />
  );

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {AvatarComponent}
        </div>
        
        <div className="flex-1 min-w-0">
          {guideSlug ? (
            <Link to={`/${guideSlug}`} className="hover:text-primary transition-colors">
              <h3 className={`${titleSizes[size]} font-semibold mb-1 leading-tight`}>
                {guideInfo.displayName}
              </h3>
            </Link>
          ) : (
            <h3 className={`${titleSizes[size]} font-semibold mb-1 leading-tight`}>
              {guideInfo.displayName}
            </h3>
          )}
          
          {isLoadingProfessional ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading credentials...
            </div>
          ) : (
            <>
              {primaryCert ? (
                <div className="mb-1.5">
                  <CertificationBadge
                    certification={primaryCert}
                    size="compact"
                    showTooltip
                    isGuideVerified={isGuideVerified}
                  />
                </div>
              ) : (
                <p className="text-primary font-semibold mb-1">
                  Certified Professional
                </p>
              )}
              <p className="text-sm text-muted-foreground leading-tight">
                {getExperienceDisplayText(guideInfo)}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
