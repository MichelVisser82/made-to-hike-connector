import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { X } from 'lucide-react';
import { type User } from '../../types';

interface HikerRegistrationModalProps {
  onClose: () => void;
  onRegister: (user: User) => void;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock hiker registration - in real app this would use Supabase auth
    const mockHiker: User = {
      id: 'hiker-' + Date.now(),
      email: formData.email,
      name: formData.name,
      role: 'hiker',
      verified: true,
      verification_status: 'approved'
    };
    
    onRegister(mockHiker);
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
                placeholder="Create a password"
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
                />
              </div>
            </div>
            
            <div className="bg-muted/30 p-4 rounded-lg text-sm">
              <p className="text-muted-foreground">
                By creating an account, you agree to our Terms of Service and Privacy Policy. 
                Emergency contact information is required for all hiking tours.
              </p>
            </div>
            
            <Button type="submit" className="w-full">
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