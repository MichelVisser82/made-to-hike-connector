/**
 * Certification Metadata
 * Extended information for common mountain guide certifications
 */

export interface CertificationMetadata {
  abbreviation: string;
  fullTitle: string;
  qualificationDescription: string;
  activityTypes: string[];
  trainingHours?: number;
  recognitionCountries?: number;
  recertificationYears?: number;
  badgeColor: string;
  certType?: 'mountain-guide' | 'medical';
}

/**
 * Extract country from certifying body name
 */
export function getCountryFromCertifyingBody(certifyingBody: string | undefined): string {
  if (!certifyingBody) return 'International';
  const body = certifyingBody.toLowerCase();
  
  // UK organizations
  if (body.includes('mountain training uk') || body.includes('mountain training scotland') || 
      body.includes('mountain training england') || body.includes('mountain training wales') ||
      body.includes('mountain training ireland')) {
    return 'United Kingdom';
  }
  
  // French organizations
  if (body.includes('ensa') || body.includes('french') || body.includes('france')) {
    return 'France';
  }
  
  // Swiss organizations
  if (body.includes('swiss') || body.includes('switzerland')) {
    return 'Switzerland';
  }
  
  // Austrian organizations
  if (body.includes('austrian') || body.includes('austria')) {
    return 'Austria';
  }
  
  // German organizations
  if (body.includes('german') || body.includes('germany')) {
    return 'Germany';
  }
  
  // Italian organizations
  if (body.includes('italian') || body.includes('italy')) {
    return 'Italy';
  }
  
  // Spanish organizations
  if (body.includes('spanish') || body.includes('spain')) {
    return 'Spain';
  }
  
  // International organizations
  if (body.includes('ifmga') || body.includes('international')) {
    return 'International';
  }
  
  // US organizations
  if (body.includes('american') || body.includes('usa') || body.includes('united states')) {
    return 'United States';
  }
  
  // Canadian organizations
  if (body.includes('canadian') || body.includes('canada')) {
    return 'Canada';
  }
  
  // Norwegian organizations
  if (body.includes('norwegian') || body.includes('norway')) {
    return 'Norway';
  }
  
  // Swedish organizations
  if (body.includes('swedish') || body.includes('sweden')) {
    return 'Sweden';
  }
  
  // New Zealand organizations
  if (body.includes('new zealand')) {
    return 'New Zealand';
  }
  
  // Australian organizations
  if (body.includes('australian') || body.includes('australia')) {
    return 'Australia';
  }
  
  // Multiple or various
  if (body.includes('various') || body.includes('multiple')) {
    return 'Various';
  }
  
  // Default fallback
  return 'International';
}

