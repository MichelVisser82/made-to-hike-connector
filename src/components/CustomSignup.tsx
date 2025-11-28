import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Eye, EyeOff, Mail, Lock, CheckCircle2 } from 'lucide-react';
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

export const CustomSignup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const referralCode = searchParams.get('ref');
  
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showPasswordStep, setShowPasswordStep] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const validatePassword = () => {
    try {
      passwordSchema.parse({ password, confirmPassword });
      setPasswordErrors([]);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setPasswordErrors(error.errors.map(e => e.message));
      }
      return false;
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !firstName || !lastName) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-verification-code', {
        body: { email }
      });

      if (error) throw error;

      setShowVerification(true);
      toast({ 
        title: 'Verification code sent', 
        description: 'Check your email for the 6-digit code' 
      });
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to send verification code';
      
      if (errorMsg.includes('already registered')) {
        toast({ 
          title: 'Account exists', 
          description: 'This email is already registered. Please log in instead.',
          variant: 'destructive' 
        });
      } else {
        toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter the 6-digit verification code',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('verify-code', {
        body: { email, code, verifyOnly: true }
      });

      if (error) throw error;

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
          code, 
          firstName, 
          lastName,
          password,
          createAccount: true
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to create account');
      }

      if (data?.error) {
        if (data.error.includes('already registered')) {
          toast({ 
            title: 'Account already exists', 
            description: 'Please log in with your credentials instead.',
            variant: 'destructive' 
          });
          navigate('/auth?mode=signin');
          return;
        }
        throw new Error(data.error);
      }

      // Sign in with the new account
      if (data?.shouldSignIn) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (signInError) {
          toast({ 
            title: 'Account created', 
            description: 'Please log in with your new credentials',
          });
          navigate('/auth?mode=signin');
          return;
        }
        
        if (signInData.user) {
          toast({ title: 'Account created successfully!', description: 'Welcome to MadeToHike!' });
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to create account',
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return { strength, label: 'Weak', color: 'text-red-500' };
    if (strength <= 3) return { strength, label: 'Fair', color: 'text-yellow-500' };
    if (strength <= 4) return { strength, label: 'Good', color: 'text-blue-500' };
    return { strength, label: 'Strong', color: 'text-green-500' };
  };

  return (
    <Card className="max-w-md mx-auto border-0 shadow-lg bg-cream/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-bold text-burgundy" style={{fontFamily: 'Playfair Display, serif'}}>
          {showPasswordStep ? (
            <>
              <Lock className="w-5 h-5" />
              Create Your Password
            </>
          ) : showVerification ? (
            <>
              <Mail className="w-5 h-5" />
              Verify Your Email
            </>
          ) : (
            <>
              🏔️ Join MadeToHike
            </>
          )}
        </CardTitle>
        <CardDescription>
          {showPasswordStep 
            ? 'Create a secure password for your account'
            : showVerification 
            ? 'Enter the 6-digit code sent to your email'
            : 'Create your account to start your hiking adventure'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showPasswordStep ? (
          // Password Step
          <>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  value={password} 
                  onChange={(e) => {
                    setPassword(e.target.value);
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
              {password && (
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
              <Alert variant="destructive">
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {passwordErrors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Password Requirements:</h4>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${password.length >= 8 ? 'text-green-500' : 'text-gray-300'}`} />
                  At least 8 characters
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${/[A-Z]/.test(password) ? 'text-green-500' : 'text-gray-300'}`} />
                  One uppercase letter
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${/[a-z]/.test(password) ? 'text-green-500' : 'text-gray-300'}`} />
                  One lowercase letter
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${/[0-9]/.test(password) ? 'text-green-500' : 'text-gray-300'}`} />
                  One number
                </li>
              </ul>
            </div>

            <Button 
              onClick={handleCreateAccount}
              disabled={isLoading}
              className="w-full bg-burgundy hover:bg-burgundy/90 text-white"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </>
        ) : showVerification ? (
          // Verification Step
          <>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                We've sent a 6-digit verification code to <span className="font-semibold">{email}</span>
              </p>
              
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={(value) => setCode(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button 
                onClick={handleVerifyCode}
                disabled={isLoading || code.length !== 6}
                className="w-full bg-burgundy hover:bg-burgundy/90 text-white"
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </Button>

              <Button
                variant="ghost"
                onClick={() => setShowVerification(false)}
                className="w-full"
              >
                Back
              </Button>
            </div>
          </>
        ) : (
          // Initial Signup Form
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
              />
            </div>

            {referralCode && (
              <Alert className="bg-sage/10 border-sage">
                <AlertDescription className="text-sm">
                  🎁 You're joining with a referral! You'll receive special benefits.
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-burgundy hover:bg-burgundy/90 text-white" 
              disabled={isLoading}
            >
              {isLoading ? 'Sending Code...' : 'Continue'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};