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
  badgeColor: string;
}

/**
 * Extract country from certifying body name
 */
export function getCountryFromCertifyingBody(certifyingBody: string): string {
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
  'Wilderness First Aid': {
    abbreviation: 'WFA',
    fullTitle: 'Wilderness First Aid',
    qualificationDescription: 'Certified in wilderness first aid and emergency response.',
    activityTypes: ['Emergency response', 'Medical support'],
    trainingHours: 16,
    badgeColor: '#0d9488',
  },
  'Wilderness First Responder': {
    abbreviation: 'WFR',
    fullTitle: 'Wilderness First Responder',
    qualificationDescription: 'Advanced wilderness medical training for extended backcountry trips.',
    activityTypes: ['Advanced emergency care', 'Medical evacuation'],
    trainingHours: 80,
    badgeColor: '#0d9488',
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
