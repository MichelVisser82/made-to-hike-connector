import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useContactForm } from '@/hooks/useEmail'
import { Loader2, Send, CheckCircle } from 'lucide-react'

export const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const { sendContactEmail, isLoading, error, success, reset } = useContactForm()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await sendContactEmail(formData)
      
      toast({
        title: "Message Sent! 🎉",
        description: "Thank you for your message. We'll get back to you within 24 hours!",
      })
      
      // Reset form
      setFormData({ name: '', email: '', subject: '', message: '' })
      
    } catch (err) {
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
            className={error ? 'border-destructive' : ''}
          />
          {formData.name.length > 0 && formData.name.length < 2 && (
            <p className="text-sm text-destructive mt-1">Name must be at least 2 characters</p>
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
            className={error ? 'border-destructive' : ''}
          />
        </div>
        
        <div>
          <Input
            type="text"
            name="subject"
            placeholder="Subject (Optional)"
            value={formData.subject}
            onChange={handleChange}
            disabled={isLoading}
          />
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
            className={error ? 'border-destructive' : ''}
          />
          {formData.message.length > 0 && formData.message.length < 10 && (
            <p className="text-sm text-destructive mt-1">Message must be at least 10 characters</p>
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