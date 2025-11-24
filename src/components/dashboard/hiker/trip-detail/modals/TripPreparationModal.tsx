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
  const { preparationStatus, tour } = tripDetails;
  const navigate = useNavigate();

  // Check if packing list is enabled for this tour
  const hasPackingList = tour.packing_list && (tour.packing_list as any)?.enabled;

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
    // Only include Trip Checklist if packing list is enabled
    ...(hasPackingList ? [{
      label: 'Trip Checklist',
      description: 'Complete your packing checklist',
      completed: preparationStatus.checklist_completed,
      action: null // Switch to checklist tab
    }] : [])
  ];

  const completedCount = preparationItems.filter(item => item.completed).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] bg-cream border-burgundy/20">
        <DialogHeader className="space-y-3 pb-4">
          <DialogTitle className="text-3xl text-burgundy text-center" style={{fontFamily: 'Playfair Display, serif'}}>
            Trip Preparation
          </DialogTitle>
          <p className="text-muted-foreground text-center text-sm">
            Complete these steps to ensure you're ready for your adventure
          </p>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Progress Section */}
          <div className="bg-white rounded-lg p-5 border border-burgundy/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                {completedCount} of {preparationItems.length} steps completed
              </span>
              <span className="text-lg font-bold text-burgundy" style={{fontFamily: 'Playfair Display, serif'}}>
                {preparationStatus.overall_percentage}%
              </span>
            </div>
            <Progress 
              value={preparationStatus.overall_percentage} 
              className="h-3 bg-burgundy/10"
            />
          </div>

          {/* Checklist Items */}
          <div className="space-y-3">
            {preparationItems.map((item, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  item.completed 
                    ? 'bg-sage/5 border-sage/30 shadow-sm' 
                    : 'bg-white border-burgundy/10 hover:border-burgundy/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  {item.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-sage flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-6 h-6 text-burgundy/40 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground mb-1">
                      {item.label}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    {!item.completed && item.action && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 border-burgundy/30 text-burgundy hover:bg-burgundy/5"
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

          {/* Success Message */}
          {preparationStatus.overall_percentage === 100 && (
            <div className="p-5 bg-sage/10 border border-sage/30 rounded-lg text-center animate-fade-in">
              <CheckCircle2 className="w-10 h-10 text-sage mx-auto mb-3" />
              <p className="text-lg font-semibold text-sage mb-2" style={{fontFamily: 'Playfair Display, serif'}}>
                All Set for Your Adventure!
              </p>
              <p className="text-sm text-muted-foreground">
                You've completed all preparation steps. Have a wonderful journey!
              </p>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-center pt-2">
            <Button 
              onClick={onClose}
              className="bg-burgundy text-white hover:bg-burgundy/90 px-8"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
