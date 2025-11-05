import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Award, Shield, CheckCircle2, Users, Globe, Clock, Mountain, Siren, HeartPulse, Heart, Activity, Cross } from "lucide-react";
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
  
  // Simple mode: Icon left, abbreviation center, checkmark right (with rich hover card)
  if (displayMode === 'simple') {
    // Determine color scheme class and icon based on certification
    const lowerTitle = certification.title.toLowerCase();
    const isMedical = lowerTitle.includes('wemt') || lowerTitle.includes('wfr') || lowerTitle.includes('wfa') || 
                      lowerTitle.includes('cpr') || lowerTitle.includes('aed') || lowerTitle.includes('faw') || 
                      lowerTitle.includes('efaw') || lowerTitle.includes('first aid') || 
                      lowerTitle.includes('wilderness emergency') || lowerTitle.includes('medical technician');
    
    const colorClass = React.useMemo(() => {
      if (isMedical) {
        // Medical certifications
        if (lowerTitle.includes('wemt') || lowerTitle.includes('wilderness emergency medical')) return 'bg-cert-emergency-red-dark text-cert-medical-foreground';
        if (lowerTitle.includes('wfr') || lowerTitle.includes('first responder')) return 'bg-cert-emergency-red text-cert-medical-foreground';
        if (lowerTitle.includes('wfa') || (lowerTitle.includes('wilderness') && lowerTitle.includes('first aid'))) return 'bg-cert-medical-blue text-cert-medical-foreground';
        if (lowerTitle.includes('cpr') || lowerTitle.includes('aed')) return 'bg-cert-safety-teal text-cert-medical-foreground';
        if (lowerTitle.includes('faw') && !lowerTitle.includes('efaw')) return 'bg-cert-medical-orange text-cert-medical-foreground';
        if (lowerTitle.includes('efaw') || lowerTitle.includes('emergency first aid at work')) return 'bg-cert-medical-blue-light text-cert-medical-foreground';
        return 'bg-cert-medical-blue text-cert-medical-foreground';
      }
      // Mountain guide certifications
      if (lowerTitle.includes('iml') || lowerTitle.includes('international mountain leader')) return 'bg-cert-sage text-cert-sage-foreground';
      if (lowerTitle.includes('ifmga') || lowerTitle.includes('mountain guide')) return 'bg-cert-burgundy text-cert-burgundy-foreground';
      return 'bg-cert-neutral text-cert-neutral-foreground';
    }, [lowerTitle, isMedical]);

    // Choose icon based on certification type
    const LeftIcon = React.useMemo(() => {
      if (isMedical) {
        if (lowerTitle.includes('wemt') || lowerTitle.includes('wilderness emergency medical')) return Siren;
        if (lowerTitle.includes('wfr') || lowerTitle.includes('first responder')) return HeartPulse;
        if (lowerTitle.includes('wfa') || (lowerTitle.includes('wilderness') && lowerTitle.includes('first aid'))) return Heart;
        if (lowerTitle.includes('cpr') || lowerTitle.includes('aed')) return Activity;
        if (lowerTitle.includes('faw')) return Cross;
        if (lowerTitle.includes('efaw')) return Heart;
        return Heart;
      }
      if (lowerTitle.includes('iml') || lowerTitle.includes('international mountain leader')) return Mountain;
      if (lowerTitle.includes('ifmga') || lowerTitle.includes('mountain guide')) return Award;
      return Shield;
    }, [lowerTitle, isMedical]);

    // Size-based styling for simple mode
    const sizeClasses = React.useMemo(() => {
      switch(size) {
        case 'mini':
          return 'gap-1 px-2 py-0.5 text-xs';
        case 'compact':
          return 'gap-1.5 px-2.5 py-1 text-sm';
        case 'full':
          return 'gap-2 px-4 py-2 text-base';
        case 'hero':
          return 'gap-2.5 px-5 py-3 text-lg';
        default:
          return 'gap-1.5 px-3 py-1.5 text-sm';
      }
    }, [size]);

    const iconSize = React.useMemo(() => {
      switch(size) {
        case 'mini':
          return 'w-3 h-3';
        case 'compact':
          return 'w-4 h-4';
        case 'full':
          return 'w-5 h-5';
        case 'hero':
          return 'w-6 h-6';
        default:
          return 'w-4 h-4';
      }
    }, [size]);

    const badgeElement = (
      <div className={cn(
        "inline-flex items-center rounded-full font-semibold cursor-pointer border shadow-sm",
        sizeClasses,
        colorClass,
        (lowerTitle.includes('iml') || lowerTitle.includes('ifmga') || isMedical) ? 'border-transparent' : 'border-cert-neutral-foreground/20'
      )}>
        <LeftIcon className={cn(iconSize, "flex-shrink-0")} />
        <span className="flex-1">{metadata?.abbreviation || certification.title}</span>
        <CheckCircle2 className={cn(iconSize, "flex-shrink-0")} />
      </div>
    );

    return showTooltip ? (
      <CertificationHoverCard certification={certification}>
        {badgeElement}
      </CertificationHoverCard>
    ) : badgeElement;
  }
  
  // Detailed mode: Icon with background left, two lines of text center, checkmark right
  if (displayMode === 'detailed') {
    const lowerTitle = certification.title.toLowerCase();
    const isMedical = lowerTitle.includes('wemt') || lowerTitle.includes('wfr') || lowerTitle.includes('wfa') || 
                      lowerTitle.includes('cpr') || lowerTitle.includes('aed') || lowerTitle.includes('faw') || 
                      lowerTitle.includes('efaw') || lowerTitle.includes('first aid') || 
                      lowerTitle.includes('wilderness emergency') || lowerTitle.includes('medical technician');
    
    const colorClass = React.useMemo(() => {
      if (isMedical) {
        if (lowerTitle.includes('wemt') || lowerTitle.includes('wilderness emergency medical')) return 'bg-cert-emergency-red-dark text-cert-medical-foreground';
        if (lowerTitle.includes('wfr') || lowerTitle.includes('first responder')) return 'bg-cert-emergency-red text-cert-medical-foreground';
        if (lowerTitle.includes('wfa') || (lowerTitle.includes('wilderness') && lowerTitle.includes('first aid'))) return 'bg-cert-medical-blue text-cert-medical-foreground';
        if (lowerTitle.includes('cpr') || lowerTitle.includes('aed')) return 'bg-cert-safety-teal text-cert-medical-foreground';
        if (lowerTitle.includes('faw') && !lowerTitle.includes('efaw')) return 'bg-cert-medical-orange text-cert-medical-foreground';
        if (lowerTitle.includes('efaw') || lowerTitle.includes('emergency first aid at work')) return 'bg-cert-medical-blue-light text-cert-medical-foreground';
        return 'bg-cert-medical-blue text-cert-medical-foreground';
      }
      if (lowerTitle.includes('iml') || lowerTitle.includes('international mountain leader')) return 'bg-cert-sage text-cert-sage-foreground';
      if (lowerTitle.includes('ifmga') || lowerTitle.includes('mountain guide')) return 'bg-cert-burgundy text-cert-burgundy-foreground';
      return 'bg-cert-neutral text-cert-neutral-foreground';
    }, [lowerTitle, isMedical]);

    // Choose icon based on certification type
    const LeftIcon = React.useMemo(() => {
      if (isMedical) {
        if (lowerTitle.includes('wemt') || lowerTitle.includes('wilderness emergency medical')) return Siren;
        if (lowerTitle.includes('wfr') || lowerTitle.includes('first responder')) return HeartPulse;
        if (lowerTitle.includes('wfa') || (lowerTitle.includes('wilderness') && lowerTitle.includes('first aid'))) return Heart;
        if (lowerTitle.includes('cpr') || lowerTitle.includes('aed')) return Activity;
        if (lowerTitle.includes('faw')) return Cross;
        if (lowerTitle.includes('efaw')) return Heart;
        return Heart;
      }
      if (lowerTitle.includes('iml') || lowerTitle.includes('international mountain leader')) return Mountain;
      if (lowerTitle.includes('ifmga') || lowerTitle.includes('mountain guide')) return Award;
      return Shield;
    }, [lowerTitle, isMedical]);

    const badgeElement = (
      <div className={cn(
        "inline-flex items-center gap-2.5 px-3 py-2 rounded-xl border shadow-sm cursor-pointer w-full",
        colorClass,
        (lowerTitle.includes('iml') || lowerTitle.includes('ifmga') || isMedical) ? 'border-transparent' : 'border-cert-neutral-foreground/20'
      )}>
        {/* Icon with darker background circle */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-black/20 flex items-center justify-center">
          <LeftIcon className="w-5 h-5" />
        </div>
        
        {/* Two lines of text */}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm leading-tight">
            {metadata?.abbreviation || certification.title} Certified
          </div>
          <div className="text-xs opacity-90 mt-0.5">
            {metadata?.fullTitle || certification.certifyingBody}
          </div>
        </div>
        
        {/* Checkmark on right */}
        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
      </div>
    );

    return showTooltip ? (
      <CertificationHoverCard certification={certification}>
        {badgeElement}
      </CertificationHoverCard>
    ) : badgeElement;
  }
  
  // Card mode: Full certification card with all details
  if (displayMode === 'card') {
    const lowerTitle = certification.title.toLowerCase();
    const isMedical = lowerTitle.includes('wemt') || lowerTitle.includes('wfr') || lowerTitle.includes('wfa') || 
                      lowerTitle.includes('cpr') || lowerTitle.includes('aed') || lowerTitle.includes('faw') || 
                      lowerTitle.includes('efaw') || lowerTitle.includes('first aid') || 
                      lowerTitle.includes('wilderness emergency') || lowerTitle.includes('medical technician');
    
    const colorClass = React.useMemo(() => {
      if (isMedical) {
        if (lowerTitle.includes('wemt') || lowerTitle.includes('wilderness emergency medical')) return 'bg-cert-emergency-red-dark text-cert-medical-foreground';
        if (lowerTitle.includes('wfr') || lowerTitle.includes('first responder')) return 'bg-cert-emergency-red text-cert-medical-foreground';
        if (lowerTitle.includes('wfa') || (lowerTitle.includes('wilderness') && lowerTitle.includes('first aid'))) return 'bg-cert-medical-blue text-cert-medical-foreground';
        if (lowerTitle.includes('cpr') || lowerTitle.includes('aed')) return 'bg-cert-safety-teal text-cert-medical-foreground';
        if (lowerTitle.includes('faw') && !lowerTitle.includes('efaw')) return 'bg-cert-medical-orange text-cert-medical-foreground';
        if (lowerTitle.includes('efaw') || lowerTitle.includes('emergency first aid at work')) return 'bg-cert-medical-blue-light text-cert-medical-foreground';
        return 'bg-cert-medical-blue text-cert-medical-foreground';
      }
      if (lowerTitle.includes('iml') || lowerTitle.includes('international mountain leader')) return 'bg-cert-sage text-cert-sage-foreground';
      if (lowerTitle.includes('ifmga') || lowerTitle.includes('mountain guide')) return 'bg-cert-burgundy text-cert-burgundy-foreground';
      return 'bg-cert-neutral text-cert-neutral-foreground';
    }, [lowerTitle, isMedical]);

    return (
      <Card className={cn(
        "overflow-hidden border shadow-sm",
        colorClass,
        (lowerTitle.includes('iml') || lowerTitle.includes('ifmga') || isMedical) ? 'border-transparent' : 'border-cert-neutral-foreground/20'
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
          {(metadata?.trainingHours || metadata?.recognitionCountries || metadata?.recertificationYears) && (
            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-white/20">
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
              {metadata?.recertificationYears && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <div className="text-sm">
                    <span className="opacity-75">Recert every</span>
                    <span className="font-semibold ml-1">{metadata.recertificationYears}yr</span>
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
