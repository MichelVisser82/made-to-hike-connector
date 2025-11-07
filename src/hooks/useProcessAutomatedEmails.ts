import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface ProcessEmailsResult {
  success: boolean
  templates_processed: number
  emails_sent: number
  lookback_days: number
}

export const useProcessAutomatedEmails = () => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ProcessEmailsResult | null>(null)

  const processEmails = async (lookbackDays: number = 30) => {
    setIsProcessing(true)
    setError(null)
    setResult(null)

    try {
      const { data, error: functionError } = await supabase.functions.invoke('process-automated-emails', {
        body: { lookbackDays }
      })

      if (functionError) {
        throw new Error(functionError.message)
      }

      setResult(data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process emails'
      setError(errorMessage)
      throw err
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    processEmails,
    isProcessing,
    error,
    result
  }
}
