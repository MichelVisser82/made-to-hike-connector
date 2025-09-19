import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { X, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

interface HikerRegistrationModalProps {
  onClose: () => void;
  onRegister: (user: any) => void;
  tourTitle: string;
}

export function HikerRegistrationModal({ onClose, onRegister, tourTitle }: HikerRegistrationModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    emergency_contact: '',
    emergency_phone: ''
  });
  const [error, setError] = useState('');
  const { signUp, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.emergency_contact || !formData.emergency_phone) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      const { error } = await signUp(formData.email, formData.password, {
        name: formData.name,
        role: 'hiker',
        phone: formData.phone,
        emergency_contact: formData.emergency_contact,
        emergency_phone: formData.emergency_phone
      });

      if (error) {
        setError(error);
        return;
      }

      toast.success('Account created! Please check your email to verify your account.');
      onRegister(null); // Just signal successful signup
      onClose();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1 hover:bg-muted rounded-full"
          >
            <X className="h-4 w-4" />
          </button>
          <CardTitle>Complete Your Booking</CardTitle>
          <CardDescription>
            Create your account to book: {tourTitle}
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
                <Label htmlFor="hiker-name">Full Name</Label>
                <Input
                  id="hiker-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  placeholder="Your full name"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="hiker-email">Email</Label>
                <Input
                  id="hiker-email"
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
              <Label htmlFor="hiker-password">Password</Label>
              <Input
                id="hiker-password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                placeholder="Minimum 6 characters"
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                required
                placeholder="Your phone number"
                disabled={loading}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergency-contact">Emergency Contact</Label>
                <Input
                  id="emergency-contact"
                  type="text"
                  value={formData.emergency_contact}
                  onChange={(e) => handleChange('emergency_contact', e.target.value)}
                  required
                  placeholder="Contact name"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="emergency-phone">Emergency Phone</Label>
                <Input
                  id="emergency-phone"
                  type="tel"
                  value={formData.emergency_phone}
                  onChange={(e) => handleChange('emergency_phone', e.target.value)}
                  required
                  placeholder="Contact phone"
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="bg-muted/30 p-4 rounded-lg text-sm">
              <p className="text-muted-foreground">
                By creating an account, you agree to our Terms of Service and Privacy Policy. 
                Emergency contact information is required for all hiking tours.
              </p>
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account & Continue
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Already have an account?</span>
            <button className="ml-1 text-primary hover:underline">
              Sign in instead
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}