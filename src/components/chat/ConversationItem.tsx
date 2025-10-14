import { usePresence } from '@/hooks/usePresence';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { Conversation } from '@/types/chat';

interface ConversationItemProps {
  conversation: Conversation;
  selectedId?: string;
  currentUserId: string;
  onSelect: (conversation: Conversation) => void;
}

export function ConversationItem({ 
  conversation, 
  selectedId, 
  currentUserId,
  onSelect 
}: ConversationItemProps) {
  const otherUserId = conversation.guide_id === currentUserId 
    ? conversation.hiker_id 
    : conversation.guide_id;
    
  const presence = usePresence(otherUserId);

  return (
    <button
      onClick={() => onSelect(conversation)}
      className={cn(
        "w-full text-left p-3 rounded-lg transition-colors hover:bg-accent",
        selectedId === conversation.id && "bg-accent"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src={conversation.tours?.hero_image || undefined} />
            <AvatarFallback>
              {conversation.tours?.title?.[0] || conversation.profiles?.name?.[0] || '?'}
            </AvatarFallback>
          </Avatar>
          {presence?.status === 'online' && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
          )}
        </div>

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
  );
}
