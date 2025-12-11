import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSeenNotifications } from './useSeenNotifications';

interface PublicRequest {
  id: string;
  trip_name: string;
  region: string;
  created_at: string;
  requester_name: string;
  status: string;
}

export function usePublicRequestsNotifications(guideId?: string) {
  const [requests, setRequests] = useState<PublicRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { markAllAsSeen, getUnseenCount } = useSeenNotifications('public_requests', guideId);

  useEffect(() => {
    if (!guideId) {
      setLoading(false);
      return;
    }

    const fetchRequests = async () => {
      // Fetch open public requests (not expired, status = open)
      const { data, error } = await supabase
        .from('public_tour_requests')
        .select('id, trip_name, region, created_at, requester_name, status')
        .eq('status', 'open')
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setRequests(data);
      }
      setLoading(false);
    };

    fetchRequests();

    // Subscribe to new public requests
    const channel = supabase
      .channel('public-requests-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'public_tour_requests'
        },
        (payload) => {
          const newRequest = payload.new as PublicRequest;
          if (newRequest.status === 'open') {
            setRequests(prev => [newRequest, ...prev].slice(0, 20));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'public_tour_requests'
        },
        (payload) => {
          // Remove from list if no longer open
          if (payload.new.status !== 'open') {
            setRequests(prev => prev.filter(r => r.id !== payload.new.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [guideId]);

  const requestIds = requests.map(r => r.id);
  const unseenCount = getUnseenCount(requestIds);

  const markRequestsAsSeen = () => {
    markAllAsSeen(requestIds);
  };

  return {
    requests,
    unseenCount,
    markRequestsAsSeen,
    loading
  };
}
