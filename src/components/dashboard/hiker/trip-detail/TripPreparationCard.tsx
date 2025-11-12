import { useState } from 'react';
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
      label: 'Payment confirmed',
      completed: preparationStatus.payment_confirmed,
    },
    {
      label: 'Emergency contact added',
      completed: preparationStatus.emergency_contact_added,
    },
    {
      label: 'Waiver pending',
      completed: preparationStatus.waiver_signed,
    },
    {
      label: 'Travel insurance needed',
      completed: preparationStatus.insurance_uploaded,
    }
  ];

  const completedCount = preparationItems.filter(item => item.completed).length;

  return (
    <>
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Preparation Status</h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Overall Progress</span>
            <span className="text-[#7c2843] font-semibold">{preparationStatus.overall_percentage}%</span>
          </div>
          <Progress value={preparationStatus.overall_percentage} className="h-2" />
        </div>

        <div className="space-y-2.5 mb-4">
          {preparationItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2.5">
              {item.completed ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
              )}
              <span className={`text-sm ${item.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <Button
          variant={preparationStatus.overall_percentage === 100 ? 'outline' : 'default'}
          className={preparationStatus.overall_percentage === 100 ? 'w-full' : 'w-full bg-[#7c2843] hover:bg-[#5d1e32] font-medium'}
          onClick={() => setShowModal(true)}
        >
          {preparationStatus.overall_percentage === 100 ? 'View Details' : 'Complete Preparation'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <TripPreparationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        tripDetails={tripDetails}
      />
    </>
  );
}