export const CERTIFICATION_METADATA: Record<string, CertificationMetadata> = {
  'International Mountain Leader': {
    abbreviation: 'IML',
    fullTitle: 'International Mountain Leader',
    qualificationDescription: 'Qualified for non-technical terrain in summer conditions across mountain environments worldwide.',
    activityTypes: ['Hiking', 'Trekking', 'Multi-day backpacking'],
    trainingHours: 900,
    recognitionCountries: 27,
    badgeColor: '#8FA68E',
  },
  'Mountain Leader': {
    abbreviation: 'ML',
    fullTitle: 'Mountain Leader',
    qualificationDescription: 'Qualified to lead groups in mountainous terrain in summer conditions.',
    activityTypes: ['Hill walking', 'Mountain hiking', 'Navigation'],
    trainingHours: 600,
    recognitionCountries: 15,
    badgeColor: '#8FA68E',
  },
  'IFMGA': {
    abbreviation: 'IFMGA',
    fullTitle: 'IFMGA Mountain Guide',
    qualificationDescription: 'Internationally certified mountain guide qualified for all mountain activities in all seasons.',
    activityTypes: ['Mountaineering', 'Rock climbing', 'Ice climbing', 'Ski touring'],
    trainingHours: 1200,
    recognitionCountries: 40,
    badgeColor: '#881337',
  },
  'WEMT': {
    abbreviation: 'WEMT',
    fullTitle: 'Wilderness Emergency Medical Technician',
    qualificationDescription: 'Combines EMT certification with wilderness protocols. Advanced life support in remote environments.',
    activityTypes: ['Advanced life support', 'Wilderness medicine', 'Remote emergency care'],
    trainingHours: 300,
    recertificationYears: 2,
    badgeColor: '#B91C1C',
    certType: 'medical',
  },
  'Wilderness Emergency Medical Technician': {
    abbreviation: 'WEMT',
    fullTitle: 'Wilderness Emergency Medical Technician',
    qualificationDescription: 'Combines EMT certification with wilderness protocols. Advanced life support in remote environments.',
    activityTypes: ['Advanced life support', 'Wilderness medicine', 'Remote emergency care'],
    trainingHours: 300,
    recertificationYears: 2,
    badgeColor: '#B91C1C',
    certType: 'medical',
  },
  'WFR': {
    abbreviation: 'WFR',
    fullTitle: 'Wilderness First Responder',
    qualificationDescription: 'Advanced wilderness medicine for remote emergencies and extended evacuations. Trauma, medical emergencies, and patient assessment.',
    activityTypes: ['Wilderness medicine', 'Patient assessment', 'Emergency care', 'Trauma management'],
    trainingHours: 80,
    recertificationYears: 3,
    badgeColor: '#DC2626',
    certType: 'medical',
  },
  'Wilderness First Responder': {
    abbreviation: 'WFR',
    fullTitle: 'Wilderness First Responder',
    qualificationDescription: 'Advanced wilderness medicine for remote emergencies and extended evacuations. Trauma, medical emergencies, and patient assessment.',
    activityTypes: ['Wilderness medicine', 'Patient assessment', 'Emergency care', 'Trauma management'],
    trainingHours: 80,
    recertificationYears: 3,
    badgeColor: '#DC2626',
    certType: 'medical',
  },
  'WFA': {
    abbreviation: 'WFA',
    fullTitle: 'Wilderness First Aid',
    qualificationDescription: 'Basic emergency care in wilderness. Patient assessment, common injuries, environmental emergencies.',
    activityTypes: ['Basic first aid', 'Wilderness care', 'Environmental emergencies'],
    trainingHours: 20,
    recertificationYears: 3,
    badgeColor: '#2563EB',
    certType: 'medical',
  },
  'Wilderness First Aid': {
    abbreviation: 'WFA',
    fullTitle: 'Wilderness First Aid',
    qualificationDescription: 'Basic emergency care in wilderness. Patient assessment, common injuries, environmental emergencies.',
    activityTypes: ['Basic first aid', 'Wilderness care', 'Environmental emergencies'],
    trainingHours: 20,
    recertificationYears: 3,
    badgeColor: '#2563EB',
    certType: 'medical',
  },
  'CPR/AED': {
    abbreviation: 'CPR/AED',
    fullTitle: 'CPR & AED Certification',
    qualificationDescription: 'Cardiopulmonary resuscitation and automated external defibrillator use for cardiac emergencies.',
    activityTypes: ['CPR', 'AED', 'Cardiac emergency'],
    trainingHours: 5,
    recertificationYears: 2,
    badgeColor: '#14B8A6',
    certType: 'medical',
  },
  'CPR': {
    abbreviation: 'CPR',
    fullTitle: 'CPR Certification',
    qualificationDescription: 'Cardiopulmonary resuscitation for cardiac emergencies.',
    activityTypes: ['CPR', 'Cardiac emergency'],
    trainingHours: 4,
    recertificationYears: 2,
    badgeColor: '#14B8A6',
    certType: 'medical',
  },
  'FAW': {
    abbreviation: 'FAW',
    fullTitle: 'First Aid at Work (UK)',
    qualificationDescription: 'UK Health & Safety Executive (HSE) approved comprehensive first aid course for workplace injuries and illnesses.',
    activityTypes: ['Workplace first aid', 'HSE approved', 'UK standard'],
    trainingHours: 18,
    recertificationYears: 3,
    badgeColor: '#EA580C',
    certType: 'medical',
  },
  'First Aid at Work': {
    abbreviation: 'FAW',
    fullTitle: 'First Aid at Work (UK)',
    qualificationDescription: 'UK Health & Safety Executive (HSE) approved comprehensive first aid course for workplace injuries and illnesses.',
    activityTypes: ['Workplace first aid', 'HSE approved', 'UK standard'],
    trainingHours: 18,
    recertificationYears: 3,
    badgeColor: '#EA580C',
    certType: 'medical',
  },
  'EFAW': {
    abbreviation: 'EFAW',
    fullTitle: 'Emergency First Aid at Work (UK)',
    qualificationDescription: 'One-day emergency first aid course meeting UK HSE requirements for low-risk workplaces. Basic emergency treatment.',
    activityTypes: ['Emergency first aid', 'Basic treatment', 'UK workplace'],
    trainingHours: 6,
    recertificationYears: 3,
    badgeColor: '#3B82F6',
    certType: 'medical',
  },
  'Emergency First Aid at Work': {
    abbreviation: 'EFAW',
    fullTitle: 'Emergency First Aid at Work (UK)',
    qualificationDescription: 'One-day emergency first aid course meeting UK HSE requirements for low-risk workplaces. Basic emergency treatment.',
    activityTypes: ['Emergency first aid', 'Basic treatment', 'UK workplace'],
    trainingHours: 6,
    recertificationYears: 3,
    badgeColor: '#3B82F6',
    certType: 'medical',
  },
  'Alpine Guide': {
    abbreviation: 'AG',
    fullTitle: 'Alpine Guide',
    qualificationDescription: 'Certified for technical alpine climbing and mountaineering.',
    activityTypes: ['Alpine climbing', 'Glacier travel', 'Technical routes'],
    trainingHours: 1000,
    recognitionCountries: 25,
    badgeColor: '#881337',
  },
  'Winter Mountain Leader': {
    abbreviation: 'WML',
    fullTitle: 'Winter Mountain Leader',
    qualificationDescription: 'Qualified to lead groups in winter mountain conditions.',
    activityTypes: ['Winter hiking', 'Snow conditions', 'Avalanche awareness'],
    trainingHours: 700,
    recognitionCountries: 18,
    badgeColor: '#8FA68E',
  },
  'Rock Climbing Instructor': {
    abbreviation: 'RCI',
    fullTitle: 'Rock Climbing Instructor',
    qualificationDescription: 'Qualified to instruct rock climbing at all levels.',
    activityTypes: ['Sport climbing', 'Traditional climbing', 'Bouldering'],
    trainingHours: 500,
    badgeColor: '#8FA68E',
  },
};

/**
 * Get metadata for a certification by title
 */
export function getCertificationMetadata(title: string): CertificationMetadata | null {
  // Try exact match first
  if (CERTIFICATION_METADATA[title]) {
    return CERTIFICATION_METADATA[title];
  }
  
  // Try partial match
  for (const [key, metadata] of Object.entries(CERTIFICATION_METADATA)) {
    if (title.includes(key) || key.includes(title)) {
      return metadata;
    }
  }
  
  return null;
}
