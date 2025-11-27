import { useState } from 'react';
import { useTourCreation } from '@/hooks/useTourCreation';
import { FormProvider } from 'react-hook-form';
import { type Tour } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, FileText, Mountain, Settings, CheckCircle } from 'lucide-react';
import Step1Welcome from './steps/Step1Welcome';
import Step2BasicInfo from './steps/Step2BasicInfo';
import Step3Location from './steps/Step3Location';
import Step4DurationDifficulty from './steps/Step4DurationDifficulty';
import Step5TourDetails from './steps/Step5TourDetails';
import Step6AvailableDates from './steps/Step6AvailableDates';
import Step7Images from './steps/Step7Images';
import { Step8RouteMap } from './steps/Step8RouteMap';
import Step8Highlights from './steps/Step8Highlights';
import Step9Itinerary from './steps/Step9Itinerary';
import Step10Inclusions from './steps/Step10Inclusions';
import PackingListSection from './steps/PackingListSection';
import Step11Pricing from './steps/Step11Pricing';
import Step12Review from './steps/Step12Review';

interface TourCreationFlowProps {
  onComplete: () => void;
  onCancel: () => void;
  initialData?: Tour;
  editMode?: boolean;
  tourId?: string;
}

// Two-level tab configuration
const mainTabsConfig = {
  basics: {
    label: 'Basics',
    icon: Info,
    subTabs: [
      { value: 'basic-info', label: 'Basic Info', component: Step2BasicInfo },
      { value: 'location', label: 'Location', component: Step3Location },
      { value: 'duration', label: 'Duration & Difficulty', component: Step4DurationDifficulty }
    ]
  },
  content: {
    label: 'Content',
    icon: FileText,
    subTabs: [
      { value: 'details', label: 'Tour Details', component: Step5TourDetails },
      { value: 'images', label: 'Images', component: Step7Images }
    ]
  },
  experience: {
    label: 'Experience',
    icon: Mountain,
    subTabs: [
      { value: 'route', label: 'Route & Map', component: Step8RouteMap },
      { value: 'highlights', label: 'Highlights', component: Step8Highlights },
      { value: 'itinerary', label: 'Itinerary', component: Step9Itinerary }
    ]
  },
  logistics: {
    label: 'Logistics',
    icon: Settings,
    subTabs: [
      { value: 'dates', label: 'Available Dates', component: Step6AvailableDates },
      { value: 'inclusions', label: 'Inclusions', component: Step10Inclusions },
      { value: 'packing-list', label: 'Packing List', component: PackingListSection },
      { value: 'pricing', label: 'Pricing', component: Step11Pricing }
    ]
  },
  review: {
    label: 'Review',
    icon: CheckCircle,
    subTabs: []
  }
} as const;

type MainTabKey = keyof typeof mainTabsConfig;

