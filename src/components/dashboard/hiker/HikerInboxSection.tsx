import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import type { Conversation } from '@/types/chat';

interface HikerInboxSectionProps {
  userId: string;
}

export function HikerInboxSection({ userId }: HikerInboxSectionProps) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif mb-2">Inbox & Messages</h1>
      </div>

      <Card className="h-[calc(100vh-16rem)]">
        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
          {/* Conversations List */}
          <div className="border-r flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold mb-4">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <ConversationList
                userId={userId}
                selectedId={selectedConversation?.id}
                onSelect={setSelectedConversation}
              />
            </div>
          </div>

          {/* Chat Window */}
          <div className="md:col-span-2">
            {selectedConversation ? (
              <ChatWindow
                conversation={selectedConversation}
                onClose={() => setSelectedConversation(null)}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-center p-8">
                <div>
                  <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                    <Search className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
                  <p className="text-muted-foreground">
                    Choose a conversation from the list to view messages
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
