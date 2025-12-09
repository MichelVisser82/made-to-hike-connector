import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const GuideSignupSuccessPage = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-burgundy to-burgundy-dark py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-white/20 p-4">
              <CheckCircle className="h-16 w-16 text-white" />
            </div>
          </div>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome to MadeToHike!
          </h1>
          <p className="text-xl text-white/90">
            Your guide application has been submitted for review
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="grid gap-6">
          {/* What happens next */}
          <Card className="border-sage/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-sage/10 p-3">
                  <Clock className="h-6 w-6 text-sage-dark" />
                </div>
                <div>
                  <h2 className="font-playfair text-xl font-semibold text-foreground mb-2">
                    What happens next?
                  </h2>
                  <p className="text-muted-foreground">
                    Our team will review your application within <strong>3-5 business days</strong>. 
                    We'll verify your certifications and experience to ensure the highest quality 
                    for our hiking community.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* While you wait */}
          <Card className="border-sage/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-burgundy/10 p-3">
                  <ArrowRight className="h-6 w-6 text-burgundy" />
                </div>
                <div>
                  <h2 className="font-playfair text-xl font-semibold text-foreground mb-2">
                    While you wait
                  </h2>
                  <ul className="text-muted-foreground space-y-2">
                    <li>• Complete your profile with photos and bio</li>
                    <li>• Explore the guide dashboard and features</li>
                    <li>• Start planning your first tour</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate('/dashboard')}
            className="bg-burgundy hover:bg-burgundy-dark text-white"
          >
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/')}
            className="border-burgundy text-burgundy hover:bg-burgundy/5"
          >
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>

        {/* Auto-redirect notice */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Redirecting to dashboard in {countdown} seconds...
        </p>
      </div>
    </div>
  );
};

export default GuideSignupSuccessPage;