export function TourCreationFlow({ onComplete, onCancel, initialData, editMode = false, tourId }: TourCreationFlowProps) {
  const [activeMainTab, setActiveMainTab] = useState<MainTabKey>('basics');
  const [activeSubTab, setActiveSubTab] = useState('basic-info');
  const { 
    form, 
    currentStep,
    nextStep,
    prevStep,
    submitTour, 
    saveProgress, 
    isSubmitting, 
    isSaving, 
    editMode: isEditMode,
    draftTourId
  } = useTourCreation({ 
    initialData, 
    editMode, 
    tourId 
  });

  const handleSubmit = async () => {
    const result = await submitTour(form.getValues());
    if (result.success) {
      onComplete();
    }
  };

  const handleSaveTab = async () => {
    await saveProgress(form.getValues(), true); // Show toast for manual saves
  };

  const handleNext = async () => {
    await saveProgress(form.getValues(), false); // Silent auto-save on next
    nextStep();
  };

  const handlePrev = () => {
    prevStep();
  };

  // Handle main tab changes
  const handleMainTabChange = (newMainTab: string) => {
    setActiveMainTab(newMainTab as MainTabKey);
    const config = mainTabsConfig[newMainTab as MainTabKey];
    
    // If the new main tab has sub-tabs, set to the first one
    if (config.subTabs.length > 0) {
      setActiveSubTab(config.subTabs[0].value);
    }
  };

  // Step-by-step flow for new tours
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1Welcome onNext={nextStep} />;
      case 2:
        return <Step2BasicInfo onNext={handleNext} onPrev={handlePrev} isSaving={isSaving} tourId={draftTourId || tourId} />;
      case 3:
        return <Step3Location onNext={handleNext} onPrev={handlePrev} isSaving={isSaving} />;
      case 4:
        return <Step4DurationDifficulty onNext={handleNext} onPrev={handlePrev} isSaving={isSaving} />;
      case 5:
        return <Step5TourDetails onNext={handleNext} onPrev={handlePrev} isSaving={isSaving} />;
      case 6:
        return <Step6AvailableDates onNext={handleNext} onPrev={handlePrev} isSaving={isSaving} />;
      case 7:
        return <Step7Images onNext={handleNext} onPrev={handlePrev} isSaving={isSaving} />;
      case 8:
        return <Step8RouteMap onNext={handleNext} onPrev={handlePrev} isSaving={isSaving} tourId={draftTourId || tourId} />;
      case 9:
        return <Step8Highlights onNext={handleNext} onPrev={handlePrev} isSaving={isSaving} />;
      case 10:
        return <Step9Itinerary onNext={handleNext} onPrev={handlePrev} isSaving={isSaving} />;
      case 11:
        return <Step10Inclusions onNext={handleNext} onPrev={handlePrev} isSaving={isSaving} />;
      case 12:
        return <Step11Pricing onNext={handleNext} onPrev={handlePrev} isSaving={isSaving} />;
      case 13:
        return <Step12Review onSubmit={handleSubmit} isSubmitting={isSubmitting} editMode={false} onPrev={handlePrev} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-light to-cream">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <FormProvider {...form}>
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h1 className="text-3xl font-playfair text-charcoal mb-2">
                  {isEditMode ? 'Edit Tour' : 'Create New Tour'}
                </h1>
                <p className="text-charcoal/60">
                  {isEditMode 
                    ? 'Update your tour details and save changes' 
                    : 'Build your perfect hiking experience step by step'
                  }
                </p>
              </div>
            </div>
          </div>

          {isEditMode ? (
            // Two-level tab navigation for editing
            <div className="w-full">
              {/* Main Tabs */}
              <Tabs value={activeMainTab} onValueChange={handleMainTabChange}>
                <TabsList className="bg-cream border border-burgundy/20 rounded-lg p-1 mb-6 w-full justify-start">
                  {Object.entries(mainTabsConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <TabsTrigger 
                        key={key}
                        value={key}
                        className="flex items-center gap-2 data-[state=active]:bg-burgundy data-[state=active]:text-white text-charcoal transition-all"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{config.label}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {/* Sub-Tabs (conditional) */}
                {mainTabsConfig[activeMainTab].subTabs.length > 0 && (
                  <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
                    <TabsList className="bg-cream/50 rounded-lg p-1 mb-4 w-full justify-start">
                      {mainTabsConfig[activeMainTab].subTabs.map((subTab) => (
                        <TabsTrigger
                          key={subTab.value}
                          value={subTab.value}
                          className="data-[state=active]:bg-burgundy data-[state=active]:text-white text-charcoal"
                        >
                          {subTab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {/* Sub-Tab Content */}
                    {mainTabsConfig[activeMainTab].subTabs.map((subTab) => {
                      const Component = subTab.component;
                      const isRouteMap = subTab.value === 'route';
                      const isBasicInfo = subTab.value === 'basic-info';
                      
                      return (
                        <TabsContent key={subTab.value} value={subTab.value} className="mt-6">
                          {isRouteMap ? (
                            <Component onSave={handleSaveTab} isSaving={isSaving} tourId={draftTourId || tourId} />
                          ) : isBasicInfo ? (
                            <Component onSave={handleSaveTab} isSaving={isSaving} tourId={draftTourId || tourId} />
                          ) : (
                            <Component onSave={handleSaveTab} isSaving={isSaving} />
                          )}
                        </TabsContent>
                      );
                    })}
                  </Tabs>
                )}

                {/* Review Tab Content (no sub-tabs) */}
                {activeMainTab === 'review' && (
                  <div className="mt-6">
                    <Step12Review onSubmit={handleSubmit} isSubmitting={isSubmitting} editMode={isEditMode} />
                  </div>
                )}
              </Tabs>
            </div>
          ) : (
            // Step-by-step flow for new tours
            <div className="mt-6">
              {renderStepContent()}
            </div>
          )}
        </FormProvider>
      </div>
    </div>
  );
}
