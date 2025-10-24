import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Loader2, User, Heart, Shield, Phone, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface HikerProfile {
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  country: string;
  hiking_experience: string;
  medical_conditions: string;
  dietary_preferences: string[];
  accessibility_needs: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
}

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut Allergy',
  'Halal',
  'Kosher',
  'Other'
];

const HIKING_EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner - New to hiking' },
  { value: 'intermediate', label: 'Intermediate - Regular hiker' },
  { value: 'advanced', label: 'Advanced - Experienced hiker' },
  { value: 'expert', label: 'Expert - Professional level' }
];

export function HikerProfileEditForm() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profile, setProfile] = useState<HikerProfile>({
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    country: '',
    hiking_experience: 'beginner',
    medical_conditions: '',
    dietary_preferences: [],
    accessibility_needs: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        // Safely parse dietary preferences from JSON
        const dietaryPrefs = Array.isArray(data.dietary_preferences) 
          ? (data.dietary_preferences as string[])
          : [];

        setProfile({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          date_of_birth: data.date_of_birth || '',
          country: data.country || '',
          hiking_experience: data.hiking_experience || 'beginner',
          medical_conditions: data.medical_conditions || '',
          dietary_preferences: dietaryPrefs,
          accessibility_needs: data.accessibility_needs || '',
          emergency_contact_name: data.emergency_contact_name || '',
          emergency_contact_phone: data.emergency_contact_phone || '',
          emergency_contact_relationship: data.emergency_contact_relationship || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          phone: profile.phone,
          date_of_birth: profile.date_of_birth || null,
          country: profile.country,
          hiking_experience: profile.hiking_experience,
          medical_conditions: profile.medical_conditions,
          dietary_preferences: profile.dietary_preferences,
          accessibility_needs: profile.accessibility_needs,
          emergency_contact_name: profile.emergency_contact_name,
          emergency_contact_phone: profile.emergency_contact_phone,
          emergency_contact_relationship: profile.emergency_contact_relationship,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const toggleDietaryPreference = (preference: string) => {
    setProfile(prev => ({
      ...prev,
      dietary_preferences: prev.dietary_preferences.includes(preference)
        ? prev.dietary_preferences.filter(p => p !== preference)
        : [...prev.dietary_preferences, preference]
    }));
  };

  const handleEmailChange = async () => {
    if (!newEmail) {
      toast.error('Please enter a new email address');
      return;
    }

    if (newEmail === profile.email) {
      toast.error('New email must be different from current email');
      return;
    }

    try {
      setUpdatingEmail(true);
      const { error } = await supabase.auth.updateUser({ email: newEmail });

      if (error) throw error;

      toast.success('Confirmation email sent! Please check your inbox to verify your new email.');
      setNewEmail('');
    } catch (error: any) {
      console.error('Error updating email:', error);
      toast.error(error.message || 'Failed to update email');
    } finally {
      setUpdatingEmail(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (currentPassword === newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    try {
      setUpdatingPassword(true);

      // First, verify the current password by attempting to sign in
      if (!profile.email) {
        throw new Error('Email not found');
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: currentPassword
      });

      if (signInError) {
        throw new Error('Current password is incorrect');
      }

      // If verification succeeds, update to new password
      const { error: updateError } = await supabase.auth.updateUser({ 
        password: newPassword 
      });

      if (updateError) throw updateError;

      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error(error.message || 'Failed to update password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-burgundy" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-playfair font-bold text-charcoal">Profile Settings</h1>
        <p className="text-charcoal/60 mt-2">
          Manage your personal information and preferences
        </p>
      </div>

      {/* Basic Information */}
      <Card className="border-burgundy/10 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-playfair text-charcoal flex items-center gap-2">
            <User className="h-5 w-5 text-burgundy" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Your personal details used for bookings and communications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="John Doe"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+1 234 567 8900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={profile.date_of_birth}
                onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={profile.country}
              onChange={(e) => setProfile({ ...profile, country: e.target.value })}
              placeholder="United States"
            />
          </div>
        </CardContent>
      </Card>

      {/* Hiking Experience */}
      <Card className="border-burgundy/10 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-playfair text-charcoal flex items-center gap-2">
            <Heart className="h-5 w-5 text-burgundy" />
            Hiking Experience
          </CardTitle>
          <CardDescription>
            Help guides understand your experience level
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hiking_experience">Experience Level</Label>
            <Select
              value={profile.hiking_experience}
              onValueChange={(value) => setProfile({ ...profile, hiking_experience: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HIKING_EXPERIENCE_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Health & Dietary Information */}
      <Card className="border-burgundy/10 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-playfair text-charcoal flex items-center gap-2">
            <Shield className="h-5 w-5 text-burgundy" />
            Health & Dietary Information
          </CardTitle>
          <CardDescription>
            Important information shared with guides for your safety
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="medical_conditions">Medical Conditions</Label>
            <Textarea
              id="medical_conditions"
              value={profile.medical_conditions}
              onChange={(e) => setProfile({ ...profile, medical_conditions: e.target.value })}
              placeholder="Any medical conditions, allergies, or medications the guide should know about..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Dietary Preferences</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {DIETARY_OPTIONS.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`diet-${option}`}
                    checked={profile.dietary_preferences.includes(option)}
                    onCheckedChange={() => toggleDietaryPreference(option)}
                  />
                  <Label
                    htmlFor={`diet-${option}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessibility_needs">Accessibility Needs</Label>
            <Textarea
              id="accessibility_needs"
              value={profile.accessibility_needs}
              onChange={(e) => setProfile({ ...profile, accessibility_needs: e.target.value })}
              placeholder="Any accessibility requirements or accommodations needed..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="border-burgundy/10 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-playfair text-charcoal flex items-center gap-2">
            <Phone className="h-5 w-5 text-burgundy" />
            Emergency Contact
          </CardTitle>
          <CardDescription>
            Person to contact in case of emergency during your hikes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergency_name">Contact Name</Label>
              <Input
                id="emergency_name"
                value={profile.emergency_contact_name}
                onChange={(e) => setProfile({ ...profile, emergency_contact_name: e.target.value })}
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency_phone">Contact Phone</Label>
              <Input
                id="emergency_phone"
                type="tel"
                value={profile.emergency_contact_phone}
                onChange={(e) => setProfile({ ...profile, emergency_contact_phone: e.target.value })}
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency_relationship">Relationship</Label>
            <Input
              id="emergency_relationship"
              value={profile.emergency_contact_relationship}
              onChange={(e) => setProfile({ ...profile, emergency_contact_relationship: e.target.value })}
              placeholder="Spouse, Parent, Sibling, Friend..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card className="border-burgundy/10 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-playfair text-charcoal flex items-center gap-2">
            <Lock className="h-5 w-5 text-burgundy" />
            Account Security
          </CardTitle>
          <CardDescription>
            Manage your login credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Change */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Email Address</Label>
                <p className="text-sm text-muted-foreground">
                  Current: {profile.email}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              A verification link will be sent to your new email address. You must verify it before the change takes effect.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter new email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleEmailChange}
                disabled={updatingEmail || !newEmail}
                variant="outline"
                className="border-burgundy/30 text-burgundy hover:bg-burgundy/5"
              >
                {updatingEmail ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Change Email
                  </>
                )}
              </Button>
            </div>
          </div>

          <Separator className="bg-burgundy/10" />

          {/* Password Change */}
          <div className="space-y-3">
            <Label className="text-base">Change Password</Label>
            <p className="text-sm text-muted-foreground">
              You must enter your current password to verify it's you before changing to a new password.
            </p>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="current_password">Current Password *</Label>
                <Input
                  id="current_password"
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new_password">New Password *</Label>
                <Input
                  id="new_password"
                  type="password"
                  placeholder="Enter new password (min. 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm New Password *</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button
                onClick={handlePasswordChange}
                disabled={updatingPassword || !currentPassword || !newPassword || !confirmPassword}
                variant="outline"
                className="w-full border-burgundy/30 text-burgundy hover:bg-burgundy/5"
              >
                {updatingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Update Password
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="bg-burgundy hover:bg-burgundy-dark text-white"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
}
