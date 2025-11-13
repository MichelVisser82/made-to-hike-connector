import * as React from "react";
import { CheckCircle2, Clock, Globe, Award, Siren, HeartPulse, Heart, Activity, Cross } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import type { GuideCertification } from "@/types/guide";
import { getCertificationMetadata, getCountryFromCertifyingBody } from "@/constants/certificationMetadata";

interface CertificationHoverCardProps {
  certification: GuideCertification;
  children: React.ReactNode;
}

/**
 * Determine color scheme based on simplified classification:
 * - IML: Sage Green
 * - IFMGA: Burgundy
 * - Medical: Medical colors (WEMT, WFR, WFA, CPR, FAW, EFAW)
 * - All Others: Light Neutral with Burgundy Text
 */
function getCertificationColorScheme(title: string): 'sage' | 'burgundy' | 'neutral' | 'medical' {
  const lowerTitle = title.toLowerCase();
  
  // Check for medical certifications first
  if (lowerTitle.includes('wemt') || lowerTitle.includes('wfr') || lowerTitle.includes('wfa') || 
      lowerTitle.includes('cpr') || lowerTitle.includes('aed') || lowerTitle.includes('faw') || 
      lowerTitle.includes('efaw') || lowerTitle.includes('first aid') || 
      lowerTitle.includes('wilderness emergency') || lowerTitle.includes('medical technician')) {
    return 'medical';
  }
  
  if (lowerTitle.includes('iml') || lowerTitle.includes('international mountain leader')) {
    return 'sage';
  }
  
  if (lowerTitle.includes('ifmga') || lowerTitle.includes('mountain guide')) {
    return 'burgundy';
  }
  
  return 'neutral';
}

/**
 * Get medical icon based on certification title
 */
function getMedicalIcon(title: string) {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('wemt') || lowerTitle.includes('wilderness emergency medical')) return Siren;
  if (lowerTitle.includes('wfr') || lowerTitle.includes('first responder')) return HeartPulse;
  if (lowerTitle.includes('wfa') || (lowerTitle.includes('wilderness') && lowerTitle.includes('first aid'))) return Heart;
  if (lowerTitle.includes('cpr') || lowerTitle.includes('aed')) return Activity;
  if (lowerTitle.includes('faw')) return Cross;
  if (lowerTitle.includes('efaw')) return Heart;
  return Heart;
}

/**
 * Get medical background color class
 */
function getMedicalColorClass(title: string): string {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('wemt') || lowerTitle.includes('wilderness emergency medical')) return 'bg-cert-emergency-red-dark text-cert-medical-foreground';
  if (lowerTitle.includes('wfr') || lowerTitle.includes('first responder')) return 'bg-cert-emergency-red text-cert-medical-foreground';
  if (lowerTitle.includes('wfa') || (lowerTitle.includes('wilderness') && lowerTitle.includes('first aid'))) return 'bg-cert-medical-blue text-cert-medical-foreground';
  if (lowerTitle.includes('cpr') || lowerTitle.includes('aed')) return 'bg-cert-safety-teal text-cert-medical-foreground';
  if (lowerTitle.includes('faw') && !lowerTitle.includes('efaw')) return 'bg-cert-medical-orange text-cert-medical-foreground';
  if (lowerTitle.includes('efaw') || lowerTitle.includes('emergency first aid at work')) return 'bg-cert-medical-blue-light text-cert-medical-foreground';
  return 'bg-cert-medical-blue text-cert-medical-foreground';
}

