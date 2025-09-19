import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { X } from 'lucide-react';
import { type User } from '../../types';

interface GuideSignupModalProps {
  onClose: () => void;
  onSignup: (user: User) => void;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock guide registration - in real app this would use Supabase auth
    const mockGuide: User = {
      id: 'guide-' + Date.now(),
      email: formData.email,
      name: formData.name,
      role: 'guide',
      verified: false,
      verification_status: 'pending',
      business_info: {
        company_name: formData.company,
        license_number: formData.license,
        insurance_info: formData.insurance,
        experience_years: parseInt(formData.experience) || 0
      }
    };
    
    onSignup(mockGuide);
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
                placeholder="Create a password"
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
              />
            </div>
            
            <div className="bg-muted/30 p-4 rounded-lg text-sm">
              <p className="text-muted-foreground">
                By submitting this application, you agree to our verification process. 
                We'll review your credentials and contact you within 2-3 business days.
              </p>
            </div>
            
            <Button type="submit" className="w-full">
              Submit Application
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}