export interface TourOffer {
  id: string;
  conversation_id: string;
  guide_id: string;
  hiker_id: string | null;
  hiker_email: string;
  offer_status: 'pending' | 'payment_pending' | 'accepted' | 'declined' | 'expired';
  price_per_person: number;
  total_price: number;
  currency: string;
  duration: string;
  preferred_date: string | null;
  group_size: number;
  meeting_point: string;
  meeting_time: string;
  itinerary: string;
  included_items: string;
  personal_note: string | null;
  booking_id: string | null;
  offer_token: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  accepted_at: string | null;
  declined_at: string | null;
}
