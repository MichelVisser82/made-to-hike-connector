import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ImageManager } from '../admin/ImageManager';
import { ImageOverview } from '../admin/ImageOverview';
import { TourTemplateManager } from '../admin/TourTemplateManager';
import { GuideVerificationManager } from '../admin/GuideVerificationManager';
import { TicketDashboard } from '../admin/TicketDashboard';
import { FlaggedMessagesPanel } from '../admin/FlaggedMessagesPanel';
import { AllConversationsPanel } from '../admin/AllConversationsPanel';
import { RegionSubmissionsPanel } from '../admin/RegionSubmissionsPanel';
import { DiscountCodesManager } from '../dashboard/policy/DiscountCodesManager';
import { type User } from '../../types';
import { MainLayout } from '../layout/MainLayout';
import type { DashboardSection } from '@/types/dashboard';

interface AdminDashboardProps {
  user: User;
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<DashboardSection>('today');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Auto-switch to conversations tab if conversation parameter is present
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    const ticketId = searchParams.get('ticket');
    
    if (conversationId) {
      setActiveTab('conversations');
    } else if (ticketId) {
      setActiveTab('tickets');
    }
  }, [searchParams]);
  
  return (
    <MainLayout
      dashboardMode="admin"
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      showVerificationBadge={false}
      isVerified={false}
    >
      <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="regions">Regions</TabsTrigger>
            <TabsTrigger value="flagged">Flagged</TabsTrigger>
            <TabsTrigger value="conversations">Conversations</TabsTrigger>
            <TabsTrigger value="discount-codes">Codes</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="verifications">Verifications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Verifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-sm text-muted-foreground">Guides awaiting approval</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Total Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">47</p>
                  <p className="text-sm text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">€12,450</p>
                  <p className="text-sm text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tickets">
            <TicketDashboard selectedTicketId={searchParams.get('ticket') || undefined} />
          </TabsContent>

          <TabsContent value="regions">
            <RegionSubmissionsPanel />
          </TabsContent>

          <TabsContent value="flagged">
            <FlaggedMessagesPanel />
          </TabsContent>

          <TabsContent value="conversations">
            <AllConversationsPanel initialConversationId={searchParams.get('conversation') || undefined} />
          </TabsContent>

          <TabsContent value="discount-codes" className="space-y-6">
            <DiscountCodesManager isAdmin={true} />
          </TabsContent>

          <TabsContent value="images">
            <div className="space-y-6">
              <ImageManager />
              <ImageOverview />
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <TourTemplateManager />
          </TabsContent>

          <TabsContent value="verifications" className="space-y-6">
            <GuideVerificationManager />
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </MainLayout>
  );
}
