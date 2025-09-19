import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const EmailTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const { toast } = useToast();

  const sendTestEmail = async () => {
    setIsLoading(true);
    setResult('Sending email...');
    
    try {
      console.log('Attempting to send test email...');
      
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'welcome',
          to: 'vissermich@gmail.com',
          subject: 'Test Email from MadeToHike! 🏔️',
          template_data: {
            user_name: 'Mich',
            first_tour_discount: '15'
          }
        }
      });

      console.log('Response:', { data, error });

      if (error) {
        console.error('Error sending email:', error);
        setResult(`Error: ${error.message}`);
        toast({
          title: 'Email Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        console.log('Email sent successfully:', data);
        setResult(`Email sent successfully! Check vissermich@gmail.com`);
        toast({
          title: 'Email Sent!',
          description: 'Check vissermich@gmail.com for the test email',
        });
      }
    } catch (err: any) {
      console.error('Catch error:', err);
      setResult(`Error: ${err.message}`);
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>🏔️ MadeToHike Email Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={sendTestEmail} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Sending...' : 'Send Test Email to vissermich@gmail.com'}
        </Button>
        
        {result && (
          <div className="p-3 bg-gray-100 rounded text-sm">
            {result}
          </div>
        )}
      </CardContent>
    </Card>
  );
};