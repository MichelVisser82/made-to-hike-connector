import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Check, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  category: z.string().min(1, 'Please select a category'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
});

type FormData = z.infer<typeof formSchema>;

export function SupportContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      category: '',
      message: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setIsSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: result, error } = await supabase.functions.invoke('create-support-ticket', {
        body: {
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
          category: data.category,
          userId: user?.id || null,
        },
      });

      if (error) throw error;

      setTicketNumber(result.ticketNumber);
      setIsSuccess(true);
      form.reset();

      toast({
        title: 'Support Ticket Created',
        description: `Your ticket ${result.ticketNumber} has been created. We'll get back to you soon!`,
      });
    } catch (error: any) {
      console.error('Error creating support ticket:', error);
      toast({
        title: 'Failed to Create Ticket',
        description: error.message || 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900">Support Ticket Created!</h3>
              <p className="text-sm text-green-700 mt-2">
                Your ticket number is: <span className="font-mono font-bold">{ticketNumber}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                We've sent a confirmation email. Our team will respond within 24 hours.
              </p>
            </div>
            <Button onClick={() => setIsSuccess(false)} variant="outline">
              Submit Another Ticket
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Contact Support</CardTitle>
            <CardDescription>
              Can't find what you're looking for? Our team is here to help.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="booking_issue">Booking Issue</SelectItem>
                      <SelectItem value="payment_issue">Payment Issue</SelectItem>
                      <SelectItem value="technical_problem">Technical Problem</SelectItem>
                      <SelectItem value="account_question">Account Question</SelectItem>
                      <SelectItem value="tour_question">Tour Question</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief description of your issue" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please describe your issue in detail..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Ticket...
                </>
              ) : (
                'Submit Support Ticket'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
