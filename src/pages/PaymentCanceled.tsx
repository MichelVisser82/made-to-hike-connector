import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';

export default function PaymentCanceled() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-warning">
          <CardHeader>
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-warning" />
              <div>
                <CardTitle>Payment Canceled</CardTitle>
                <CardDescription>You canceled the payment process</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              No charges were made to your payment method. You can try again whenever you're ready.
            </p>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/')}>
                Back to Home
              </Button>
              <Button onClick={() => navigate('/tours')}>
                Browse Tours
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