export function CertificationHoverCard({ certification, children }: CertificationHoverCardProps) {
  const metadata = getCertificationMetadata(certification.title);
  const colorScheme = getCertificationColorScheme(certification.title);
  const country = getCountryFromCertifyingBody(certification.certifyingBody);

  // Medical Theme (WEMT, WFR, WFA, CPR/AED, FAW, EFAW)
  if (colorScheme === 'medical') {
    const MedicalIcon = getMedicalIcon(certification.title);
    const medicalColorClass = getMedicalColorClass(certification.title);
    
    return (
      <HoverCard openDelay={200} closeDelay={100}>
        <HoverCardTrigger asChild>
          <span className="inline-block">{children}</span>
        </HoverCardTrigger>
        <HoverCardContent className={`w-[300px] p-0 overflow-hidden border-0 ${medicalColorClass}`}>
          <div className="p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start gap-2.5">
              <MedicalIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-base leading-tight">
                    {metadata?.abbreviation || certification.title}
                  </h4>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm">
                    Medical
                  </span>
                </div>
                <p className="text-sm opacity-90 mt-0.5">
                  {metadata?.fullTitle || certification.title}
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
                {metadata.activityTypes.map((activity, idx) => (
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
            {(metadata?.trainingHours || metadata?.recertificationYears) && (
              <div className="flex items-center gap-4 pt-2 border-t border-white/20 text-xs">
                {metadata?.trainingHours && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span><strong>{metadata.trainingHours}h</strong> training</span>
                  </div>
                )}
                {metadata?.recertificationYears && (
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Recert <strong>{metadata.recertificationYears}yr</strong></span>
                  </div>
                )}
              </div>
            )}

            {/* Certifying Body */}
            <div className="pt-2 border-t border-white/20 text-xs">
              <span className="font-bold">{certification.certifyingBody}</span>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  }

  // Sage Green Theme (IML)
  if (colorScheme === 'sage') {
    return (
      <HoverCard openDelay={200} closeDelay={100}>
        <HoverCardTrigger asChild>
          <span className="inline-block">{children}</span>
        </HoverCardTrigger>
        <HoverCardContent className="w-[300px] p-0 overflow-hidden border-0 bg-cert-sage text-cert-sage-foreground">
          <div className="p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-base leading-tight">
                    {metadata?.abbreviation || certification.title}
                  </h4>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm">
                    {country}
                  </span>
                </div>
                <p className="text-sm opacity-90 mt-0.5">
                  {metadata?.fullTitle || certification.title}
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
                {metadata.activityTypes.map((activity, idx) => (
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

            {/* Certifying Body */}
            <div className="pt-2 border-t border-white/20 text-xs">
              <span className="font-bold">{certification.certifyingBody}</span>
            </div>
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
          <span className="inline-block">{children}</span>
        </HoverCardTrigger>
        <HoverCardContent className="w-[300px] p-0 overflow-hidden border-0 bg-cert-burgundy text-cert-burgundy-foreground">
          <div className="p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start gap-2.5">
              <Award className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-base leading-tight">
                    {metadata?.abbreviation || certification.title}
                  </h4>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm">
                    {country}
                  </span>
                </div>
                <p className="text-sm opacity-90 mt-0.5">
                  {metadata?.fullTitle || certification.title}
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
                {metadata.activityTypes.map((activity, idx) => (
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

            {/* Certifying Body */}
            <div className="pt-2 border-t border-white/20 text-xs">
              <span className="font-bold">{certification.certifyingBody}</span>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  }

  // Neutral Theme (All Others - ML, WML, medical, regional)
  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <span className="inline-block">{children}</span>
      </HoverCardTrigger>
      <HoverCardContent className="w-[300px] p-0 overflow-hidden border shadow-sm bg-cert-neutral text-cert-neutral-foreground">
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-base leading-tight">
                  {metadata?.abbreviation || certification.title}
                </h4>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-cert-burgundy/10 text-cert-neutral-foreground">
                  {country}
                </span>
              </div>
              <p className="text-sm opacity-75 mt-0.5">
                {metadata?.fullTitle || certification.title}
              </p>
            </div>
          </div>

          {/* Description */}
          {metadata?.qualificationDescription && (
            <p className="text-xs leading-relaxed opacity-75">
              {metadata.qualificationDescription}
            </p>
          )}

          {/* Activity Types */}
          {metadata?.activityTypes && metadata.activityTypes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {metadata.activityTypes.map((activity, idx) => (
                <span 
                  key={idx}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-cert-burgundy/10 text-cert-neutral-foreground"
                >
                  {activity}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          {(metadata?.trainingHours || metadata?.recognitionCountries) && (
            <div className="flex items-center gap-4 pt-2 border-t border-cert-neutral-foreground/20 text-xs">
              {metadata?.trainingHours && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span><strong>{metadata.trainingHours}h</strong> training</span>
                </div>
              )}
              {metadata?.recognitionRegion && (
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span><strong>{metadata.recognitionRegion}</strong></span>
                </div>
              )}
              {!metadata?.recognitionRegion && metadata?.recognitionCountries && (
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span><strong>{metadata.recognitionCountries}+</strong> countries</span>
                </div>
              )}
            </div>
          )}

          {/* Certifying Body */}
          <div className="pt-2 border-t border-cert-neutral-foreground/20 text-xs">
            <span className="font-bold">{certification.certifyingBody}</span>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}