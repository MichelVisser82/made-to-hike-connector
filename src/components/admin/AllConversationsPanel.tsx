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
      const conversation = conversations.find(c => c.id === initialConversationId);
      if (conversation) {
        setSelectedConv(conversation);
      }
    }
  }, [initialConversationId, conversations]);

  const fetchAllConversations = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        tours(title),
        profiles:hiker_id(name, email)
      `)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
    } else {
      setConversations((data || []) as any);
    }

    setLoading(false);
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.tours?.title.toLowerCase().includes(search.toLowerCase()) ||
    conv.profiles?.email?.toLowerCase().includes(search.toLowerCase())
  );

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
                    <p className="font-medium">{conv.tours?.title || 'No tour'}</p>
                    <p className="text-sm text-muted-foreground">
                      {conv.profiles?.name} • {conv.profiles?.email}
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
