import { useState } from 'react';
import { format } from 'date-fns';
import { MapPin, Calendar, Users, Compass, DollarSign, ChevronDown, ChevronUp, Forward, X, Check, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PublicTourRequest {
  id: string;
  trip_name: string;
  region: string;
  preferred_dates: string;
  duration: string;
  group_size: string;
  experience_level: string;
  budget_per_person: string | null;
  description: string;
  special_requests: string[] | null;
  additional_details: string | null;
  requester_name: string;
  requester_email: string;
  created_at: string;
}

interface PublicRequestCardProps {
  request: PublicTourRequest;
  guideId: string;
  onInterested: (conversationId: string) => void;
  onDeclined: () => void;
  onForward: (request: PublicTourRequest) => void;
}

export function PublicRequestCard({
  request,
  guideId,
  onInterested,
  onDeclined,
  onForward,
}: PublicRequestCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showDeclineReason, setShowDeclineReason] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [isLoading, setIsLoading] = useState<'interested' | 'declined' | null>(null);

  const handleInterested = async () => {
    setIsLoading('interested');
    try {
      const { data, error } = await supabase.functions.invoke('respond-to-public-request', {
        body: {
          request_id: request.id,
          guide_id: guideId,
          response_type: 'interested',
        },
      });

      if (error) throw error;

      if (data?.already_responded) {
        toast.success('Opening existing conversation...');
      } else {
        toast.success('You expressed interest! A conversation has been created.');
      }
      
      if (data?.conversation_id) {
        onInterested(data.conversation_id);
      } else {
        // Still remove from list even without conversation_id
        onInterested('');
      }
    } catch (error) {
      console.error('Error expressing interest:', error);
      toast.error('Failed to express interest. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  const handleDecline = async () => {
    if (!showDeclineReason) {
      setShowDeclineReason(true);
      return;
    }

    setIsLoading('declined');
    try {
      const { error } = await supabase.functions.invoke('respond-to-public-request', {
        body: {
          request_id: request.id,
          guide_id: guideId,
          response_type: 'declined',
          decline_reason: declineReason || null,
        },
      });

      if (error) throw error;

      toast.success('Request declined');
      onDeclined();
    } catch (error) {
      console.error('Error declining request:', error);
      toast.error('Failed to decline. Please try again.');
    } finally {
      setIsLoading(null);
      setShowDeclineReason(false);
    }
  };

  const experienceLevelColors: Record<string, string> = {
    beginner: 'bg-sage/20 text-sage border-sage/30',
    intermediate: 'bg-gold/20 text-gold border-gold/30',
    advanced: 'bg-burgundy/20 text-burgundy border-burgundy/30',
    expert: 'bg-charcoal/20 text-charcoal border-charcoal/30',
  };

  return (
    <Card className="border-burgundy/10 bg-cream/30 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-playfair text-lg text-charcoal font-semibold">
              {request.trip_name}
            </h4>
            <div className="flex items-center gap-1.5 text-charcoal/60 text-sm mt-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{request.region}</span>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={experienceLevelColors[request.experience_level.toLowerCase()] || 'border-charcoal/30'}
          >
            {request.experience_level}
          </Badge>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <div className="flex items-center gap-1.5 text-sm text-charcoal/70">
            <Calendar className="w-4 h-4 text-burgundy/60" />
            <span className="truncate">{request.preferred_dates}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-charcoal/70">
            <Compass className="w-4 h-4 text-burgundy/60" />
            <span>{request.duration}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-charcoal/70">
            <Users className="w-4 h-4 text-burgundy/60" />
            <span>{request.group_size}</span>
          </div>
          {request.budget_per_person && (
            <div className="flex items-center gap-1.5 text-sm text-charcoal/70">
              <DollarSign className="w-4 h-4 text-burgundy/60" />
              <span>{request.budget_per_person}/person</span>
            </div>
          )}
        </div>

        {/* Special Requests */}
        {request.special_requests && request.special_requests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {request.special_requests.map((sr, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className="border-burgundy/30 text-burgundy text-xs"
              >
                {sr}
              </Badge>
            ))}
          </div>
        )}

        {/* Expandable Description */}
        <div 
          className={`bg-cream/60 rounded-lg p-3 mb-3 cursor-pointer transition-all ${expanded ? '' : 'max-h-20 overflow-hidden'}`}
          onClick={() => setExpanded(!expanded)}
        >
          <p className="text-sm text-charcoal/80 whitespace-pre-wrap">
            {request.description}
          </p>
          
          {/* Additional Details - shown when expanded */}
          {expanded && request.additional_details && (
            <div className="mt-3 pt-3 border-t border-charcoal/10">
              <p className="text-xs font-medium text-charcoal/60 mb-1">Additional Details</p>
              <p className="text-sm text-charcoal/80 whitespace-pre-wrap">
                {request.additional_details}
              </p>
            </div>
          )}
        </div>
        
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-burgundy hover:text-burgundy/80 flex items-center gap-1 mb-4"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" /> Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" /> Read more
            </>
          )}
        </button>

        {/* Decline Reason Input */}
        {showDeclineReason && (
          <div className="mb-4">
            <Textarea
              placeholder="Optional: Why are you declining? (This helps us improve matching)"
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="text-sm border-charcoal/20 focus:border-burgundy"
              rows={2}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleInterested}
            disabled={isLoading !== null}
            className="bg-burgundy hover:bg-burgundy/90 text-white flex-1 sm:flex-none"
          >
            {isLoading === 'interested' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            I'm Interested
          </Button>
          
          <Button
            variant="outline"
            onClick={handleDecline}
            disabled={isLoading !== null}
            className="border-charcoal/20 text-charcoal hover:bg-charcoal/5"
          >
            {isLoading === 'declined' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <X className="w-4 h-4 mr-2" />
            )}
            {showDeclineReason ? 'Confirm Decline' : 'Decline'}
          </Button>
          
          {showDeclineReason && (
            <Button
              variant="ghost"
              onClick={() => setShowDeclineReason(false)}
              className="text-charcoal/60"
            >
              Cancel
            </Button>
          )}
          
          {!showDeclineReason && (
            <Button
              variant="outline"
              onClick={() => onForward(request)}
              disabled={isLoading !== null}
              className="border-sage/30 text-sage hover:bg-sage/5"
            >
              <Forward className="w-4 h-4 mr-2" />
              Forward
            </Button>
          )}
        </div>

        {/* Requester Info */}
        <div className="mt-3 pt-3 border-t border-charcoal/10 flex justify-between items-center text-xs text-charcoal/50">
          <span>From: {request.requester_name}</span>
          <span>{format(new Date(request.created_at), 'MMM d, yyyy')}</span>
        </div>
      </CardContent>
    </Card>
  );
}
