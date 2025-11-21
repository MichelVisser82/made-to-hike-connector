import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TourBookingSummary {
  tour_id: string;
  tour_title: string;
  tour_slug: string;
  tour_hero_image: string | null;
  tour_location: string;
  tour_duration: string;
  tour_meeting_point: string;
  tour_meeting_point_lat: number | null;
  tour_meeting_point_lng: number | null;
  total_bookings: number;
  total_participants: number;
  max_group_size: number;
  confirmed_bookings: number;
  pending_bookings: number;
  earliest_date: string;
  latest_date: string;
  total_revenue: number;
  currency: string;
}

export function useGuideBookingsByTour(guideId: string | undefined) {
  const [tours, setTours] = useState<TourBookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!guideId) {
      setLoading(false);
      return;
    }

    fetchTourBookings();
  }, [guideId]);

  const fetchTourBookings = async () => {
    if (!guideId) return;

    try {
      setLoading(true);
      setError(null);

      // First, get all tours for this guide
      const { data: tours, error: toursError } = await supabase
        .from('tours')
        .select('id')
        .eq('guide_id', guideId);

      if (toursError) throw toursError;
      if (!tours || tours.length === 0) {
        setTours([]);
        setLoading(false);
        return;
      }

      const tourIds = tours.map(t => t.id);

      // Fetch all bookings for these tours
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          tour_id,
          booking_date,
          participants,
          total_price,
          currency,
          status,
          tours!inner (
            id,
            title,
            slug,
            region,
            duration,
            meeting_point,
            meeting_point_lat,
            meeting_point_lng,
            hero_image,
            max_group_size
          )
        `)
        .in('tour_id', tourIds)
        .in('status', ['confirmed', 'pending', 'pending_confirmation', 'completed']);

      if (bookingsError) throw bookingsError;

      // Group bookings by tour AND date (composite key)
      const tourMap = new Map<string, TourBookingSummary>();

      bookings?.forEach((booking: any) => {
        const tour = booking.tours;
        if (!tour) return;

        // Create composite key: tourId_bookingDate
        const compositeKey = `${tour.id}_${booking.booking_date}`;
        const existing = tourMap.get(compositeKey);
        const isConfirmed = ['confirmed', 'pending_confirmation', 'completed'].includes(booking.status);
        const isPending = booking.status === 'pending';

        if (existing) {
          // Aggregate bookings for the same tour on the same date
          existing.total_bookings += 1;
          existing.total_participants += booking.participants;
          existing.confirmed_bookings += isConfirmed ? 1 : 0;
          existing.pending_bookings += isPending ? 1 : 0;
          existing.total_revenue += booking.total_price;
        } else {
          tourMap.set(compositeKey, {
            tour_id: tour.id,
            tour_title: tour.title,
            tour_slug: tour.slug,
            tour_hero_image: tour.hero_image,
            tour_location: tour.region,
            tour_duration: tour.duration,
            tour_meeting_point: tour.meeting_point,
            tour_meeting_point_lat: tour.meeting_point_lat,
            tour_meeting_point_lng: tour.meeting_point_lng,
            total_bookings: 1,
            total_participants: booking.participants,
            max_group_size: tour.max_group_size,
            confirmed_bookings: isConfirmed ? 1 : 0,
            pending_bookings: isPending ? 1 : 0,
            earliest_date: booking.booking_date,
            latest_date: booking.booking_date,
            total_revenue: booking.total_price,
            currency: booking.currency,
          });
        }
      });

      setTours(Array.from(tourMap.values()));
    } catch (err) {
      console.error('Error fetching tour bookings:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return {
    tours,
    loading,
    error,
    refetch: fetchTourBookings
  };
}
