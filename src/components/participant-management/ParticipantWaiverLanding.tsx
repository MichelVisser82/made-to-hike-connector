import { useState } from "react";
import { 
  Shield, CheckCircle, Mountain, FileText, Phone, Mail,
  AlertCircle, ArrowRight, Upload, User, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SmartWaiverForm from "@/components/waiver/SmartWaiverForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ParticipantWaiverLandingProps {
  token: string;
  bookingReference: string;
  tourName: string;
  tourDates: { from: string; to: string };
  location: string;
  guideName: string;
  primaryBooker: string;
  participantEmail?: string;
  tourId?: string;
  onWaiverSubmit?: (data: any) => Promise<void>;
  onInsuranceSubmit?: (data: any) => Promise<void>;
}

export default function ParticipantWaiverLanding({
  token,
  bookingReference,
  tourName,
  tourDates,
  location,
  guideName,
  primaryBooker,
  participantEmail,
  tourId,
  onWaiverSubmit,
  onInsuranceSubmit
}: ParticipantWaiverLandingProps) {
  const [stage, setStage] = useState<"welcome" | "waiver" | "insurance" | "complete">("welcome");
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null);

  const handleWaiverSubmit = async (data: any) => {
    if (onWaiverSubmit) {
      await onWaiverSubmit(data);
    }
    setStage("insurance");
  };

  const handleInsuranceSubmit = async () => {
    if (onInsuranceSubmit) {
      await onInsuranceSubmit({
        file: insuranceFile
      });
    }
    setStage("complete");
  };

  const handleEmailConfirmation = () => {
    if (participantEmail) {
      window.location.href = `mailto:${participantEmail}?subject=Tour Confirmation - ${tourName}`;
    }
  };

  const handleViewTourDetails = () => {
    if (tourId) {
      window.open(`/tours/${tourId}`, '_blank');
    }
  };

  if (stage === "complete") {
    return (
      <CompletionScreen 
        tourName={tourName} 
        primaryBooker={primaryBooker}
        onEmailConfirmation={handleEmailConfirmation}
        onViewTourDetails={handleViewTourDetails}
      />
    );
  }

  if (stage === "insurance") {
    return (
      <InsuranceUpload 
        tourName={tourName}
        onSubmit={handleInsuranceSubmit}
        onBack={() => setStage("waiver")}
      />
    );
  }

  if (stage === "waiver") {
    return (
      <div className="min-h-screen bg-cream-light">
        <SmartWaiverForm
          tourName={tourName}
          bookingReference={bookingReference}
          tourDates={tourDates}
          location={location}
          guideName={guideName}
          guideContact="+33 6 12 34 56 78"
          onSubmit={handleWaiverSubmit}
          prefilledData={{ email: participantEmail }}
        />
      </div>
    );
  }

  // Welcome Screen
  return (
    <div className="min-h-screen bg-cream-light">
      {/* Header */}
      <div className="bg-gradient-to-br from-burgundy via-burgundy-dark to-burgundy text-white py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Mountain className="w-8 h-8" />
            <span className="text-2xl" style={{fontFamily: 'Playfair Display, serif'}}>
              Made to Hike
            </span>
          </div>
          <h1 className="text-3xl mb-2" style={{fontFamily: 'Playfair Display, serif'}}>
            Complete Your Participant Information
          </h1>
          <p className="text-white/80">
            You've been invited by {primaryBooker} to join this adventure
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Tour Info Card */}
        <Card className="p-6 bg-white border-burgundy/10 shadow-lg mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-burgundy/10 flex items-center justify-center text-burgundy">
              <Mountain className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl text-charcoal mb-1" style={{fontFamily: 'Playfair Display, serif'}}>
                {tourName}
              </h2>
              <div className="text-sm text-charcoal/70 space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{tourDates.from} - {tourDates.to}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5" />
                  <span>Guide: {guideName}</span>
                </div>
              </div>
            </div>
            <Badge className="bg-burgundy text-white border-0">
              Booking #{bookingReference}
            </Badge>
          </div>
        </Card>

        {/* Security Notice */}
        <Alert className="mb-6 bg-sage/10 border-sage/20">
          <Shield className="h-4 w-4 text-sage" />
          <AlertDescription className="text-sm text-charcoal/70">
            <strong>Secure Link:</strong> This page is unique to you and expires in 30 days. 
            Your information is encrypted and only shared with your guide and Made to Hike.
          </AlertDescription>
        </Alert>

        {/* Steps Overview */}
        <Card className="p-6 bg-white border-burgundy/10 shadow-lg mb-6">
          <h3 className="text-lg mb-4 text-charcoal" style={{fontFamily: 'Playfair Display, serif'}}>
            What You Need to Complete
          </h3>
          
          <div className="space-y-4">
            <StepItem 
              number={1}
              title="Liability Waiver"
              description="Sign the multi-day hiking waiver (5-10 minutes)"
              icon={<FileText className="w-5 h-5" />}
              status="pending"
            />
            <StepItem 
              number={2}
              title="Travel Insurance"
              description="Upload proof of travel and mountain rescue insurance"
              icon={<Shield className="w-5 h-5" />}
              status="pending"
            />
            <StepItem 
              number={3}
              title="Emergency Contact"
              description="Provide emergency contact information (included in waiver)"
              icon={<Phone className="w-5 h-5" />}
              status="pending"
            />
          </div>
        </Card>

        {/* Important Information */}
        <Card className="p-6 bg-cream border-burgundy/10 mb-6">
          <h3 className="text-lg mb-3 text-charcoal flex items-center gap-2" style={{fontFamily: 'Playfair Display, serif'}}>
            <AlertCircle className="w-5 h-5 text-burgundy" />
            Before You Start
          </h3>
          <ul className="space-y-2 text-sm text-charcoal/70">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
              <span>Have your travel insurance policy details ready</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
              <span>Know your emergency contact's phone number</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
              <span>Your progress is automatically saved as you go</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
              <span>No Made to Hike account required</span>
            </li>
          </ul>
        </Card>

        {/* Start Button */}
        <div className="flex flex-col items-center gap-4">
          <Button 
            size="lg"
            onClick={() => setStage("waiver")}
            className="bg-burgundy hover:bg-burgundy-dark text-white shadow-lg px-8"
          >
            Start Participant Registration
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-sm text-charcoal/60 text-center">
            Estimated time: 10-15 minutes
          </p>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-burgundy/10 text-center">
          <p className="text-sm text-charcoal/60 mb-2">
            Questions about this booking?
          </p>
          <p className="text-sm text-charcoal/70">
            Contact {primaryBooker} or reach out to{" "}
            <a href="mailto:support@madetohike.com" className="text-burgundy hover:underline">
              support@madetohike.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function StepItem({ number, title, description, icon, status }: any) {
  const statusColors = {
    pending: "bg-burgundy/10 text-burgundy",
    complete: "bg-sage/10 text-sage"
  };

  return (
    <div className="flex items-start gap-4 p-4 bg-cream/50 rounded-lg border border-burgundy/10">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusColors[status]}`}>
        {status === "complete" ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <span className="font-medium">{number}</span>
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-burgundy/60">{icon}</div>
          <h4 className="font-medium text-charcoal">{title}</h4>
        </div>
        <p className="text-sm text-charcoal/70">{description}</p>
      </div>
    </div>
  );
}

function InsuranceUpload({ tourName, onSubmit, onBack }: any) {
  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-cream-light py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="p-8 bg-white border-burgundy/10 shadow-lg">
          <div className="mb-6">
            <h2 className="text-2xl mb-2 text-charcoal" style={{fontFamily: 'Playfair Display, serif'}}>
              Travel Insurance Information
            </h2>
            <p className="text-charcoal/70">
              Upload proof of travel and mountain rescue insurance coverage
            </p>
          </div>

          <Progress value={66} className="h-2 mb-6" />

          <Alert className="mb-6 bg-burgundy/5 border-burgundy/20">
            <Shield className="h-4 w-4 text-burgundy" />
            <AlertDescription className="text-sm text-charcoal/70">
              <strong>Required Coverage:</strong> Your insurance must cover medical treatment abroad, 
              mountain rescue and evacuation, emergency repatriation, and trip cancellation.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label>Insurance Provider *</Label>
              <Input
                value={insuranceProvider}
                onChange={(e) => setInsuranceProvider(e.target.value)}
                placeholder="e.g., World Nomads"
                className="border-burgundy/20"
              />
            </div>

            <div>
              <Label>Policy Number *</Label>
              <Input
                value={policyNumber}
                onChange={(e) => setPolicyNumber(e.target.value)}
                placeholder="Enter your policy number"
                className="border-burgundy/20"
              />
            </div>

            <div>
              <Label>Upload Insurance Document *</Label>
              <div className="mt-2 border-2 border-dashed border-burgundy/20 rounded-lg p-8 text-center hover:border-burgundy/40 transition-colors">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  id="insurance-upload"
                />
                <label htmlFor="insurance-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-burgundy/40 mx-auto mb-3" />
                  {file ? (
                    <div>
                      <p className="text-sage font-medium mb-1">{file.name}</p>
                      <p className="text-xs text-charcoal/60">Click to change file</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-charcoal/70 font-medium mb-1">Click to upload</p>
                      <p className="text-xs text-charcoal/60">PDF, JPG, PNG (max 10MB)</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <Button
              variant="outline"
              onClick={onBack}
              className="border-burgundy/30 text-burgundy hover:bg-burgundy/5"
            >
              Back
            </Button>
            <Button
              onClick={onSubmit}
              disabled={!insuranceProvider || !policyNumber || !file}
              className="flex-1 bg-burgundy hover:bg-burgundy-dark text-white"
            >
              Submit Insurance Information
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function CompletionScreen({ tourName, primaryBooker, onEmailConfirmation, onViewTourDetails }: any) {
  return (
    <div className="min-h-screen bg-cream-light flex items-center justify-center py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="p-8 bg-white border-burgundy/10 shadow-lg text-center">
          <div className="w-20 h-20 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-sage" />
          </div>

          <h1 className="text-3xl mb-3 text-charcoal" style={{fontFamily: 'Playfair Display, serif'}}>
            All Set!
          </h1>
          
          <p className="text-lg text-charcoal/70 mb-6">
            Your participant information has been submitted successfully
          </p>

          <div className="bg-sage/5 border border-sage/20 rounded-lg p-6 mb-6">
            <h3 className="font-medium text-charcoal mb-3">What happens next?</h3>
            <ul className="space-y-2 text-sm text-charcoal/70 text-left">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
                <span>{primaryBooker} will be notified that you've completed your forms</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
                <span>Your guide will review your information before the tour</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
                <span>You'll receive a confirmation email with your waiver copy</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
                <span>Tour details and meeting instructions will be sent 48 hours before departure</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 border-t border-burgundy/10">
            <h3 className="text-sm font-medium text-charcoal mb-3">Excited for your adventure?</h3>
            <div className="flex gap-3 justify-center">
              <Button 
                variant="outline" 
                className="border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                onClick={onEmailConfirmation}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email Confirmation
              </Button>
              <Button 
                className="bg-burgundy hover:bg-burgundy-dark text-white"
                onClick={onViewTourDetails}
              >
                View Tour Details
              </Button>
            </div>
          </div>

          <p className="text-xs text-charcoal/50 mt-6">
            Questions? Contact us at{" "}
            <a href="mailto:support@madetohike.com" className="text-burgundy hover:underline">
              support@madetohike.com
            </a>
          </p>
        </Card>
      </div>
    </div>
  );
}
