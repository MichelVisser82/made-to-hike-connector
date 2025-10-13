import { useConversations } from '@/hooks/useConversations';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { Conversation } from '@/types/chat';

interface ConversationListProps {
  userId: string | undefined;
  selectedId?: string;
  onSelect: (conversation: Conversation) => void;
}

export function ConversationList({ userId, selectedId, onSelect }: ConversationListProps) {
  const { conversations, loading } = useConversations(userId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No conversations yet</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-2">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation)}
            className={cn(
              "w-full text-left p-3 rounded-lg transition-colors hover:bg-accent",
              selectedId === conversation.id && "bg-accent"
            )}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarImage src={conversation.tours?.hero_image || undefined} />
                <AvatarFallback>
                  {conversation.tours?.title?.[0] || conversation.profiles?.name?.[0] || '?'}
                </AvatarFallback>
              </Avatar>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-medium text-sm truncate">
                    {conversation.tours?.title || 'Chat'}
                  </h4>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {format(new Date(conversation.last_message_at), 'MMM d')}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground truncate">
                  {conversation.profiles?.name || conversation.anonymous_name || 'Anonymous'}
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {conversation.conversation_type.replace('_', ' ')}
                  </Badge>
                  {conversation.unread_count && conversation.unread_count > 0 && (
                    <Badge variant="default" className="text-xs">
                      {conversation.unread_count}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}
