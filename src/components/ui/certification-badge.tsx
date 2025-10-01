import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Award, Shield, CheckCircle2, Users, Globe, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { CertificationHoverCard } from "@/components/ui/certification-hover-card";
import type { GuideCertification } from "@/types/guide";
import { getCertificationMetadata } from "@/constants/certificationMetadata";

const certificationBadgeVariants = cva(
  "inline-flex items-center gap-1.5 font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "text-white hover:opacity-90",
        priority1: "text-white hover:opacity-90", // Burgundy - will use inline style
        priority2: "text-white hover:opacity-90", // Green - will use inline style
        priority3: "text-white hover:opacity-90", // Gray - will use inline style
        medical: "text-white hover:opacity-90", // Teal - will use inline style
        verified: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/20",
      },
      size: {
        mini: "text-xs px-2 py-0.5 rounded-full",
        compact: "text-sm px-2.5 py-1 rounded-md",
        full: "text-sm px-3 py-1.5 rounded-md",
        hero: "text-base px-4 py-2 rounded-lg font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "compact",
    },
  }
);

export interface CertificationBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof certificationBadgeVariants> {
  certification: GuideCertification;
  showTooltip?: boolean;
  isGuideVerified?: boolean;
  showPrimaryIndicator?: boolean;
  showAbbreviated?: boolean;
  displayMode?: 'simple' | 'detailed' | 'card';
}

