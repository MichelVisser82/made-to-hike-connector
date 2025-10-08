import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GuideSignupData } from '@/types/guide';

interface Step15TermsProps {
  data: Partial<GuideSignupData>;
  updateData: (data: Partial<GuideSignupData>) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export function Step15Terms({ data, updateData, onSubmit, onBack, isSubmitting }: Step15TermsProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-serif text-charcoal flex items-center gap-2" style={{fontFamily: 'Playfair Display, serif'}}>
            <CheckCircle className="w-5 h-5 text-burgundy" />
            Terms & Conditions
          </CardTitle>
          <p className="text-muted-foreground">Final step - review and accept our terms</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-6 rounded-lg max-h-64 overflow-y-auto">
            <h3 className="font-semibold mb-4">Guide Agreement</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>By becoming a guide on MadeToHike, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate and truthful information about your qualifications</li>
                <li>Maintain valid certifications and insurance</li>
                <li>Prioritize safety and wellbeing of all participants</li>
                <li>Comply with local regulations and environmental guidelines</li>
                <li>Maintain professional conduct at all times</li>
                <li>Keep your availability and profile information up to date</li>
              </ul>
              <p className="mt-4">Your application will be reviewed by our team within 3-5 business days.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={data.terms_accepted || false}
              onCheckedChange={(checked) => updateData({ terms_accepted: checked as boolean })}
            />
            <Label htmlFor="terms" className="cursor-pointer leading-relaxed">
              I have read and agree to the terms and conditions, and confirm that all information provided is accurate
            </Label>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack} disabled={isSubmitting} className="border-burgundy text-burgundy hover:bg-burgundy/10">Back</Button>
            <Button 
              onClick={onSubmit} 
              disabled={!data.terms_accepted || isSubmitting}
              size="lg"
              className="bg-burgundy hover:bg-burgundy/90 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
