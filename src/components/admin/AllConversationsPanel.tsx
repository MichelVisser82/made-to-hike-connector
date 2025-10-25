import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Conversation } from '@/types/chat';
import { ChatWindow } from '../chat/ChatWindow';

interface AllConversationsPanelProps {
  initialConversationId?: string;
}

export function AllConversationsPanel({ initialConversationId }: AllConversationsPanelProps) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllConversations();
  }, []);

  // Auto-select conversation if initialConversationId is provided
  useEffect(() => {
    if (initialConversationId && conversations.length > 0) {
      console.log('Admin: Looking for conversation:', initialConversationId);
      const conversation = conversations.find(c => c.id === initialConversationId);
      console.log('Admin: Found conversation:', conversation ? 'YES' : 'NO');
      if (conversation) {
        setSelectedConv(conversation);
      }
    }
  }, [initialConversationId, conversations]);

  const fetchAllConversations = async () => {
    setLoading(true);

    // Get current admin user ID
    const { data: { user } } = await supabase.auth.getUser();
    const adminId = user?.id;

    // Fetch ALL admin-related conversations (admin_support, guide_admin)
    // Admins should see all support tickets regardless of participation
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        tours(id, title, hero_image)
      `)
      .in('conversation_type', ['admin_support', 'guide_admin'])
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
    } else {
      console.log('Admin: Fetched conversations:', data?.length);
      
      // Fetch profiles and tickets for each conversation
      const conversationsWithProfiles = await Promise.all(
        (data || []).map(async (conv) => {
          let hikerProfile = null;
          let guideProfile = null;
          let ticket = null;
          
          if (conv.hiker_id) {
            const { data: hiker } = await supabase
              .from('profiles')
              .select('id, name, email, avatar_url')
              .eq('id', conv.hiker_id)
              .maybeSingle();
            hikerProfile = hiker;
          }
          
          if (conv.guide_id) {
            const { data: guide } = await supabase
              .from('profiles')
              .select('id, name, email, avatar_url')
              .eq('id', conv.guide_id)
              .maybeSingle();
            guideProfile = guide;
          }
          
          // Fetch ticket if exists
          const { data: ticketData } = await supabase
            .from('tickets')
            .select('id, ticket_number, title, status, priority')
            .eq('conversation_id', conv.id)
            .maybeSingle();
          ticket = ticketData;
          
          return {
            ...conv,
            hiker_profile: hikerProfile,
            guide_profile: guideProfile,
            ticket: ticket,
            profiles: hikerProfile // For backward compatibility
          };
        })
      );
      
      setConversations(conversationsWithProfiles as any);
    }

    setLoading(false);
  };

  const filteredConversations = conversations.filter((conv) => {
    // If no search term, show all conversations
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    return (
      conv.tours?.title?.toLowerCase().includes(searchLower) ||
      conv.hiker_profile?.name?.toLowerCase().includes(searchLower) ||
      conv.hiker_profile?.email?.toLowerCase().includes(searchLower) ||
      conv.guide_profile?.name?.toLowerCase().includes(searchLower) ||
      conv.guide_profile?.email?.toLowerCase().includes(searchLower) ||
      conv.ticket?.ticket_number?.toLowerCase().includes(searchLower) ||
      conv.ticket?.title?.toLowerCase().includes(searchLower) ||
      conv.anonymous_name?.toLowerCase().includes(searchLower) ||
      conv.anonymous_email?.toLowerCase().includes(searchLower) ||
      conv.conversation_type?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>All Conversations</CardTitle>
          <Input
            placeholder="Search by tour or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-2"
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Loading...</p>
          ) : filteredConversations.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No conversations found</p>
          ) : (
            <div className="space-y-2">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => setSelectedConv(conv)}
                >
                <div className="flex-1">
                  <p className="font-medium">
                    {conv.tours?.title || (conv.ticket ? `Ticket: ${conv.ticket.ticket_number}` : `${conv.conversation_type.replace('_', ' ')}`)}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <span>
                      {conv.hiker_profile?.name || (conv.anonymous_name ? `${conv.anonymous_name} (Non-member)` : 'Anonymous')}
                    </span>
                    <span>↔</span>
                    <span>
                      {conv.guide_profile?.name || 'No guide'}
                    </span>
                  </p>
                </div>
                  <Badge variant={conv.status === 'active' ? 'default' : 'secondary'}>
                    {conv.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        {selectedConv ? (
          <ChatWindow
            conversation={selectedConv}
            onClose={() => setSelectedConv(null)}
          />
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Eye className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Select a conversation to view</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