function CertificationBadge({
  certification,
  variant,
  size,
  showTooltip = true,
  isGuideVerified = false,
  showPrimaryIndicator = false,
  showAbbreviated = false,
  displayMode = 'simple',
  className,
  ...props
}: CertificationBadgeProps) {
  const metadata = getCertificationMetadata(certification.title);
  
  // Simple mode: Just abbreviation with checkmark (with rich hover card)
  if (displayMode === 'simple') {
    // Determine color scheme class based on certification
    const lowerTitle = certification.title.toLowerCase();
    const colorClass = React.useMemo(() => {
      if (lowerTitle.includes('iml')) return 'bg-cert-sage text-cert-sage-foreground';
      if (lowerTitle.includes('ifmga')) return 'bg-cert-burgundy text-cert-burgundy-foreground';
      return 'bg-cert-neutral text-cert-neutral-foreground';
    }, [lowerTitle]);

    const badgeElement = (
      <div className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer border shadow-sm",
        colorClass,
        lowerTitle.includes('iml') || lowerTitle.includes('ifmga') ? 'border-transparent' : 'border-cert-neutral-foreground/20'
      )}>
        <CheckCircle2 className="w-4 h-4" />
        <span>{metadata?.abbreviation || certification.title}</span>
      </div>
    );

    return showTooltip ? (
      <CertificationHoverCard certification={certification}>
        {badgeElement}
      </CertificationHoverCard>
    ) : badgeElement;
  }
  
  // Detailed mode: Badge with title and subtitle
  if (displayMode === 'detailed') {
    const lowerTitle = certification.title.toLowerCase();
    const colorClass = React.useMemo(() => {
      if (lowerTitle.includes('iml')) return 'bg-cert-sage text-cert-sage-foreground';
      if (lowerTitle.includes('ifmga')) return 'bg-cert-burgundy text-cert-burgundy-foreground';
      return 'bg-cert-neutral text-cert-neutral-foreground';
    }, [lowerTitle]);

    return (
      <div className={cn(
        "inline-flex items-start gap-3 px-4 py-3 rounded-lg border shadow-sm",
        colorClass,
        lowerTitle.includes('iml') || lowerTitle.includes('ifmga') ? 'border-transparent' : 'border-cert-neutral-foreground/20'
      )}>
        <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-base">
            {metadata?.abbreviation || certification.title} Certified
          </div>
          <div className="text-sm opacity-90 mt-0.5">
            {metadata?.fullTitle || certification.certifyingBody}
          </div>
        </div>
      </div>
    );
  }
  
  // Card mode: Full certification card with all details
  if (displayMode === 'card') {
    const lowerTitle = certification.title.toLowerCase();
    const colorClass = React.useMemo(() => {
      if (lowerTitle.includes('iml')) return 'bg-cert-sage text-cert-sage-foreground';
      if (lowerTitle.includes('ifmga')) return 'bg-cert-burgundy text-cert-burgundy-foreground';
      return 'bg-cert-neutral text-cert-neutral-foreground';
    }, [lowerTitle]);

    return (
      <Card className={cn(
        "overflow-hidden border shadow-sm",
        colorClass,
        lowerTitle.includes('iml') || lowerTitle.includes('ifmga') ? 'border-transparent' : 'border-cert-neutral-foreground/20'
      )}>
        <CardContent className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-xl mb-1">
                {metadata?.abbreviation || certification.title} Certified
              </h3>
              <p className="text-base opacity-90">
                {metadata?.fullTitle || certification.certifyingBody}
              </p>
            </div>
          </div>

          {/* Qualification Description */}
          {metadata?.qualificationDescription && (
            <p className="text-sm leading-relaxed opacity-95">
              {metadata.qualificationDescription}
            </p>
          )}

          {/* Activity Types */}
          {metadata?.activityTypes && metadata.activityTypes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {metadata.activityTypes.map((activity, idx) => (
                <span 
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm"
                >
                  {activity}
                </span>
              ))}
            </div>
          )}

          {/* Stats Row */}
          {(metadata?.trainingHours || metadata?.recognitionCountries) && (
            <div className="flex items-center gap-6 pt-2 border-t border-white/20">
              {metadata?.trainingHours && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <div className="text-sm">
                    <span className="font-semibold">{metadata.trainingHours}h</span>
                    <span className="opacity-75 ml-1">training</span>
                  </div>
                </div>
              )}
              {metadata?.recognitionCountries && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <div className="text-sm">
                    <span className="font-semibold">{metadata.recognitionCountries}+</span>
                    <span className="opacity-75 ml-1">countries</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
  // Determine variant and background color based on certification priority
  const { badgeVariant, backgroundColor } = React.useMemo((): {
    badgeVariant: "default" | "priority1" | "priority2" | "priority3" | "medical" | "verified";
    backgroundColor: string | undefined;
  } => {
    if (variant) return { badgeVariant: variant, backgroundColor: undefined };
    
    // Use priority-based colors
    if (certification.verificationPriority === 1) {
      return { badgeVariant: "priority1", backgroundColor: certification.badgeColor || '#881337' };
    }
    if (certification.verificationPriority === 2) {
      const isMedical = certification.badgeColor === '#0d9488';
      return { 
        badgeVariant: isMedical ? "medical" : "priority2", 
        backgroundColor: certification.badgeColor || '#22c55e' 
      };
    }
    if (certification.verificationPriority === 3) {
      return { badgeVariant: "priority3", backgroundColor: '#6b7280' };
    }
    
    // Fallback to custom badge color or default
    return { 
      badgeVariant: "default", 
      backgroundColor: certification.badgeColor 
    };
  }, [certification, variant]);

  const icon = React.useMemo(() => {
    const iconSize = 
      size === "mini" ? "w-3 h-3" : 
      size === "hero" ? "w-5 h-5" :
      "w-4 h-4";
    
    if (isGuideVerified) {
      return <CheckCircle2 className={iconSize} />;
    }
    
    if (certification.verificationPriority === 1) {
      return <Shield className={iconSize} />;
    }
    
    return <Award className={iconSize} />;
  }, [certification, isGuideVerified, size]);

  // Get display title - abbreviated or full
  const displayTitle = React.useMemo(() => {
    if (!showAbbreviated) return certification.title;
    
    // Common abbreviations
    const abbreviations: Record<string, string> = {
      'International Mountain Leader': 'IML',
      'Mountain Leader': 'ML',
      'Wilderness First Aid': 'WFA',
      'Wilderness First Responder': 'WFR',
      'Mountain Instructor Certificate': 'MIC',
      'International Federation of Mountain Guides Association': 'IFMGA',
      'Alpine Guide': 'AG',
      'Rock Climbing Instructor': 'RCI',
      'Winter Mountain Leader': 'WML',
    };
    
    // Check for exact match
    if (abbreviations[certification.title]) {
      return abbreviations[certification.title];
    }
    
    // Check for partial match
    for (const [key, abbr] of Object.entries(abbreviations)) {
      if (certification.title.includes(key)) {
        return abbr;
      }
    }
    
    // Fallback to full title
    return certification.title;
  }, [certification.title, showAbbreviated]);

  // Small & Medium badges: Use rich hover card
  // Large badges: No tooltip by default
  const shouldShowTooltip = showTooltip && (size === 'mini' || size === 'compact');
  
  const badgeContent = (
    <div
      className={cn(certificationBadgeVariants({ variant: badgeVariant, size }), className)}
      style={backgroundColor ? { backgroundColor } : undefined}
      {...props}
    >
      {icon}
      <span className="truncate">{displayTitle}</span>
      {showPrimaryIndicator && certification.isPrimary && (
        <span className="ml-1 text-xs opacity-90">★</span>
      )}
      {isGuideVerified && (
        <CheckCircle2 className="w-3 h-3 ml-1" />
      )}
    </div>
  );
  
  if (!shouldShowTooltip) {
    return badgeContent;
  }

  return (
    <CertificationHoverCard certification={certification}>
      {badgeContent}
    </CertificationHoverCard>
  );
}

export { CertificationBadge, certificationBadgeVariants };
