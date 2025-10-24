import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar } from 'lucide-react';

export function AvailabilitySettings() {
  return (
    <div className="space-y-6">
      <Card className="border-burgundy/10 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-playfair text-charcoal">Calendar Integration</CardTitle>
          <CardDescription>Sync with your calendar (Coming Soon)</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-burgundy/10">
            <Calendar className="h-4 w-4" />
            <AlertDescription className="text-charcoal/70">
              Calendar sync with Google, iCal, and Outlook coming soon
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
