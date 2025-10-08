import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useContactForm } from '@/hooks/useEmail'
import { Loader2, Send, CheckCircle } from 'lucide-react'
import { contactFormSchema, type ContactFormData } from '@/lib/validationSchemas'

export const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({})

  const { sendContactEmail, isLoading, error, success, reset } = useContactForm()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationErrors({})
    
    try {
      // Validate with Zod - parse() throws on error with correct types
      const validatedData = contactFormSchema.parse(formData) as {
        name: string;
        email: string;
        subject?: string;
        message: string;
      };
      
      await sendContactEmail(validatedData)
      
      toast({
        title: "Message Sent! 🎉",
        description: "Thank you for your message. We'll get back to you within 24 hours!",
      })
      
      // Reset form
      setFormData({ name: '', email: '', subject: '', message: '' })
      setValidationErrors({})
      
    } catch (err: any) {
      // Handle Zod validation errors
      if (err.errors) {
        const errors: Partial<Record<keyof ContactFormData, string>> = {}
        err.errors.forEach((error: any) => {
          if (error.path[0]) {
            errors[error.path[0] as keyof ContactFormData] = error.message
          }
        })
        setValidationErrors(errors)
        toast({
          title: "Validation Error",
          description: "Please check the form for errors.",
          variant: "destructive",
        })
        return
      }
      
      // Handle other errors
      toast({
        title: "Oops! Something went wrong",
        description: error || "Failed to send message. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear validation errors for this field
    if (validationErrors[name as keyof ContactFormData]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }))
    }
    
    // Clear previous errors when user starts typing
    if (error) reset()
  }

  const isFormValid = formData.name.trim().length >= 2 && 
                     formData.email.trim().length > 0 && 
                     formData.message.trim().length >= 10

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
            name="name"
            placeholder="Your Name *"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isLoading}
            className={validationErrors.name ? 'border-destructive' : ''}
          />
          {validationErrors.name && (
            <p className="text-sm text-destructive mt-1">{validationErrors.name}</p>
          )}
        </div>
        
        <div>
          <Input
            type="email"
            name="email"
            placeholder="Your Email *"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
            className={validationErrors.email ? 'border-destructive' : ''}
          />
          {validationErrors.email && (
            <p className="text-sm text-destructive mt-1">{validationErrors.email}</p>
          )}
        </div>
        
        <div>
          <Input
            type="text"
            name="subject"
            placeholder="Subject (Optional)"
            value={formData.subject}
            onChange={handleChange}
            disabled={isLoading}
            className={validationErrors.subject ? 'border-destructive' : ''}
          />
          {validationErrors.subject && (
            <p className="text-sm text-destructive mt-1">{validationErrors.subject}</p>
          )}
        </div>
        
        <div>
          <Textarea
            name="message"
            placeholder="Your Message *"
            value={formData.message}
            onChange={handleChange}
            required
            disabled={isLoading}
            rows={4}
            className={validationErrors.message ? 'border-destructive' : ''}
          />
          {validationErrors.message && (
            <p className="text-sm text-destructive mt-1">{validationErrors.message}</p>
          )}
        </div>
        
        <Button 
          type="submit" 
          disabled={isLoading || !isFormValid}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : success ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Sent!
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send Message
            </>
          )}
        </Button>
        
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-600 text-sm">Message sent successfully! We'll get back to you soon.</p>
          </div>
        )}
      </form>
    </div>
  )
}