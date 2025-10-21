export interface BookingFormData {
  // Participants
  participants: Array<{
    name: string;
    age: number;
    experience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    medicalConditions?: string;
  }>;
  
  // Contact
  phone: string;
  country: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  
  // Date
  selectedDateSlotId: string;
  
  // Special Requests
  dietaryPreferences: string[];
  accessibilityNeeds?: string;
  specialRequests?: string;
  
  // Payment
  discountCode?: string;
  agreedToTerms: boolean;
}

export interface PricingDetails {
  subtotal: number;
  discount: number;
  serviceFee: number;
  total: number;
}

export interface BookingStep {
  title: string;
  description: string;
  isComplete: boolean;
}
