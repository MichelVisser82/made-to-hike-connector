import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Download, MapPin, Gift, Eye, Copy, FileDown } from 'lucide-react';
import { TourHighlight, HIGHLIGHT_CATEGORY_ICONS } from '@/types/map';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RoutePolylineWithArrows } from './RoutePolylineWithArrows';

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface FullMapRevealProps {
  tourId: string;
  bookingId: string;
}

export function FullMapReveal({ tourId, bookingId }: FullMapRevealProps) {
  // Fetch full map data (routes + all highlights)
  const { data: mapData, isLoading } = useQuery({
    queryKey: ['full-tour-map', tourId, bookingId],
    queryFn: async () => {
      // Verify booking exists and is confirmed
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('status')
        .eq('id', bookingId)
        .eq('tour_id', tourId)
        .single();

      if (bookingError || !booking || !['confirmed', 'completed'].includes(booking.status)) {
        throw new Error('Unauthorized or booking not confirmed');
      }

      // Fetch day routes
      const { data: dayRoutes, error: routesError } = await supabase
        .from('tour_day_routes')
        .select('*')
        .eq('tour_id', tourId)
        .order('day_number');

      if (routesError) throw routesError;

      // Fetch ALL highlights (public + secret)
      const { data: highlights, error: highlightsError } = await supabase
        .from('tour_highlights')
        .select('*')
        .eq('tour_id', tourId)
        .order('sequence_order');

      if (highlightsError) throw highlightsError;

      // Fetch GPX file info
      const { data: gpxFile, error: gpxError } = await supabase
        .from('tour_gpx_files')
        .select('*')
        .eq('tour_id', tourId)
        .single();

      return {
        dayRoutes: dayRoutes || [],
        highlights: highlights || [],
        gpxFile: gpxFile || null
      };
    },
  });

  const [selectedDay, setSelectedDay] = useState<number>(1);

  const handleCopyCoordinates = (lat: number, lng: number) => {
    const coordString = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    navigator.clipboard.writeText(coordString);
    toast.success('Coordinates copied to clipboard!');
  };

  const handleDownloadPDF = async () => {
    try {
      toast.info('Generating PDF...');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPosition = 20;

      // Title
      pdf.setFontSize(20);
      pdf.text('Tour Route Map & Details', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Stats
      pdf.setFontSize(12);
      pdf.text(`Total Distance: ${mapData?.dayRoutes.reduce((sum, r) => sum + (r.distance_km || 0), 0).toFixed(1)} km`, 20, yPosition);
      yPosition += 7;
      pdf.text(`Total Elevation: ${mapData?.dayRoutes.reduce((sum, r) => sum + (r.elevation_gain_m || 0), 0)} m`, 20, yPosition);
      yPosition += 7;
      pdf.text(`Highlights: ${mapData?.highlights.length || 0} points of interest`, 20, yPosition);
      yPosition += 15;

      // Capture map screenshot
      const mapElement = document.querySelector('.leaflet-container') as HTMLElement;
      if (mapElement) {
        const canvas = await html2canvas(mapElement, { useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        if (yPosition + imgHeight > 280) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
      }

      // Highlights
      if (mapData?.highlights && mapData.highlights.length > 0) {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(14);
        pdf.text('Points of Interest', 20, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(10);
        mapData.highlights.forEach((h, idx) => {
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(`${idx + 1}. ${h.name} - ${h.latitude.toFixed(4)}, ${h.longitude.toFixed(4)}`, 25, yPosition);
          yPosition += 6;
          if (h.description) {
            pdf.setFontSize(8);
            pdf.text(h.description.substring(0, 80), 30, yPosition);
            pdf.setFontSize(10);
            yPosition += 6;
          }
        });
      }

      pdf.save('tour-route-map.pdf');
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const selectedRoute = useMemo(() => {
    return mapData?.dayRoutes?.find(r => r.day_number === selectedDay);
  }, [mapData, selectedDay]);

  const routeCoordinates: [number, number][] = useMemo(() => {
    if (!selectedRoute?.route_coordinates) return [];
    const coords = selectedRoute.route_coordinates as any;
    if (Array.isArray(coords)) {
      return coords.map((c: any) => [c.lat, c.lng]);
    }
    return [];
  }, [selectedRoute]);

  const center: [number, number] = useMemo(() => {
    if (routeCoordinates.length > 0) {
      const lats = routeCoordinates.map(c => c[0]);
      const lngs = routeCoordinates.map(c => c[1]);
      return [
        (Math.max(...lats) + Math.min(...lats)) / 2,
        (Math.max(...lngs) + Math.min(...lngs)) / 2
      ];
    }
    return [46.5, 11.3];
  }, [routeCoordinates]);

  const elevationData = useMemo(() => {
    if (!selectedRoute?.elevation_profile) return [];
    const profile = selectedRoute.elevation_profile as any;
    if (Array.isArray(profile)) {
      return profile;
    }
    return [];
  }, [selectedRoute]);

  const getMarkerIcon = (isPublic: boolean) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="flex items-center justify-center w-10 h-10 bg-white border-3 ${isPublic ? 'border-green-500' : 'border-purple-500'} rounded-full shadow-lg">
          ${!isPublic ? '<span class="text-xl">🎁</span>' : '<span class="text-xl">📍</span>'}
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
  };

  const handleDownloadGPX = async () => {
    if (!mapData?.gpxFile) return;
    
    const { data, error } = await supabase.storage
      .from('guide-documents')
      .download(mapData.gpxFile.storage_path);

    if (error) {
      toast.error('Failed to download GPX file');
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = mapData.gpxFile.original_filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Loading full route map...</p>
        </CardContent>
      </Card>
    );
  }

  if (!mapData || !mapData.dayRoutes?.length) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No route data available for this tour yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {mapData.dayRoutes.reduce((sum, r) => sum + (r.distance_km || 0), 0).toFixed(1)} km
              </p>
              <p className="text-sm text-muted-foreground mt-1">Total Distance</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {mapData.dayRoutes.reduce((sum, r) => sum + (r.elevation_gain_m || 0), 0)} m
              </p>
              <p className="text-sm text-muted-foreground mt-1">Total Elevation Gain</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{mapData.highlights.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Highlights</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Day Tabs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Full Route Map</CardTitle>
          <div className="flex gap-2">
            <Button onClick={handleDownloadPDF} variant="outline" size="sm">
              <FileDown className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            {mapData.gpxFile && (
              <Button onClick={handleDownloadGPX} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download GPX
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedDay.toString()} onValueChange={(v) => setSelectedDay(parseInt(v))}>
            <TabsList className="w-full">
              {mapData.dayRoutes.map((route) => (
                <TabsTrigger key={route.day_number} value={route.day_number.toString()} className="flex-1">
                  Day {route.day_number}
                </TabsTrigger>
              ))}
            </TabsList>

            {mapData.dayRoutes.map((route) => (
              <TabsContent key={route.day_number} value={route.day_number.toString()} className="space-y-4">
                {/* Map */}
                <div className="h-[500px] rounded-lg overflow-hidden border">
                  <MapContainer
                    center={center}
                    zoom={13}
                    className="h-full w-full"
                    scrollWheelZoom={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Route line */}
                    {routeCoordinates.length > 0 && (
                      <Polyline
                        positions={routeCoordinates}
                        pathOptions={{
                          color: '#10b981',
                          weight: 4,
                          opacity: 0.8
                        }}
                      />
                    )}

                    {/* Highlights for this day */}
                    {mapData.highlights
                      .filter(h => !h.day_number || h.day_number === selectedDay)
                      .map((highlight: any) => (
                        <Marker
                          key={highlight.id}
                          position={[highlight.latitude, highlight.longitude]}
                          icon={getMarkerIcon(highlight.is_public)}
                        >
                          <Popup>
                            <div className="p-2 min-w-[200px]">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">{HIGHLIGHT_CATEGORY_ICONS[highlight.category as keyof typeof HIGHLIGHT_CATEGORY_ICONS]}</span>
                                <h4 className="font-semibold">{highlight.name}</h4>
                                {!highlight.is_public && (
                                  <Badge variant="secondary" className="ml-auto">
                                    <Gift className="h-3 w-3 mr-1" />
                                    Secret
                                  </Badge>
                                )}
                              </div>
                              {highlight.description && (
                                <p className="text-sm text-muted-foreground mb-2">{highlight.description}</p>
                              )}
                              {highlight.guide_notes && (
                                <div className="mt-2 p-2 bg-muted rounded text-xs">
                                  <p className="font-medium mb-1">Guide's Notes:</p>
                                  <p className="text-muted-foreground">{highlight.guide_notes}</p>
                                </div>
                              )}
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                  </MapContainer>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-xl font-bold">{route.distance_km?.toFixed(1)} km</p>
                    <p className="text-sm text-muted-foreground">Distance</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-xl font-bold">{route.elevation_gain_m} m</p>
                    <p className="text-sm text-muted-foreground">Elevation Gain</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-xl font-bold">~{route.estimated_duration_hours?.toFixed(1)} hrs</p>
                    <p className="text-sm text-muted-foreground">Duration</p>
                  </div>
                </div>

                {/* Elevation Profile */}
                {Array.isArray(elevationData) && elevationData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Elevation Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={elevationData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="distance" 
                            label={{ value: 'Distance (km)', position: 'insideBottom', offset: -5 }}
                          />
                          <YAxis 
                            label={{ value: 'Elevation (m)', angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip />
                          <Area 
                            type="monotone" 
                            dataKey="elevation" 
                            stroke="#10b981" 
                            fill="#10b981" 
                            fillOpacity={0.3} 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* All Highlights List */}
      <Card>
        <CardHeader>
          <CardTitle>All Highlights</CardTitle>
          <p className="text-sm text-muted-foreground">
            {mapData.highlights.filter((h: any) => h.is_public).length} public • 
            {mapData.highlights.filter((h: any) => !h.is_public).length} secret spots
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {Array.isArray(mapData.highlights) && mapData.highlights.map((highlight: any) => (
              <div key={highlight.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <span className="text-2xl">{HIGHLIGHT_CATEGORY_ICONS[highlight.category as keyof typeof HIGHLIGHT_CATEGORY_ICONS]}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{highlight.name}</h4>
                    {!highlight.is_public && (
                      <Badge variant="secondary">
                        <Gift className="h-3 w-3 mr-1" />
                        Secret Spot
                      </Badge>
                    )}
                    {highlight.day_number && (
                      <Badge variant="outline">Day {highlight.day_number}</Badge>
                    )}
                  </div>
                  {highlight.description && (
                    <p className="text-sm text-muted-foreground mt-1">{highlight.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
