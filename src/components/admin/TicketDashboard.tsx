import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Ticket as TicketIcon, AlertCircle, Clock, MessageSquare } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Ticket } from '@/types/chat';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface TicketDashboardProps {
  selectedTicketId?: string;
}

export function TicketDashboard({ selectedTicketId }: TicketDashboardProps = {}) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('open');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Auto-select ticket if selectedTicketId is provided
  useEffect(() => {
    if (selectedTicketId && tickets.length > 0) {
      const ticket = tickets.find(t => t.ticket_number === selectedTicketId);
      if (ticket) {
        setSelectedTicket(ticket);
      }
    }
  }, [selectedTicketId, tickets]);

  useEffect(() => {
    fetchTickets();

    // Subscribe to ticket changes
    const channel = supabase
      .channel('tickets-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        () => {
          fetchTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchTickets() {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        conversations (
          id,
          anonymous_name,
          anonymous_email,
          profiles (
            name,
            email
          ),
          tours (
            title
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: 'Error loading tickets',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      setTickets((data || []) as any);
    }
    setLoading(false);
  }

  async function handleClaimTicket(ticketId: string, userId: string) {
    const { error } = await supabase
      .from('tickets')
      .update({ 
        assigned_to: userId,
        status: 'assigned'
      })
      .eq('id', ticketId);

    if (error) {
      toast({
        title: 'Error claiming ticket',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Ticket claimed',
        description: 'You are now assigned to this ticket'
      });
      fetchTickets();
    }
  }

  async function handleUpdateStatus(ticketId: string, newStatus: string) {
    const updates: any = { status: newStatus };
    
    if (newStatus === 'resolved') {
      updates.resolved_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('id', ticketId);

    if (error) {
      toast({
        title: 'Error updating ticket',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Ticket updated',
        description: `Status changed to ${newStatus}`
      });
      fetchTickets();
    }
  }

  const filteredTickets = tickets.filter(t => {
    if (activeTab === 'all') return true;
    return t.status === activeTab;
  });

  const stats = {
    open: tickets.filter(t => t.status === 'open').length,
    assigned: tickets.filter(t => t.status === 'assigned').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    total: tickets.length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TicketIcon className="w-4 h-4 text-blue-500" />
              Open Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.open}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              Assigned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.assigned}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-green-500" />
              Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.resolved}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Support Tickets</CardTitle>
            {selectedTicket && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTicket(null)}
              >
                Back to List
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {selectedTicket ? (
            // Ticket Detail View
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-2xl font-bold">{selectedTicket.ticket_number}</h3>
                  <Badge
                    variant={
                      selectedTicket.priority === 'urgent' ? 'destructive' :
                      selectedTicket.priority === 'high' ? 'default' : 'secondary'
                    }
                  >
                    {selectedTicket.priority}
                  </Badge>
                  <Badge variant="outline">{selectedTicket.status}</Badge>
                </div>
                <h4 className="text-lg font-semibold mb-2">{selectedTicket.title}</h4>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span>Category: {selectedTicket.category || 'General'}</span>
                  <span>Created: {format(new Date(selectedTicket.created_at), 'MMM d, yyyy HH:mm')}</span>
                  {selectedTicket.resolved_at && (
                    <span>Resolved: {format(new Date(selectedTicket.resolved_at), 'MMM d, yyyy HH:mm')}</span>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h5 className="font-semibold mb-2">Contact Information</h5>
                <div className="space-y-2 text-sm">
                  <p><strong>From:</strong> {
                    (selectedTicket.conversations as any)?.profiles?.name || 
                    (selectedTicket.conversations as any)?.anonymous_name || 
                    'Anonymous'
                  }</p>
                  <p><strong>Email:</strong> {
                    (selectedTicket.conversations as any)?.profiles?.email || 
                    (selectedTicket.conversations as any)?.anonymous_email || 
                    'Not provided'
                  }</p>
                  {(selectedTicket.conversations as any)?.tours?.title && (
                    <p><strong>Related Tour:</strong> {(selectedTicket.conversations as any).tours.title}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => navigate(`/dashboard?conversation=${selectedTicket.conversation_id}`)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  View Full Conversation
                </Button>
                {selectedTicket.status === 'open' && user && (
                  <Button
                    variant="outline"
                    onClick={() => handleClaimTicket(selectedTicket.id, user.id)}
                  >
                    Claim Ticket
                  </Button>
                )}
                {selectedTicket.status === 'assigned' && (
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateStatus(selectedTicket.id, 'resolved')}
                  >
                    Mark as Resolved
                  </Button>
                )}
              </div>
            </div>
          ) : (
            // Tickets List
            <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="assigned">Assigned</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 mt-4">
              {filteredTickets.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No tickets found
                </p>
              ) : (
                filteredTickets.map((ticket) => (
                  <Card key={ticket.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            className="font-semibold hover:underline text-primary"
                          >
                            {ticket.ticket_number}
                          </button>
                          <Badge
                              variant={
                                ticket.priority === 'urgent' ? 'destructive' :
                                ticket.priority === 'high' ? 'default' : 'secondary'
                              }
                            >
                              {ticket.priority}
                            </Badge>
                            <Badge variant="outline">{ticket.status}</Badge>
                          </div>

                          <p className="text-sm mb-2">{ticket.title}</p>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              Tour: {ticket.conversations?.tours?.title || 'N/A'}
                            </span>
                            <span>
                              From: {ticket.conversations?.profiles?.name || 'Anonymous'}
                            </span>
                            <span>
                              {format(new Date(ticket.created_at), 'MMM d, HH:mm')}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/dashboard?conversation=${ticket.conversation_id}`)}
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            View Conversation
                          </Button>
                          {ticket.status === 'open' && (
                            <Button
                              size="sm"
                              onClick={() => user && handleClaimTicket(ticket.id, user.id)}
                              disabled={!user}
                            >
                              Claim
                            </Button>
                          )}
                          {ticket.status === 'assigned' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(ticket.id, 'resolved')}
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
