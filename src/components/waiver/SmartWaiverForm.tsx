import { useState, useRef, useEffect } from "react";
import {
  FileText, Check, ChevronRight, ChevronLeft, AlertCircle, Info,
  User, Heart, Shield, Camera, FileCheck, Download, Mail,
  CheckCircle, Clock, Calendar, MapPin, Phone, Home as HomeIcon,
  Loader2, Save, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WaiverFormProps {
  tourName: string;
  bookingReference: string;
  tourDates: { from: string; to: string };
  location: string;
  guideName: string;
  guideContact: string;
  onSubmit: (data: any) => void;
  onSaveDraft?: (data: any) => void;
  prefilledData?: Partial<WaiverData>;
}

interface WaiverData {
  // Section 1: Tour Info (pre-filled)
  tourName: string;
  bookingReference: string;
  tourDates: { from: string; to: string };
  location: string;
  guideName: string;
  guideContact: string;
  
  // Section 2: Participant Info
  fullName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  
  // Section 3: Emergency Contact
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelationship: string;
  
  // Section 4: Medical
  medicalConditions: string[];
  medicalDetails: string;
  currentMedications: string;
  allergies: string;
  lastTetanusShot: string;
  
  // Section 5: Insurance
  hasInsurance: boolean;
  insuranceProvider: string;
  policyNumber: string;
  insuranceEmergencyNumber: string;
  
  // Section 6-8: Acknowledgments
  risksInitial: string;
  liabilityInitial: string;
  conductInitial: string;
  
  // Section 9: Media Consent
  mediaConsent: boolean;
  mediaInitial: string;
  
  // Section 10: Signature
  signature: string;
  signatureDate: string;
  signatureLocation: string;
  
  // Parent/Guardian (if under 18)
  isUnder18: boolean;
  guardianName?: string;
  guardianRelationship?: string;
  guardianSignature?: string;
}

export default function SmartWaiverForm({ 
  tourName, 
  bookingReference, 
  tourDates, 
  location, 
  guideName, 
  guideContact,
  onSubmit,
  onSaveDraft,
  prefilledData 
}: WaiverFormProps) {
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState<Partial<WaiverData>>({
    tourName,
    bookingReference,
    tourDates,
    location,
    guideName,
    guideContact,
    medicalConditions: [],
    hasInsurance: true,
    mediaConsent: true,
    isUnder18: false,
    ...prefilledData
  });
  const [errors, setErrors] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  const totalSections = 10;
  const progress = (currentSection / totalSections) * 100;

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!onSaveDraft) return;
    
    const interval = setInterval(() => {
      onSaveDraft(formData);
    }, 30000);

    return () => clearInterval(interval);
  }, [formData, onSaveDraft]);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }));
    }
  };

  const toggleMedicalCondition = (condition: string) => {
    const current = formData.medicalConditions || [];
    if (current.includes(condition)) {
      updateField('medicalConditions', current.filter(c => c !== condition));
    } else {
      updateField('medicalConditions', [...current, condition]);
    }
  };

  const validateSection = (section: number): boolean => {
    const newErrors: any = {};

    switch (section) {
      case 2: // Participant Info
        if (!formData.fullName) newErrors.fullName = "Full name is required";
        if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
        if (!formData.email) newErrors.email = "Email is required";
        if (!formData.phone) newErrors.phone = "Phone number is required";
        break;
      case 3: // Emergency Contact
        if (!formData.emergencyName) newErrors.emergencyName = "Emergency contact name is required";
        if (!formData.emergencyPhone) newErrors.emergencyPhone = "Emergency contact phone is required";
        break;
      case 5: // Insurance
        if (formData.hasInsurance) {
          if (!formData.insuranceProvider) newErrors.insuranceProvider = "Insurance provider is required";
          if (!formData.policyNumber) newErrors.policyNumber = "Policy number is required";
        }
        break;
      case 6: // Risk Acknowledgment
        if (!formData.risksInitial) newErrors.risksInitial = "Please initial to acknowledge risks";
        break;
      case 7: // Liability Release
        if (!formData.liabilityInitial) newErrors.liabilityInitial = "Please initial to accept release";
        break;
      case 8: // Conduct Agreement
        if (!formData.conductInitial) newErrors.conductInitial = "Please initial to agree to conduct terms";
        break;
      case 9: // Media Consent
        if (!formData.mediaInitial) newErrors.mediaInitial = "Please initial your media preference";
        break;
      case 10: // Signature
        if (!formData.signature) newErrors.signature = "Signature is required";
        if (formData.isUnder18 && !formData.guardianSignature) {
          newErrors.guardianSignature = "Parent/guardian signature is required";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextSection = () => {
    if (validateSection(currentSection)) {
      setCurrentSection(prev => Math.min(prev + 1, totalSections));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevSection = () => {
    setCurrentSection(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = () => {
    if (validateSection(10)) {
      onSubmit({
        ...formData,
        signatureDate: new Date().toISOString(),
        submittedAt: new Date().toISOString()
      });
    }
  };

  const handleSaveDraft = async () => {
    if (onSaveDraft) {
      setIsSaving(true);
      await onSaveDraft(formData);
      setTimeout(() => setIsSaving(false), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <Card className="p-6 mb-6 bg-background border-burgundy/10 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl text-burgundy mb-2" style={{fontFamily: 'Playfair Display, serif'}}>
                Multi-Day Hiking Waiver
              </h1>
              <p className="text-muted-foreground">
                Please complete all sections carefully. Your information is securely stored.
              </p>
            </div>
            <Badge className="bg-burgundy text-white border-0">
              <FileText className="w-3 h-3 mr-1" />
              Required
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Section {currentSection} of {totalSections}</span>
              <span className="text-burgundy font-medium">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Section Indicator */}
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="w-4 h-4" />
            <span>
              {prefilledData && Object.keys(prefilledData).length > 0 && (
                "Some fields are pre-filled from your profile. Please review and update as needed."
              )}
              {(!prefilledData || Object.keys(prefilledData).length === 0) && (
                "This information will be saved for future waivers to make the process faster."
              )}
            </span>
          </div>
        </Card>

        {/* Form Sections */}
        <Card className="p-8 bg-background border-burgundy/10 shadow-lg mb-6">
          {currentSection === 1 && <Section1TourInfo formData={formData} />}
          {currentSection === 2 && <Section2ParticipantInfo formData={formData} updateField={updateField} errors={errors} />}
          {currentSection === 3 && <Section3EmergencyContact formData={formData} updateField={updateField} errors={errors} />}
          {currentSection === 4 && <Section4Medical formData={formData} updateField={updateField} toggleMedicalCondition={toggleMedicalCondition} />}
          {currentSection === 5 && <Section5Insurance formData={formData} updateField={updateField} errors={errors} />}
          {currentSection === 6 && <Section6RiskAcknowledgment formData={formData} updateField={updateField} errors={errors} />}
          {currentSection === 7 && <Section7LiabilityRelease formData={formData} updateField={updateField} errors={errors} />}
          {currentSection === 8 && <Section8Conduct formData={formData} updateField={updateField} errors={errors} />}
          {currentSection === 9 && <Section9MediaConsent formData={formData} updateField={updateField} errors={errors} />}
          {currentSection === 10 && <Section10Signature formData={formData} updateField={updateField} errors={errors} />}
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={prevSection}
            disabled={currentSection === 1}
            className="border-burgundy/30 text-burgundy hover:bg-burgundy/5"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {onSaveDraft && (
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="border-burgundy/30 text-burgundy hover:bg-burgundy/5"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </>
                )}
              </Button>
            )}
          </div>

          {currentSection < totalSections ? (
            <Button
              onClick={nextSection}
              className="bg-burgundy hover:bg-burgundy/90 text-white"
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="bg-sage hover:bg-sage/90 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Submit Waiver
            </Button>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Questions? Contact us at <a href="mailto:support@madetohike.com" className="text-burgundy hover:underline">support@madetohike.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}

function Section1TourInfo({ formData }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-4 text-foreground" style={{fontFamily: 'Playfair Display, serif'}}>
          Section 1: Tour Information
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Review your tour details below. This information has been automatically populated from your booking.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoField label="Tour Name" value={formData.tourName} icon={<MapPin />} />
        <InfoField label="Booking Reference" value={formData.bookingReference} icon={<FileText />} />
        <InfoField label="Tour Dates" value={`${formData.tourDates?.from} to ${formData.tourDates?.to}`} icon={<Calendar />} />
        <InfoField label="Location" value={formData.location} icon={<MapPin />} />
        <InfoField label="Guide Name" value={formData.guideName} icon={<User />} />
        <InfoField label="Guide Contact" value={formData.guideContact} icon={<Phone />} />
      </div>

      <Alert className="bg-sage/10 border-sage/20">
        <CheckCircle className="h-4 w-4 text-sage" />
        <AlertDescription className="text-sm text-muted-foreground">
          All tour information has been verified. If you notice any errors, please contact support before proceeding.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function InfoField({ label, value, icon }: any) {
  return (
    <div className="p-4 bg-cream rounded-lg border border-burgundy/10">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-burgundy/10 flex items-center justify-center text-burgundy flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground mb-1">{label}</div>
          <div className="text-sm font-medium text-foreground">{value}</div>
        </div>
      </div>
    </div>
  );
}

function Section2ParticipantInfo({ formData, updateField, errors }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-2 text-foreground" style={{fontFamily: 'Playfair Display, serif'}}>
          Section 2: Participant Information
        </h2>
        <p className="text-sm text-muted-foreground">
          Provide your personal details. Some fields may be pre-filled from your profile.
        </p>
      </div>

      <div className="space-y-4">
        <FormField
          label="Full Legal Name"
          required
          value={formData.fullName || ''}
          onChange={(e: any) => updateField('fullName', e.target.value)}
          error={errors.fullName}
          placeholder="As it appears on your passport"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Date of Birth"
            type="date"
            required
            value={formData.dateOfBirth || ''}
            onChange={(e: any) => updateField('dateOfBirth', e.target.value)}
            error={errors.dateOfBirth}
          />
          <FormField
            label="Nationality"
            value={formData.nationality || ''}
            onChange={(e: any) => updateField('nationality', e.target.value)}
          />
        </div>

        <FormField
          label="Address"
          value={formData.address || ''}
          onChange={(e: any) => updateField('address', e.target.value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="City/Town"
            value={formData.city || ''}
            onChange={(e: any) => updateField('city', e.target.value)}
          />
          <FormField
            label="Country"
            value={formData.country || ''}
            onChange={(e: any) => updateField('country', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Email Address"
            type="email"
            required
            value={formData.email || ''}
            onChange={(e: any) => updateField('email', e.target.value)}
            error={errors.email}
          />
          <FormField
            label="Mobile Phone"
            type="tel"
            required
            value={formData.phone || ''}
            onChange={(e: any) => updateField('phone', e.target.value)}
            error={errors.phone}
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>
    </div>
  );
}

function Section3EmergencyContact({ formData, updateField, errors }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-2 text-foreground" style={{fontFamily: 'Playfair Display, serif'}}>
          Section 3: Emergency Contact
        </h2>
        <p className="text-sm text-muted-foreground">
          Provide details for someone we can contact in case of emergency.
        </p>
      </div>

      <Alert className="bg-burgundy/5 border-burgundy/20">
        <AlertCircle className="h-4 w-4 text-burgundy" />
        <AlertDescription className="text-sm text-muted-foreground">
          This should be someone who is NOT joining you on the tour and can be reached at any time.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <FormField
          label="Emergency Contact Name"
          required
          value={formData.emergencyName || ''}
          onChange={(e: any) => updateField('emergencyName', e.target.value)}
          error={errors.emergencyName}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Primary Phone Number"
            type="tel"
            required
            value={formData.emergencyPhone || ''}
            onChange={(e: any) => updateField('emergencyPhone', e.target.value)}
            error={errors.emergencyPhone}
            placeholder="+1 (555) 123-4567"
          />
          <FormField
            label="Relationship to You"
            value={formData.emergencyRelationship || ''}
            onChange={(e: any) => updateField('emergencyRelationship', e.target.value)}
            placeholder="e.g., Spouse, Parent, Sibling"
          />
        </div>
      </div>
    </div>
  );
}

function Section4Medical({ formData, updateField, toggleMedicalCondition }: any) {
  const conditions = [
    "Heart condition or cardiovascular disease",
    "Respiratory problems (asthma, COPD, etc.)",
    "Diabetes (Type 1 or Type 2)",
    "Epilepsy or seizure disorder",
    "Joint or mobility issues",
    "Recent surgery (within 6 months)",
    "Pregnancy",
    "Altitude sensitivity",
    "Mental health conditions affecting judgment or safety",
    "Other medical conditions",
    "None of the above"
  ];

  const hasConditions = formData.medicalConditions?.length > 0 && 
    !formData.medicalConditions.includes("None of the above");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-2 text-foreground" style={{fontFamily: 'Playfair Display, serif'}}>
          Section 4: Medical Declaration
        </h2>
        <p className="text-sm text-muted-foreground">
          Honest disclosure helps us ensure your safety during the tour.
        </p>
      </div>

      <div>
        <Label className="text-sm font-medium text-foreground mb-3 block">
          Do you have any of the following conditions? (Check all that apply)
        </Label>
        <div className="space-y-3">
          {conditions.map((condition) => (
            <div key={condition} className="flex items-start gap-3 p-3 bg-cream rounded-lg hover:bg-cream/70 transition-colors">
              <Checkbox
                checked={formData.medicalConditions?.includes(condition)}
                onCheckedChange={() => toggleMedicalCondition(condition)}
                className="mt-1"
              />
              <Label className="text-sm text-foreground cursor-pointer flex-1">
                {condition}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {hasConditions && (
        <FormField
          label="Please provide details about your conditions"
          value={formData.medicalDetails || ''}
          onChange={(e: any) => updateField('medicalDetails', e.target.value)}
          textarea
          rows={3}
          placeholder="Describe your condition(s), severity, and any relevant treatment details..."
        />
      )}

      <Separator />

      <div className="space-y-4">
        <FormField
          label="Current Medications"
          value={formData.currentMedications || ''}
          onChange={(e: any) => updateField('currentMedications', e.target.value)}
          placeholder="List all medications you're currently taking"
        />

        <FormField
          label="Allergies (medications, food, insect stings)"
          value={formData.allergies || ''}
          onChange={(e: any) => updateField('allergies', e.target.value)}
          placeholder="List any allergies and their severity"
        />

        <FormField
          label="Last Tetanus Shot"
          value={formData.lastTetanusShot || ''}
          onChange={(e: any) => updateField('lastTetanusShot', e.target.value)}
          placeholder="Month and year (e.g., January 2023)"
        />
      </div>
    </div>
  );
}

function Section5Insurance({ formData, updateField, errors }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-2 text-foreground" style={{fontFamily: 'Playfair Display, serif'}}>
          Section 5: Insurance Confirmation
        </h2>
        <p className="text-sm text-muted-foreground">
          Valid travel insurance covering mountain activities is required for participation.
        </p>
      </div>

      <Alert className="bg-burgundy/5 border-burgundy/20">
        <Shield className="h-4 w-4 text-burgundy" />
        <AlertDescription className="text-sm text-muted-foreground">
          <strong>Required Coverage:</strong> Your insurance must cover medical treatment abroad, mountain rescue and evacuation, emergency repatriation, and trip cancellation.
        </AlertDescription>
      </Alert>

      <div className="flex items-center gap-3 p-4 bg-cream rounded-lg">
        <Checkbox
          checked={formData.hasInsurance}
          onCheckedChange={(checked) => updateField('hasInsurance', checked)}
        />
        <Label className="text-sm text-foreground cursor-pointer">
          I confirm that I have valid travel and medical insurance covering all required areas
        </Label>
      </div>

      {formData.hasInsurance && (
        <div className="space-y-4">
          <FormField
            label="Insurance Provider"
            required
            value={formData.insuranceProvider || ''}
            onChange={(e: any) => updateField('insuranceProvider', e.target.value)}
            error={errors.insuranceProvider}
            placeholder="Company name"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Policy Number"
              required
              value={formData.policyNumber || ''}
              onChange={(e: any) => updateField('policyNumber', e.target.value)}
              error={errors.policyNumber}
            />
            <FormField
              label="Emergency Contact Number (Insurance)"
              value={formData.insuranceEmergencyNumber || ''}
              onChange={(e: any) => updateField('insuranceEmergencyNumber', e.target.value)}
              placeholder="24/7 emergency line"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Section6RiskAcknowledgment({ formData, updateField, errors }: any) {
  const risks = [
    "Steep and uneven terrain",
    "Changing and unpredictable weather conditions",
    "Altitude-related illnesses",
    "Wildlife encounters",
    "Slips, trips, and falls",
    "River crossings and water hazards",
    "Exposure to sun, cold, wind, and precipitation",
    "Remote locations with limited rescue access",
    "Physical exhaustion and fatigue",
    "Equipment failure",
    "Navigation errors",
    "Rock fall and natural hazards",
    "Other participants' actions or inactions"
  ];

  const consequences = [
    "Minor injuries (cuts, bruises, sprains)",
    "Serious injuries (fractures, head injuries, hypothermia)",
    "Permanent disability",
    "Death"
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-2 text-foreground" style={{fontFamily: 'Playfair Display, serif'}}>
          Section 6: Acknowledgment of Risks
        </h2>
        <p className="text-sm text-muted-foreground">
          Please read carefully and acknowledge that you understand the inherent risks.
        </p>
      </div>

      <Alert className="bg-gold/10 border-gold/20">
        <AlertCircle className="h-4 w-4 text-gold" />
        <AlertDescription className="text-sm text-muted-foreground">
          Multi-day mountain hiking involves serious inherent risks. Please read all items carefully.
        </AlertDescription>
      </Alert>

      <div className="p-6 bg-cream rounded-lg border border-burgundy/10 max-h-96 overflow-y-auto">
        <h3 className="font-medium text-foreground mb-3">Inherent Risks Include:</h3>
        <ul className="space-y-2 mb-6">
          {risks.map((risk, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-burgundy mt-1">•</span>
              <span>{risk}</span>
            </li>
          ))}
        </ul>

        <Separator className="my-4" />

        <h3 className="font-medium text-foreground mb-3">These Risks Could Result In:</h3>
        <ul className="space-y-2">
          {consequences.map((consequence, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-burgundy mt-1">•</span>
              <span>{consequence}</span>
            </li>
          ))}
        </ul>

        <Separator className="my-4" />

        <p className="text-sm text-muted-foreground">
          I confirm that I am physically and mentally fit to participate in this activity and have prepared adequately through training and appropriate equipment.
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Initial Here to Acknowledge <span className="text-burgundy">*</span>
        </Label>
        <Input
          value={formData.risksInitial || ''}
          onChange={(e) => updateField('risksInitial', e.target.value.toUpperCase())}
          placeholder="Your initials (e.g., JD)"
          className={`max-w-xs font-mono ${errors.risksInitial ? 'border-red-500' : ''}`}
          maxLength={4}
        />
        {errors.risksInitial && (
          <p className="text-xs text-red-500">{errors.risksInitial}</p>
        )}
      </div>
    </div>
  );
}

function Section7LiabilityRelease({ formData, updateField, errors }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-2 text-foreground" style={{fontFamily: 'Playfair Display, serif'}}>
          Section 7: Assumption of Risk and Liability Release
        </h2>
        <p className="text-sm text-muted-foreground">
          This is a legal release of liability. Please read carefully.
        </p>
      </div>

      <Alert className="bg-burgundy/5 border-burgundy/20">
        <AlertCircle className="h-4 w-4 text-burgundy" />
        <AlertDescription className="text-sm text-muted-foreground">
          <strong>Important Legal Notice:</strong> By initialing this section, you are waiving certain legal rights. Please read carefully.
        </AlertDescription>
      </Alert>

      <div className="p-6 bg-cream rounded-lg border border-burgundy/10 max-h-96 overflow-y-auto">
        <p className="text-sm text-muted-foreground mb-4">
          I, the undersigned participant, hereby:
        </p>

        <div className="space-y-4 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
            <p><strong>VOLUNTARILY</strong> choose to participate in this multi-day hiking tour</p>
          </div>

          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
            <p><strong>ASSUME ALL RISKS</strong> associated with participation, including those listed above and any other risks, whether known or unknown</p>
          </div>

          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
            <div>
              <p className="mb-2"><strong>RELEASE AND DISCHARGE</strong> MadeToHike, the assigned guide, and all affiliated persons from any and all claims, demands, or causes of action arising from my participation, including:</p>
              <ul className="ml-6 space-y-1">
                <li>• Personal injury or death</li>
                <li>• Property damage or loss</li>
                <li>• Emotional distress</li>
                <li>• Any other damages</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
            <p><strong>AGREE NOT TO SUE</strong> MadeToHike, the guide, or affiliated persons for any claims arising from participation</p>
          </div>

          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
            <p><strong>INDEMNIFY AND HOLD HARMLESS</strong> MadeToHike and the guide from any claims brought by third parties (including family members) arising from my participation</p>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">This release applies to:</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Negligence on the part of MadeToHike or the guide</li>
            <li>• Dangerous conditions in the hiking environment</li>
            <li>• Equipment failure or inadequacy</li>
            <li>• Acts or omissions of other participants</li>
            <li>• Any other causes</li>
          </ul>
        </div>

        <Separator className="my-4" />

        <div className="p-3 bg-sage/10 rounded border border-sage/20">
          <p className="text-sm font-medium text-foreground mb-1">This release does NOT apply to:</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Gross negligence or willful misconduct by MadeToHike or the guide</li>
            <li>• Violations of applicable law</li>
          </ul>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Initial Here to Accept Release <span className="text-burgundy">*</span>
        </Label>
        <Input
          value={formData.liabilityInitial || ''}
          onChange={(e) => updateField('liabilityInitial', e.target.value.toUpperCase())}
          placeholder="Your initials (e.g., JD)"
          className={`max-w-xs font-mono ${errors.liabilityInitial ? 'border-red-500' : ''}`}
          maxLength={4}
        />
        {errors.liabilityInitial && (
          <p className="text-xs text-red-500">{errors.liabilityInitial}</p>
        )}
      </div>
    </div>
  );
}

function Section8Conduct({ formData, updateField, errors }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-2 text-foreground" style={{fontFamily: 'Playfair Display, serif'}}>
          Section 8: Conduct and Participation Agreement
        </h2>
        <p className="text-sm text-muted-foreground">
          Agree to the conduct expectations and guide authority.
        </p>
      </div>

      <div className="p-6 bg-cream rounded-lg border border-burgundy/10">
        <h3 className="font-medium text-foreground mb-3">I Agree To:</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
            <span>Follow all safety instructions provided by the guide</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
            <span>Use safety equipment properly when provided</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
            <span>Inform the guide immediately of any medical issues or concerns</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
            <span>Not participate under the influence of alcohol or drugs</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
            <span>Respect other participants and the natural environment</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
            <span>Accept the guide's decisions regarding safety and route changes</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
            <span>Leave no trace and follow environmental best practices</span>
          </li>
        </ul>
      </div>

      <div className="p-6 bg-burgundy/5 rounded-lg border border-burgundy/10">
        <h3 className="font-medium text-foreground mb-3">I Understand the Guide Has Authority To:</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-burgundy mt-0.5 flex-shrink-0" />
            <span>Remove me from the tour if I endanger myself or others</span>
          </li>
          <li className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-burgundy mt-0.5 flex-shrink-0" />
            <span>Modify or cancel the tour due to weather, safety, or other concerns</span>
          </li>
          <li className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-burgundy mt-0.5 flex-shrink-0" />
            <span>Make final decisions on route, pace, and overnight locations</span>
          </li>
        </ul>
        <Alert className="mt-4 bg-background border-burgundy/20">
          <AlertCircle className="h-4 w-4 text-burgundy" />
          <AlertDescription className="text-xs text-muted-foreground">
            <strong>Note:</strong> No refund will be provided if you are removed from the tour due to your conduct or inability to continue safely.
          </AlertDescription>
        </Alert>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Initial Here to Agree <span className="text-burgundy">*</span>
        </Label>
        <Input
          value={formData.conductInitial || ''}
          onChange={(e) => updateField('conductInitial', e.target.value.toUpperCase())}
          placeholder="Your initials (e.g., JD)"
          className={`max-w-xs font-mono ${errors.conductInitial ? 'border-red-500' : ''}`}
          maxLength={4}
        />
        {errors.conductInitial && (
          <p className="text-xs text-red-500">{errors.conductInitial}</p>
        )}
      </div>
    </div>
  );
}

function Section9MediaConsent({ formData, updateField, errors }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-2 text-foreground" style={{fontFamily: 'Playfair Display, serif'}}>
          Section 9: Photo and Media Consent
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose whether you consent to use of your image in promotional materials.
        </p>
      </div>

      <div className="p-6 bg-cream rounded-lg border border-burgundy/10">
        <div className="flex items-start gap-3 mb-4">
          <Camera className="w-5 h-5 text-burgundy mt-0.5" />
          <div>
            <h3 className="font-medium text-foreground mb-2">Media Usage</h3>
            <p className="text-sm text-muted-foreground mb-4">
              During the tour, your guide may take photographs and videos for promotional purposes. These may be used on the Made to Hike website, social media channels, and other marketing materials.
            </p>
          </div>
        </div>

        <RadioGroup
          value={formData.mediaConsent ? "yes" : "no"}
          onValueChange={(value) => updateField('mediaConsent', value === "yes")}
        >
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-background rounded-lg border border-burgundy/10 hover:border-burgundy/30 transition-colors">
              <RadioGroupItem value="yes" id="consent-yes" />
              <Label htmlFor="consent-yes" className="flex-1 cursor-pointer text-sm">
                <strong>I CONSENT</strong> to photographs and videos being used for marketing purposes
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-background rounded-lg border border-burgundy/10 hover:border-burgundy/30 transition-colors">
              <RadioGroupItem value="no" id="consent-no" />
              <Label htmlFor="consent-no" className="flex-1 cursor-pointer text-sm">
                <strong>I DO NOT CONSENT</strong> to use of my image
              </Label>
            </div>
          </div>
        </RadioGroup>

        {!formData.mediaConsent && (
          <Alert className="mt-4 bg-sage/10 border-sage/20">
            <Info className="h-4 w-4 text-sage" />
            <AlertDescription className="text-xs text-muted-foreground">
              Your preference has been noted. We will make every effort to exclude you from promotional materials, though you may appear in background shots.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Initial Here to Confirm Your Choice <span className="text-burgundy">*</span>
        </Label>
        <Input
          value={formData.mediaInitial || ''}
          onChange={(e) => updateField('mediaInitial', e.target.value.toUpperCase())}
          placeholder="Your initials (e.g., JD)"
          className={`max-w-xs font-mono ${errors.mediaInitial ? 'border-red-500' : ''}`}
          maxLength={4}
        />
        {errors.mediaInitial && (
          <p className="text-xs text-red-500">{errors.mediaInitial}</p>
        )}
      </div>
    </div>
  );
}

function Section10Signature({ formData, updateField, errors }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-2 text-foreground" style={{fontFamily: 'Playfair Display, serif'}}>
          Section 10: Final Acknowledgment & Signature
        </h2>
        <p className="text-sm text-muted-foreground">
          Review your acknowledgments and provide your digital signature.
        </p>
      </div>

      <Alert className="bg-burgundy/5 border-burgundy/20">
        <FileCheck className="h-4 w-4 text-burgundy" />
        <AlertDescription className="text-sm text-muted-foreground">
          <strong>Final Step:</strong> By signing below, you confirm that you have read, understood, and agree to all terms in this waiver.
        </AlertDescription>
      </Alert>

      <div className="p-6 bg-cream rounded-lg border border-burgundy/10">
        <h3 className="font-medium text-foreground mb-3">I Acknowledge That:</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
            <span>I have read this entire document</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
            <span>I understand all terms and conditions</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
            <span>I have had the opportunity to ask questions</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
            <span>I am signing this agreement voluntarily</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
            <span>I understand this is a legally binding contract</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
            <span>I am at least 18 years of age (or have parental/guardian consent)</span>
          </li>
        </ul>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-cream rounded-lg">
          <Checkbox
            checked={formData.isUnder18}
            onCheckedChange={(checked) => updateField('isUnder18', checked)}
          />
          <Label className="text-sm text-foreground cursor-pointer">
            I am under 18 years of age (parent/guardian signature will be required)
          </Label>
        </div>

        <SignaturePad
          label="Participant Signature"
          value={formData.signature || ''}
          onChange={(value: string) => updateField('signature', value)}
          error={errors.signature}
        />

        <FormField
          label="Participant Full Name (printed)"
          value={formData.fullName || ''}
          readOnly
          className="bg-cream"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Date"
            value={new Date().toLocaleDateString()}
            readOnly
            className="bg-cream"
          />
          <FormField
            label="Location"
            value={formData.signatureLocation || ''}
            onChange={(e: any) => updateField('signatureLocation', e.target.value)}
            placeholder="City, Country"
          />
        </div>
      </div>

      {formData.isUnder18 && (
        <>
          <Separator />
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Parent/Guardian Signature (Required)</h3>
            
            <FormField
              label="Parent/Guardian Full Name"
              value={formData.guardianName || ''}
              onChange={(e: any) => updateField('guardianName', e.target.value)}
            />

            <FormField
              label="Relationship to Participant"
              value={formData.guardianRelationship || ''}
              onChange={(e: any) => updateField('guardianRelationship', e.target.value)}
              placeholder="e.g., Mother, Father, Legal Guardian"
            />

            <SignaturePad
              label="Parent/Guardian Signature"
              value={formData.guardianSignature || ''}
              onChange={(value: string) => updateField('guardianSignature', value)}
              error={errors.guardianSignature}
            />
          </div>
        </>
      )}

      <Alert className="bg-sage/10 border-sage/20">
        <Mail className="h-4 w-4 text-sage" />
        <AlertDescription className="text-sm text-muted-foreground">
          A copy of this signed waiver will be sent to your email address ({formData.email}) upon submission.
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Reusable Components
function FormField({ label, required, error, textarea, rows = 3, readOnly, className = '', ...props }: any) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">
        {label} {required && <span className="text-burgundy">*</span>}
      </Label>
      {textarea ? (
        <Textarea
          {...props}
          rows={rows}
          className={`${error ? 'border-red-500' : 'border-burgundy/20'} ${className}`}
          readOnly={readOnly}
        />
      ) : (
        <Input
          {...props}
          className={`${error ? 'border-red-500' : 'border-burgundy/20'} ${className}`}
          readOnly={readOnly}
        />
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function SignaturePad({ label, value, onChange, error }: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsDrawing(true);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#2C2C2C';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) {
        onChange(canvas.toDataURL());
      }
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange('');
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">
        {label} <span className="text-burgundy">*</span>
      </Label>
      <div className={`border-2 rounded-lg p-4 bg-background ${error ? 'border-red-500' : 'border-burgundy/20'}`}>
        <canvas
          ref={canvasRef}
          width={600}
          height={150}
          className="w-full border border-burgundy/10 rounded cursor-crosshair bg-background"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">Sign above with your mouse or touchscreen</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearSignature}
            className="text-burgundy hover:bg-burgundy/5"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        </div>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
