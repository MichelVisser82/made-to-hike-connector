import { Progress } from '../ui/progress';
import { useGuideSignup } from '@/hooks/useGuideSignup';
import { Step01Welcome } from './steps/Step01Welcome';
import { Step02BasicInfo } from './steps/Step02BasicInfo';
import { Step03Location } from './steps/Step03Location';
import { Step04Specialties } from './steps/Step04Specialties';
import { Step05DifficultyLevels } from './steps/Step05DifficultyLevels';
import { Step06Certifications } from './steps/Step06Certifications';
import { Step07GroupPreferences } from './steps/Step07GroupPreferences';
import { Step08DayRates } from './steps/Step08DayRates';
import { Step09Languages } from './steps/Step09Languages';
import { Step11GuidingAreas } from './steps/Step11GuidingAreas';
import { Step12TerrainCapabilities } from './steps/Step12TerrainCapabilities';
import { Step13Bio } from './steps/Step13Bio';
import { Step14Preview } from './steps/Step14Preview';
import { Step15Terms } from './steps/Step15Terms';

const TOTAL_STEPS = 15;

export function GuideSignupFlow() {
  const signup = useGuideSignup();

  const renderStep = () => {
    switch (signup.currentStep) {
      case 1: return <Step01Welcome onNext={signup.nextStep} />;
      case 2: return <Step02BasicInfo data={signup.formData} updateData={signup.updateFormData} onNext={signup.nextStep} onBack={signup.previousStep} />;
      case 3: return <Step03Location data={signup.formData} updateData={signup.updateFormData} onNext={signup.nextStep} onBack={signup.previousStep} />;
      case 4: return <Step04Specialties data={signup.formData} updateData={signup.updateFormData} onNext={signup.nextStep} onBack={signup.previousStep} />;
      case 5: return <Step05DifficultyLevels data={signup.formData} updateData={signup.updateFormData} onNext={signup.nextStep} onBack={signup.previousStep} />;
      case 6: return <Step06Certifications data={signup.formData} updateData={signup.updateFormData} onNext={signup.nextStep} onBack={signup.previousStep} />;
      case 7: return <Step07GroupPreferences data={signup.formData} updateData={signup.updateFormData} onNext={signup.nextStep} onBack={signup.previousStep} />;
      case 8: return <Step08DayRates data={signup.formData} updateData={signup.updateFormData} onNext={signup.nextStep} onBack={signup.previousStep} />;
      case 9: return <Step09Languages data={signup.formData} updateData={signup.updateFormData} onNext={signup.nextStep} onBack={signup.previousStep} />;
      case 10: return <Step11GuidingAreas data={signup.formData} updateData={signup.updateFormData} onNext={signup.nextStep} onBack={signup.previousStep} />;
      case 11: return <Step12TerrainCapabilities data={signup.formData} updateData={signup.updateFormData} onNext={signup.nextStep} onBack={signup.previousStep} />;
      case 12: return <Step13Bio data={signup.formData} updateData={signup.updateFormData} onNext={signup.nextStep} onBack={signup.previousStep} />;
      case 13: return <Step14Preview data={signup.formData} onNext={signup.nextStep} onBack={signup.previousStep} />;
      case 14: return <Step15Terms data={signup.formData} updateData={signup.updateFormData} onSubmit={signup.submitSignup} onBack={signup.previousStep} isSubmitting={signup.isSubmitting} />;
      default: return <Step01Welcome onNext={signup.nextStep} />;
    }
  };

  // Calculate progress based on total steps
  const progress = ((signup.currentStep - 1) / (TOTAL_STEPS - 1)) * 100;

  return (
    <div className="min-h-screen bg-cream-light">
      {/* Progress Bar */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-sm font-medium text-charcoal">Step {signup.currentStep} of {TOTAL_STEPS}</span>
            <span className="text-sm text-muted-foreground ml-auto">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Step Content */}
      <div className="container mx-auto px-4 py-12">
        {renderStep()}
      </div>
    </div>
  );
}
