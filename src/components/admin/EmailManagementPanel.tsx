import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { useProcessAutomatedEmails } from '@/hooks/useProcessAutomatedEmails'
import { toast } from 'sonner'
import { Mail, Send, CheckCircle2 } from 'lucide-react'

export function EmailManagementPanel() {
  const [lookbackDays, setLookbackDays] = useState('30')
  const { processEmails, isProcessing, result } = useProcessAutomatedEmails()

  const handleSendRetrospective = async () => {
    try {
      const days = parseInt(lookbackDays) || 30
      const data = await processEmails(days)
      
      toast.success('Emails processed successfully', {
        description: `Sent ${data.emails_sent} emails from ${data.templates_processed} active templates`
      })
    } catch (error) {
      toast.error('Failed to process emails', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Retrospective Emails
          </CardTitle>
          <CardDescription>
            Send automated emails for past bookings that didn't receive confirmation emails
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lookbackDays">Look Back Days</Label>
            <Input
              id="lookbackDays"
              type="number"
              min="1"
              max="365"
              value={lookbackDays}
              onChange={(e) => setLookbackDays(e.target.value)}
              placeholder="30"
            />
            <p className="text-sm text-muted-foreground">
              Number of days to look back for bookings without confirmation emails
            </p>
          </div>

          <Button 
            onClick={handleSendRetrospective}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>Processing...</>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Retrospective Emails
              </>
            )}
          </Button>

          {result && (
            <Card className="bg-muted">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium">Processing Complete</p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• Templates processed: {result.templates_processed}</p>
                      <p>• Emails sent: {result.emails_sent}</p>
                      <p>• Lookback period: {result.lookback_days} days</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Checks all active email templates in the system</p>
          <p>• Finds bookings within the lookback period that match each template's trigger</p>
          <p>• Skips bookings that already received emails (checks email_logs table)</p>
          <p>• Sends confirmation emails and logs them to prevent duplicates</p>
        </CardContent>
      </Card>
    </div>
  )
}
