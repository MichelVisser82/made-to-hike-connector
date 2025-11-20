import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, ChevronRight, AlertCircle } from 'lucide-react';
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
      label: preparationStatus.waiver_signed ? 'Waiver submitted' : 'Waiver pending',
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
      <div className="p-6 bg-white border border-burgundy/10 rounded-lg shadow-md">
        <h3 className="text-lg mb-3 text-charcoal font-playfair">Preparation Status</h3>
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-charcoal/70">Overall Progress</span>
            <span className="text-sm font-medium text-burgundy">{preparationStatus.overall_percentage}%</span>
          </div>
          <Progress value={preparationStatus.overall_percentage} className="h-2" />
        </div>

        <div className="space-y-2 text-sm mb-4">
          {preparationItems.map((item, idx) => (
            <div key={idx} className={`flex items-center gap-2 ${item.completed ? 'text-sage' : 'text-gold'}`}>
              {item.completed ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <Button
          variant={preparationStatus.overall_percentage === 100 ? 'outline' : 'default'}
          className={preparationStatus.overall_percentage === 100 ? 'w-full border-burgundy/30 text-burgundy hover:bg-burgundy/5' : 'w-full bg-burgundy hover:bg-burgundy-dark text-white'}
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
