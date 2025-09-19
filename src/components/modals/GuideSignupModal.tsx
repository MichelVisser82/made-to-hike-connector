import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';

interface GuideSignupModalProps {
  onClose: () => void;
  onSignup: (user: any) => void;
}

export function GuideSignupModal({ onClose, onSignup }: GuideSignupModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    license: '',
    experience: '',
    insurance: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.name || !formData.email || !formData.password || !formData.company || !formData.license) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    if (!formData.experience || parseInt(formData.experience) < 0) {
      setError('Please enter a valid number of years of experience.');
      setLoading(false);
      return;
    }

    try {
      console.log('Starting guide signup process...');

      // Call our custom signup function with guide metadata
      const { data, error } = await supabase.functions.invoke('custom-signup', {
        body: {
          email: formData.email,
          password: formData.password,
          metadata: {
            name: formData.name,
            role: 'guide',
            company_name: formData.company,
            license_number: formData.license,
            insurance_info: formData.insurance,
            experience_years: parseInt(formData.experience)
          }
        }
      });

      if (error) {
        console.error('Guide signup error:', error);
        throw new Error(error.message || 'Signup failed');
      }

      console.log('Guide signup successful:', data);
      toast.success('Guide application submitted! Please check your email to verify your account.');
      onSignup(null); // Just signal successful signup
      onClose();
    } catch (err: any) {
      console.error('Guide signup failed:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1 hover:bg-muted rounded-full"
          >
            <X className="h-4 w-4" />
          </button>
          <CardTitle>Become a Guide</CardTitle>
          <CardDescription>
            Join our network of certified mountain guides and share your passion for hiking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guide-name">Full Name</Label>
                <Input
                  id="guide-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  placeholder="Your full name"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="guide-email">Email</Label>
                <Input
                  id="guide-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  placeholder="Your email"
                  disabled={loading}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="guide-password">Password</Label>
              <Input
                id="guide-password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                placeholder="Minimum 6 characters"
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="company">Company/Business Name</Label>
              <Input
                id="company"
                type="text"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                required
                placeholder="Your guiding business name"
                disabled={loading}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="license">Guide License Number</Label>
                <Input
                  id="license"
                  type="text"
                  value={formData.license}
                  onChange={(e) => handleChange('license', e.target.value)}
                  required
                  placeholder="License #"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  value={formData.experience}
                  onChange={(e) => handleChange('experience', e.target.value)}
                  required
                  placeholder="Years"
                  disabled={loading}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="insurance">Insurance Information</Label>
              <Textarea
                id="insurance"
                value={formData.insurance}
                onChange={(e) => handleChange('insurance', e.target.value)}
                required
                placeholder="Professional liability and public liability insurance details"
                rows={3}
                disabled={loading}
              />
            </div>
            
            <div className="bg-muted/30 p-4 rounded-lg text-sm">
              <p className="text-muted-foreground">
                By submitting this application, you agree to our verification process. 
                We'll review your credentials and contact you within 2-3 business days.
              </p>
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Application
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}