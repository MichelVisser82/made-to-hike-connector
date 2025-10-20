import type { Database } from '@/integrations/supabase/types';

export type TourDateSlot = Database['public']['Tables']['tour_date_slots']['Row'];
export type TourDateSlotInsert = Database['public']['Tables']['tour_date_slots']['Insert'];
export type TourDateSlotUpdate = Database['public']['Tables']['tour_date_slots']['Update'];

export interface CalendarDateView {
  slotId: string;
  tourId: string;
  tourTitle: string;
  tourDuration: string;
  date: Date;
  endDate: Date;
  durationDays: number;
  spotsTotal: number;
  spotsBooked: number;
  spotsRemaining: number;
  price: number;
  currency: string;
  discountPercentage?: number;
  availabilityStatus: 'available' | 'limited' | 'booked';
}

export interface DateSlotFormData {
  date: Date;
  spotsTotal: number;
  priceOverride?: number;
  currencyOverride?: string;
  discountPercentage?: number;
  discountLabel?: string;
  earlyBirdDate?: Date;
  notes?: string;
}

export interface TourDateAvailability {
  slotId: string;
  slotDate: Date;
  spotsTotal: number;
  spotsBooked: number;
  spotsRemaining: number;
  price: number;
  currency: string;
  discountPercentage?: number;
  discountLabel?: string;
  isEarlyBird: boolean;
  isAvailable: boolean;
}
