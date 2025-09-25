import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useEmail } from '@/hooks/useEmail'

export const EmailTester = () => {
  const [testResult, setTestResult] = useState<string>('')
  const { sendEmail, isLoading } = useEmail()

  const testEmailTypes = [
    {
      type: 'contact',
      data: {
        type: 'contact',
        to: 'test@example.com',
        name: 'Test User',
        email: 'testuser@example.com',
        subject: 'Test Contact Form',
        message: 'This is a test message from the contact form.'
      }
    },
    {
      type: 'newsletter',
      data: {
        type: 'newsletter',
        to: 'test@example.com',
        name: 'Test User',
        email: 'testuser@example.com'
      }
    }
  ]

  const runTest = async (testCase: any) => {
    try {
      setTestResult('Testing...')
      const result = await sendEmail(testCase.data)
      setTestResult(`✅ ${testCase.type} email sent successfully! ID: ${result.id}`)
    } catch (error: any) {
      setTestResult(`❌ ${testCase.type} email failed: ${error.message}`)
    }
  }

  // Only show in development
  if (import.meta.env.PROD) return null

  return (
    <div className="fixed bottom-4 right-4 bg-background p-4 border rounded-lg shadow-lg max-w-xs">
      <h4 className="font-semibold mb-2">Email Tester</h4>
      <div className="space-y-2">
        {testEmailTypes.map((test) => (
          <Button
            key={test.type}
            size="sm"
            variant="outline"
            onClick={() => runTest(test)}
            disabled={isLoading}
            className="w-full"
          >
            Test {test.type}
          </Button>
        ))}
      </div>
      {testResult && (
        <p className="mt-2 text-xs bg-muted p-2 rounded">{testResult}</p>
      )}
    </div>
  )
}