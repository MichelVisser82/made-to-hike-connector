import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Check, X, Clock, Loader2, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RegionSubmission {
  id: string;
  country: string;
  region: string | null;
  subregion: string;
  description: string;
  key_features: string[];
  verification_status: string;
  submitted_by: string;
  created_at: string;
  declined_reason: string | null;
  reviewed_at: string | null;
  ticket_number?: string;
  profiles: {
    name: string;
    email: string;
  };
}

export const RegionSubmissionsPanel = () => {
  const [selectedSubmission, setSelectedSubmission] = useState<RegionSubmission | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['region-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_submitted_regions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profile data and ticket info for each submission
      const submissionsWithProfiles = await Promise.all(
        (data || []).map(async (submission) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, email')
            .eq('id', submission.submitted_by)
            .single();

          // Find associated ticket
          const regionDisplayName = submission.region
            ? `${submission.country} - ${submission.region} - ${submission.subregion}`
            : `${submission.country} - ${submission.subregion}`;

          const { data: ticket } = await supabase
            .from('tickets')
            .select('ticket_number')
            .eq('title', `Region Submission: ${regionDisplayName}`)
            .eq('category', 'region_submission')
            .single();

          return {
            ...submission,
            profiles: profile || { name: 'Unknown', email: 'unknown@example.com' },
            ticket_number: ticket?.ticket_number,
          };
        })
      );

      return submissionsWithProfiles as RegionSubmission[];
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ 
      submissionId, 
      action, 
      reason 
    }: { 
      submissionId: string; 
      action: 'approve' | 'decline'; 
      reason?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('review-region-submission', {
        body: {
          submission_id: submissionId,
          action,
          declined_reason: reason,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['region-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['hiking-regions'] });
      toast.success(data.message);
      setShowDeclineDialog(false);
      setSelectedSubmission(null);
      setDeclineReason('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to process submission');
    },
  });

  const handleApprove = (submission: RegionSubmission) => {
    if (confirm(`Approve region: ${getRegionDisplayName(submission)}?`)) {
      reviewMutation.mutate({
        submissionId: submission.id,
        action: 'approve',
      });
    }
  };

  const handleDecline = (submission: RegionSubmission) => {
    setSelectedSubmission(submission);
    setShowDeclineDialog(true);
  };

  const handleDeclineConfirm = () => {
    if (!selectedSubmission || !declineReason.trim()) {
      toast.error('Please provide a reason for declining');
      return;
    }

    reviewMutation.mutate({
      submissionId: selectedSubmission.id,
      action: 'decline',
      reason: declineReason,
    });
  };

  const getRegionDisplayName = (submission: RegionSubmission) => {
    return submission.region
      ? `${submission.country} - ${submission.region} - ${submission.subregion}`
      : `${submission.country} - ${submission.subregion}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700"><Check className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'declined':
        return <Badge variant="outline" className="bg-red-50 text-red-700"><X className="w-3 h-3 mr-1" />Declined</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingSubmissions = submissions?.filter(s => s.verification_status === 'pending') || [];
  const reviewedSubmissions = submissions?.filter(s => s.verification_status !== 'pending') || [];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Pending Submissions */}
        {pendingSubmissions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Pending Region Submissions ({pendingSubmissions.length})
              </CardTitle>
              <CardDescription>
                Review and approve or decline region submissions from guides
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingSubmissions.map((submission) => (
                <Card key={submission.id} className="border-l-4 border-l-yellow-500">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-lg">{getRegionDisplayName(submission)}</h4>
                          {getStatusBadge(submission.verification_status)}
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{submission.description}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          {submission.key_features.map((feature, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>Submitted by: <span className="font-medium">{submission.profiles?.name}</span> ({submission.profiles?.email})</div>
                          <div>Submitted: {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}</div>
                          {submission.ticket_number && (
                            <div>
                              <Badge variant="outline" className="text-xs">
                                Ticket: {submission.ticket_number}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleApprove(submission)}
                          disabled={reviewMutation.isPending}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDecline(submission)}
                          disabled={reviewMutation.isPending}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Reviewed Submissions */}
        {reviewedSubmissions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Reviewed Submissions ({reviewedSubmissions.length})</CardTitle>
              <CardDescription>Previously reviewed region submissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviewedSubmissions.map((submission) => (
                <Card key={submission.id} className="opacity-60">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{getRegionDisplayName(submission)}</h4>
                        {getStatusBadge(submission.verification_status)}
                      </div>
                      
                      {submission.declined_reason && (
                        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                          <strong>Decline Reason:</strong> {submission.declined_reason}
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        Reviewed: {submission.reviewed_at ? formatDistanceToNow(new Date(submission.reviewed_at), { addSuffix: true }) : 'Unknown'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {submissions?.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No region submissions yet</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Decline Dialog */}
      <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Region Submission</DialogTitle>
            <DialogDescription>
              Please provide a reason for declining this region. The guide will receive an email notification and their tours using this region will be archived.
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded">
                <p className="font-medium">{getRegionDisplayName(selectedSubmission)}</p>
                <p className="text-sm text-muted-foreground mt-1">{selectedSubmission.description}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Reason for Decline *
                </label>
                <Textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="Explain why this region cannot be approved (e.g., duplicate of existing region, incorrect information, too vague, etc.)"
                  rows={4}
                  className="w-full"
                />
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
                <strong>⚠️ Warning:</strong> This action will:
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>Send an email notification to the guide</li>
                  <li>Archive all tours using this region</li>
                  <li>Allow the guide to edit and reactivate their tours with a different region</li>
                </ul>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeclineDialog(false);
                setSelectedSubmission(null);
                setDeclineReason('');
              }}
              disabled={reviewMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeclineConfirm}
              disabled={reviewMutation.isPending || !declineReason.trim()}
            >
              {reviewMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Decline & Notify Guide
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};