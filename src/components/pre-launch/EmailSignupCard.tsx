import { useState } from 'react';
import { Mail, CheckCircle, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GuideFollowUpModal } from './GuideFollowUpModal';
import { ensureAnonymousContext } from '@/utils/authCleanup';

interface EmailSignupCardProps {
  userType: 'guide' | 'hiker';
  sectionName: string;
  className?: string;
}

export function EmailSignupCard({ userType, sectionName, className }: EmailSignupCardProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [signupId, setSignupId] = useState<string>('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Ensure we're operating as anonymous user
      await ensureAnonymousContext();

      console.log('[EmailSignup] Submitting as anonymous:', { 
        email: email.toLowerCase().trim(), 
        userType, 
        sectionName 
      });

      const { data, error } = await supabase
        .from('launch_signups')
        .insert({
          email: email.toLowerCase().trim(),
          user_type: userType,
          source_section: sectionName,
        })
        .select('id')
        .single();

      if (error) {
        console.error('[EmailSignup] Insert error:', error);
        
        // Check for RLS policy violation
        if (error.message?.includes('row-level security')) {
          // Try one more time after clearing all auth state
          console.log('[EmailSignup] RLS error detected, clearing auth and retrying...');
          localStorage.clear();
          
          const { data: retryData, error: retryError } = await supabase
            .from('launch_signups')
            .insert({
              email: email.toLowerCase().trim(),
              user_type: userType,
              source_section: sectionName,
            })
            .select('id')
            .single();
          
          if (retryError) {
            console.error('[EmailSignup] Retry failed:', retryError);
            throw retryError;
          }
          
          // Retry succeeded
          if (userType === 'guide' && retryData?.id) {
            setSignupId(retryData.id);
            setShowGuideModal(true);
            setEmail('');
          } else {
            setIsSuccess(true);
            setEmail('');
            setTimeout(() => setIsSuccess(false), 3000);
            toast({
              title: 'Success!',
              description: "You're on the list. We'll email you when we launch!",
            });
          }
          return;
        }
        
        if (error.code === '23505') {
          toast({
            title: "You're already on the list!",
            description: "We'll notify you when we launch.",
          });
        } else {
          throw error;
        }
      } else {
        if (userType === 'guide' && data?.id) {
          setSignupId(data.id);
          setShowGuideModal(true);
          setEmail('');
        } else {
          setIsSuccess(true);
          setEmail('');
          setTimeout(() => setIsSuccess(false), 3000);
          toast({
            title: 'Success!',
            description: "You're on the list. We'll email you when we launch!",
          });
        }
      }
    } catch (error: any) {
      console.error('[EmailSignup] Error submitting email:', error);
      const errorMessage = error?.message || 'Please try again later';
      toast({
        title: 'Something went wrong',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowGuideModal(false);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
    }, 3000);
  };

  return (
    <>
      <Card className={`p-6 bg-gradient-to-br from-burgundy to-burgundy-dark text-white ${className}`}>
        <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">Join the Waitlist</h3>
            <p className="text-sm text-white/80">Be first to know when we launch</p>
          </div>
        </div>

        {isSuccess ? (
          <div className="flex items-center gap-3 py-4">
            <CheckCircle className="h-6 w-6 text-green-400" />
            <div>
              <p className="font-semibold">You're on the list!</p>
              <p className="text-sm text-white/80">We'll email you when we launch</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
              disabled={isLoading}
            />
            <Button
              type="submit"
              className="w-full bg-white text-burgundy hover:bg-white/90"
              disabled={isLoading}
            >
              {isLoading ? 'Joining...' : 'Join Waitlist'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        )}
      </div>
    </Card>

    {userType === 'guide' && (
      <GuideFollowUpModal
        open={showGuideModal}
        onClose={handleModalClose}
        signupId={signupId}
        email={email}
      />
    )}
    </>
  );
}
