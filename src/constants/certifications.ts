/**
 * Preloaded Certification Database for MadeToHike
 * Organized by priority and category
 */

export interface PreloadedCertification {
  id: string;
  name: string;
  certifyingBody: string;
  category: 'international' | 'european' | 'hiking' | 'medical';
  priority: 1 | 2 | 3;
  badgeColor: string;
  requiresCertificateNumber: boolean;
  verificationTarget: string; // Response time target
  description?: string;
}

export const CERTIFICATION_CATEGORIES = {
  international: 'International Mountain Guiding',
  european: 'European National Certifications',
  hiking: 'Hiking/Walking Certifications',
  medical: 'Wilderness Medical',
} as const;

export const PRELOADED_CERTIFICATIONS: PreloadedCertification[] = [
  // ========== PRIORITY 1: International Mountain Guiding ==========
  {
    id: 'ifmga',
    name: 'IFMGA/UIAGM/IVBV (International Mountain Guide)',
    certifyingBody: 'IFMGA',
    category: 'international',
    priority: 1,
    badgeColor: '#881337', // Burgundy
    requiresCertificateNumber: true,
    verificationTarget: '2 hours',
    description: 'Highest international mountain guiding certification',
  },
  {
    id: 'uimla-iml',
    name: 'UIMLA/IML (International Mountain Leader)',
    certifyingBody: 'UIMLA',
    category: 'international',
    priority: 1,
    badgeColor: '#881337', // Burgundy
    requiresCertificateNumber: true,
    verificationTarget: '2 hours',
    description: 'International mountain leadership certification',
  },

  // ========== PRIORITY 1: European National Certifications ==========
  {
    id: 'guide-haute-montagne',
    name: 'Guide de Haute Montagne (France)',
    certifyingBody: 'SNGM/ENSA',
    category: 'european',
    priority: 1,
    badgeColor: '#881337', // Burgundy
    requiresCertificateNumber: true,
    verificationTarget: '2 hours',
  },
  {
    id: 'bergfuhrer-swiss',
    name: 'Bergführer (Switzerland)',
    certifyingBody: 'SBV-ASGM',
    category: 'european',
    priority: 1,
    badgeColor: '#881337', // Burgundy
    requiresCertificateNumber: true,
    verificationTarget: '2 hours',
  },
  {
    id: 'bergfuhrer-austria',
    name: 'Berg- und Skiführer (Austria)',
    certifyingBody: 'VÖBS',
    category: 'european',
    priority: 1,
    badgeColor: '#881337', // Burgundy
    requiresCertificateNumber: true,
    verificationTarget: '2 hours',
  },
  {
    id: 'guida-alpina',
    name: 'Guida Alpina (Italy)',
    certifyingBody: 'CONAGAI',
    category: 'european',
    priority: 1,
    badgeColor: '#881337', // Burgundy
    requiresCertificateNumber: true,
    verificationTarget: '2 hours',
  },
  {
    id: 'guia-alta-montana',
    name: 'Guía de Alta Montaña (Spain)',
    certifyingBody: 'AEGM',
    category: 'european',
    priority: 1,
    badgeColor: '#881337', // Burgundy
    requiresCertificateNumber: true,
    verificationTarget: '2 hours',
  },
  {
    id: 'mic-uk',
    name: 'MIC (Mountain Instructor Certificate, UK)',
    certifyingBody: 'AMI/Mountain Training UK',
    category: 'european',
    priority: 1,
    badgeColor: '#881337', // Burgundy
    requiresCertificateNumber: true,
    verificationTarget: '2 hours',
  },
  {
    id: 'wmci-uk',
    name: 'WMCI (Winter Mountaineering & Climbing Instructor, UK)',
    certifyingBody: 'AMI',
    category: 'european',
    priority: 1,
    badgeColor: '#881337', // Burgundy
    requiresCertificateNumber: true,
    verificationTarget: '2 hours',
  },
  {
    id: 'bergfuhrer-germany',
    name: 'Staatlich geprüfter Berg- und Skiführer (Germany)',
    certifyingBody: 'VDBS',
    category: 'european',
    priority: 1,
    badgeColor: '#881337', // Burgundy
    requiresCertificateNumber: true,
    verificationTarget: '2 hours',
  },

  // ========== PRIORITY 2: Hiking/Walking Certifications ==========
  {
    id: 'iml-netherlands',
    name: 'IML via NLAIML (Netherlands)',
    certifyingBody: 'NLAIML',
    category: 'hiking',
    priority: 2,
    badgeColor: '#22c55e', // Green
    requiresCertificateNumber: false,
    verificationTarget: '24 hours',
  },
  {
    id: 'ml-uk',
    name: 'ML (Mountain Leader, UK)',
    certifyingBody: 'Mountain Training UK',
    category: 'hiking',
    priority: 2,
    badgeColor: '#22c55e', // Green
    requiresCertificateNumber: false,
    verificationTarget: '24 hours',
  },
  {
    id: 'wml-uk',
    name: 'WML (Winter Mountain Leader, UK)',
    certifyingBody: 'Mountain Training UK',
    category: 'hiking',
    priority: 2,
    badgeColor: '#22c55e', // Green
    requiresCertificateNumber: false,
    verificationTarget: '24 hours',
  },
  {
    id: 'amm-france',
    name: 'AMM (Accompagnateur en Montagne, France)',
    certifyingBody: 'ENSA',
    category: 'hiking',
    priority: 2,
    badgeColor: '#22c55e', // Green
    requiresCertificateNumber: false,
    verificationTarget: '24 hours',
  },
  {
    id: 'wanderfuhrer',
    name: 'Wanderführer (Austria/Germany)',
    certifyingBody: 'VÖBS/Regional',
    category: 'hiking',
    priority: 2,
    badgeColor: '#22c55e', // Green
    requiresCertificateNumber: false,
    verificationTarget: '24 hours',
  },

  // ========== PRIORITY 2: Wilderness Medical Certifications ==========
  {
    id: 'wfr',
    name: 'WFR (Wilderness First Responder)',
    certifyingBody: 'Various (NOLS, WMA, SOLO)',
    category: 'medical',
    priority: 2,
    badgeColor: '#0d9488', // Teal
    requiresCertificateNumber: true,
    verificationTarget: '24 hours',
    description: 'Advanced wilderness medical training',
  },
  {
    id: 'wfa',
    name: 'WFA (Wilderness First Aid)',
    certifyingBody: 'Various (NOLS, WMA, SOLO)',
    category: 'medical',
    priority: 2,
    badgeColor: '#0d9488', // Teal
    requiresCertificateNumber: true,
    verificationTarget: '24 hours',
  },
  {
    id: 'wafa',
    name: 'WAFA (Wilderness Advanced First Aid)',
    certifyingBody: 'Various',
    category: 'medical',
    priority: 2,
    badgeColor: '#0d9488', // Teal
    requiresCertificateNumber: true,
    verificationTarget: '24 hours',
  },
  {
    id: 'wemt',
    name: 'WEMT (Wilderness EMT)',
    certifyingBody: 'NOLS/State Specific',
    category: 'medical',
    priority: 2,
    badgeColor: '#0d9488', // Teal
    requiresCertificateNumber: true,
    verificationTarget: '24 hours',
    description: 'Wilderness Emergency Medical Technician',
  },
];

/**
 * Get certifications grouped by category
 */
export function getCertificationsByCategory() {
  const grouped: Record<string, PreloadedCertification[]> = {
    international: [],
    european: [],
    hiking: [],
    medical: [],
  };

  PRELOADED_CERTIFICATIONS.forEach((cert) => {
    grouped[cert.category].push(cert);
  });

  return grouped;
}

/**
 * Find a preloaded certification by ID
 */
export function findCertificationById(id: string): PreloadedCertification | undefined {
  return PRELOADED_CERTIFICATIONS.find((cert) => cert.id === id);
}

/**
 * Validate certificate number format
 */
export function validateCertificateNumber(certNumber: string, certId?: string): boolean {
  // Remove whitespace
  const cleaned = certNumber.trim();
  
  // Must be 6-20 alphanumeric characters for IFMGA/UIMLA
  if (certId === 'ifmga' || certId === 'uimla-iml') {
    return /^[A-Z0-9]{6,20}$/i.test(cleaned);
  }
  
  // For others, just check it's not empty and reasonable length
  return cleaned.length >= 3 && cleaned.length <= 50;
}
