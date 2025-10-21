import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Mail, Lock } from 'lucide-react';

interface AccountStepProps {
  onVerified: (userId: string) => void;
}

export function AccountStep({ onVerified }: AccountStepProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [showVerification, setShowVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        onVerified(data.user.id);
        toast({ title: 'Logged in successfully' });
      }
    } catch (error: any) {
      toast({ 
        title: 'Login failed', 
        description: error.message || 'Invalid email or password',
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      const errorMsg = error.message || 'Failed to send verification code';
      
      // If email already exists, suggest login
      if (errorMsg.includes('already registered')) {
        toast({ 
          title: 'Account exists', 
          description: 'This email is already registered. Please log in instead.',
          variant: 'destructive' 
        });
        setActiveTab('login');
      } else {
        toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setIsLoading(true);
    const verificationCode = code.join('');
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-code', {
        body: { email, code: verificationCode, firstName, lastName }
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
          {showVerification ? 'Verify Your Email' : 'Account Required'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showVerification ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input 
                  id="login-email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>
              <Button 
                onClick={handleLogin} 
                disabled={isLoading || !email || !password} 
                className="w-full"
              >
                {isLoading ? 'Logging in...' : 'Log In'}
              </Button>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input 
                  id="signup-email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <Button 
                onClick={handleSendCode} 
                disabled={isLoading || !email || !firstName || !lastName} 
                className="w-full"
              >
                {isLoading ? 'Sending code...' : 'Continue'}
              </Button>
            </TabsContent>
          </Tabs>
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
                      
                      // Auto-focus next input
                      if (e.target.value && idx < 5) {
                        const nextInput = document.querySelector(
                          `input[maxlength="1"]:nth-child(${idx + 2})`
                        ) as HTMLInputElement;
                        nextInput?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      // Auto-focus previous input on backspace
                      if (e.key === 'Backspace' && !code[idx] && idx > 0) {
                        const prevInput = document.querySelector(
                          `input[maxlength="1"]:nth-child(${idx})`
                        ) as HTMLInputElement;
                        prevInput?.focus();
                      }
                    }}
                  />
                ))}
              </div>
            </div>
            <Button onClick={handleVerifyCode} disabled={isLoading || code.some(d => !d)} className="w-full">
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </Button>
            <Button variant="ghost" onClick={() => setShowVerification(false)} className="w-full">
              Back
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
