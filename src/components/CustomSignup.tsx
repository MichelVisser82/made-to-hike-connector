import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { userSignupSchema, type UserSignupData } from '@/lib/validationSchemas';

export const CustomSignup = () => {
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
  });
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof UserSignupData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation error for this field
    if (validationErrors[name as keyof UserSignupData]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setIsLoading(true);

    // Validate with Zod
    const result = userSignupSchema.safeParse(formData);
    
    if (!result.success) {
      const errors: Partial<Record<keyof UserSignupData, string>> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as keyof UserSignupData] = err.message;
        }
      });
      setValidationErrors(errors);
      toast({
        title: 'Validation Error',
        description: 'Please check the form for errors.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      // Call our custom signup function with validated data
      const { data, error } = await supabase.functions.invoke('custom-signup', {
        body: {
          email: result.data.email,
          password: result.data.password,
          metadata: {
            name: result.data.name,
            phone: result.data.phone,
            role: 'hiker',
            referral_code: referralCode || undefined
          }
        }
      });

      if (error) {
        throw new Error(error.message || 'Signup failed');
      }

      setSuccess(true);
      toast({
        title: 'Account Created!',
        description: 'Please check your email to verify your account.',
      });

    } catch (error: any) {
      // SECURITY: Don't log full error details that might contain PII
      toast({
        title: 'Signup Failed',
        description: error.message || 'An error occurred during signup',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="max-w-md mx-auto border-0 shadow-lg bg-cream/80">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-burgundy" style={{fontFamily: 'Playfair Display, serif'}}>
            🏔️ Check Your Email
          </CardTitle>
          <CardDescription>
            We've sent a verification link to your email address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Please check your email and click the verification link to activate your account.
              Don't forget to check your spam folder!
            </AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            className="w-full mt-4 border-burgundy text-burgundy hover:bg-burgundy/5"
            onClick={() => {
              setSuccess(false);
              setFormData({ email: '', password: '', name: '', phone: '' });
            }}
          >
            Sign Up Another Account
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto border-0 shadow-lg bg-cream/80">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-burgundy" style={{fontFamily: 'Playfair Display, serif'}}>
          🏔️ Join MadeToHike
        </CardTitle>
        <CardDescription>
          Create your account to start your hiking adventure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter your full name"
              className={validationErrors.name ? 'border-destructive' : ''}
            />
            {validationErrors.name && (
              <p className="text-sm text-destructive">{validationErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email"
              className={validationErrors.email ? 'border-destructive' : ''}
            />
            {validationErrors.email && (
              <p className="text-sm text-destructive">{validationErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Enter your password"
              minLength={6}
              className={validationErrors.password ? 'border-destructive' : ''}
            />
            {validationErrors.password && (
              <p className="text-sm text-destructive">{validationErrors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
              className={validationErrors.phone ? 'border-destructive' : ''}
            />
            {validationErrors.phone && (
              <p className="text-sm text-destructive">{validationErrors.phone}</p>
            )}
          </div>

          <Button type="submit" className="w-full bg-burgundy hover:bg-burgundy/90 text-white" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};