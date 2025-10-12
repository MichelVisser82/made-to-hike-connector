import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ImageManager } from '../admin/ImageManager';
import { ImageOverview } from '../admin/ImageOverview';
import { TourTemplateManager } from '../admin/TourTemplateManager';
import { GuideVerificationManager } from '../admin/GuideVerificationManager';
import { type User } from '../../types';
import { MainLayout } from '../layout/MainLayout';
import type { DashboardSection } from '@/types/dashboard';

interface AdminDashboardProps {
  user: User;
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<DashboardSection>('today');
  
  return (
    <MainLayout
      isDashboardMode={true}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      showVerificationBadge={false}
      isVerified={false}
      userRole="admin"
    >
      <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="images">Image Manager</TabsTrigger>
            <TabsTrigger value="image-overview">Image Overview</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="verifications">Verifications</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
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

          <TabsContent value="images">
            <ImageManager />
          </TabsContent>

          <TabsContent value="image-overview">
            <ImageOverview />
          </TabsContent>

          <TabsContent value="templates">
            <TourTemplateManager />
          </TabsContent>

          <TabsContent value="verifications" className="space-y-6">
            <GuideVerificationManager />
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Booking management will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </MainLayout>
  );
}