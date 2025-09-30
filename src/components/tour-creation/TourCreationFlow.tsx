import { TourCreationLayout } from './TourCreationLayout';
import { useTourCreation } from '@/hooks/useTourCreation';
import { FormProvider } from 'react-hook-form';
import { type Tour } from '@/types';
import Step1Welcome from './steps/Step1Welcome';
import Step2BasicInfo from './steps/Step2BasicInfo';
import Step3Location from './steps/Step3Location';
import Step4DurationDifficulty from './steps/Step4DurationDifficulty';
import Step5TourDetails from './steps/Step5TourDetails';
import Step6AvailableDates from './steps/Step6AvailableDates';
import Step7Images from './steps/Step7Images';
import Step8Highlights from './steps/Step8Highlights';
import Step9Itinerary from './steps/Step9Itinerary';
import Step10Inclusions from './steps/Step10Inclusions';
import Step11Pricing from './steps/Step11Pricing';
import Step12Review from './steps/Step12Review';

interface TourCreationFlowProps {
  onComplete: () => void;
  onCancel: () => void;
  initialData?: Tour;
}

const stepTitles = [
  'Welcome',
  'Basic Information',
  'Location',
  'Duration & Difficulty',
  'Tour Details',
  'Available Dates',
  'Tour Images',
  'Highlights',
  'Daily Itinerary',
  'Inclusions & Exclusions',
  'Pricing',
  'Review & Publish',
];

export function TourCreationFlow({ onComplete, onCancel, initialData }: TourCreationFlowProps) {
  const { form, currentStep, nextStep, prevStep, goToStep, submitTour, isSubmitting, totalSteps } = useTourCreation(initialData);

  const handleBack = () => {
    if (currentStep === 1) {
      onCancel();
    } else {
      prevStep();
    }
  };

  const handleSubmit = async () => {
    const result = await submitTour(form.getValues());
    if (result.success) {
      onComplete();
    }
  };

  const renderStep = () => {
    const stepProps = { onNext: nextStep, onPrev: prevStep };

    switch (currentStep) {
      case 1:
        return <Step1Welcome onNext={nextStep} />;
      case 2:
        return <Step2BasicInfo {...stepProps} />;
      case 3:
        return <Step3Location {...stepProps} />;
      case 4:
        return <Step4DurationDifficulty {...stepProps} />;
      case 5:
        return <Step5TourDetails {...stepProps} />;
      case 6:
        return <Step6AvailableDates {...stepProps} />;
      case 7:
        return <Step7Images {...stepProps} />;
      case 8:
        return <Step8Highlights {...stepProps} />;
      case 9:
        return <Step9Itinerary {...stepProps} />;
      case 10:
        return <Step10Inclusions {...stepProps} />;
      case 11:
        return <Step11Pricing {...stepProps} />;
      case 12:
        return <Step12Review onSubmit={handleSubmit} onEdit={goToStep} isSubmitting={isSubmitting} />;
      default:
        return null;
    }
  };

  return (
    <FormProvider {...form}>
      <TourCreationLayout
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={handleBack}
        title={stepTitles[currentStep - 1]}
      >
        {renderStep()}
      </TourCreationLayout>
    </FormProvider>
  );
}
