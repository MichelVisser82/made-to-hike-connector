-- Create help_faqs table for FAQ content management
CREATE TABLE IF NOT EXISTS public.help_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('guide', 'hiker', 'general', 'billing', 'technical')),
  user_type TEXT NOT NULL CHECK (user_type IN ('guide', 'hiker', 'both')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  search_keywords TEXT[] DEFAULT '{}',
  view_count INTEGER NOT NULL DEFAULT 0,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  not_helpful_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create help_searches table for search analytics
CREATE TABLE IF NOT EXISTS public.help_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_query TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  results_shown JSONB DEFAULT '[]',
  selected_faq_id UUID REFERENCES public.help_faqs(id) ON DELETE SET NULL,
  was_helpful BOOLEAN,
  created_ticket BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.help_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_searches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for help_faqs
CREATE POLICY "Anyone can view active FAQs"
  ON public.help_faqs FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage all FAQs"
  ON public.help_faqs FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for help_searches
CREATE POLICY "Anyone can insert searches"
  ON public.help_searches FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own searches"
  ON public.help_searches FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all searches"
  ON public.help_searches FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_help_faqs_category ON public.help_faqs(category);
CREATE INDEX idx_help_faqs_user_type ON public.help_faqs(user_type);
CREATE INDEX idx_help_faqs_is_active ON public.help_faqs(is_active);
CREATE INDEX idx_help_searches_user_id ON public.help_searches(user_id);
CREATE INDEX idx_help_searches_created_at ON public.help_searches(created_at DESC);

-- Trigger to update updated_at
CREATE TRIGGER update_help_faqs_updated_at
  BEFORE UPDATE ON public.help_faqs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial FAQs for Guides
INSERT INTO public.help_faqs (question, answer, category, user_type, sort_order, search_keywords) VALUES
('How do I set my availability?', 'You can manage your availability in two ways:\n\n1. **Tour-specific availability**: When creating or editing a tour, you can set specific available dates for that tour.\n\n2. **General availability**: In your Guide Dashboard under "Availability", you can set your general available periods.\n\nWe recommend keeping your calendar updated to receive more booking requests.', 'guide', 'guide', 1, ARRAY['availability', 'calendar', 'dates', 'schedule']),

('How do I create a tour?', 'To create a new tour:\n\n1. Go to your **Guide Dashboard**\n2. Click **"Create New Tour"** button\n3. Follow the step-by-step wizard:\n   - Basic information (title, description, region)\n   - Duration and difficulty level\n   - Pricing and group size\n   - Available dates\n   - Upload images\n   - Add route map (optional)\n   - Define inclusions/exclusions\n\nYour tour will be reviewed before going live.', 'guide', 'guide', 2, ARRAY['create tour', 'new tour', 'add tour', 'tour creation']),

('How do payouts work?', 'Payouts are processed through Stripe Connect:\n\n- **Frequency**: Weekly (every Monday)\n- **Processing time**: 2-7 business days to your bank\n- **Service fee**: 10% platform fee (covers payment processing, insurance, support)\n- **Currency**: Paid in your selected currency (EUR, USD, GBP)\n\nYou can view your earnings and payout history in the "Money" section of your dashboard.', 'billing', 'guide', 3, ARRAY['payout', 'payment', 'earnings', 'money', 'stripe']),

('How do I verify my certifications?', 'To get verified:\n\n1. Upload your certifications in your profile under **"Credentials"**\n2. Our admin team will review your documents (usually within 48 hours)\n3. You''ll receive an email once verified\n4. A verification badge will appear on your profile\n\n**Required documents**: Valid guiding license, first aid certification, insurance proof. Priority 1-2 certifications get faster approval.', 'guide', 'guide', 4, ARRAY['verification', 'certifications', 'credentials', 'verified badge', 'documents']),

('Can I set different prices for different dates?', 'Yes! You can customize pricing per date:\n\n1. Go to your tour page\n2. Click **"Manage Dates"**\n3. For each date slot, you can:\n   - Override the base price\n   - Add discount percentages\n   - Set early bird pricing\n   - Adjust available spots\n\nThis is perfect for peak/off-peak seasons or special promotional dates.', 'guide', 'guide', 5, ARRAY['pricing', 'different prices', 'date pricing', 'discount', 'early bird']),

('How do I communicate with hikers?', 'MadeToHike has built-in messaging:\n\n1. Access messages from your **Dashboard → Inbox**\n2. You''ll receive email notifications for new messages\n3. You can send pre-trip information, meeting details, and answer questions\n4. After booking confirmation, you can share additional details\n\n**Pro tip**: Enable automated responses for common questions to save time!', 'guide', 'guide', 6, ARRAY['messaging', 'communication', 'chat', 'contact hikers', 'inbox']),

('What happens if I need to cancel?', 'If you must cancel a booking:\n\n1. Contact the hiker immediately via messaging\n2. Go to **Dashboard → Bookings**\n3. Select the booking and click **"Cancel"**\n4. Provide a reason (weather, emergency, etc.)\n\n**Cancellation policy**: Full refund to hiker if canceled >14 days before. Less than 14 days may affect your guide rating. Frequent cancellations may result in account review.', 'guide', 'guide', 7, ARRAY['cancel', 'cancellation', 'refund', 'cancel booking']),

('How do I upload photos to my profile?', 'You can add photos in several places:\n\n1. **Profile hero image**: Dashboard → Profile → Edit Profile\n2. **Portfolio gallery**: Dashboard → Profile → Portfolio (up to 12 images)\n3. **Tour images**: When creating/editing tours\n\n**Best practices**: Use high-quality landscape images, WebP format, max 2MB per image. Show mountain scenery, happy hikers, and your guiding style.', 'guide', 'guide', 8, ARRAY['photos', 'images', 'upload', 'gallery', 'portfolio']),

('Can I see my booking history?', 'Yes! Your complete booking history is in **Dashboard → Bookings**.\n\nYou can:\n- View all past, current, and upcoming bookings\n- Filter by status (confirmed, completed, cancelled)\n- See payment details and hiker information\n- Download booking receipts\n- Export to CSV for accounting', 'guide', 'guide', 9, ARRAY['booking history', 'past bookings', 'completed tours', 'history']),

('How do I edit my profile URL?', 'Your profile URL (slug) is set when you create your account:\n\n- **Format**: madetohike.com/your-name\n- **Auto-generated**: Based on your display name\n- **Custom slug**: Contact admin to change if needed\n\n**Note**: Your slug must be unique and cannot use reserved keywords like "tour", "guide", "admin".', 'guide', 'guide', 10, ARRAY['url', 'slug', 'profile link', 'custom url', 'web address']);

-- Seed initial FAQs for Hikers
INSERT INTO public.help_faqs (question, answer, category, user_type, sort_order, search_keywords) VALUES
('How do I book a tour?', 'Booking a tour is simple:\n\n1. **Browse tours** on the homepage or search by region\n2. **Select a tour** and click "Book Now"\n3. **Choose your date** from available slots\n4. **Add participants** and special requests\n5. **Enter contact details**\n6. **Pay securely** with credit card\n7. **Receive confirmation** via email\n\nYou''ll get all tour details, meeting point, and guide contact information immediately after booking.', 'hiker', 'hiker', 1, ARRAY['book', 'booking', 'reserve', 'how to book']),

('How do I know guides are certified?', 'All MadeToHike guides are verified:\n\n- **Verification badge**: Look for the ✓ verified badge on profiles\n- **Certifications displayed**: View their credentials on their profile\n- **Priority certification system**: Color-coded badges (red = highest qualifications)\n- **Manual review**: Our team verifies all documents\n\n**We check**: Valid guiding licenses, first aid certifications, insurance, and professional experience.', 'hiker', 'hiker', 2, ARRAY['certified', 'verification', 'credentials', 'safe', 'qualifications']),

('What is the cancellation policy?', '**Hiker cancellation policy**:\n\n- **More than 14 days before**: Full refund (minus 3% payment processing fee)\n- **7-14 days before**: 50% refund\n- **Less than 7 days**: No refund (unless emergency, contact support)\n\n**Guide cancellation**: If your guide cancels, you receive a full refund + 20% credit for future bookings.\n\n**Weather cancellations**: Guide will reschedule or offer full refund.', 'hiker', 'hiker', 3, ARRAY['cancel', 'cancellation', 'refund', 'cancel booking', 'policy']),

('How do I contact my guide?', 'After booking confirmation:\n\n1. Go to **Dashboard → My Trips**\n2. Click on your booking\n3. Use the **"Message Guide"** button\n4. You can also email them directly (email provided in confirmation)\n\n**Before booking**: Use the "Contact Guide" button on their profile page to ask questions.', 'hiker', 'hiker', 4, ARRAY['contact', 'message', 'communication', 'reach guide', 'email']),

('Can I book for a group?', 'Yes! Group bookings are welcome:\n\n- Each tour shows **maximum group size**\n- During booking, select **number of participants**\n- Enter details for each participant (name, age, experience)\n- **One person pays** for the entire group\n\n**Large groups**: If you need more spots than available, contact the guide to request a private tour.', 'hiker', 'hiker', 5, ARRAY['group', 'group booking', 'multiple people', 'friends', 'family']),

('How do payments work?', '**Payment security**:\n\n- We use **Stripe** for secure payments (bank-grade encryption)\n- **Accepted cards**: Visa, Mastercard, Amex\n- **Currency**: Automatically converted if needed\n- **Service fee**: Included in the displayed price\n\n**When you pay**:\n- Full payment at booking\n- Funds held securely\n- Released to guide 24 hours after tour completion\n- Receipt emailed immediately', 'billing', 'hiker', 6, ARRAY['payment', 'pay', 'credit card', 'secure', 'stripe']),

('What should I bring on a tour?', 'Your guide will provide a **detailed packing list** after booking, but generally:\n\n**Essential**:\n- Hiking boots (broken in)\n- Weather-appropriate clothing (layers)\n- Rain jacket\n- Water bottle (1-2L)\n- Sun protection (hat, sunscreen, sunglasses)\n- Snacks and lunch (unless included)\n\n**Check tour details** for:\n- What''s included (meals, equipment)\n- Difficulty level requirements\n- Elevation gain and distance', 'hiker', 'hiker', 7, ARRAY['packing list', 'what to bring', 'gear', 'equipment', 'preparation']),

('How do I leave a review?', 'After your tour is completed:\n\n1. You''ll receive an **email prompt** to review\n2. Or go to **Dashboard → My Trips**\n3. Find the completed tour\n4. Click **"Write Review"**\n5. Rate your experience (1-5 stars)\n6. Write a detailed review\n\n**Reviews help** other hikers choose tours and help guides improve. We appreciate honest, constructive feedback!', 'hiker', 'hiker', 8, ARRAY['review', 'rating', 'feedback', 'write review', 'rate']),

('Can I see the route before booking?', 'Route visibility depends on the guide''s settings:\n\n- **Region overview**: Always visible with approximate area\n- **Detailed route**: May be hidden until after booking (to protect guide''s routes)\n- **Highlights**: Key points of interest are shown\n- **Full GPS route**: Shared after booking confirmation\n\nThis protects guides'' intellectual property while giving you enough information to decide.', 'hiker', 'hiker', 9, ARRAY['route', 'map', 'gps', 'track', 'path', 'itinerary']),

('What if I have dietary requirements?', 'We accommodate dietary needs:\n\n1. **During booking**: Add dietary requirements in "Special Requests" field\n2. **Options**: Vegetarian, vegan, gluten-free, allergies, etc.\n3. **Your guide** will be notified and will prepare accordingly\n\n**Important**: If you have severe allergies, message your guide directly after booking to discuss details. Check if meals are included in your tour.', 'hiker', 'hiker', 10, ARRAY['dietary', 'food', 'allergies', 'vegetarian', 'vegan', 'gluten-free']);

-- Seed General FAQs
INSERT INTO public.help_faqs (question, answer, category, user_type, sort_order, search_keywords) VALUES
('Is my data safe? (GDPR compliance)', '**Yes, your data is fully protected**:\n\n- **GDPR compliant**: We follow EU data protection laws\n- **Data storage**: All data stored in EU servers (Germany)\n- **Encryption**: Bank-grade SSL encryption\n- **Your rights**: Access, export, or delete your data anytime\n- **No selling**: We NEVER sell your data to third parties\n\n**Privacy controls**: Manage what information guides see in Settings → Privacy.', 'general', 'both', 1, ARRAY['gdpr', 'privacy', 'data protection', 'security', 'safe']),

('How do I reset my password?', 'To reset your password:\n\n1. Go to **Sign In** page\n2. Click **"Forgot Password?"**\n3. Enter your email address\n4. Check your email for reset link\n5. Click link and enter new password\n6. Confirm new password\n\n**Link expires in 1 hour**. If you don''t receive the email, check spam folder or contact support.', 'technical', 'both', 2, ARRAY['password', 'reset password', 'forgot password', 'login', 'access']),

('What regions do you cover?', 'MadeToHike operates across **Europe''s top hiking destinations**:\n\n- **Scottish Highlands** (Scotland)\n- **Dolomites** (Italy)\n- **Pyrenees** (France/Spain)\n- **Alps** (Switzerland, Austria, France)\n- **Picos de Europa** (Spain)\n- And more regions added regularly!\n\nEach region has certified local guides with deep knowledge of the area. Browse by region on our homepage.', 'general', 'both', 3, ARRAY['regions', 'locations', 'where', 'countries', 'areas', 'destinations']),

('How do I delete my account?', 'To delete your account:\n\n1. Go to **Settings → Privacy**\n2. Scroll to **"Delete Account"** section\n3. Click **"Request Account Deletion"**\n4. Confirm your choice\n5. We''ll process within 30 days\n\n**Note**: \n- **Guides**: Cannot delete with active bookings\n- **Hikers**: Cannot delete with upcoming bookings\n- **Data retention**: Some data kept for legal/accounting (GDPR compliant)\n- **Final**: This action cannot be undone', 'general', 'both', 4, ARRAY['delete account', 'close account', 'remove account', 'deactivate']),

('What payment methods do you accept?', 'We accept all major payment methods:\n\n**Credit/Debit Cards**:\n- Visa\n- Mastercard\n- American Express\n\n**Digital Wallets**:\n- Apple Pay\n- Google Pay\n\n**Currencies**: EUR, USD, GBP (automatic conversion)\n\n**Security**: All payments processed through Stripe with PCI-DSS compliance. We never store your card details.', 'billing', 'both', 5, ARRAY['payment methods', 'credit card', 'apple pay', 'google pay', 'how to pay']);