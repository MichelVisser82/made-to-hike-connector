export interface ParticipantDetails {
  firstName: string;
  surname: string;
  age: number;
  experience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  medicalConditions?: string;
  
  // Per-participant tracking
  waiverStatus?: 'not_started' | 'pending' | 'completed' | 'overdue';
  waiverSubmittedAt?: string;
  waiverData?: any;
  
  insuranceStatus?: 'not_submitted' | 'pending' | 'verified' | 'missing';
  insuranceSubmittedAt?: string;
  insuranceFileUrl?: string;
  insurancePolicyNumber?: string;
  insuranceProvider?: string;
  
  participantEmail?: string;
  participantPhone?: string;
  
  // Multi-party system fields
  participantTokenId?: string;
  uniqueSecureLink?: string;
  invitedAt?: string;
  completedAt?: string;
  remindersSent?: number;
  lastReminderAt?: string;
  documentStatus?: 'complete' | 'in_progress' | 'not_started' | 'invited';
}

export interface BookingFormData {
  participants: ParticipantDetails[];
  phone: string;
  country: string;
  emergencyContactName: string;
  emergencyContactCountry: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  selectedDateSlotId: string;
  dietaryPreferences?: string[];
  accessibilityNeeds?: string;
  specialRequests?: string;
  discountCode?: string;
  agreedToTerms: boolean;
}

export interface PricingDetails {
  subtotal: number;
  discount: number;
  slotDiscount?: number;
  serviceFee: number;
  total: number;
  currency: string;
}

export type BookingStep = 
  | 'account'
  | 'participants'
  | 'contact'
  | 'date'
  | 'special-requests'
  | 'review'
  | 'payment';

export const BOOKING_STEPS: BookingStep[] = ['date', 'participants', 'contact', 'special-requests', 'review', 'payment'];
