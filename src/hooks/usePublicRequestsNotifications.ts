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
      const { data: openRequests } = await supabase
        .from('public_tour_requests')
        .select('id, trip_name, region, created_at, requester_name, status')
        .eq('status', 'open')
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order('created_at', { ascending: false })
        .limit(20);

      // Fetch guide's responses to filter out already-responded requests
      const { data: responses } = await supabase
        .from('guide_request_responses')
        .select('request_id')
        .eq('guide_id', guideId);

      const respondedIds = new Set(responses?.map(r => r.request_id) || []);
      
      // Filter out requests the guide has already responded to
      const filteredRequests = (openRequests || []).filter(
        req => !respondedIds.has(req.id)
      );

      setRequests(filteredRequests);
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
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'guide_request_responses',
          filter: `guide_id=eq.${guideId}`
        },
        (payload) => {
          // Remove request when guide responds to it
          const requestId = (payload.new as { request_id: string }).request_id;
          setRequests(prev => prev.filter(r => r.id !== requestId));
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
