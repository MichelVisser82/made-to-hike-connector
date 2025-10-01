import * as React from "react";
import { CheckCircle2, Clock, Globe, Award } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import type { GuideCertification } from "@/types/guide";
import { getCertificationMetadata } from "@/constants/certificationMetadata";

interface CertificationHoverCardProps {
  certification: GuideCertification;
  children: React.ReactNode;
}

/**
 * Determine color scheme based on simplified classification:
 * - IML: Sage Green (#8FA68E)
 * - IFMGA: Burgundy (#881337)  
 * - All Others: Light Neutral with Burgundy Text
 */
function getCertificationColorScheme(title: string): 'sage' | 'burgundy' | 'neutral' {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('iml')) {
    return 'sage';
  }
  
  if (lowerTitle.includes('ifmga')) {
    return 'burgundy';
  }
  
  return 'neutral';
}

export function CertificationHoverCard({ certification, children }: CertificationHoverCardProps) {
  const metadata = getCertificationMetadata(certification.title);
  const colorScheme = getCertificationColorScheme(certification.title);

  // Sage Green Theme (IML)
  if (colorScheme === 'sage') {
    return (
      <HoverCard openDelay={200} closeDelay={100}>
        <HoverCardTrigger asChild>
          {children}
        </HoverCardTrigger>
        <HoverCardContent 
          className="w-[280px] p-0 overflow-hidden border-0" 
          style={{ backgroundColor: '#8FA68E' }}
        >
          <div className="p-4 text-white space-y-3">
            {/* Header */}
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-base leading-tight">
                  {metadata?.abbreviation || certification.title}
                </h4>
                <p className="text-sm opacity-90 mt-0.5">
                  {metadata?.fullTitle || certification.certifyingBody}
                </p>
              </div>
            </div>

            {/* Description */}
            {metadata?.qualificationDescription && (
              <p className="text-xs leading-relaxed opacity-95">
                {metadata.qualificationDescription}
              </p>
            )}

            {/* Activity Types */}
            {metadata?.activityTypes && metadata.activityTypes.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {metadata.activityTypes.slice(0, 3).map((activity, idx) => (
                  <span 
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm"
                  >
                    {activity}
                  </span>
                ))}
              </div>
            )}

            {/* Stats */}
            {(metadata?.trainingHours || metadata?.recognitionCountries) && (
              <div className="flex items-center gap-4 pt-2 border-t border-white/20 text-xs">
                {metadata?.trainingHours && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span><strong>{metadata.trainingHours}h</strong> training</span>
                  </div>
                )}
                {metadata?.recognitionCountries && (
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    <span><strong>{metadata.recognitionCountries}+</strong> countries</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  }

  // Burgundy Theme (IFMGA)
  if (colorScheme === 'burgundy') {
    return (
      <HoverCard openDelay={200} closeDelay={100}>
        <HoverCardTrigger asChild>
          {children}
        </HoverCardTrigger>
        <HoverCardContent 
          className="w-[320px] p-0 overflow-hidden border-0" 
          style={{ backgroundColor: '#881337' }}
        >
          <div className="p-5 text-white space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
              <Award className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-lg leading-tight">
                  {metadata?.abbreviation || certification.title}
                </h4>
                <p className="text-sm opacity-95 mt-1">
                  {metadata?.fullTitle || certification.certifyingBody}
                </p>
              </div>
            </div>

            {/* Description */}
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
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/25 backdrop-blur-sm"
                  >
                    {activity}
                  </span>
                ))}
              </div>
            )}

            {/* Stats */}
            {(metadata?.trainingHours || metadata?.recognitionCountries) && (
              <div className="flex items-center gap-5 pt-3 border-t border-white/25 text-sm">
                {metadata?.trainingHours && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <div>
                      <span className="font-bold">{metadata.trainingHours}h</span>
                      <span className="opacity-90 ml-1">training</span>
                    </div>
                  </div>
                )}
                {metadata?.recognitionCountries && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <div>
                      <span className="font-bold">{metadata.recognitionCountries}+</span>
                      <span className="opacity-90 ml-1">countries</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  }

  // Neutral Theme (All Others - ML, WML, medical, regional)
  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-[240px] p-4 bg-card border-border">
        <div className="space-y-2.5">
          {/* Header */}
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#881337' }} />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm leading-tight" style={{ color: '#881337' }}>
                {metadata?.abbreviation || certification.title}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {metadata?.fullTitle || certification.certifyingBody}
              </p>
            </div>
          </div>

          {/* Description */}
          {metadata?.qualificationDescription && (
            <p className="text-xs leading-relaxed text-muted-foreground">
              {metadata.qualificationDescription}
            </p>
          )}

          {/* Activity Types */}
          {metadata?.activityTypes && metadata.activityTypes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {metadata.activityTypes.slice(0, 3).map((activity, idx) => (
                <span 
                  key={idx}
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground"
                >
                  {activity}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          {(metadata?.trainingHours || metadata?.recognitionCountries) && (
            <div className="flex items-center gap-3 pt-2 border-t text-xs text-muted-foreground">
              {metadata?.trainingHours && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span><strong className="text-foreground">{metadata.trainingHours}h</strong></span>
                </div>
              )}
              {metadata?.recognitionCountries && (
                <div className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  <span><strong className="text-foreground">{metadata.recognitionCountries}+</strong></span>
                </div>
              )}
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
