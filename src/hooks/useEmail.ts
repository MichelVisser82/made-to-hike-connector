import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface EmailData {
  type: 'contact' | 'newsletter' | 'booking' | 'custom_verification' | 'waiver_confirmation'
  to?: string
  name?: string
  email?: string
  subject?: string
  message?: string
  [key: string]: any
}

export const useEmail = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const sendEmail = async (emailData: EmailData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      console.log('Sending email request:', emailData)
      
      const { data, error: supabaseError } = await supabase.functions.invoke('send-email', {
        body: emailData,
      })

      if (supabaseError) {
        console.error('Supabase function error:', supabaseError)
        throw new Error(supabaseError.message || 'Failed to send email')
      }

      if (data?.error) {
        console.error('Email service error:', data.error)
        throw new Error(data.error)
      }

      console.log('Email sent successfully:', data)
      setSuccess(true)
      return data

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      console.error('Email sending error:', err)
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const reset = () => {
    setError(null)
    setSuccess(false)
    setIsLoading(false)
  }

  return { 
    sendEmail, 
    isLoading, 
    error, 
    success, 
    reset 
  }
}

// Specific hooks for different email types
export const useContactForm = () => {
  const { sendEmail, isLoading, error, success, reset } = useEmail()

  const sendContactEmail = async (contactData: {
    name: string
    email: string
    subject?: string
    message: string
  }) => {
    return sendEmail({
      type: 'contact',
      to: 'contact@madetohike.com', // Your contact email
      ...contactData
    })
  }

  return { sendContactEmail, isLoading, error, success, reset }
}

export const useNewsletter = () => {
  const { sendEmail, isLoading, error, success, reset } = useEmail()

  const subscribeToNewsletter = async (subscriptionData: {
    email: string
    name?: string
  }) => {
    return sendEmail({
      type: 'newsletter',
      to: subscriptionData.email,
      ...subscriptionData
    })
  }

  return { subscribeToNewsletter, isLoading, error, success, reset }
}