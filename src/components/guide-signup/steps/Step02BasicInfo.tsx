import { useState } from 'react';
import { Upload, Mail, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { GuideSignupData } from '@/types/guide';
import { sanitizeSlug } from '@/utils/slugValidation';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
interface Step02BasicInfoProps {
  data: Partial<GuideSignupData>;
  updateData: (data: Partial<GuideSignupData>) => void;
  onNext: () => void;
  onBack: () => void;
}
export function Step02BasicInfo({
  data,
  updateData,
  onNext,
  onBack
}: Step02BasicInfoProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [verificationCode, setVerificationCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const { toast } = useToast();
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateData({
        profile_image: file
      });
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
  const handleSendVerificationCode = async () => {
    if (!data.email?.trim()) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address first',
        variant: 'destructive',
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setIsSendingCode(true);
    try {
      const { error } = await supabase.functions.invoke('send-verification-code', {
        body: { email: data.email }
      });

      if (error) throw error;

      setCodeSent(true);
      toast({
        title: 'Code Sent!',
        description: 'Check your email for the verification code',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to Send Code',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter the 6-digit code',
        variant: 'destructive',
      });
      return;
    }

    setIsVerifyingCode(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('verify-code', {
        body: { 
          email: data.email,
          code: verificationCode,
          verifyOnly: true
        }
      });

      if (error) throw error;

      if (result.verified) {
        setIsEmailVerified(true);
        toast({
          title: 'Email Verified!',
          description: 'You can now continue with your application',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: error.message || 'Invalid or expired code',
        variant: 'destructive',
      });
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!data.first_name?.trim()) newErrors.first_name = 'First name is required';
    if (!data.last_name?.trim()) newErrors.last_name = 'Last name is required';
    if (!data.email?.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) newErrors.email = 'Invalid email format';
    if (!isEmailVerified) newErrors.email_verification = 'Please verify your email address';
    if (!data.password) newErrors.password = 'Password is required';
    else if (data.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!data.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };
  return <div className="max-w-2xl mx-auto">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-serif text-charcoal" style={{
          fontFamily: 'Playfair Display, serif'
        }}>Basic Information</CardTitle>
          <p className="text-muted-foreground">Let's start with your essential details</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Photo */}
          <div>
            <Label>Profile Photo</Label>
            <div className="mt-2 flex items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover" /> : <Upload className="w-8 h-8 text-muted-foreground" />}
              </div>
              <div>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="profile-image" />
                <Label htmlFor="profile-image" className="cursor-pointer">
                  <Button type="button" variant="outline" asChild>
                    <span>Upload Photo</span>
                  </Button>
                </Label>
              </div>
            </div>
          </div>

          {/* First Name and Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name *</Label>
              <Input 
                id="first_name" 
                value={data.first_name || ''} 
                onChange={e => {
                  const firstName = e.target.value;
                  updateData({
                    first_name: firstName,
                    display_name: `${firstName} ${data.last_name || ''}`.trim()
                  });
                }} 
                placeholder="Sarah" 
              />
              {errors.first_name && <p className="text-sm text-destructive mt-1">{errors.first_name}</p>}
            </div>
            <div>
              <Label htmlFor="last_name">Last Name *</Label>
              <Input 
                id="last_name" 
                value={data.last_name || ''} 
                onChange={e => {
                  const lastName = e.target.value;
                  updateData({
                    last_name: lastName,
                    display_name: `${data.first_name || ''} ${lastName}`.trim()
                  });
                }} 
                placeholder="Mountain" 
              />
              {errors.last_name && <p className="text-sm text-destructive mt-1">{errors.last_name}</p>}
            </div>
          </div>

          {/* Custom Slug (Optional) */}
          <div>
            <Label htmlFor="slug">Custom Profile URL (Optional)</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">madetohike.com/</span>
              <Input id="slug" value={data.slug || ''} onChange={e => updateData({
              slug: sanitizeSlug(e.target.value)
            })} placeholder="johnsmith" className="flex-1" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Leave blank to auto-generate from your name. Letters, numbers, and hyphens only.
            </p>
            {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug}</p>}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <div className="flex gap-2">
              <Input 
                id="email" 
                type="email" 
                value={data.email || ''} 
                onChange={e => {
                  updateData({ email: e.target.value });
                  setCodeSent(false);
                  setIsEmailVerified(false);
                }} 
                placeholder="your@email.com"
                disabled={isEmailVerified}
                className={isEmailVerified ? 'bg-green-50 border-green-500' : ''}
              />
              {!isEmailVerified && (
                <Button
                  type="button"
                  onClick={handleSendVerificationCode}
                  disabled={isSendingCode || !data.email}
                  variant="outline"
                  className="whitespace-nowrap"
                >
                  {isSendingCode ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : codeSent ? (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Resend Code
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Code
                    </>
                  )}
                </Button>
              )}
              {isEmailVerified && (
                <Button
                  type="button"
                  disabled
                  className="bg-green-600 hover:bg-green-600"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Verified
                </Button>
              )}
            </div>
            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
          </div>

          {/* Verification Code Input */}
          {codeSent && !isEmailVerified && (
            <div>
              <Alert className="mb-4">
                <AlertDescription>
                  We've sent a 6-digit verification code to <strong>{data.email}</strong>. Please check your email and enter the code below.
                </AlertDescription>
              </Alert>
              <Label htmlFor="verification_code">Verification Code *</Label>
              <div className="flex gap-2">
                <Input
                  id="verification_code"
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="text-center text-2xl tracking-widest"
                />
                <Button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={isVerifyingCode || verificationCode.length !== 6}
                  className="bg-burgundy hover:bg-burgundy/90"
                >
                  {isVerifyingCode ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify'
                  )}
                </Button>
              </div>
            </div>
          )}

          {isEmailVerified && (
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Email verified successfully! You can now continue with your application.
              </AlertDescription>
            </Alert>
          )}

          {errors.email_verification && !isEmailVerified && (
            <Alert variant="destructive">
              <AlertDescription>{errors.email_verification}</AlertDescription>
            </Alert>
          )}

          {/* Password */}
          <div>
            <Label htmlFor="password">Password *</Label>
            <Input id="password" type="password" value={data.password || ''} onChange={e => updateData({
            password: e.target.value
          })} placeholder="Minimum 8 characters" />
            {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
          </div>

          {/* Years of Experience */}
          <div>
            <Label htmlFor="experience_years">Years of Guiding Experience *</Label>
            <Input id="experience_years" type="number" min="0" max="50" value={data.experience_years ?? ''} onChange={e => updateData({
            experience_years: e.target.value === '' ? undefined : parseInt(e.target.value) || undefined
          })} placeholder="e.g., 5" />
            {errors.experience_years && <p className="text-sm text-destructive mt-1">{errors.experience_years}</p>}
          </div>

          {/* Date of Birth */}
          <div>
            <Label htmlFor="dob">Date of Birth *</Label>
            <Input id="dob" type="date" value={data.date_of_birth || ''} onChange={e => updateData({
            date_of_birth: e.target.value
          })} max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]} className="border-burgundy/20 focus:border-burgundy focus:ring-burgundy/20" />
            <p className="text-xs text-muted-foreground mt-1">Guides must be 18+</p>
            {errors.date_of_birth && <p className="text-sm text-destructive mt-1">{errors.date_of_birth}</p>}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack} className="border-burgundy text-burgundy hover:bg-burgundy/10">Back</Button>
            <Button onClick={handleNext} className="bg-burgundy hover:bg-burgundy/90 text-white">Continue</Button>
          </div>
        </CardContent>
      </Card>
    </div>;
}