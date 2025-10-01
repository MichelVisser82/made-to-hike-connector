import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Award, Shield, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { GuideCertification } from "@/types/guide";

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
  showVerificationStatus?: boolean;
  showPrimaryIndicator?: boolean;
  showAbbreviated?: boolean;
}

function CertificationBadge({
  certification,
  variant,
  size,
  showTooltip = true,
  showVerificationStatus = false,
  showPrimaryIndicator = false,
  showAbbreviated = false,
  className,
  ...props
}: CertificationBadgeProps) {
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
    
    if (certification.verificationStatus === "verified") {
      return <CheckCircle2 className={iconSize} />;
    }
    
    if (certification.verificationPriority === 1) {
      return <Shield className={iconSize} />;
    }
    
    return <Award className={iconSize} />;
  }, [certification, size]);

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
      {showVerificationStatus && certification.verificationStatus === "verified" && (
        <CheckCircle2 className="w-3 h-3 ml-1" />
      )}
      {showVerificationStatus && certification.verificationStatus === "pending" && (
        <Badge variant="outline" className="ml-1 text-xs bg-background/20">
          Pending
        </Badge>
      )}
    </div>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <div className="font-semibold">{certification.title}</div>
            <div className="text-sm text-muted-foreground">
              {certification.certifyingBody}
            </div>
            {certification.certificateNumber && (
              <div className="text-xs text-muted-foreground">
                Certificate #: {certification.certificateNumber}
              </div>
            )}
            {certification.expiryDate && (
              <div className="text-xs text-muted-foreground">
                Expires: {new Date(certification.expiryDate).toLocaleDateString()}
              </div>
            )}
            {certification.verificationPriority && (
              <div className="text-xs text-muted-foreground">
                Priority {certification.verificationPriority} Certification
              </div>
            )}
            {certification.description && (
              <div className="text-sm mt-2">{certification.description}</div>
            )}
            {certification.verificationStatus === "verified" && (
              <div className="flex items-center gap-1 text-xs text-emerald-600 mt-2">
                <CheckCircle2 className="w-3 h-3" />
                Verified Certification
              </div>
            )}
            {certification.isPrimary && (
              <div className="text-xs font-medium text-primary mt-2">
                ★ Primary Certification
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export { CertificationBadge, certificationBadgeVariants };
