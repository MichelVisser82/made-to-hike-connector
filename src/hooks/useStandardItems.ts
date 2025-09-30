import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StandardItem {
  id: string;
  step_name: string;
  category: string;
  item_text: string;
  is_active: boolean;
  sort_order: number;
}

export function useStandardItems(stepName: string, category?: string) {
  return useQuery({
    queryKey: ['standard-items', stepName, category],
    queryFn: async () => {
      let query = supabase
        .from('tour_step_templates')
        .select('*')
        .eq('step_name', stepName)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as StandardItem[];
    },
  });
}
