import { UseFormReturn } from 'react-hook-form';
import { BookingFormData, PricingDetails } from '@/types/booking';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Phone, AlertCircle, Utensils, FileText, Edit } from 'lucide-react';
import { format } from 'date-fns';

interface ReviewStepProps {
  form: UseFormReturn<BookingFormData>;
  tourData: any;
  guideData: any;
  selectedSlot: any;
  pricing: PricingDetails;
  onNext: () => void;
  onBack: () => void;
  onEdit: (step: number) => void;
}

export const ReviewStep = ({
  form,
  tourData,
  guideData,
  selectedSlot,
  pricing,
  onNext,
  onBack,
  onEdit
}: ReviewStepProps) => {
  const formData = form.getValues();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Review Your Booking</h2>
        <p className="text-muted-foreground">
          Please review all details before proceeding to payment
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Tour & Guide Info */}
          <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">Tour Details</h3>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg">{tourData.title}</h4>
                <p className="text-sm text-muted-foreground">{tourData.region}</p>
                <Badge variant="secondary" className="mt-2">{tourData.duration}</Badge>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={guideData.profileImageUrl} />
                  <AvatarFallback>{guideData.displayName?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Your Guide</p>
                  <p className="text-sm text-muted-foreground">{guideData.displayName}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Selected Date */}
          <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">Date & Participants</h3>
              <Button variant="ghost" size="sm" onClick={() => onEdit(1)}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="font-medium">
                  {selectedSlot?.slotDate ? format(new Date(selectedSlot.slotDate), 'EEEE, MMMM d, yyyy') : 'Date not selected'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <span>{formData.participants.length} participant{formData.participants.length > 1 ? 's' : ''}</span>
              </div>
            </div>
          </Card>

          {/* Participants */}
          <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">Participants</h3>
              <Button variant="ghost" size="sm" onClick={() => onEdit(2)}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
            <div className="space-y-3">
              {formData.participants.map((p, idx) => (
                <div key={idx} className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{p.firstName} {p.surname}</p>
                  <div className="text-sm text-muted-foreground">
                    Age {p.age} • {p.experience}
                  </div>
                  {p.medicalConditions && (
                    <p className="text-sm mt-1">Medical: {p.medicalConditions}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Contact Info */}
          <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">Contact Information</h3>
              <Button variant="ghost" size="sm" onClick={() => onEdit(3)}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <span>{formData.country} {formData.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Emergency Contact</p>
                  <p className="text-sm text-muted-foreground">
                    {formData.emergencyContactName} ({formData.emergencyContactRelationship})
                  </p>
                  <p className="text-sm text-muted-foreground">{formData.emergencyContactPhone}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Special Requests */}
          {(formData.dietaryPreferences?.length > 0 || formData.accessibilityNeeds || formData.specialRequests) && (
            <Card className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">Special Requests</h3>
                <Button variant="ghost" size="sm" onClick={() => onEdit(4)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
              <div className="space-y-3">
                {formData.dietaryPreferences && formData.dietaryPreferences.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Utensils className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Dietary Preferences</p>
                      <p className="text-sm text-muted-foreground">
                        {formData.dietaryPreferences.join(', ')}
                      </p>
                    </div>
                  </div>
                )}
                {formData.accessibilityNeeds && (
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Accessibility Needs</p>
                      <p className="text-sm text-muted-foreground">{formData.accessibilityNeeds}</p>
                    </div>
                  </div>
                )}
                {formData.specialRequests && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Additional Notes</p>
                      <p className="text-sm text-muted-foreground">{formData.specialRequests}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Pricing Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-4">
            <h3 className="text-xl font-semibold mb-4">Pricing Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {selectedSlot?.currency === 'EUR' ? '€' : selectedSlot?.currency === 'GBP' ? '£' : '$'}
                  {selectedSlot?.price} × {formData.participants.length} person{formData.participants.length > 1 ? 's' : ''}
                </span>
                <span className="font-medium">
                  {selectedSlot?.currency === 'EUR' ? '€' : selectedSlot?.currency === 'GBP' ? '£' : '$'}
                  {pricing.subtotal.toFixed(2)}
                </span>
              </div>

              {pricing.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{selectedSlot?.currency === 'EUR' ? '€' : selectedSlot?.currency === 'GBP' ? '£' : '$'}{pricing.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service Fee</span>
                <span className="font-medium">
                  {selectedSlot?.currency === 'EUR' ? '€' : selectedSlot?.currency === 'GBP' ? '£' : '$'}
                  {pricing.serviceFee.toFixed(2)}
                </span>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">
                  {selectedSlot?.currency === 'EUR' ? '€' : selectedSlot?.currency === 'GBP' ? '£' : '$'}
                  {pricing.total.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} size="lg">
          Continue to Payment
        </Button>
      </div>
    </div>
  );
};
