import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GuideSignupData } from '@/types/guide';
import { sanitizeSlug } from '@/utils/slugValidation';

interface Step02BasicInfoProps {
  data: Partial<GuideSignupData>;
  updateData: (data: Partial<GuideSignupData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step02BasicInfo({ data, updateData, onNext, onBack }: Step02BasicInfoProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateData({ profile_image: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.display_name?.trim()) newErrors.display_name = 'Name is required';
    if (!data.email?.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) newErrors.email = 'Invalid email format';
    if (!data.password) newErrors.password = 'Password is required';
    else if (data.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!data.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-serif text-charcoal" style={{fontFamily: 'Playfair Display, serif'}}>Basic Information</CardTitle>
          <p className="text-muted-foreground">Let's start with your essential details</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Photo */}
          <div>
            <Label>Profile Photo</Label>
            <div className="mt-2 flex items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="profile-image"
                />
                <Label htmlFor="profile-image" className="cursor-pointer">
                  <Button type="button" variant="outline" asChild>
                    <span>Upload Photo</span>
                  </Button>
                </Label>
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="display_name">Full Name *</Label>
            <Input
              id="display_name"
              value={data.display_name || ''}
              onChange={(e) => updateData({ display_name: e.target.value })}
              placeholder="e.g., Sarah Mountain"
            />
            {errors.display_name && <p className="text-sm text-destructive mt-1">{errors.display_name}</p>}
          </div>

          {/* Custom Slug (Optional) */}
          <div>
            <Label htmlFor="slug">Custom Profile URL (Optional)</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">madetohike.com/</span>
              <Input
                id="slug"
                value={data.slug || ''}
                onChange={(e) => updateData({ slug: sanitizeSlug(e.target.value) })}
                placeholder="johnsmith"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Leave blank to auto-generate from your name. Letters, numbers, and hyphens only.
            </p>
            {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug}</p>}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={data.email || ''}
              onChange={(e) => updateData({ email: e.target.value })}
              placeholder="your@email.com"
            />
            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={data.password || ''}
              onChange={(e) => updateData({ password: e.target.value })}
              placeholder="Minimum 8 characters"
            />
            {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
          </div>

          {/* Years of Experience */}
          <div>
            <Label htmlFor="experience_years">Years of Guiding Experience *</Label>
            <Input
              id="experience_years"
              type="number"
              min="0"
              max="50"
              value={data.experience_years ?? ''}
              onChange={(e) => updateData({ experience_years: e.target.value === '' ? undefined : parseInt(e.target.value) || undefined })}
              placeholder="e.g., 5"
            />
            {errors.experience_years && <p className="text-sm text-destructive mt-1">{errors.experience_years}</p>}
          </div>

          {/* Date of Birth */}
          <div>
            <Label htmlFor="dob">Date of Birth *</Label>
            <Input
              id="dob"
              type="date"
              value={data.date_of_birth || ''}
              onChange={(e) => updateData({ date_of_birth: e.target.value })}
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
              className="border-burgundy/20 focus:border-burgundy focus:ring-burgundy/20"
            />
            <p className="text-xs text-muted-foreground mt-1">Required by Stripe (must be 18+)</p>
            {errors.date_of_birth && <p className="text-sm text-destructive mt-1">{errors.date_of_birth}</p>}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack} className="border-burgundy text-burgundy hover:bg-burgundy/10">Back</Button>
            <Button onClick={handleNext} className="bg-burgundy hover:bg-burgundy/90 text-white">Continue</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
