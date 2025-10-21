import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Mail, Lock, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { z } from 'zod';

const passwordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be less than 72 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

interface AccountStepProps {
  onVerified: (userId: string) => void;
}

export function AccountStep({ onVerified }: AccountStepProps) {
  const [email, setEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [showVerification, setShowVerification] = useState(false);
  const [showPasswordStep, setShowPasswordStep] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: loginPassword
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

  const validatePassword = () => {
    try {
      passwordSchema.parse({ password: newPassword, confirmPassword });
      setPasswordErrors([]);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setPasswordErrors(error.errors.map(e => e.message));
      }
      return false;
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
      const { error } = await supabase.functions.invoke('verify-code', {
        body: { email, code: verificationCode, verifyOnly: true }
      });

      if (error) throw error;

      // Move to password step
      setShowVerification(false);
      setShowPasswordStep(true);
      toast({ title: 'Email verified!', description: 'Now create your password' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!validatePassword()) {
      toast({ 
        title: 'Invalid password', 
        description: 'Please fix the password errors',
        variant: 'destructive' 
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-code', {
        body: { 
          email, 
          code: code.join(''), 
          firstName, 
          lastName,
          password: newPassword,
          createAccount: true
        }
      });

      if (error) throw error;

      onVerified(data.user.id);
      toast({ title: 'Account created successfully!' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!newPassword) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (newPassword.length >= 8) strength++;
    if (/[A-Z]/.test(newPassword)) strength++;
    if (/[a-z]/.test(newPassword)) strength++;
    if (/[0-9]/.test(newPassword)) strength++;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength++;
    
    if (strength <= 2) return { strength, label: 'Weak', color: 'text-red-500' };
    if (strength <= 3) return { strength, label: 'Fair', color: 'text-yellow-500' };
    if (strength <= 4) return { strength, label: 'Good', color: 'text-blue-500' };
    return { strength, label: 'Strong', color: 'text-green-500' };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {showPasswordStep ? (
            <>
              <Lock className="w-5 h-5 text-burgundy" />
              Create Your Password
            </>
          ) : showVerification ? (
            <>
              <Mail className="w-5 h-5 text-burgundy" />
              Verify Your Email
            </>
          ) : (
            <>
              <Mail className="w-5 h-5 text-burgundy" />
              Account Required
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showPasswordStep ? (
          <>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Create a secure password for your account
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">Password</Label>
                <div className="relative">
                  <Input 
                    id="newPassword" 
                    type={showPassword ? "text" : "password"}
                    value={newPassword} 
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordErrors([]);
                    }}
                    placeholder="Enter your password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newPassword && (
                  <div className="flex items-center gap-2 text-sm">
                    <span>Strength:</span>
                    <span className={`font-medium ${getPasswordStrength().color}`}>
                      {getPasswordStrength().label}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input 
                    id="confirmPassword" 
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword} 
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordErrors([]);
                    }}
                    placeholder="Confirm your password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {passwordErrors.length > 0 && (
                <div className="space-y-1">
                  {passwordErrors.map((error, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-destructive">
                      <XCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="font-medium">Password must contain:</p>
                <div className="flex items-center gap-2">
                  {newPassword.length >= 8 ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span>At least 8 characters</span>
                </div>
                <div className="flex items-center gap-2">
                  {/[A-Z]/.test(newPassword) ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span>One uppercase letter</span>
                </div>
                <div className="flex items-center gap-2">
                  {/[a-z]/.test(newPassword) ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span>One lowercase letter</span>
                </div>
                <div className="flex items-center gap-2">
                  {/[0-9]/.test(newPassword) ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span>One number</span>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleCreateAccount} 
              disabled={isLoading || !newPassword || !confirmPassword} 
              className="w-full"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => {
                setShowPasswordStep(false);
                setShowVerification(true);
              }} 
              className="w-full"
            >
              Back
            </Button>
          </>
        ) : !showVerification ? (
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
                  value={loginPassword} 
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>
              <Button 
                onClick={handleLogin} 
                disabled={isLoading || !email || !loginPassword} 
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
