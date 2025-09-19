import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Layout, 
  Smartphone, 
  Monitor, 
  Tablet,
  Eye,
  Download,
  Share2,
  Layers,
  Grid,
  Navigation,
  Users
} from 'lucide-react';

export function WireframeDesign() {
  const [selectedView, setSelectedView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [selectedPage, setSelectedPage] = useState('landing');

  const wireframes = {
    landing: {
      title: 'Landing Page',
      description: 'Hero section with search and featured regions',
      components: ['Hero Section', 'Search Bar', 'Region Cards', 'Trust Indicators', 'CTA Section']
    },
    search: {
      title: 'Search Results',
      description: 'Filterable tour listings with map view',
      components: ['Filter Sidebar', 'Search Results Grid', 'Map View', 'Pagination', 'Sort Options']
    },
    'tour-detail': {
      title: 'Tour Details',
      description: 'Comprehensive tour information and booking',
      components: ['Image Gallery', 'Tour Info', 'Guide Profile', 'Reviews', 'Booking Form']
    },
    'user-dashboard': {
      title: 'User Dashboard',
      description: 'Personal bookings and profile management',
      components: ['Profile Card', 'Booking History', 'Favorites', 'Settings', 'Activity Feed']
    },
    'guide-dashboard': {
      title: 'Guide Dashboard',
      description: 'Tour management and analytics for guides',
      components: ['Tour Listings', 'Calendar', 'Earnings', 'Reviews', 'Verification Status']
    },
    'admin-dashboard': {
      title: 'Admin Panel',
      description: 'Platform management and oversight',
      components: ['Analytics Overview', 'User Management', 'Tour Approval', 'Revenue Tracking']
    }
  };

  const getViewportClass = () => {
    switch (selectedView) {
      case 'mobile':
        return 'w-full max-w-sm mx-auto';
      case 'tablet':
        return 'w-full max-w-2xl mx-auto';
      default:
        return 'w-full';
    }
  };

  const renderWireframe = (pageKey: string) => {
    const page = wireframes[pageKey as keyof typeof wireframes];
    
    return (
      <div className={`${getViewportClass()} bg-white border rounded-lg p-4 min-h-[500px]`}>
        <div className="space-y-4">
          {/* Header Wireframe */}
          <div className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/20 rounded"></div>
                <div className="w-24 h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="flex gap-2">
                <div className="w-16 h-6 bg-gray-200 rounded"></div>
                <div className="w-20 h-6 bg-primary/20 rounded"></div>
              </div>
            </div>
          </div>

          {/* Page-specific wireframe content */}
          {pageKey === 'landing' && (
            <>
              {/* Hero Section */}
              <div className="bg-gradient-to-b from-primary/5 to-transparent p-8 rounded-lg text-center">
                <div className="w-64 h-8 bg-gray-300 rounded mx-auto mb-4"></div>
                <div className="w-48 h-4 bg-gray-200 rounded mx-auto mb-6"></div>
                <div className="w-32 h-10 bg-primary/20 rounded mx-auto"></div>
              </div>
              
              {/* Region Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="w-full h-32 bg-gray-200 rounded mb-3"></div>
                    <div className="w-24 h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="w-16 h-3 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </>
          )}

          {pageKey === 'search' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Sidebar */}
              <div className="space-y-4">
                <div className="w-full h-6 bg-gray-300 rounded"></div>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="border rounded p-3">
                    <div className="w-20 h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="w-full h-8 bg-gray-100 rounded"></div>
                  </div>
                ))}
              </div>
              
              {/* Results Grid */}
              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="border rounded-lg overflow-hidden">
                    <div className="w-full h-40 bg-gray-200"></div>
                    <div className="p-4 space-y-2">
                      <div className="w-32 h-4 bg-gray-300 rounded"></div>
                      <div className="w-24 h-3 bg-gray-200 rounded"></div>
                      <div className="w-16 h-6 bg-primary/20 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pageKey === 'tour-detail' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="md:col-span-2 space-y-6">
                <div className="w-full h-64 bg-gray-200 rounded-lg"></div>
                <div className="space-y-3">
                  <div className="w-48 h-6 bg-gray-300 rounded"></div>
                  <div className="w-full h-20 bg-gray-100 rounded"></div>
                </div>
              </div>
              
              {/* Booking Sidebar */}
              <div className="border rounded-lg p-4 h-fit">
                <div className="w-24 h-8 bg-primary/20 rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="w-full h-10 bg-gray-100 rounded"></div>
                  <div className="w-full h-10 bg-gray-100 rounded"></div>
                  <div className="w-full h-12 bg-primary/20 rounded"></div>
                </div>
              </div>
            </div>
          )}

          {(pageKey === 'user-dashboard' || pageKey === 'guide-dashboard' || pageKey === 'admin-dashboard') && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stats Cards */}
              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="w-16 h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="w-12 h-8 bg-gray-300 rounded"></div>
                  </div>
                ))}
              </div>
              
              {/* Main Content */}
              <div className="md:col-span-2 space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="w-32 h-5 bg-gray-300 rounded mb-4"></div>
                  <div className="w-full h-48 bg-gray-100 rounded"></div>
                </div>
              </div>
              
              {/* Sidebar */}
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="w-24 h-4 bg-gray-300 rounded mb-3"></div>
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-full h-6 bg-gray-100 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Wireframe Design System</h1>
            <p className="text-muted-foreground">Visual representation of the marketplace structure and layout</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Viewport Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant={selectedView === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedView('desktop')}
              className="gap-2"
            >
              <Monitor className="h-4 w-4" />
              Desktop
            </Button>
            <Button
              variant={selectedView === 'tablet' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedView('tablet')}
              className="gap-2"
            >
              <Tablet className="h-4 w-4" />
              Tablet
            </Button>
            <Button
              variant={selectedView === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedView('mobile')}
              className="gap-2"
            >
              <Smartphone className="h-4 w-4" />
              Mobile
            </Button>
          </div>
          
          <Badge variant="outline" className="gap-1">
            <Eye className="h-3 w-3" />
            {selectedView} view
          </Badge>
        </div>

        <Tabs value={selectedPage} onValueChange={setSelectedPage} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            {Object.entries(wireframes).map(([key, page]) => (
              <TabsTrigger key={key} value={key} className="text-xs">
                {page.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(wireframes).map(([key, page]) => (
            <TabsContent key={key} value={key} className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Layout className="h-5 w-5" />
                        {page.title}
                      </CardTitle>
                      <p className="text-muted-foreground mt-1">{page.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {page.components.map(component => (
                        <Badge key={component} variant="secondary" className="text-xs">
                          {component}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {renderWireframe(key)}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Component Library */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Component Library
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Header', icon: Navigation },
                { name: 'Search Bar', icon: Grid },
                { name: 'Tour Card', icon: Layout },
                { name: 'Profile Card', icon: Users },
                { name: 'Filter Panel', icon: Layers },
                { name: 'Booking Form', icon: Layout },
                { name: 'Review Component', icon: Users },
                { name: 'Analytics Chart', icon: Grid }
              ].map(component => (
                <div key={component.name} className="border rounded-lg p-4 text-center hover:bg-muted/50 cursor-pointer">
                  <component.icon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">{component.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}