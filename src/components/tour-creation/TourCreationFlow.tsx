import { useState } from 'react';
import { TourCreationLayout } from './TourCreationLayout';
import { useTourCreation } from '@/hooks/useTourCreation';
import { FormProvider } from 'react-hook-form';
import { type Tour } from '@/types';
import { MainLayout } from '../layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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
import Step11Pricing from './steps/Step11Pricing';
import Step12Review from './steps/Step12Review';

interface TourCreationFlowProps {
  onComplete: () => void;
  onCancel: () => void;
  initialData?: Tour;
  editMode?: boolean;
  tourId?: string;
}

const tabs = [
  { value: 'basic', label: 'Basic Info' },
  { value: 'location', label: 'Location' },
  { value: 'duration', label: 'Duration & Difficulty' },
  { value: 'details', label: 'Tour Details' },
  { value: 'dates', label: 'Available Dates' },
  { value: 'images', label: 'Images' },
  { value: 'route', label: 'Route & Map' },
  { value: 'highlights', label: 'Highlights' },
  { value: 'itinerary', label: 'Itinerary' },
  { value: 'inclusions', label: 'Inclusions' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'review', label: 'Review' },
];

export function TourCreationFlow({ onComplete, onCancel, initialData, editMode = false, tourId }: TourCreationFlowProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const { form, submitTour, saveProgress, isSubmitting, isSaving, editMode: isEditMode } = useTourCreation({ 
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
    await saveProgress(form.getValues());
  };

  return (
    <MainLayout>
      <FormProvider {...form}>
        <TourCreationLayout
          onBack={onCancel}
          editMode={isEditMode}
          tourTitle={initialData?.title}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <ScrollArea className="w-full">
              <TabsList className="inline-flex w-max min-w-full justify-start mb-6">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value} className="whitespace-nowrap">
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <TabsContent value="basic" className="mt-6">
              <Step2BasicInfo onSave={handleSaveTab} isSaving={isSaving} />
            </TabsContent>

            <TabsContent value="location" className="mt-6">
              <Step3Location onSave={handleSaveTab} isSaving={isSaving} />
            </TabsContent>

            <TabsContent value="duration" className="mt-6">
              <Step4DurationDifficulty onSave={handleSaveTab} isSaving={isSaving} />
            </TabsContent>

            <TabsContent value="details" className="mt-6">
              <Step5TourDetails onSave={handleSaveTab} isSaving={isSaving} />
            </TabsContent>

            <TabsContent value="dates" className="mt-6">
              <Step6AvailableDates onSave={handleSaveTab} isSaving={isSaving} />
            </TabsContent>

            <TabsContent value="images" className="mt-6">
              <Step7Images onSave={handleSaveTab} isSaving={isSaving} />
            </TabsContent>

            <TabsContent value="route" className="mt-6">
              <Step8RouteMap onSave={handleSaveTab} isSaving={isSaving} tourId={tourId} />
            </TabsContent>

            <TabsContent value="highlights" className="mt-6">
              <Step8Highlights onSave={handleSaveTab} isSaving={isSaving} />
            </TabsContent>

            <TabsContent value="itinerary" className="mt-6">
              <Step9Itinerary onSave={handleSaveTab} isSaving={isSaving} />
            </TabsContent>

            <TabsContent value="inclusions" className="mt-6">
              <Step10Inclusions onSave={handleSaveTab} isSaving={isSaving} />
            </TabsContent>

            <TabsContent value="pricing" className="mt-6">
              <Step11Pricing onSave={handleSaveTab} isSaving={isSaving} />
            </TabsContent>

            <TabsContent value="review" className="mt-6">
              <Step12Review onSubmit={handleSubmit} isSubmitting={isSubmitting} editMode={isEditMode} />
            </TabsContent>
          </Tabs>
        </TourCreationLayout>
      </FormProvider>
    </MainLayout>
  );
}
