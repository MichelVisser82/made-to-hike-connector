import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const CustomSignup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== FORM SUBMITTED ===');
    console.log('Form data:', formData);
    setIsLoading(true);

    try {
      console.log('Starting custom signup process...');

      // Call our custom signup function
      const { data, error } = await supabase.functions.invoke('custom-signup', {
        body: {
          email: formData.email,
          password: formData.password,
          metadata: {
            name: formData.name,
            phone: formData.phone,
            role: 'hiker'
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        throw new Error(error.message || 'Signup failed');
      }

      console.log('Signup successful:', data);
      setSuccess(true);
      toast({
        title: 'Account Created!',
        description: 'Please check your email to verify your account.',
      });

    } catch (error: any) {
      console.error('Signup failed:', error);
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
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>🏔️ Check Your Email</CardTitle>
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
            className="w-full mt-4"
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
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>🏔️ Join MadeToHike</CardTitle>
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
            />
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
            />
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
            />
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
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};