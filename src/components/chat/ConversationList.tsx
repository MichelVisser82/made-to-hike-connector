import { useConversations } from '@/hooks/useConversations';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, MessageSquare } from 'lucide-react';
import type { Conversation } from '@/types/chat';
import { ConversationItem } from './ConversationItem';

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
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            selectedId={selectedId}
            currentUserId={userId!}
            onSelect={onSelect}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
