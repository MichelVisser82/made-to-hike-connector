import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useNewsletter } from '@/hooks/useEmail'
import { Mail, Loader2, CheckCircle } from 'lucide-react'
import { newsletterSchema, type NewsletterData } from '@/lib/validationSchemas'

export const NewsletterSubscription = () => {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof NewsletterData, string>>>({})
  const { subscribeToNewsletter, isLoading, error, success, reset } = useNewsletter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationErrors({})
    
    try {
      // Validate with Zod - parse() throws on error with correct types
      const validatedData = newsletterSchema.parse({ email, name }) as {
        email: string;
        name?: string;
      };
      
      await subscribeToNewsletter(validatedData)
      
      toast({
        title: "Welcome to the Adventure! 🏔️",
        description: "You've been subscribed to our newsletter. Check your email for a welcome message!",
      })
      
      setEmail('')
      setName('')
      setValidationErrors({})
      
    } catch (err: any) {
      // Handle Zod validation errors
      if (err.errors) {
        const errors: Partial<Record<keyof NewsletterData, string>> = {}
        err.errors.forEach((error: any) => {
          if (error.path[0]) {
            errors[error.path[0] as keyof NewsletterData] = error.message
          }
        })
        setValidationErrors(errors)
        toast({
          title: "Invalid Email",
          description: errors.email || "Please enter a valid email address.",
          variant: "destructive",
        })
        return
      }
      
      // Handle other errors
      toast({
        title: "Subscription Failed",
        description: error || "Failed to subscribe. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (validationErrors.email) {
      setValidationErrors(prev => ({ ...prev, email: undefined }))
    }
    if (error) reset()
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    if (validationErrors.name) {
      setValidationErrors(prev => ({ ...prev, name: undefined }))
    }
  }

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-accent/10 to-accent/20 p-6 rounded-lg border border-accent/20">
      <div className="text-center mb-4">
        <Mail className="mx-auto h-8 w-8 text-accent mb-2" />
        <h3 className="text-lg font-semibold text-accent">Stay Connected</h3>
        <p className="text-sm text-muted-foreground">Get weekly trail recommendations and hiking tips</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Input
            type="text"
            placeholder="Your Name (Optional)"
            value={name}
            onChange={handleNameChange}
            disabled={isLoading}
            className={validationErrors.name ? 'border-destructive' : ''}
          />
          {validationErrors.name && (
            <p className="text-xs text-destructive mt-1">{validationErrors.name}</p>
          )}
        </div>
        
        <div>
          <Input
            type="email"
            placeholder="Your Email Address"
            value={email}
            onChange={handleEmailChange}
            required
            disabled={isLoading}
            className={validationErrors.email ? 'border-destructive' : ''}
          />
          {validationErrors.email && (
            <p className="text-xs text-destructive mt-1">{validationErrors.email}</p>
          )}
        </div>
        
        <Button 
          type="submit" 
          disabled={isLoading || !email}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Subscribing...
            </>
          ) : success ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Subscribed!
            </>
          ) : (
            "Subscribe to Newsletter"
          )}
        </Button>
        
        {error && (
          <p className="text-destructive text-sm text-center">{error}</p>
        )}
      </form>
      
      <p className="text-xs text-muted-foreground text-center mt-3">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </div>
  )
}