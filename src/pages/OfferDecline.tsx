import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

export default function OfferDecline() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [declined, setDeclined] = useState(false);

  const handleDecline = async () => {
    const token = searchParams.get('token');
    
    if (!token) {
      toast({
        title: "Error",
        description: "Invalid offer link",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.functions.invoke('decline-offer', {
        body: { token, reason: reason.trim() || null },
      });

      if (error) throw error;

      setDeclined(true);
      
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err: any) {
      console.error('Error declining offer:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to decline offer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (declined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle>Offer Declined</CardTitle>
            <CardDescription>
              Your response has been sent to the guide. Redirecting you to the homepage...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <X className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-center">Decline Tour Offer</CardTitle>
          <CardDescription className="text-center">
            Let the guide know why you're declining this offer (optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="e.g., Dates don't work, looking for different location, etc."
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="w-full"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDecline}
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Declining...' : 'Decline Offer'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
