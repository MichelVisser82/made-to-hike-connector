import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';
import type { TripDetails } from '@/hooks/useTripDetails';
import { TripPreparationModal } from './modals/TripPreparationModal';

interface TripPreparationCardProps {
  tripDetails: TripDetails;
}

export function TripPreparationCard({ tripDetails }: TripPreparationCardProps) {
  const [showModal, setShowModal] = useState(false);
  const { preparationStatus } = tripDetails;

  const preparationItems = [
    {
      label: 'Payment Confirmed',
      completed: preparationStatus.payment_confirmed,
      icon: preparationStatus.payment_confirmed ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Circle className="w-5 h-5 text-muted-foreground" />
    },
    {
      label: 'Emergency Contact',
      completed: preparationStatus.emergency_contact_added,
      icon: preparationStatus.emergency_contact_added ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Circle className="w-5 h-5 text-muted-foreground" />
    },
    {
      label: 'Waiver Signed',
      completed: preparationStatus.waiver_signed,
      icon: preparationStatus.waiver_signed ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Circle className="w-5 h-5 text-muted-foreground" />
    },
    {
      label: 'Travel Insurance',
      completed: preparationStatus.insurance_uploaded,
      icon: preparationStatus.insurance_uploaded ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Circle className="w-5 h-5 text-muted-foreground" />
    },
    {
      label: 'Trip Checklist',
      completed: preparationStatus.checklist_completed,
      icon: preparationStatus.checklist_completed ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Circle className="w-5 h-5 text-muted-foreground" />
    }
  ];

  const completedCount = preparationItems.filter(item => item.completed).length;

  return (
    <>
      <Card className={preparationStatus.overall_percentage === 100 ? 'border-green-200 bg-green-50/30' : ''}>
        <CardHeader>
          <CardTitle className="text-lg">Trip Preparation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{completedCount} of {preparationItems.length} completed</span>
              <span className="text-muted-foreground">{preparationStatus.overall_percentage}%</span>
            </div>
            <Progress value={preparationStatus.overall_percentage} className="h-2" />
          </div>

          <div className="space-y-3">
            {preparationItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                {item.icon}
                <span className={`text-sm ${item.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <Button
            variant={preparationStatus.overall_percentage === 100 ? 'outline' : 'default'}
            className="w-full"
            onClick={() => setShowModal(true)}
          >
            {preparationStatus.overall_percentage === 100 ? 'View Details' : 'Complete Preparation'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      <TripPreparationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        tripDetails={tripDetails}
      />
    </>
  );
}
