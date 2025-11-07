import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Loader2, AlertCircle, CheckCircle, Mail, MapPin } from 'lucide-react';
import { useMyGuideProfile } from '@/hooks/useGuideProfile';

// Stripe-supported countries
const STRIPE_COUNTRIES = [
  { code: 'AT', name: 'Austria' }, { code: 'BE', name: 'Belgium' }, { code: 'BG', name: 'Bulgaria' },
  { code: 'HR', name: 'Croatia' }, { code: 'CY', name: 'Cyprus' }, { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' }, { code: 'EE', name: 'Estonia' }, { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' }, { code: 'DE', name: 'Germany' }, { code: 'GR', name: 'Greece' },
  { code: 'HU', name: 'Hungary' }, { code: 'IE', name: 'Ireland' }, { code: 'IT', name: 'Italy' },
  { code: 'LV', name: 'Latvia' }, { code: 'LT', name: 'Lithuania' }, { code: 'LU', name: 'Luxembourg' },
  { code: 'MT', name: 'Malta' }, { code: 'NL', name: 'Netherlands' }, { code: 'NO', name: 'Norway' },
  { code: 'PL', name: 'Poland' }, { code: 'PT', name: 'Portugal' }, { code: 'RO', name: 'Romania' },
  { code: 'SK', name: 'Slovakia' }, { code: 'SI', name: 'Slovenia' }, { code: 'ES', name: 'Spain' },
  { code: 'SE', name: 'Sweden' }, { code: 'CH', name: 'Switzerland' }, { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
];

export function AccountSettings() {
  const { user } = useAuth();
  const { data: guideProfile, isLoading: guideLoading } = useMyGuideProfile();
  const [newEmail, setNewEmail] = useState('');
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  
  // Contact information state
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [addressCountry, setAddressCountry] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Load existing address data
  useEffect(() => {
    if (guideProfile) {
      setAddressLine1(guideProfile.address_line1 || '');
      setAddressLine2(guideProfile.address_line2 || '');
      setCity(guideProfile.address_city || '');
      setState(guideProfile.address_state || '');
      setPostalCode(guideProfile.address_postal_code || '');
      setAddressCountry(guideProfile.country || '');
      setDateOfBirth(guideProfile.date_of_birth || '');
    }
  }, [guideProfile]);

  const handleEmailChange = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setIsChangingEmail(true);
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      
      if (error) throw error;
      
      toast.success('Verification email sent to your new address');
      setShowEmailForm(false);
      setNewEmail('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update email');
    } finally {
      setIsChangingEmail(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      
      if (error) throw error;
      
      toast.success('Password reset email sent');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send password reset email');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    try {
      setIsDeleting(true);
      
      // Note: Actual account deletion requires server-side handling
      // This is a placeholder for the UI flow
      toast.error('Account deletion must be handled by support');
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  const handle2FAToggle = (checked: boolean) => {
    // Placeholder for 2FA implementation
    toast.info('Two-factor authentication coming soon');
    setIs2FAEnabled(checked);
  };

  const handleSaveContactInfo = async () => {
    if (!user) return;

    try {
      setIsSavingAddress(true);

      const { error } = await supabase
        .from('guide_profiles')
        .update({
          address_line1: addressLine1.trim() || null,
          address_line2: addressLine2.trim() || null,
          address_city: city.trim() || null,
          address_state: state.trim() || null,
          address_postal_code: postalCode.trim() || null,
          country: addressCountry || null,
          date_of_birth: dateOfBirth || null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Contact information saved successfully');
    } catch (error: any) {
      console.error('Error saving contact info:', error);
      toast.error(error.message || 'Failed to save contact information');
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Show loading state
  if (guideLoading && !guideProfile) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-burgundy" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Email Section */}
      <Card className="border-burgundy/10 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-playfair text-charcoal">Email Address</CardTitle>
          <CardDescription>Manage your account email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-charcoal/60" />
              <div>
                <p className="font-medium text-charcoal">{user?.email}</p>
                {user?.email_confirmed_at ? (
                  <Badge className="bg-sage/10 text-sage border-sage/20 mt-1">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge className="bg-gold/10 text-gold border-gold/20 mt-1">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Unverified
                  </Badge>
                )}
              </div>
            </div>
            <Button 
              variant="outline" 
              className="border-burgundy/30 text-burgundy hover:bg-burgundy/5"
              onClick={() => setShowEmailForm(!showEmailForm)}
            >
              Change Email
            </Button>
          </div>

          {showEmailForm && (
            <div className="space-y-3 pt-4 border-t border-burgundy/10">
              <div>
                <Label htmlFor="new-email">New Email Address</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="your.new.email@example.com"
                  className="border-burgundy/20 focus:border-burgundy focus:ring-burgundy/20"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleEmailChange}
                  disabled={isChangingEmail}
                  className="bg-burgundy hover:bg-burgundy-dark text-white"
                >
                  {isChangingEmail && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isChangingEmail ? 'Sending...' : 'Update Email'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowEmailForm(false);
                    setNewEmail('');
                  }}
                  className="border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                >
                  Cancel
                </Button>
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  You'll receive a verification email at your new address
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password Section */}
      <Card className="border-burgundy/10 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-playfair text-charcoal">Password</CardTitle>
          <CardDescription>Change your password</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            onClick={handlePasswordReset}
            className="border-burgundy/30 text-burgundy hover:bg-burgundy/5"
          >
            Send Password Reset Email
          </Button>
        </CardContent>
      </Card>

      {/* Contact Information Section - For Guides Only */}
      {guideProfile && (
        <Card className="border-burgundy/10 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-burgundy" />
              <CardTitle className="text-lg font-playfair text-charcoal">Contact Information</CardTitle>
            </div>
            <CardDescription>
              Required for Stripe payment account verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth *</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  className="border-burgundy/20 focus:border-burgundy focus:ring-burgundy/20"
                />
                <p className="text-xs text-muted-foreground">Required by Stripe (18+ only)</p>
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="address-country">Country *</Label>
                <Select value={addressCountry} onValueChange={setAddressCountry}>
                  <SelectTrigger className="border-burgundy/20">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {STRIPE_COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Street Address */}
            <div className="space-y-2">
              <Label htmlFor="address-line1">Street Address *</Label>
              <Input
                id="address-line1"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="123 Main Street"
                className="border-burgundy/20 focus:border-burgundy focus:ring-burgundy/20"
                maxLength={200}
              />
            </div>

            {/* Address Line 2 */}
            <div className="space-y-2">
              <Label htmlFor="address-line2">Apartment, Suite, etc. (Optional)</Label>
              <Input
                id="address-line2"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="Apt 4B"
                className="border-burgundy/20 focus:border-burgundy focus:ring-burgundy/20"
                maxLength={200}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Munich"
                  className="border-burgundy/20 focus:border-burgundy focus:ring-burgundy/20"
                  maxLength={100}
                />
              </div>

              {/* State/Province */}
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Bavaria"
                  className="border-burgundy/20 focus:border-burgundy focus:ring-burgundy/20"
                  maxLength={100}
                />
              </div>

              {/* Postal Code */}
              <div className="space-y-2">
                <Label htmlFor="postal-code">Postal Code *</Label>
                <Input
                  id="postal-code"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="80331"
                  className="border-burgundy/20 focus:border-burgundy focus:ring-burgundy/20"
                  maxLength={20}
                />
              </div>
            </div>

            <Alert className="border-burgundy/20 bg-burgundy/5">
              <AlertCircle className="h-4 w-4 text-burgundy" />
              <AlertDescription className="text-sm">
                This information is required by Stripe for identity verification and tax compliance.
                It will be securely stored and only shared with Stripe.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleSaveContactInfo}
              disabled={isSavingAddress || !addressLine1 || !city || !postalCode || !addressCountry || !dateOfBirth}
              className="bg-burgundy hover:bg-burgundy-dark text-white"
            >
              {isSavingAddress && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isSavingAddress ? 'Saving...' : 'Save Contact Information'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 2FA Section */}
      <Card className="border-burgundy/10 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-playfair text-charcoal">Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal">2FA Status</p>
              <p className="text-sm text-charcoal/60">
                {is2FAEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <Switch 
              checked={is2FAEnabled} 
              onCheckedChange={handle2FAToggle}
              className="data-[state=checked]:bg-burgundy"
            />
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Section */}
      <Card className="border-destructive/50 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-playfair text-destructive">Delete Account</CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 border-destructive/20 bg-destructive/5">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              This action cannot be undone. All your data will be permanently deleted.
            </AlertDescription>
          </Alert>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete My Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your account and remove all data from our servers.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4">
                <Label htmlFor="delete-confirm">Type DELETE to confirm</Label>
                <Input
                  id="delete-confirm"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="DELETE"
                  className="mt-2"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteConfirmation('')}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmation !== 'DELETE' || isDeleting}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
