import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SendSlackNotificationParams {
  verificationId: string;
}

export function useSendSlackVerification() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ verificationId }: SendSlackNotificationParams) => {
      const { data, error } = await supabase.functions.invoke(
        'slack-verification-notification',
        {
          body: {
            verificationId,
            action: 'send',
          },
        }
      );

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Notification Sent',
        description: 'Verification notification sent to Slack',
      });
    },
    onError: (error: any) => {
      console.error('Failed to send Slack notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to send notification to Slack',
        variant: 'destructive',
      });
    },
  });
}
