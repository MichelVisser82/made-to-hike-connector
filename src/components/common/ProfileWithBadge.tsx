import { Crown, Mountain } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

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
    container: 'w-12 h-12',
    ring: 'ring-2',
    badge: 'w-4 h-4 -bottom-0.5 -right-0.5',
    icon: 'h-2 w-2',
    hoverCard: 'w-56',
    verifiedBadge: 'w-3.5 h-3.5 -bottom-0.5 -right-0.5',
  },
  md: {
    container: 'w-20 h-20',
    ring: 'ring-[3px]',
    badge: 'w-6 h-6 -bottom-1 -right-1',
    icon: 'h-3 w-3',
    hoverCard: 'w-64',
    verifiedBadge: 'w-5 h-5 -bottom-1 -right-1',
  },
  lg: {
    container: 'w-20 h-20',
    ring: 'ring-[3px]',
    badge: 'w-6 h-6 -bottom-1 -right-1',
    icon: 'h-3 w-3',
    hoverCard: 'w-72',
    verifiedBadge: 'w-5 h-5 -bottom-1 -right-1',
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
  const config = sizeConfig[size];
  const badge = badgeType ? getBadgeConfig(badgeType, name, pioneerNumber) : null;

  const formattedJoinDate = joinedDate
    ? format(new Date(joinedDate), 'MMMM yyyy')
    : 'January 2025';

  const BadgeIcon = badge?.icon;

  // Check if className contains size overrides (w-XX h-XX)
  const hasCustomSize = className && /w-\d+|h-\d+/.test(className);

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div className={cn('relative group cursor-pointer', className)}>
          {/* Profile Image with Ring */}
          <div
            className={cn(
              'relative rounded-full overflow-hidden border-4 border-white shadow-2xl w-full h-full',
              !hasCustomSize && config.container,
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
                hasCustomSize 
                  ? 'w-10 h-10 bottom-1 right-1' 
                  : config.badge,
                badge.badgeBg
              )}
            >
              <BadgeIcon className={cn('text-white', hasCustomSize ? 'h-5 w-5' : config.icon)} />
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
        </div>
      </HoverCardTrigger>

      {/* Hover Card Content - uses portal for proper z-index */}
      {badge && (
        <HoverCardContent 
          className={cn('p-0 overflow-hidden', config.hoverCard)}
          side="bottom"
          align="center"
          sideOffset={8}
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
        </HoverCardContent>
      )}
    </HoverCard>
  );
}
