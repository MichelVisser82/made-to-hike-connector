import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sanitizeFAQAnswer } from '@/utils/sanitizeHTML';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  user_type: string;
  sort_order: number;
}

export function HelpFAQSection() {
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ['help-faqs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('help_faqs')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as FAQ[];
    },
  });

  const guideFaqs = faqs.filter(faq => faq.user_type === 'guide' || faq.user_type === 'both');
  const hikerFaqs = faqs.filter(faq => faq.user_type === 'hiker' || faq.user_type === 'both');
  const generalFaqs = faqs.filter(faq => faq.category === 'general');

  const handleFeedback = async (faqId: string, wasHelpful: boolean) => {
    setFeedbackGiven(prev => ({ ...prev, [faqId]: true }));
    
    try {
      const column = wasHelpful ? 'helpful_count' : 'not_helpful_count';
      const { data: currentFaq } = await supabase
        .from('help_faqs')
        .select(column)
        .eq('id', faqId)
        .single();

      if (currentFaq) {
        await supabase
          .from('help_faqs')
          .update({ [column]: currentFaq[column] + 1 })
          .eq('id', faqId);
      }

      toast({
        title: 'Thank you!',
        description: wasHelpful 
          ? 'Glad we could help!' 
          : 'We\'ll work on improving this answer.',
      });
    } catch (error) {
      console.error('Error recording feedback:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const renderFAQList = (faqList: FAQ[]) => (
    <Accordion type="single" collapsible className="w-full">
      {faqList.map((faq) => (
        <AccordionItem key={faq.id} value={faq.id}>
          <AccordionTrigger className="text-left hover:no-underline">
            <span className="font-medium">{faq.question}</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div 
                className="text-sm text-muted-foreground prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: sanitizeFAQAnswer(faq.answer)
                }}
              />
              
              {!feedbackGiven[faq.id] && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Was this helpful?</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFeedback(faq.id, true)}
                    className="hover:text-green-600"
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Yes
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFeedback(faq.id, false)}
                    className="hover:text-red-600"
                  >
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    No
                  </Button>
                </div>
              )}
              
              {feedbackGiven[faq.id] && (
                <p className="text-sm text-muted-foreground pt-2 border-t">
                  Thanks for your feedback!
                </p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );

  return (
    <Tabs defaultValue="hikers" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="hikers">For Hikers</TabsTrigger>
        <TabsTrigger value="guides">For Guides</TabsTrigger>
        <TabsTrigger value="general">General</TabsTrigger>
      </TabsList>
      
      <TabsContent value="hikers" className="mt-6">
        {renderFAQList(hikerFaqs)}
      </TabsContent>
      
      <TabsContent value="guides" className="mt-6">
        {renderFAQList(guideFaqs)}
      </TabsContent>
      
      <TabsContent value="general" className="mt-6">
        {renderFAQList(generalFaqs)}
      </TabsContent>
    </Tabs>
  );
}
