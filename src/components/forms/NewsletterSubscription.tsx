import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useNewsletter } from '@/hooks/useEmail'
import { Mail, Loader2, CheckCircle } from 'lucide-react'

export const NewsletterSubscription = () => {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const { subscribeToNewsletter, isLoading, error, success, reset } = useNewsletter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await subscribeToNewsletter({ email, name })
      
      toast({
        title: "Welcome to the Adventure! 🏔️",
        description: "You've been subscribed to our newsletter. Check your email for a welcome message!",
      })
      
      setEmail('')
      setName('')
      
    } catch (err) {
      toast({
        title: "Subscription Failed",
        description: error || "Failed to subscribe. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (error) reset()
  }

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-accent/10 to-accent/20 p-6 rounded-lg border border-accent/20">
      <div className="text-center mb-4">
        <Mail className="mx-auto h-8 w-8 text-accent mb-2" />
        <h3 className="text-lg font-semibold text-accent">Stay Connected</h3>
        <p className="text-sm text-muted-foreground">Get weekly trail recommendations and hiking tips</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="text"
          placeholder="Your Name (Optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />
        
        <Input
          type="email"
          placeholder="Your Email Address"
          value={email}
          onChange={handleEmailChange}
          required
          disabled={isLoading}
          className={error ? 'border-destructive' : ''}
        />
        
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