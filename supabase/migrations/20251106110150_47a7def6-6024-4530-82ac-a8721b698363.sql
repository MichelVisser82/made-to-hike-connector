-- Add booking_id to conversations table for better linking
ALTER TABLE public.conversations
ADD COLUMN booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_conversations_booking_id ON public.conversations(booking_id);

-- Add comment explaining the column
COMMENT ON COLUMN public.conversations.booking_id IS 'Links conversation to a specific booking for personalized messaging';