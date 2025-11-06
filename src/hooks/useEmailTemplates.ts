import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface EmailTemplate {
  id: string
  guide_id: string
  name: string
  description?: string
  subject: string
  content: string
  trigger_type: 'booking_confirmed' | 'booking_reminder' | 'tour_completed' | 'custom'
  timing_value: number
  timing_unit: 'minutes' | 'hours' | 'days'
  timing_direction: 'before' | 'after'
  is_active: boolean
  send_as_email: boolean
  created_at: string
  updated_at: string
}

export const useEmailTemplates = (guideId?: string) => {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: templates, isLoading } = useQuery({
    queryKey: ['email-templates', guideId],
    queryFn: async () => {
      if (!guideId) return []

      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('guide_id', guideId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as EmailTemplate[]
    },
    enabled: !!guideId
  })

  const createTemplate = useMutation({
    mutationFn: async (template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('email_templates')
        .insert(template)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] })
      toast({
        title: 'Template created',
        description: 'Email template has been created successfully'
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create template: ${error.message}`,
        variant: 'destructive'
      })
    }
  })

  const updateTemplate = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<EmailTemplate> }) => {
      const { data, error } = await supabase
        .from('email_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] })
      toast({
        title: 'Template updated',
        description: 'Email template has been updated successfully'
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update template: ${error.message}`,
        variant: 'destructive'
      })
    }
  })

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] })
      toast({
        title: 'Template deleted',
        description: 'Email template has been deleted successfully'
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete template: ${error.message}`,
        variant: 'destructive'
      })
    }
  })

  const toggleTemplate = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('email_templates')
        .update({ is_active: isActive })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to toggle template: ${error.message}`,
        variant: 'destructive'
      })
    }
  })

  return {
    templates: templates || [],
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    toggleTemplate
  }
}
