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
        default: "bg-primary/10 text-primary hover:bg-primary/20",
        ifmga: "bg-destructive/10 text-destructive hover:bg-destructive/20",
        verified: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20",
      },
      size: {
        mini: "text-xs px-2 py-0.5 rounded-full",
        compact: "text-sm px-2.5 py-1 rounded-md",
        full: "text-sm px-3 py-1.5 rounded-md",
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
}

function CertificationBadge({
  certification,
  variant,
  size,
  showTooltip = true,
  showVerificationStatus = false,
  className,
  ...props
}: CertificationBadgeProps) {
  // Determine variant based on certification type
  const badgeVariant = React.useMemo(() => {
    if (variant) return variant;
    
    const titleLower = certification.title.toLowerCase();
    if (titleLower.includes("ifmga")) return "ifmga";
    if (certification.verificationStatus === "verified") return "verified";
    return "default";
  }, [certification, variant]);

  const icon = React.useMemo(() => {
    const iconSize = size === "mini" ? "w-3 h-3" : "w-4 h-4";
    
    if (certification.verificationStatus === "verified") {
      return <CheckCircle2 className={iconSize} />;
    }
    
    const titleLower = certification.title.toLowerCase();
    if (titleLower.includes("ifmga") || titleLower.includes("guide")) {
      return <Shield className={iconSize} />;
    }
    
    return <Award className={iconSize} />;
  }, [certification, size]);

  const badgeContent = (
    <div
      className={cn(certificationBadgeVariants({ variant: badgeVariant, size }), className)}
      {...props}
    >
      {icon}
      <span>{certification.title}</span>
      {showVerificationStatus && certification.verificationStatus === "pending" && (
        <Badge variant="outline" className="ml-1 text-xs">
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
            {certification.description && (
              <div className="text-sm mt-2">{certification.description}</div>
            )}
            {certification.verificationStatus === "verified" && (
              <div className="flex items-center gap-1 text-xs text-emerald-600 mt-2">
                <CheckCircle2 className="w-3 h-3" />
                Verified Certification
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export { CertificationBadge, certificationBadgeVariants };
