import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Mail, Lock } from 'lucide-react';

interface AccountStepProps {
  onVerified: (userId: string) => void;
}

export function AccountStep({ onVerified }: AccountStepProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [showVerification, setShowVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-verification-code', {
        body: { email }
      });

      if (error) throw error;

      setShowVerification(true);
      toast({ title: 'Verification code sent', description: 'Check your email' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setIsLoading(true);
    const verificationCode = code.join('');
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-code', {
        body: { email, code: verificationCode, name }
      });

      if (error) throw error;

      onVerified(data.user.id);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-burgundy" />
          {showVerification ? 'Verify Your Email' : 'Create Account'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showVerification ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button onClick={handleSendCode} disabled={isLoading || !email || !name} className="w-full">
              Continue
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label>Enter 6-digit code sent to {email}</Label>
              <div className="flex gap-2 justify-center">
                {code.map((digit, idx) => (
                  <Input
                    key={idx}
                    maxLength={1}
                    className="w-12 h-12 text-center text-lg"
                    value={digit}
                    onChange={(e) => {
                      const newCode = [...code];
                      newCode[idx] = e.target.value;
                      setCode(newCode);
                    }}
                  />
                ))}
              </div>
            </div>
            <Button onClick={handleVerifyCode} disabled={isLoading || code.some(d => !d)} className="w-full">
              Verify & Continue
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
