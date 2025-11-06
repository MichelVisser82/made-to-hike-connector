import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { TicketDashboard } from './TicketDashboard';
import { FlaggedMessagesPanel } from './FlaggedMessagesPanel';
import { AllConversationsPanel } from './AllConversationsPanel';

export function AdminSupportSection() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('tickets');
  
  // Auto-switch tabs based on URL parameters
  useEffect(() => {
    const tab = searchParams.get('tab');
    const conversationId = searchParams.get('conversation');
    const ticketId = searchParams.get('ticket');
    
    if (tab) {
      setActiveTab(tab);
    } else if (conversationId) {
      setActiveTab('conversations');
    } else if (ticketId) {
      setActiveTab('tickets');
    }
  }, [searchParams]);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-playfair text-charcoal mb-2">Support Management</h1>
        <p className="text-charcoal/60">Manage support tickets, flagged content, and conversations</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-cream p-1 rounded-lg">
          <TabsTrigger 
            value="tickets"
            className="data-[state=active]:bg-burgundy data-[state=active]:text-white"
          >
            Support Tickets
          </TabsTrigger>
          <TabsTrigger 
            value="flagged"
            className="data-[state=active]:bg-burgundy data-[state=active]:text-white"
          >
            Flagged Messages
          </TabsTrigger>
          <TabsTrigger 
            value="conversations"
            className="data-[state=active]:bg-burgundy data-[state=active]:text-white"
          >
            All Conversations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets">
          <TicketDashboard selectedTicketId={searchParams.get('ticket') || undefined} />
        </TabsContent>

        <TabsContent value="flagged">
          <FlaggedMessagesPanel />
        </TabsContent>

        <TabsContent value="conversations">
          <AllConversationsPanel initialConversationId={searchParams.get('conversation') || undefined} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
