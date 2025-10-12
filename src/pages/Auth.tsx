import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CustomSignup } from '@/components/CustomSignup';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const Auth = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'signup';
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    email: mode === 'admin' ? 'michel@madetohike.com' : mode === 'guide' ? 'guide@madetohike.com' : '', 
    password: '' 
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const toggleMode = () => {
    const newMode = mode === 'signup' ? 'signin' : 'signup';
    setSearchParams({ mode: newMode });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          toast({
            title: 'Email Not Verified',
            description: 'Please check your email and click the verification link before signing in.',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
        return;
      }

      if (data.user) {
        toast({
          title: 'Welcome back!',
          description: 'You have successfully signed in.',
        });
        // Redirect to dashboard instead of landing page
        window.location.href = '/';
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: 'Sign In Failed',
        description: error.message || 'Invalid email or password',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (mode === 'admin') {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Card className="border-primary/20 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-primary">🔐 Admin Access</CardTitle>
              <CardDescription>
                Administrative portal for MadeToHike
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input
                    id="admin-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password">Admin Password</Label>
                  <Input
                    id="admin-password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter admin password"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Authenticating...' : 'Access Admin Panel'}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <div className="text-center">
            <Button variant="link" onClick={() => navigate('/')}>
              Back to Main Site
            </Button>
          </div>
        </div>
        </div>
      </MainLayout>
    );
  }

  if (mode === 'guide') {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Card className="border-green-600/20 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-green-600">🥾 Guide Access</CardTitle>
              <CardDescription>
                Quick access portal for verified guides
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="guide-email">Guide Email</Label>
                  <Input
                    id="guide-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guide-password">Guide Password</Label>
                  <Input
                    id="guide-password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter guide password"
                  />
                </div>

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                  {isLoading ? 'Authenticating...' : 'Access Guide Dashboard'}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <div className="text-center">
            <Button variant="link" onClick={() => navigate('/')}>
              Back to Main Site
            </Button>
          </div>
        </div>
        </div>
      </MainLayout>
    );
  }


  if (mode === 'signup') {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <CustomSignup />
          <div className="text-center">
            <Button variant="link" onClick={toggleMode}>
              Already have an account? Sign in
            </Button>
          </div>
        </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>🏔️ Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your MadeToHike account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="text-center">
          <Button variant="link" onClick={toggleMode}>
            Don't have an account? Sign up
          </Button>
        </div>
      </div>
      </div>
    </MainLayout>
  );
};