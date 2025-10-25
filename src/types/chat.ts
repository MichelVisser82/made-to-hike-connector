export interface Conversation {
  id: string;
  tour_id: string | null;
  hiker_id: string | null;
  guide_id: string;
  conversation_type: 'tour_inquiry' | 'booking_chat' | 'admin_support' | 'guide_admin';
  status: 'active' | 'closed' | 'archived';
  anonymous_email: string | null;
  anonymous_name: string | null;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  tours?: {
    title: string;
    hero_image: string | null;
  };
  profiles?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  hiker_profile?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  guide_profile?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  ticket?: {
    ticket_number: string;
  };
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  sender_type: 'hiker' | 'guide' | 'admin' | 'anonymous';
  sender_name: string | null;
  message_type: 'text' | 'image' | 'system';
  content: string;
  moderated_content: string | null;
  attachment_url: string | null;
  attachment_type: string | null;
  moderation_status: 'approved' | 'flagged' | 'pending';
  moderation_flags: string[];
  is_automated: boolean;
  created_at: string;
  edited_at: string | null;
  read_receipts?: MessageReadReceipt[];
}

export interface MessageReadReceipt {
  id: string;
  message_id: string;
  user_id: string;
  read_at: string;
}

export interface Ticket {
  id: string;
  conversation_id: string;
  ticket_number: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'assigned' | 'resolved' | 'closed';
  assigned_to: string | null;
  category: string | null;
  slack_thread_ts: string | null;
  created_at: string;
  resolved_at: string | null;
  first_response_at: string | null;
  updated_at: string;
  conversations?: Conversation;
}

export interface UserPresence {
  user_id: string;
  status: 'online' | 'offline' | 'away';
  last_seen: string;
  updated_at: string;
}
