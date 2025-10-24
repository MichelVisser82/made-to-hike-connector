import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  user_type: string;
  helpful_count: number;
  not_helpful_count: number;
}

interface SearchResult {
  results: FAQ[];
  suggestions: string[];
}

export function useHelpSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string): Promise<SearchResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error: functionError } = await supabase.functions.invoke('help-search', {
        body: { 
          query,
          userId: user?.id || null,
        },
      });

      if (functionError) throw functionError;

      return data as SearchResult;
    } catch (err: any) {
      console.error('Help search error:', err);
      setError(err.message || 'Failed to search help articles');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const recordFeedback = async (faqId: string, wasHelpful: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get current count
      const column = wasHelpful ? 'helpful_count' : 'not_helpful_count';
      const { data: currentFaq } = await supabase
        .from('help_faqs')
        .select(column)
        .eq('id', faqId)
        .single();

      if (currentFaq) {
        // Increment count
        await supabase
          .from('help_faqs')
          .update({ [column]: currentFaq[column] + 1 })
          .eq('id', faqId);
      }
    } catch (err: any) {
      console.error('Error recording feedback:', err);
    }
  };

  return { search, recordFeedback, isLoading, error };
}
