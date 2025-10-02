import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useGuideVerifications } from '@/hooks/useGuideVerifications';
import { GuideVerificationDetails } from './GuideVerificationDetails';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { VerifiedGuidesArchive } from './VerifiedGuidesArchive';
import { Clock, CheckCircle2, XCircle, FileText, Calendar, Send, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function GuideVerificationManager() {
  const [selectedVerification, setSelectedVerification] = useState<string | null>(null);
  const [sendingSlack, setSendingSlack] = useState<string | null>(null);
  const { toast } = useToast();
  const { data: pendingVerifications, isLoading: pendingLoading } = useGuideVerifications('pending');
  const { data: rejectedVerifications, isLoading: rejectedLoading } = useGuideVerifications('rejected');

  const handleSendToSlack = async (verificationId: string) => {
    setSendingSlack(verificationId);
    try {
      const { error } = await supabase.functions.invoke(
        'slack-verification-notification',
        {
          body: {
            verificationId,
            action: 'send'
          }
        }
      );

      if (error) throw error;

      toast({
        title: 'Notification Sent',
        description: 'Verification notification sent to Slack',
      });
    } catch (error: any) {
      console.error('Failed to send Slack notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to send notification to Slack',
        variant: 'destructive',
      });
    } finally {
      setSendingSlack(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="gap-1 bg-green-500"><CheckCircle2 className="h-3 w-3" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityLevel = (certifications: any[]) => {
    if (!certifications || certifications.length === 0) return 3;
    const priorities = certifications.map(cert => cert.verificationPriority || 3);
    return Math.min(...priorities);
  };

  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 1:
        return <Badge className="bg-purple-500">Priority 1 - 2h</Badge>;
      case 2:
        return <Badge className="bg-blue-500">Priority 2 - 24h</Badge>;
      default:
        return <Badge variant="secondary">Priority 3 - 3-5 days</Badge>;
    }
  };

  if (selectedVerification) {
    return (
      <GuideVerificationDetails
        verificationId={selectedVerification}
        onBack={() => setSelectedVerification(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Guide Verifications</h2>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Pending ({pendingVerifications?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedVerifications?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="verified">
            Verified Guides
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingLoading ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Loading verifications...</p>
              </CardContent>
            </Card>
          ) : !pendingVerifications || pendingVerifications.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">No pending verifications</p>
              </CardContent>
            </Card>
          ) : (
            pendingVerifications.map((verification) => {
              const priority = getPriorityLevel(verification.guide_profile?.certifications || []);
              return (
                <Card key={verification.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={verification.guide_profile?.profile_image_url} />
                          <AvatarFallback>
                            {verification.guide_profile?.display_name?.charAt(0) || 'G'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            {verification.guide_profile?.display_name || 'Unknown Guide'}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {verification.profile?.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(verification.verification_status)}
                        {getPriorityBadge(priority)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Company</p>
                        <p className="font-medium">{verification.company_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Experience</p>
                        <p className="font-medium">{verification.experience_years || 0} years</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Location</p>
                        <p className="font-medium">{verification.guide_profile?.location || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Certifications</p>
                        <p className="font-medium">
                          {verification.guide_profile?.certifications?.length || 0} submitted
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Submitted {formatDistanceToNow(new Date(verification.created_at))} ago
                      </div>
                      {verification.verification_documents && verification.verification_documents.length > 0 && (
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {verification.verification_documents.length} documents
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSendToSlack(verification.id)}
                        variant="outline"
                        disabled={sendingSlack === verification.id}
                      >
                        {sendingSlack === verification.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send to Slack
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => setSelectedVerification(verification.id)}
                        className="flex-1"
                      >
                        Review Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedLoading ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Loading rejected verifications...</p>
              </CardContent>
            </Card>
          ) : !rejectedVerifications || rejectedVerifications.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">No rejected verifications</p>
              </CardContent>
            </Card>
          ) : (
            rejectedVerifications.map((verification) => (
              <Card key={verification.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={verification.guide_profile?.profile_image_url} />
                        <AvatarFallback>
                          {verification.guide_profile?.display_name?.charAt(0) || 'G'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {verification.guide_profile?.display_name || 'Unknown Guide'}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {verification.profile?.email}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(verification.verification_status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {verification.admin_notes && (
                    <div className="bg-muted/50 p-3 rounded-md">
                      <p className="text-sm font-medium mb-1">Admin Notes:</p>
                      <p className="text-sm text-muted-foreground">{verification.admin_notes}</p>
                    </div>
                  )}
                  <Button
                    onClick={() => setSelectedVerification(verification.id)}
                    variant="outline"
                    className="w-full"
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="verified">
          <VerifiedGuidesArchive />
        </TabsContent>
      </Tabs>
    </div>
  );
}
