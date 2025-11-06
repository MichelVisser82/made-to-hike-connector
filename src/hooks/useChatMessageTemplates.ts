import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessageTemplate {
  id: string;
  guide_id: string;
  name: string;
  description?: string;
  message_content: string;
  category: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function useChatMessageTemplates(guideId?: string) {
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['chat-message-templates', guideId],
    queryFn: async () => {
      if (!guideId) return [];
      
      const { data, error } = await supabase
        .from('chat_message_templates')
        .select('*')
        .eq('guide_id', guideId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ChatMessageTemplate[];
    },
    enabled: !!guideId,
  });

  const createTemplate = useMutation({
    mutationFn: async (template: Omit<ChatMessageTemplate, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('chat_message_templates')
        .insert(template)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-message-templates', guideId] });
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ChatMessageTemplate> }) => {
      const { data, error } = await supabase
        .from('chat_message_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-message-templates', guideId] });
    },
  });

  const toggleTemplate = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('chat_message_templates')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-message-templates', guideId] });
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('chat_message_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-message-templates', guideId] });
    },
  });

  return {
    templates,
    isLoading,
    createTemplate,
    updateTemplate,
    toggleTemplate,
    deleteTemplate,
  };
}
