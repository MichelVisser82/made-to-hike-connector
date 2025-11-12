import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, ExternalLink } from 'lucide-react';
import type { TripDetails } from '@/hooks/useTripDetails';
import { useNavigate } from 'react-router-dom';

interface TripPreparationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripDetails: TripDetails;
}

export function TripPreparationModal({ isOpen, onClose, tripDetails }: TripPreparationModalProps) {
  const { preparationStatus } = tripDetails;
  const navigate = useNavigate();

  const preparationItems = [
    {
      label: 'Payment Confirmed',
      description: 'Your payment has been processed',
      completed: preparationStatus.payment_confirmed,
      action: null
    },
    {
      label: 'Emergency Contact',
      description: 'Add emergency contact information',
      completed: preparationStatus.emergency_contact_added,
      action: () => navigate('/settings/profile')
    },
    {
      label: 'Waiver Signed',
      description: 'Sign the liability waiver',
      completed: preparationStatus.waiver_signed,
      action: null // Will be implemented
    },
    {
      label: 'Travel Insurance',
      description: 'Upload proof of travel insurance',
      completed: preparationStatus.insurance_uploaded,
      action: null // Will be implemented
    },
    {
      label: 'Trip Checklist',
      description: 'Complete your packing checklist',
      completed: preparationStatus.checklist_completed,
      action: null // Switch to checklist tab
    }
  ];

  const completedCount = preparationItems.filter(item => item.completed).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Trip Preparation Checklist</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{completedCount} of {preparationItems.length} completed</span>
              <span className="text-muted-foreground">{preparationStatus.overall_percentage}%</span>
            </div>
            <Progress value={preparationStatus.overall_percentage} className="h-2" />
          </div>

          <div className="space-y-4">
            {preparationItems.map((item, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border ${
                  item.completed ? 'bg-green-50/50 border-green-200' : 'bg-card'
                }`}
              >
                <div className="flex items-start gap-4">
                  {item.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                  ) : (
                    <Circle className="w-6 h-6 text-muted-foreground flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{item.label}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    {!item.completed && item.action && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={item.action}
                      >
                        Complete
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {preparationStatus.overall_percentage === 100 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-green-900">All set for your adventure!</p>
              <p className="text-sm text-green-700 mt-1">
                You've completed all preparation steps. Have a great trip!
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
