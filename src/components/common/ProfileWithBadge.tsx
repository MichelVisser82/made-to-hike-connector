import { useState } from 'react';
import { Crown, Mountain } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface ProfileWithBadgeProps {
  imageUrl?: string;
  name: string;
  badgeType?: 'founder' | 'pioneer-guide' | null;
  pioneerNumber?: number;
  joinedDate?: string;
  size?: 'sm' | 'md' | 'lg';
  showVerifiedBadge?: boolean;
  isVerified?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: {
    container: 'w-16 h-16',
    ring: 'ring-2',
    badge: 'w-5 h-5 -bottom-0.5 -right-0.5',
    icon: 'h-2.5 w-2.5',
    hoverCard: 'w-56',
    verifiedBadge: 'w-4 h-4 -bottom-0.5 -right-0.5',
  },
  md: {
    container: 'w-24 h-24',
    ring: 'ring-[3px]',
    badge: 'w-7 h-7 -bottom-1 -right-1',
    icon: 'h-3.5 w-3.5',
    hoverCard: 'w-64',
    verifiedBadge: 'w-5 h-5 -bottom-1 -right-1',
  },
  lg: {
    container: 'w-48 h-48',
    ring: 'ring-4',
    badge: 'w-10 h-10 -bottom-1 -right-1',
    icon: 'h-5 w-5',
    hoverCard: 'w-72',
    verifiedBadge: 'w-7 h-7 -bottom-1 -right-1',
  },
};

const getBadgeConfig = (badgeType: 'founder' | 'pioneer-guide', name: string, pioneerNumber?: number) => {
  if (badgeType === 'founder') {
    return {
      ring: 'ring-amber-500',
      badgeBg: 'bg-gradient-to-br from-amber-400 to-amber-600',
      headerBg: 'bg-gradient-to-r from-amber-500 to-amber-600',
      icon: Crown,
      title: 'PLATFORM FOUNDER',
      description: `${name} co-founded Made to Hike and built the platform from the ground up, shaping the future of guided hiking adventures.`,
      statusLabel: 'Status',
      statusValue: 'Platform Founder',
      dateLabel: 'Since',
      roleLabel: 'Role',
      roleValue: 'Core Team',
    };
  }
  return {
    ring: 'ring-burgundy',
    badgeBg: 'bg-gradient-to-br from-burgundy-light to-burgundy',
    headerBg: 'bg-gradient-to-r from-burgundy to-burgundy-dark',
    icon: Mountain,
    title: 'PIONEER GUIDE',
    description: `${name} is one of the first 50 certified guides to join Made to Hike, helping establish the foundation of our trusted guide community.`,
    statusLabel: 'Badge',
    statusValue: `Pioneer Guide #${pioneerNumber || ''}`,
    dateLabel: 'Joined',
    roleLabel: 'Status',
    roleValue: 'First 50 Guides',
  };
};

export function ProfileWithBadge({
  imageUrl,
  name,
  badgeType,
  pioneerNumber,
  joinedDate,
  size = 'md',
  showVerifiedBadge = true,
  isVerified = false,
  className,
}: ProfileWithBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const config = sizeConfig[size];
  const badge = badgeType ? getBadgeConfig(badgeType, name, pioneerNumber) : null;

  const formattedJoinDate = joinedDate
    ? format(new Date(joinedDate), 'MMMM yyyy')
    : 'January 2025';

  const BadgeIcon = badge?.icon;

  return (
    <div
      className={cn('relative group', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Profile Image with Ring */}
      <div
        className={cn(
          'relative rounded-full overflow-hidden border-4 border-white shadow-2xl',
          config.container,
          badge && config.ring,
          badge?.ring
        )}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground font-semibold text-lg">
              {name?.charAt(0) || 'G'}
            </span>
          </div>
        )}
      </div>

      {/* Badge Icon (bottom-right) */}
      {badge && BadgeIcon && (
        <div
          className={cn(
            'absolute rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-110',
            config.badge,
            badge.badgeBg
          )}
        >
          <BadgeIcon className={cn('text-white', config.icon)} />
        </div>
      )}

      {/* Verified Badge (only show if no special badge and isVerified) */}
      {!badge && showVerifiedBadge && isVerified && (
        <div
          className={cn(
            'absolute rounded-full flex items-center justify-center bg-sage text-white shadow-lg',
            config.verifiedBadge
          )}
        >
          <svg
            className={cn(config.icon)}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}

      {/* Hover Card */}
      {badge && isHovered && (
        <div
          className={cn(
            'absolute z-50 left-1/2 -translate-x-1/2 mt-2 rounded-xl shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-200',
            config.hoverCard,
            size === 'sm' ? 'top-full' : 'top-full'
          )}
          style={{ top: '100%' }}
        >
          {/* Header */}
          <div className={cn('px-4 py-3 text-white', badge.headerBg)}>
            <div className="flex items-center gap-2">
              {BadgeIcon && <BadgeIcon className="h-4 w-4" />}
              <span className="font-semibold text-sm tracking-wide">
                {badge.title}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="bg-card p-4 space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {badge.description}
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{badge.statusLabel}:</span>
                <span className="font-medium text-foreground">
                  {badge.statusValue}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{badge.dateLabel}:</span>
                <span className="font-medium text-foreground">{formattedJoinDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{badge.roleLabel}:</span>
                <span className="font-medium text-foreground">{badge.roleValue}</span>
              </div>
            </div>

            {/* Pioneer exclusive note */}
            {badgeType === 'pioneer-guide' && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground italic">
                  Exclusive to our founding community
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
