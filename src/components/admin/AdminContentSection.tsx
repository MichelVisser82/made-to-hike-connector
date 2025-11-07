import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ImageManager } from './ImageManager';
import { ImageOverview } from './ImageOverview';
import { TourTemplateManager } from './TourTemplateManager';
import { RegionSubmissionsPanel } from './RegionSubmissionsPanel';

export function AdminContentSection() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('images');
  
  // Auto-switch tabs based on URL parameters
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-playfair text-charcoal mb-2">Content Management</h1>
        <p className="text-charcoal/60">Manage images, templates, and region requests</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-cream p-1 rounded-lg">
          <TabsTrigger 
            value="images"
            className="data-[state=active]:bg-burgundy data-[state=active]:text-cream-light"
          >
            Images
          </TabsTrigger>
          <TabsTrigger 
            value="templates"
            className="data-[state=active]:bg-burgundy data-[state=active]:text-cream-light"
          >
            Tour Templates
          </TabsTrigger>
          <TabsTrigger 
            value="regions"
            className="data-[state=active]:bg-burgundy data-[state=active]:text-cream-light"
          >
            Region Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="images" className="space-y-6">
          <ImageManager />
          <ImageOverview />
        </TabsContent>

        <TabsContent value="templates">
          <TourTemplateManager />
        </TabsContent>

        <TabsContent value="regions">
          <RegionSubmissionsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
