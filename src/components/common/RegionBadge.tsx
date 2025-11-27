import { MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface RegionBadgeProps {
  country: string;
  region?: string | null;
  subregion: string;
  variant?: 'default' | 'secondary' | 'outline' | 'plain';
  size?: 'sm' | 'default' | 'lg';
  showIcon?: boolean;
  clickable?: boolean;
  className?: string;
}

/**
 * Standardized region display component
 * Shows region in "Country - Region - Subregion" format with optional linking
 */
export function RegionBadge({
  country,
  region,
  subregion,
  variant = 'secondary',
  size = 'default',
  showIcon = true,
  clickable = true,
  className = ''
}: RegionBadgeProps) {
  const navigate = useNavigate();

  const displayText = region 
    ? `${country} - ${region} - ${subregion}`
    : `${country} - ${subregion}`;

  const handleClick = (e: React.MouseEvent) => {
    if (!clickable) return;
    e.stopPropagation();
    
    // Build filter URL
    const params = new URLSearchParams();
    params.set('country', country);
    if (region) params.set('region', region);
    params.set('subregion', subregion);
    
    navigate(`/tours?${params.toString()}`);
  };

  const sizeClasses = {
    sm: 'text-xs',
    default: 'text-sm',
    lg: 'text-base'
  };

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    default: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  // Plain variant: render without Badge wrapper
  if (variant === 'plain') {
    return (
      <div
        className={`flex items-center gap-2 ${clickable ? 'cursor-pointer hover:text-burgundy transition-colors' : ''} ${className}`}
        onClick={handleClick}
      >
        {showIcon && <MapPin className={`${iconSizeClasses[size]} text-burgundy flex-shrink-0`} />}
        <span className={`font-medium text-charcoal ${sizeClasses[size]}`}>
          {displayText}
        </span>
      </div>
    );
  }

  // Default: render with Badge wrapper
  return (
    <Badge
      variant={variant}
      className={`${sizeClasses[size]} ${clickable ? 'cursor-pointer hover:bg-accent' : ''} ${className}`}
      onClick={handleClick}
    >
      {showIcon && <MapPin className="h-3 w-3 mr-1" />}
      {displayText}
    </Badge>
  );
}